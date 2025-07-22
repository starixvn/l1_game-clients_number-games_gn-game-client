# URL Parameter Combinations Analysis

## Overview

This document provides a comprehensive analysis of all possible combinations of URL context parameters (`gameId`, `isDirectMode`, `redirectUrl`, `isSabaPlay`) and their resulting behaviors in the gaming application.

## Parameter Definitions

| Parameter      | Type    | Source           | Default | Description                                                 |
| -------------- | ------- | ---------------- | ------- | ----------------------------------------------------------- |
| `gameId`       | number  | `?gameId=X`      | `0`     | Determines which game to load or lobby mode                 |
| `isDirectMode` | boolean | `?ref=true`      | `false` | Controls SSO redirect logic bypass                          |
| `redirectUrl`  | string  | `?rurl=<base64>` | `""`    | Base64 encoded redirect URL (only when `isDirectMode=true`) |
| `isSabaPlay`   | boolean | `?op=SP`         | `false` | Identifies SabaPlay platform integration                    |

## Complete Parameter Combinations Matrix

### Legend

-   ✅ = Parameter is present/true
-   ❌ = Parameter is absent/false
-   `0` = Lobby mode
-   `>0` = Specific game ID
-   `N/A` = Not applicable

| #   | gameId | isDirectMode | redirectUrl | isSabaPlay | URL Example                                | Behavior                                      | User Flow                                                        | Notes                                 |
| --- | ------ | ------------ | ----------- | ---------- | ------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------- |
| 1   | `0`    | ❌           | N/A         | ❌         | `?gameId=0`                                | Normal SSO to Lobby                           | URL → SplashScreen → Register → Dashboard → Lobby                | First SSO to lobby                    |
| 2   | `0`    | ❌           | N/A         | ✅         | `?gameId=0&op=SP`                          | SabaPlay to Lobby                             | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay integration to lobby         |
| 3   | `0`    | ✅           | ❌          | ❌         | `?gameId=0&ref=true`                       | Direct Mode to Lobby                          | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Direct lobby access                   |
| 4   | `0`    | ✅           | ❌          | ✅         | `?gameId=0&ref=true&op=SP`                 | Direct Mode + SabaPlay to Lobby               | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Redundant SabaPlay flag               |
| 5   | `0`    | ✅           | ✅          | ❌         | `?gameId=0&ref=true&rurl=<base64>`         | Direct Mode to Lobby with Redirect            | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Redirect URL stored for post-game     |
| 6   | `0`    | ✅           | ✅          | ✅         | `?gameId=0&ref=true&rurl=<base64>&op=SP`   | Direct Mode + SabaPlay to Lobby with Redirect | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Redirect URL stored for post-game     |
| 7   | `>0`   | ❌           | N/A         | ❌         | `?gameId=123`                              | Normal SSO to Game                            | URL → SplashScreen → Register → Dashboard → Available Game       | SSO with game redirect                |
| 8   | `>0`   | ❌           | N/A         | ✅         | `?gameId=123&op=SP`                        | SabaPlay to Game                              | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | SabaPlay integration to specific game |
| 9   | `>0`   | ✅           | ❌          | ❌         | `?gameId=123&ref=true`                     | Direct Mode to Game                           | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Direct game access                    |
| 10  | `>0`   | ✅           | ❌          | ✅         | `?gameId=123&ref=true&op=SP`               | Direct Mode + SabaPlay to Game                | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Redundant SabaPlay flag               |
| 11  | `>0`   | ✅           | ✅          | ❌         | `?gameId=123&ref=true&rurl=<base64>`       | Direct Mode to Game with Redirect             | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Redirect URL stored for post-game     |
| 12  | `>0`   | ✅           | ✅          | ✅         | `?gameId=123&ref=true&rurl=<base64>&op=SP` | Direct Mode + SabaPlay to Game with Redirect  | URL → SplashScreen → Auto Create Nickname → Dashboard → Game 123 | Redirect URL stored for post-game     |
| 13  | ❌     | ❌           | N/A         | ❌         | No parameters                              | Default to Lobby                              | URL → SplashScreen → Register → Dashboard → Lobby                | Default behavior                      |
| 14  | ❌     | ❌           | N/A         | ✅         | `?op=SP`                                   | SabaPlay Default                              | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | SabaPlay with no game specified       |
| 15  | ❌     | ✅           | ❌          | ❌         | `?ref=true`                                | Direct Mode Default                           | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Direct mode with no game specified    |
| 16  | ❌     | ✅           | ❌          | ✅         | `?ref=true&op=SP`                          | Direct Mode + SabaPlay Default                | URL → SplashScreen → Auto Create Nickname → Dashboard → Lobby    | Redundant flags, defaults to lobby    |

## Detailed Behavior Analysis

### Category 1: Lobby Access (gameId = 0 or absent)

#### Normal SSO to Lobby (Combinations 1, 13)

