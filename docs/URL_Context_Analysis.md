# URL Context Analysis: First Login to Lobby Flow

## Overview

This document provides a comprehensive analysis of the URL context parameters (`isDirectMode`, `redirectUrl`, `isSabaPlay`, `gameId`) and their critical roles in the first login to lobby flow of the gaming application.

## URL Context Parameters

### 1. `gameId` (number)

**Purpose**: Determines which game to load or whether to show the lobby
**Source**: URL parameter `?gameId=X`
**Default**: `0` (lobby mode)

**Values**:

-   `0`: Lobby mode (no specific game)
-   `> 0`: Specific game ID to load
-   `-1`: Initial state (not yet determined)

### 2. `isDirectMode` (boolean)

**Purpose**: Controls whether the user should be taken directly to a specific game or follow SSO redirect logic
**Source**: URL parameter `?ref=true`
**Default**: `false`

**Behavior**:

-   `true`: Skip SSO redirect logic, use URL gameId directly
-   `false`: Apply SSO redirect logic, may change gameId based on business rules

### 3. `redirectUrl` (string)

**Purpose**: Base64 encoded URL to redirect to after game completion or back to lobby action
**Source**: URL parameter `?rurl=<base64-encoded-url>` (only when `isDirectMode=true`)
**Default**: `""` (empty string)

**Usage**: Used in `backToRedirectUrl` function to handle post-game navigation

### 4. `isSabaPlay` (boolean)

**Purpose**: Identifies if the user is coming from SabaPlay platform
**Source**: URL parameter `?op=SP`
**Default**: `false`

**Behavior**:

-   `true`: Triggers auto nickname creation (same as Direct Mode)
-   `false`: Normal registration flow

## URL Context Parsing Flow

```typescript
// From url-context.ts
export function parseContextFromURL(): URLContextModel | undefined {
    const params = new URLSearchParams(globalThis.location?.search);

    const token = params.get("token");
    const language = params.get("lang");
    const gameId = Number(params.get("gameId") || 0);
    const isDirectMode = !!params.get("ref");
    const redirectUrl = isDirectMode ? params.get("rurl") : "";
    const isSabaPlay = params.get("op") === "SP";

    return {
        token,
        language,
        gameId,
        isDirectMode,
        redirectUrl,
        firstSSOToLobby: true,
        isSabaPlay,
    };
}
```

## Complete First Login to Lobby Flow

### 1. Initial URL Context Loading

```mermaid
flowchart TD
    A1[User accesses application] --> B1[parseContextFromURL]
    B1 --> C1{URL Parameters Present?}
    C1 -->|Yes| D1[Parse all parameters]
    C1 -->|No| E1[Return undefined]

    D1 --> F1[Extract gameId, isDirectMode, redirectUrl, isSabaPlay]
    F1 --> G1[Store in localStorage]
    G1 --> H1[Clear URL parameters]
    H1 --> I1[loadURLContext returns context]

    E1 --> J1[Load from localStorage]
    J1 --> I1
```

### 2. SplashScreen Initialization Flow

```mermaid
flowchart TD
    A2[SplashScreen Mount] --> B2[Get URL Context]
    B2 --> C2[Get Session]
    C2 --> D2{Session Valid?}
    D2 -->|No| E2[Redirect to Timeout]
    D2 -->|Yes| F2{UM Session?}

    F2 -->|Yes| G2[Handle UM]
    F2 -->|No| H2[Authorize User]

    H2 --> I2{User Authorized?}
    I2 -->|No| J2{isDirectMode or isSabaPlay?}
    I2 -->|Yes| K2[Load Lobby Configs]

    J2 -->|Yes| L2[Auto Create Nickname]
    J2 -->|No| M2[Render Register]

    L2 --> N2{Success?}
    N2 -->|No| E2
    N2 -->|Yes| K2

    K2 --> O2{isDirectMode?}
    O2 -->|Yes| P2[Use URL gameId]
    O2 -->|No| Q2[Apply SSO Redirect Logic]

    Q2 --> R2{firstSSOToLobby?}
    R2 -->|Yes| S2[Set gameId equals 0 Lobby]
    R2 -->|No| T2[Use latestGameId and Check Service]

    P2 --> U2[Set currentGameId]
    S2 --> U2
    T2 --> U2

    U2 --> V2[Render Dashboard]
    M2 --> W2[User Registration]
    W2 --> V2
```

