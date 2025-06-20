# Game ID Flow Workflow Analysis

## Overview

This document outlines the complete workflow for how `gameId` is handled throughout the application, from initial URL parsing to game selection and navigation.

## 1. Initial Application Load Flow

```mermaid
flowchart TD
    A[User accesses application] --> B[URL Context Parsing]
    B --> C{URL Parameters Present?}
    C -->|Yes| D[Parse gameId from URL]
    C -->|No| E[Load from localStorage]
    D --> F[Store in localStorage]
    E --> F
    F --> G[SplashScreen Initialization]

    G --> H{Session Valid?}
    H -->|No| I[Redirect to Timeout]
    H -->|Yes| J{UM Session?}
    J -->|Yes| K[Render UM Page]
    J -->|No| L{User Authorized?}

    L -->|No| M{Direct Mode?}
    M -->|Yes| N[Auto Create Nickname]
    M -->|No| O[Render Register]
    N --> P{Authorization Success?}
    P -->|No| I
    P -->|Yes| Q[Load Lobby Configs]

    L -->|Yes| Q
    O --> R[User Registration]
    R --> Q

    Q --> S{Direct Mode?}
    S -->|Yes| T[Use URL gameId]
    S -->|No| U[Get SSO Redirect GameId]
    U --> V{firstSSOToLobby?}
    V -->|Yes| W[Find Available Game Service]
    V -->|No| X[Use latestGameId]
    W --> Y[Set toLoadGameId]
    X --> Y
    T --> Y

    Y --> Z[Render Dashboard]
```

## 2. Game ID Sources and Priority

### Priority Order:

1. **URL Parameter** (`?gameId=X`) - Highest priority
2. **Direct Mode** - Uses URL gameId directly
3. **SSO Redirect Logic** - For non-direct mode with firstSSOToLobby
4. **Latest Game ID** - From localStorage
5. **Available Game Service** - First available game from lobby configs
6. **Default (0)** - Lobby mode

### URL Context Parsing:

```javascript
// From URL parameters
gameId = Number(params.get("gameId") || 0);
isDirectMode = !!params.get("ref");
redirectUrl = isDirectMode ? params.get("rurl") : "";
```

## 3. SplashScreen Component Flow

```mermaid
flowchart TD
    A[SplashScreen Mount] --> B[Get Session]
    B --> C{Session Valid?}
    C -->|No| D[Sign Out]
    C -->|Yes| E{UM Session?}
    E -->|Yes| F[Handle UM]
    E -->|No| G[Authorize User]

    G --> H{Authorized?}
    H -->|No| I{Direct Mode?}
    I -->|Yes| J[Auto Create Nickname]
    I -->|No| K[Render Register]
    J --> L{Success?}
    L -->|No| D
    L -->|Yes| M[Load Lobby Configs]

    H -->|Yes| M
    K --> N[User Registration]
    N --> M

    M --> O{Direct Mode?}
    O -->|Yes| P[Use URL gameId]
    O -->|No| Q[SSO Redirect Logic]
    Q --> R{firstSSOToLobby?}
    R -->|Yes| S[Find Available Game]
    R -->|No| T[Use latestGameId]
    S --> U[Set Current GameId]
    T --> U
    P --> U

    U --> V[Custom Startup]
    V --> W[Preload Resources]
    W --> X[Render Dashboard]
```

## 4. Register Component Flow

```mermaid
flowchart TD
    A[Register Component] --> B[Initialize with gameId from props]
    B --> C[User Fills Form]
    C --> D[Submit Registration]
    D --> E{Name Valid?}
    E -->|No| F[Show Error]
    E -->|Yes| G[Create Nickname]

    G --> H{Success?}
    H -->|No| F
    H -->|Yes| I{Direct Mode?}
    I -->|Yes| J[Keep Original gameId]
    I -->|No| K[Update toLoadGameId]
    K --> L[Get Lobby Configs]
    L --> M{firstSSOToLobby?}
    M -->|Yes| N[Set toLoadGameId = 0]
    M -->|No| O[Find Available Game Service]
    O --> P[Set toLoadGameId to Available Game]

    J --> Q[Trigger Preload]
    N --> Q
    P --> Q
    Q --> R[Preload Resources]
    R --> S{gameId = 0?}
    S -->|Yes| T[PreloadResourceRegister Calls updateStatePreloadResource]
    S -->|No| U[PreloadResources Component Handles Preload]
    T --> V[Set isDonePreloadResource = true]
    U --> V
    V --> W[Render Dashboard]
```