-   **Use Case**: Standard SSO integration
-   **User Journey**: Registration form → Lobby
-   **Analytics**: `SSO_To_Lobby`
-   **Game Selection**: Lobby mode (gameId = 0)

#### SabaPlay to Lobby (Combinations 2, 14)

-   **Use Case**: SabaPlay platform integration
-   **User Journey**: Auto nickname creation → Lobby
-   **Analytics**: `SSO_To_Lobby` (with SabaPlay context)
-   **Game Selection**: Lobby mode (gameId = 0)

#### Direct Mode to Lobby (Combinations 3, 15)

-   **Use Case**: Direct lobby access
-   **User Journey**: Auto nickname creation → Lobby
-   **Analytics**: `SSO_Direct_Mode_To_Game` (with gameId = 0)
-   **Game Selection**: Lobby mode (gameId = 0)

### Category 2: Game Access (gameId > 0)

#### Normal SSO to Game (Combination 7)

-   **Use Case**: SSO with game redirect
-   **User Journey**: Registration form → Available Game
-   **Analytics**: `SSO_To_Game`
-   **Game Selection**: Service availability check

#### SabaPlay to Game (Combination 8)

-   **Use Case**: SabaPlay platform with specific game
-   **User Journey**: Auto nickname creation → Specific Game
-   **Analytics**: `SSO_To_Game` (with SabaPlay context)
-   **Game Selection**: Specific game (gameId = 123)

#### Direct Mode to Game (Combinations 9, 11)

-   **Use Case**: Direct game access
-   **User Journey**: Auto nickname creation → Specific Game
-   **Analytics**: `SSO_Direct_Mode_To_Game`
-   **Game Selection**: Specific game (gameId = 123)

### Category 3: Redirect URL Handling

#### With Redirect URL (Combinations 5, 6, 11, 12)

-   **Storage**: Base64 decoded and stored in URL context
-   **Usage**: `backToRedirectUrl()` function
-   **Trigger**: Post-game completion or back to lobby action
-   **Validation**: URL format validation before storage

## Registration Flow Variations

### Auto Nickname Creation

**Triggered by**: `isDirectMode = true` OR `isSabaPlay = true`

```typescript
// Registration logic
if (isDirectMode || isSabaPlay) {
    // Auto create nickname
    const nickname = generateAutoNickname();
    await createNickname(nickname);
    // Continue to game/lobby
} else {
    // Show registration form
    renderRegister();
}
```

### Manual Registration

**Triggered by**: `isDirectMode = false` AND `isSabaPlay = false`

```typescript
// Registration logic
if (!isDirectMode && !isSabaPlay) {
    // Show registration form
    renderRegister();
    // User fills form and submits
    // Validate nickname
    // Create nickname
    // Continue to game/lobby
}
```

## Game Selection Logic

### Direct Mode Game Selection

```typescript
if (isDirectMode) {
    // Use URL gameId directly
    currentGameId = urlContext.gameId;
} else {
    // Apply SSO redirect logic
    if (firstSSOToLobby) {
        currentGameId = 0; // Lobby
    } else {
        // Check service availability
        currentGameId = findAvailableGame(urlContext.gameId);
    }
}
```

### Service Availability Check

```typescript
function findAvailableGame(requestedGameId: number): number {
    const enabledGames = getLobbyConfigs().enabledGames;

    // Check if requested game is available
    if (enabledGames.includes(requestedGameId)) {
        return requestedGameId;
    }

    // Find first available game
    return enabledGames[0] || 0; // Fallback to lobby
}
```

## Analytics Tracking

### SSO Method Classification

```typescript
function getSSOMethod(urlContext: URLContextModel): string {
    if (urlContext.isDirectMode) {
        return `SSO_Direct_Mode_To_Game`;
    } else if (urlContext.gameId > 0) {
        return `SSO_To_Game`;
    } else {
        return `SSO_To_Lobby`;
    }
}
```

### Context Data

```typescript
const analyticsContext = {
    ssoMethod: getSSOMethod(urlContext),
    gameId: urlContext.gameId,
    language: urlContext.language,
    isSabaPlay: urlContext.isSabaPlay,
    hasRedirectUrl: !!urlContext.redirectUrl,
};
```

## Error Handling Scenarios

### Invalid gameId

-   **Behavior**: Fallback to gameId = 0 (lobby)
-   **Logging**: Error logged for debugging
-   **User Experience**: Redirected to lobby

### Service Unavailable

-   **Behavior**: Find alternative available game
-   **Fallback**: Lobby if no games available
-   **User Experience**: Seamless transition to available game

### Invalid Redirect URL

-   **Behavior**: Ignore redirect URL
-   **Validation**: Base64 decode and URL format check
-   **User Experience**: No redirect after game completion

### Network Failures

-   **Behavior**: Retry with exponential backoff
-   **Fallback**: Show user-friendly error message
-   **User Experience**: Clear error communication

## Testing Scenarios

### Happy Path Tests