### 3. Registration Flow (Register Component)

```mermaid
flowchart TD
    A3[Register Component] --> B3[Initialize with gameId from props]
    B3 --> C3[User Fills Form]
    C3 --> D3[Submit Registration]
    D3 --> E3{Name Valid?}
    E3 -->|No| F3[Show Error]
    E3 -->|Yes| G3[Create Nickname]

    G3 --> H3{Success?}
    H3 -->|No| F3
    H3 -->|Yes| I3{isDirectMode?}

    I3 -->|Yes| J3[Keep Original gameId]
    I3 -->|No| K3[Update toLoadGameId]

    K3 --> L3[Get Lobby Configs]
    L3 --> M3{firstSSOToLobby?}
    M3 -->|Yes| N3[Set toLoadGameId equals 0 Lobby]
    M3 -->|No| O3[Find Available Game Service]

    O3 --> P3[Set toLoadGameId to Available Game]
    J3 --> Q3[Trigger Preload]
    N3 --> Q3
    P3 --> Q3

    Q3 --> R3[Preload Resources]
    R3 --> S3[Render Dashboard]
```

### 4. Dashboard Rendering Logic

```mermaid
flowchart TD
    A4[Dashboard Mount] --> B4[Constructor with queryGame]
    B4 --> C4[componentDidMount]
    C4 --> D4{queryGame Present?}
    D4 -->|Yes| E4[openGame queryGame]
    D4 -->|No| F4[Render Lobby]

    E4 --> G4[Set State: queryGame, openGameId]
    G4 --> H4[Update URL Context]
    H4 --> I4[Render Games]

    F4 --> J4[Update URL Context: backToLobby]
    J4 --> K4[Render Lobby Component]

    K4 --> L4[User Clicks Game]
    L4 --> M4[openGameFromLobby]
    M4 --> N4{GameId Different?}
    N4 -->|Yes| O4[Remove Game Transmitter]
    N4 -->|No| P4[Force Update]
    O4 --> Q4[Set openGameId]
    P4 --> Q4
    Q4 --> R4[Update URL Context]
    R4 --> I4
```

## Critical Decision Points

### 1. Direct Mode vs Non-Direct Mode

**Direct Mode (`isDirectMode = true`)**:

-   Uses URL `gameId` directly without modification
-   Skips SSO redirect logic
-   Triggers auto nickname creation for unauthorized users
-   Used for direct game access scenarios

**Non-Direct Mode (`isDirectMode = false`)**:

-   Applies SSO redirect logic
-   May change `gameId` based on business rules
-   Shows registration form for unauthorized users
-   Used for normal SSO flows

### 2. SabaPlay Integration (`isSabaPlay = true`)

**Behavior**:

-   Triggers auto nickname creation (same as Direct Mode)
-   Determined by URL parameter `op=SP`
-   Used for SabaPlay platform integration

### 3. First SSO to Lobby Logic (`firstSSOToLobby = true`)

**Business Requirement**: Redirect to lobby instead of specific game

-   **When `true`**: Sets `gameId = 0` (lobby mode)
-   **When `false`**: Uses `latestGameId` from localStorage and checks service availability

### 4. Game Service Availability Check

**Process**:

1. Get enabled game settings from lobby configs
2. Check if current `gameId` is available
3. If not available, find first available game service
4. Set `toLoadGameId` to available game

## URL Context State Management

### Context Storage Flow

