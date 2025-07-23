# Latest Workflow Documentation

## Overview

This document describes the complete workflow for the game client application, including URL parsing, authentication, routing, and game rendering based on the latest console.logs and code analysis.

## Table of Contents

1. [URL Context Parsing](#url-context-parsing)
2. [Splash Screen Initialization](#splash-screen-initialization)
3. [Authentication Flow](#authentication-flow)
4. [Dashboard Rendering](#dashboard-rendering)
5. [Game Rendering Logic](#game-rendering-logic)
6. [Register Flow](#register-flow)
7. [Lobby Rendering](#lobby-rendering)
8. [Header Title Logic](#header-title-logic)

## URL Context Parsing

### File: `src/_shared/react-contexts/url-context.ts`

#### Console Logs:

```
[URLContext] loadURLContext - Starting URL context loading
[URLContext] parseContextFromURL - URL search params: ?token=xxx&lang=vi-VN&appType=1&gameId=1003&op=SP&cg=SabaPlay_VN
[URLContext] parseContextFromURL - Decoded search params: ?token=xxx&lang=vi-VN&appType=1&gameId=1003&op=SP&cg=SabaPlay_VN
[URLContext] parseContextFromURL - All params: (6) [Array(2), Array(2), Array(2), Array(2), Array(2), Array(2)]
[URLContext] parseContextFromURL - Direct mode calculation: {ref: null, redirectUrl: null, effectiveRedirectUrl: null, isSabaPlay: true, gameId: 1003, isDirectMode: true}
[URLContext] parseContextFromURL - Parsed result: {token: 'xxx', language: 'vi-VN', gameId: 1003, isDirectMode: true, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Context from URL: {token: 'xxx', language: 'vi-VN', gameId: 1003, isDirectMode: true, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Context from localStorage: {language: 'vi-VN', gameId: 0, isDirectMode: true, redirectUrl: null, firstSSOToLobby: false, isSabaPlay: true}
[URLContext] loadURLContext - Storing context in localStorage: {token: undefined, language: 'vi-VN', gameId: 1003, isDirectMode: true, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
[URLContext] loadURLContext - Final context returned: {token: 'xxx', language: 'vi-VN', gameId: 1003, isDirectMode: true, redirectUrl: null, firstSSOToLobby: true, isSabaPlay: true}
```

#### Key Logic:

1. **HTML-encoded ampersands handling**: Decodes `&amp;` to `&` before parsing
2. **User-specific latestGameId**: Uses username to create isolated storage keys
3. **Direct mode calculation**:
    - `isDirectMode = !!(ref && effectiveRedirectUrl) || (isSabaPlay && gameId !== 0)`
    - When `gameId=0` (lobby), `effectiveRedirectUrl` is set to `null` to ignore `rurl`
4. **Context storage**: Stores context in localStorage without token for security

## Splash Screen Initialization

### File: `src/components/page-components/splash-screen/index.tsx`

#### Console Logs:

```
[SplashScreen] handleInitialization - Starting initialization
[SplashScreen] handleInitialization - URL Context values: {gameId: 1003, isDirectMode: true, token: 'xxx', language: 'vi-VN', firstSSOToLobby: true, isSabaPlay: true}
[SplashScreen] handleInitialization - Session retrieved: {isAuthenticated: true, umInfo: null, username: 'SabaPlay_4100300~401837', language: 'vi-VN', ss: 'xxx'}
[SplashScreen] handleInitialization - Language loaded: vi
[SplashScreen] handleInitialization - Authorization result: {authorized: true, user: {...}, umInfo: null, isUM: false}
[SplashScreen] handleInitialization - Checking auto nickname creation conditions
[SplashScreen] handleInitialization - authorizeInfo?.authorized: true
[SplashScreen] handleInitialization - isSabaPlay: true
[SplashScreen] handleInitialization - Condition: !authorizeInfo?.authorized && isSabaPlay = false
[SplashScreen] handleInitialization - Final authorization check: true
[SplashScreen] handleInitialization - User authorized, loading lobby configs
[SplashScreen] handleInitialization - Initial toLoadGameId: 1003
[SplashScreen] handleInitialization - isDirectMode: true
[SplashScreen] handleInitialization - Direct mode, using URL gameId directly: 1003
[SplashScreen] handleInitialization - Final toLoadGameId set: 1003
[SplashScreen] handleInitialization - Running custom startup
[SplashScreen] handleInitialization - Custom startup completed, isDoneLoadConfig set to true
```

#### Key Logic:

1. **Session retrieval**: Gets session from token or verifies existing session
2. **Language loading**: Maps language codes and sets Tolgee language
3. **Authorization check**: Verifies user authorization status
4. **Auto nickname creation**: For SabaPlay users who aren't authorized
5. **Game ID determination**:
    - Direct mode: Uses URL gameId directly
    - Non-direct mode: Goes through SSO redirect logic
6. **User-specific latestGameId**: Uses `getUserLatestGameId(player?.session?.username)`

## Authentication Flow

### Auto Nickname Creation (SabaPlay)

```
[SplashScreen] handleInitialization - Auto creating nickname for SabaPlay
[SplashScreen] handleInitialization - Auto nickname creation result: {authorized: true, user: {...}, umInfo: null, isUM: false}
```

### SSO Redirect Logic

```
[SplashScreen] getSSORedirectToGameId - Input values: {urlGameId: 0, userLatestGameId: 0, toLoadGameId: 0, firstSSOToLobby: true}
[SplashScreen] getSSORedirectToGameId - First SSO to lobby, redirecting to lobby
[SplashScreen] getSSORedirectToGameId - Final result: 0
```

## Dashboard Rendering

### File: `src/components/page-components/dashboard/index.tsx`

#### Console Logs:

```
[Dashboard] constructor - Props received: {queryGame: 1003, directMode: true, authorizeResponse: {...}, lobbyConfigs: {...}}
[Dashboard] constructor - Initial state set: {queryGame: 1003, openGameId: null, authorizeInfo: {...}}
[Dashboard] constructor - Dashboard initialized successfully
[Dashboard] render - Component render called
[Dashboard] render - Rendering dashboard
[Dashboard] renderDashBoard - Starting dashboard render
[Dashboard] componentDidMount - Starting component initialization
[Dashboard] componentDidMount - Checking if game is not in offer
[Dashboard] componentDidMount - Opening game from queryGame: 1003
[Dashboard] openGame - Opening game: 1003
[Dashboard] openGame - Game opened and URL context updated
[Dashboard] componentDidMount - Component initialization complete
```

#### Key Logic:

1. **Props validation**: Validates queryGame, directMode, authorizeResponse, lobbyConfigs
2. **State initialization**: Sets initial state with queryGame and empty openGameId
3. **Game offer check**: Verifies if the requested game is available
4. **Game opening**: Automatically opens the game if it's in the offer list

## Game Rendering Logic

### File: `src/components/page-components/dashboard/handlers/dash-board-handler.ts`

#### Console Logs:

```
[DashboardHandler] constructor - Props: {router: {...}, data-testid: 'dashboard-component', session: {...}, queryGame: 1003, setIsUm: ƒ, directMode: true, authorizeResponse: {...}, lobbyConfigs: {...}}
[DashboardHandler] checkIsNotOfferGame - offerGames: (7) [1001, 1002, 1003, 1004, 1005, 1006, 1007]
[DashboardHandler] checkIsNotOfferGame - props: {directMode: true, queryGame: 1003}
[DashboardHandler] checkIsNotOfferGame - Direct mode result: false
[DashboardHandler] shouldRenderGames - Input: {offerGames: Array(7), openGameId: 1003}
[DashboardHandler] shouldRenderGames - URL context: {backToLobby: true, ssoRedirectGameId: 1003}
[DashboardHandler] shouldRenderGames - Effective gameId: 1003
[DashboardHandler] shouldRenderGames - Final result: true
[DashboardHandler] shouldRenderGames - Breakdown: {effectiveGameId: 1003, offerGamesIncludes: true, notBackToLobby: false, ssoRedirectGameIdGreaterThan0: true}
```

#### Key Logic:

1. **Game offer validation**: Checks if the game is in the available offer list
2. **Direct mode handling**: Special logic for direct mode with `queryGame: 0` (lobby)
3. **Game rendering decision**: Determines whether to render games or lobby
4. **Effective game ID calculation**: Uses openGameId or falls back to ssoRedirectGameId

### Special Cases:

-   **Lobby access with direct mode**: `queryGame: 0` returns `false` for "not in offer"
-   **Invalid game IDs**: Returns `true` for "not in offer" and shows error modal

## Register Flow

### File: `src/components/page-components/dashboard/register/register.tsx`

#### Console Logs:

```
[Register] constructor - Props received: {session: {...}, isDirectMode: true, gameId: 1003, firstSSOToLobby: true, isSabaPlay: true}
[Register] constructor - gameId from props: 1003
[Register] constructor - Initial state set: {avatar: 5, isGalleryOpened: false, isValidUsername: true, name: 'Player123', formValidity: '', isTriggerPreloadResources: false, isDonePreloadResource: false, authorizeResponse: null, lobbyConfigs: null, isUm: false, isClickRegister: false, toLoadGameId: 1003}
[Register] componentDidMount - Register component mounted
[Register] componentDidMount - Current state: {avatar: 5, isGalleryOpened: false, isValidUsername: true, name: 'Player123', formValidity: '', isTriggerPreloadResources: false, isDonePreloadResource: false, authorizeResponse: null, lobbyConfigs: null, isUm: false, isClickRegister: false, toLoadGameId: 1003}
[Register] submit - Form submitted
[Register] submit - Form data: {name: 'Player123', avatar: 5}
[Register] submit - Props: {isDirectMode: true, gameId: 1003, isSabaPlay: true}
[Register] submit - Creating nickname...
[Register] submit - createNickname result: {authorized: true, user: {...}, umInfo: null, isUM: false}
[Register] submit - Authorization successful
[Register] submit - Direct mode, keeping original gameId
[Register] render - Current state: {avatar: 5, isGalleryOpened: false, isValidUsername: true, name: 'Player123', formValidity: '', isTriggerPreloadResources: true, isDonePreloadResource: false, authorizeResponse: {...}, lobbyConfigs: null, isUm: false, isClickRegister: true, toLoadGameId: 1003}
[Register] render - Props: {isDirectMode: true, isSabaPlay: true, gameId: 1003}
[Register] render - isDonePreloadResource: false
[Register] render - Rendering Register form
```

#### Key Logic:

1. **Initial state setup**: Sets default avatar, generated name, and toLoadGameId
2. **Form validation**: Validates username format and requirements
3. **Nickname creation**: Calls API to create user nickname
4. **Game ID handling**:
    - Direct mode: Keeps original gameId
    - Non-direct mode: Determines gameId through SSO redirect logic
5. **Preload resources**: Triggers resource preloading after successful registration

## Preload Resource Register

### File: `src/components/page-components/dashboard/register/preload-resource/index.tsx`

#### Console Logs:

```
[PreloadResourceRegister] Component props: {isDirectMode: true, gameId: 1003, session: {...}, authorizeResponse: {...}}
[PreloadResourceRegister] useEffect - Component mounted, calling handleAuthorizedAccess
[PreloadResourceRegister] handleAuthorizedAccess - Starting
[PreloadResourceRegister] handleAuthorizedAccess - Lobby configs result: {lobbyConfigs: {...}}
[PreloadResourceRegister] handleAuthorizedAccess - Lobby configs found, updating
[PreloadResourceRegister] handleAuthorizedAccess - Calling updateStatePreloadResource after lobby configs
[PreloadResourceRegister] useMemo - Calculating render result: {isDirectMode: true, gameId: 1003}
[PreloadResourceRegister] useMemo - Rendering PreloadResources for direct mode
```

#### Key Logic:

1. **Lobby configs loading**: Fetches lobby configurations
2. **Banner and game offers**: Handles banner offers and game offer IDs
3. **Resource preloading**: Preloads game resources based on mode and gameId
4. **State updates**: Updates parent component state when preloading completes

## Lobby Rendering

### File: `src/components/page-components/lobby/lobby.tsx`

#### Console Logs:

```
[Lobby] AnalyticsHelper.trackLobby() called
[Lobby] useEffect - Setting showPFSetting to empty string
[Lobby] useEffect - Broadcasting OPEN_GAME_ID: 0
[Lobby] handleOpenGame - Opening game: 1003
```

#### Key Logic:

1. **Analytics tracking**: Tracks lobby visits
2. **Settings reset**: Clears PF settings on lobby entry
3. **Game transmitter**: Broadcasts lobby state to other components
4. **Game opening**: Handles game selection from lobby

## Header Title Logic

### File: `src/components/page-components/header/header-title/index.tsx`

#### Key Logic:

1. **Logo selection**:
    - SabaPlay: Shows SabaPlay logo
    - Non-direct mode: Shows site logo
    - Direct mode: No logo (empty)
2. **Title display**:
    - Games mode: Shows game name with animation
    - Lobby mode: Shows logo
3. **Translation**: Uses game-specific translation namespace

## Complete Workflow Summary

### 1. URL Parsing Phase

-   Decodes HTML-encoded ampersands
-   Determines direct mode based on parameters
-   Handles user-specific latestGameId storage
-   Ignores rurl when gameId=0 (lobby)

### 2. Splash Screen Phase

-   Retrieves and validates session
-   Loads language settings
-   Checks authorization status
-   Auto-creates nickname for SabaPlay users if needed
-   Determines target gameId based on mode

### 3. Authentication Phase

-   Validates user credentials
-   Creates nickname if required
-   Loads lobby configurations
-   Handles SSO redirect logic

### 4. Dashboard Phase

-   Initializes dashboard with props
-   Validates game availability
-   Determines rendering mode (games vs lobby)
-   Opens games automatically if in direct mode

### 5. Game Rendering Phase

-   Checks if game is in offer list
-   Handles special cases (lobby with direct mode)
-   Renders appropriate component (games or lobby)
-   Manages game transmitters and connections

### 6. Register Phase (if needed)

-   Shows registration form for new users
-   Validates username and avatar
-   Creates user account
-   Preloads resources
-   Redirects to dashboard

### 7. Lobby Phase

-   Tracks analytics
-   Manages game selection
-   Handles game opening
-   Broadcasts state changes

## Key Improvements in Latest Version

1. **User-specific latestGameId**: Prevents cross-user interference
2. **HTML-encoded ampersands handling**: Fixes URL parsing issues
3. **Smart direct mode logic**: Handles lobby access properly
4. **rurl parameter ignoring**: Prioritizes lobby access over redirects
5. **Enhanced error handling**: Better error modal management
6. **Comprehensive logging**: Detailed console logs for debugging

## Testing Scenarios

### Scenario 1: SabaPlay Direct Game Access

-   URL: `?token=xxx&gameId=1003&op=SP`
-   Expected: Direct mode, game 1003, no error modal

### Scenario 2: SabaPlay Lobby Access

-   URL: `?token=xxx&op=SP` (no gameId)
-   Expected: Non-direct mode, lobby, no error modal

### Scenario 3: SabaPlay Lobby with rurl

-   URL: `?token=xxx&ref=d_direct&rurl=xxx&op=SP`
-   Expected: Non-direct mode, lobby, rurl ignored

### Scenario 4: Regular User Game Access

-   URL: `?token=xxx&gameId=1003&op=GN`
-   Expected: Non-direct mode, SSO redirect logic

### Scenario 5: Regular User Lobby Access

-   URL: `?token=xxx&op=GN`
-   Expected: Non-direct mode, lobby

This documentation provides a comprehensive overview of the latest workflow based on the console.logs and code analysis.