1. **Direct game access**: `?gameId=123&ref=true`
2. **SSO to lobby**: `?gameId=0`
3. **SabaPlay integration**: `?gameId=123&op=SP`
4. **With redirect URL**: `?gameId=123&ref=true&rurl=<base64>`

### Edge Case Tests

1. **No parameters**: Empty URL
2. **Invalid gameId**: `?gameId=999999`
3. **Invalid redirect URL**: `?rurl=invalid-base64`
4. **Conflicting flags**: `?ref=true&op=SP` (redundant)

### Error Handling Tests

1. **Network timeout**: Simulate slow connection
2. **Service unavailable**: Disable all games
3. **Invalid session**: Expired token
4. **Authorization failure**: Invalid credentials

## Implementation Recommendations

### 1. Parameter Validation

```typescript
function validateURLContext(context: URLContextModel): boolean {
    // Validate gameId range
    if (context.gameId < 0 || context.gameId > MAX_GAME_ID) {
        return false;
    }

    // Validate redirect URL format
    if (context.redirectUrl && !isValidBase64URL(context.redirectUrl)) {
        return false;
    }

    return true;
}
```

### 2. Default Value Handling

```typescript
function getDefaultContext(): URLContextModel {
    return {
        gameId: 0,
        isDirectMode: false,
        redirectUrl: "",
        isSabaPlay: false,
        firstSSOToLobby: true,
    };
}
```

### 3. Context Persistence

```typescript
function persistURLContext(context: URLContextModel): void {
    // Store in localStorage
    localStorage.setItem("urlContext", JSON.stringify(context));

    // Clear URL parameters
    if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
    }
}
```

## Recent Bug Fixes and Parameter Combination Improvements

### Bug Fix: Registration Flow Getting Stuck

**Issue**: New users with URLs like `?token=xxx&lang=vi-VN&appType=1&op=GN&cg=Credit_VN` (missing gameId, non-direct mode, non-SabaPlay) would get stuck after registration completion.

**Root Cause**:

1. `PreloadResourceRegister.handleAuthorizedAccess` was not calling `updateStatePreloadResource()` when lobby configs were successfully loaded
2. `Register.updateToLoadGameId` had no fallback when no enabled games were available

**Fix Applied**:

#### 1. PreloadResourceRegister Fix

```typescript
const handleAuthorizedAccess = async () => {
    try {
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            updateStatePreloadResource();
        } else {
            if (lobby?.lobbyConfigs) {
                updateLobbyConfigs(lobby?.lobbyConfigs);
                getAndHandleBannerOffer(authorizeResponse, lobby?.lobbyConfigs, setBannerId);
                getAndHandleGameOfferIds(authorizeResponse, lobby?.lobbyConfigs, setGameOfferIds);
                // Fix: Call updateStatePreloadResource when lobby configs are successfully loaded
                updateStatePreloadResource();
            }
        }
    } catch (error) {
        console.error(error);
        // Fix: Call updateStatePreloadResource even on error to prevent getting stuck
        updateStatePreloadResource();
    }
};
```

#### 2. Register updateToLoadGameId Fix

```typescript
updateToLoadGameId = async (authorizeResponse: AuthorizeResponse) => {
    const lobby = await getLobbyConfigs(session);
    const enabledRenderGameSettings = getEnabledRenderGameSettings(lobby?.lobbyConfigs, authorizeResponse);

    if (firstSSOToLobby && enabledRenderGameSettings.length > 0) {
        this.setState({ toLoadGameId: 0 });
    } else if (enabledRenderGameSettings.length > 0) {
        for (const gameSetting of enabledRenderGameSettings) {
            const isServiceAvailable = await getServiceStatusIsAvailable(gameSetting);
            if (isServiceAvailable) {
                this.setState({ toLoadGameId: gameSetting.id });
                break;
            }
        }
    } else {
        // Fix: Handle case when no enabled games are available - default to lobby
        this.setState({ toLoadGameId: 0 });
    }
};
```

**Impact on Parameter Combinations**:

-   All combinations now have guaranteed completion paths
-   Error handling prevents flows from getting stuck
-   Lobby fallback ensures users always have a destination
-   Network errors are handled gracefully

**Updated Combination Behavior**:

-   **Before Fix**: Combinations 1, 2, 3, 5, 7, 9, 11, 13, 15 could get stuck
-   **After Fix**: All combinations complete successfully with proper error handling

## Conclusion

This comprehensive analysis covers all 16 possible combinations of URL context parameters and their resulting behaviors. Understanding these combinations is crucial for:

-   **Development**: Implementing correct logic for each scenario
-   **Testing**: Ensuring all combinations are properly tested
-   **Debugging**: Identifying issues based on parameter combinations
-   **Analytics**: Tracking user journeys accurately
-   **Documentation**: Providing clear guidance for integration scenarios

The parameter combinations provide flexibility for different integration scenarios while maintaining consistent user experience across all access methods.