```mermaid
flowchart TD
    A5[URL Context Update] --> B5[updateURLContext]
    B5 --> C5{gameId Present?}
    C5 -->|Yes| D5[Update latestGameId]
    C5 -->|No| E5[Skip gameId Update]
    D5 --> F5[Store in localStorage]
    E5 --> F5
    F5 --> G5[Context Updated]
```

### Context Retrieval Flow

```mermaid
flowchart TD
    A6[Load URL Context] --> B6[loadURLContext]
    B6 --> C6{Context from URL?}
    C6 -->|Yes| D6[Parse and Store]
    C6 -->|No| E6[Load from localStorage]
    D6 --> F6[Clear URL Parameters]
    E6 --> F6
    F6 --> G6[Return Context]
```

## Common Flow Scenarios

### Scenario 1: Direct Game Access

```
URL: ?gameId=123&ref=true&rurl=<base64-url>
Flow: URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123
```

### Scenario 2: Lobby Access (First SSO)

```
URL: ?gameId=0 (or no gameId)
Flow: URL → SplashScreen → Register → Dashboard → Lobby
```

### Scenario 3: SabaPlay Integration

```
URL: ?gameId=123&op=SP
Flow: URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123
```

### Scenario 4: Normal SSO with Game Redirect

```
URL: ?gameId=123
Flow: URL → SplashScreen → Register → Dashboard → Available Game
```

## Key State Variables

### SplashScreen State:

-   `currentGameId`: Final gameId to load
-   `gameId`: Original URL gameId
-   `latestGameId`: From localStorage

### Register State:

-   `toLoadGameId`: GameId to pass to Dashboard
-   `gameId`: From props (original URL gameId)

### Dashboard State:

-   `queryGame`: GameId from props
-   `openGameId`: Currently open game
-   `gameTransmitters`: Active game connections

## Error Handling and Edge Cases

### 1. Invalid gameId

-   Falls back to `gameId = 0` (lobby mode)
-   Logs error for debugging

### 2. Service Unavailable

-   Searches for alternative available games
-   Falls back to lobby if no games available

### 3. Authorization Failure

-   Redirects to timeout page
-   Clears session data

### 4. Network Errors

-   Retries with exponential backoff
-   Shows user-friendly error messages

## Analytics and Tracking

### SSO Method Tracking:

```typescript
// From analytic-helper.ts
static login(urlContext: URLContextModel) {
    let ssoMethod = "SSO_To_Lobby";
    if (urlContext.isDirectMode) {
        ssoMethod = `SSO_Direct_Mode_To_Game`;
    } else if (urlContext.gameId) {
        ssoMethod = `SSO_To_Game`;
    }

    AnalyticsHelper.ssoContext = {
        ssoMethod,
        gameId: urlContext.gameId,
        language: urlContext.language,
    };
}
```

## Testing Considerations

### Test Cases to Cover:

1. **Direct Mode Scenarios**:

    - Direct game access with valid gameId
    - Direct mode with invalid gameId
    - Direct mode with unauthorized user

2. **SabaPlay Scenarios**:

    - SabaPlay integration with auto nickname creation
    - SabaPlay with different gameIds

3. **SSO Redirect Scenarios**:

    - First SSO to lobby
    - SSO with game redirect
    - Service availability checks

4. **Edge Cases**:
    - No URL parameters
    - Invalid URL parameters
    - Network failures
    - Session timeouts

## Conclusion

The URL context parameters (`isDirectMode`, `redirectUrl`, `isSabaPlay`, `gameId`) play critical roles in determining the user's journey from first login to lobby/game. Understanding these parameters and their interactions is essential for:

-   Debugging user flow issues
-   Implementing new features
-   Maintaining backward compatibility
-   Ensuring proper analytics tracking
-   Testing all possible scenarios

The flow is designed to handle various integration scenarios while maintaining a consistent user experience across different platforms and access methods.