## 5. Dashboard Component Flow

```mermaid
flowchart TD
    A[Dashboard Mount] --> B[Constructor with queryGame]
    B --> C[componentDidMount]
    C --> D{queryGame Present?}
    D -->|Yes| E[openGame queryGame]
    D -->|No| F[Render Lobby]

    E --> G[Set State: queryGame, openGameId]
    G --> H[Update URL Context]
    H --> I[Render Games]

    F --> J[Update URL Context: backToLobby]
    J --> K[Render Lobby Component]

    K --> L[User Clicks Game]
    L --> M[openGameFromLobby]
    M --> N{GameId Different?}
    N -->|Yes| O[Remove Game Transmitter]
    N -->|No| P[Force Update]
    O --> Q[Set openGameId]
    P --> Q
    Q --> R[Update URL Context]
    R --> I
```

## 6. Lobby Component Flow

```mermaid
flowchart TD
    A[Lobby Component] --> B[Initialize]
    B --> C[Broadcast OPEN_GAME_ID: 0]
    C --> D[Render Banner & Layout]
    D --> E[User Clicks Game]
    E --> F[handleOpenGame]
    F --> G[Call openGame with gameId]
    G --> H[Dashboard openGameFromLobby]
```

## 7. Settings Component Flow

```mermaid
flowchart TD
    A[Settings Component] --> B[User Clicks Back to Lobby]
    B --> C[handleBackToLobbyOnclick]
    C --> D[Update URL Context: gameId = 0]
    D --> E[backToRedirectUrl]
    E --> F{redirectUrl Present?}
    F -->|Yes| G[Decode & Redirect]
    F -->|No| H[Broadcast BACK_TO_LOBBY]
    H --> I[Dashboard resetGameIdDashboardEvent]
    I --> J[Set openGameId = 0]
    J --> K[Render Lobby]
```

## 8. URL Context Management

```mermaid
flowchart TD
    A[URL Context Update] --> B[updateURLContext]
    B --> C{gameId Present?}
    C -->|Yes| D[Update latestGameId]
    C -->|No| E[Skip gameId Update]
    D --> F[Store in localStorage]
    E --> F
    F --> G[Context Updated]
```

## 9. Key State Variables

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

## 10. Critical Decision Points

### 1. Direct Mode vs Non-Direct Mode:

-   **Direct Mode**: Uses URL gameId directly, no SSO redirect logic
-   **Non-Direct Mode**: Applies SSO redirect logic, may change gameId

### 2. firstSSOToLobby Logic:

-   **True**: Redirect to lobby (gameId = 0) - **Business Requirement**
-   **False**: Use latestGameId from localStorage and check service availability

### 3. Game Service Availability:

-   Check each enabled game setting for service availability
-   Select first available game if current game unavailable
-   **Note**: Only applies when firstSSOToLobby is false

### 4. Authorization Flow:

-   **Authorized**: Proceed to game/lobby
-   **Not Authorized + Direct Mode**: Auto-create nickname
-   **Not Authorized + Non-Direct Mode**: Show registration

## 11. Bug Fixes and Implementation Details

### Register Success Flow Fix (Lobby Version)

#### Problem:

When `firstSSOToLobby = true`, the Register component would get stuck after successful registration and never render the Dashboard.

#### Root Cause:

The `PreloadResourceRegister` component had a logic flaw where it would return an empty fragment `<></>` when `gameId = 0` (lobby case) and `isDirectMode = false`, preventing `updateStatePreloadResource()` from being called.

#### Original Logic:

```typescript
return useMemo(() => {
    if (!isDirectMode && gameId > 0) {
        return <PreloadResources ... />;
    }
    return isDirectMode ? (
        <PreloadResources ... />
    ) : (
        <></>  // Problem: No updateStatePreloadResource call
    );
}, [gameId]);
```

#### Fix Implementation:

Added a new `useEffect` to handle the lobby case specifically:

```typescript
useEffect(() => {
    if (!isDirectMode && gameId === 0) {
        console.log("[PreloadResourceRegister] Lobby case (gameId = 0) - calling updateStatePreloadResource");
        const timer = setTimeout(() => {
            updateStatePreloadResource();
        }, 100);
        return () => clearTimeout(timer);
    }
}, [gameId, isDirectMode, updateStatePreloadResource]);
```

#### Dashboard Rendering Fix:

Also fixed the `shouldRenderGames` method in `DashboardHandler` to properly handle `openGameId = 0`:

```typescript
shouldRenderGames = (offerGames: number[], openGameId: number) => {
    // Fix: When openGameId is 0 (lobby), we should render lobby, not games
    if (openGameId === 0) {
        return false;
    }
    // ... rest of logic
};
```

#### Expected Flow After Fix:

1. ✅ Registration succeeds
2. ✅ `updateToLoadGameId` sets `toLoadGameId = 0`
3. ✅ `isTriggerPreloadResources` is set to `true`
4. ✅ `PreloadResourceRegister` calls `updateStatePreloadResource` for lobby case
5. ✅ `isDonePreloadResource` becomes `true`
6. ✅ Register component renders Dashboard with `queryGame = 0`
7. ✅ Dashboard renders lobby (thanks to `shouldRenderGames` fix)

## 12. Console Log Analysis Points

### Key Log Patterns to Monitor:

1. `[URLContext]` - URL parsing and context updates
2. `[SplashScreen]` - Initialization and gameId determination
3. `[Register]` - Registration flow and gameId updates
4. `[Dashboard]` - Game opening and state management
5. `[Lobby]` - Lobby interactions and game selection
6. `[Settings]` - Back to lobby functionality

### Critical Log Messages:

-   `Final toLoadGameId` - Final gameId decision
-   `Rendering Dashboard with gameId` - Dashboard rendering
-   `openGame called with gameId` - Game opening
-   `updateURLContext called with` - Context updates

### Fixed Registration Flow Logs (Lobby Version):

```
[Register] Submit called
[Register] Creating nickname with name: User123 avatar: 4
[Register] Authorization successful
[Register] Not direct mode - updating toLoadGameId
[Register] updateToLoadGameId called
[Register] firstSSOToLobby from props: true
[Register] Lobby configs retrieved: true
[Register] Enabled game settings count: 1
[Register] firstSSOToLobby is true - redirecting to lobby (gameId = 0)
[Register] updateLobbyConfigs called
[PreloadResourceRegister] Lobby case (gameId = 0) - calling updateStatePreloadResource
[Register] updateStatePreloadResource called
[Register] Setting isDonePreloadResource = true and isClickRegister = false
[Register] Render - isDonePreloadResource: true
[Register] Rendering Dashboard with toLoadGameId: 0
[Dashboard] Constructor - queryGame from props: 0
[Dashboard] componentDidMount - queryGame: 0
[Dashboard] openGame called with gameId: 0
[Dashboard] renderDashBoard - openGameId: 0
[Dashboard] renderDashBoard - isRenderGames: false
[Dashboard] renderLobby called
[Lobby] Lobby component rendered
```

## 13. Common Flow Scenarios

### Scenario 1: Direct Game Access

```
URL: ?gameId=123&ref=true
Flow: URL → SplashScreen → Dashboard → Game 123
```

### Scenario 2: Lobby Access

```
URL: (no gameId)
Flow: URL → SplashScreen → Dashboard → Lobby → User selects game
```

### Scenario 3: New User Registration (Game Version)

```
URL: ?gameId=123
Flow: URL → SplashScreen → Register → Dashboard → Game 123
```

### Scenario 4: New User Registration (Lobby Version) - FIXED

```
URL: ?gameId=0 (or no gameId, firstSSOToLobby=true)
Flow: URL → SplashScreen → Register → PreloadResourceRegister → Dashboard → Lobby
```

**Key Steps in Lobby Registration Flow:**

1. User submits registration form
2. `updateToLoadGameId` sets `toLoadGameId = 0` (lobby)
3. `PreloadResourceRegister` calls `updateStatePreloadResource` for lobby case
4. Register component renders Dashboard with `queryGame = 0`
5. Dashboard renders lobby (not games) due to `shouldRenderGames` fix

### Scenario 5: SSO Redirect

```
URL: (no gameId, firstSSOToLobby=true)
Flow: URL → SplashScreen → Redirect to Lobby
```

This workflow analysis provides a comprehensive understanding of how gameId flows through the application, enabling better debugging and feature development.
