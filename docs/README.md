# URL Context Documentation

This documentation provides comprehensive analysis of the URL context parameters (`isDirectMode`, `redirectUrl`, `isSabaPlay`, `gameId`) and their critical roles in the first login to lobby flow of the gaming application.

## 🚨 Latest Updates (Latest Version)

### ✅ **Key Improvements Applied**

**1. User-Specific latestGameId Storage**

-   **Change**: `latestGameId` is now stored per user using username-based keys
-   **Before**: Global storage causing cross-user interference
-   **After**: `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Impact**: Prevents cross-user state leakage and ensures proper game tracking

**2. HTML-Encoded Ampersands Handling**

-   **Change**: URLs with `&amp;` are now properly decoded before parsing
-   **Before**: URL parsing failed with HTML-encoded ampersands
-   **After**: `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Impact**: Fixes URL parsing issues in various integrations

**3. Smart Direct Mode Logic**

-   **Change**: Direct mode calculation now properly handles lobby access
-   **Before**: `isDirectMode = !!(ref && effectiveRedirectUrl) || (isSabaPlay && gameId !== 0)`
-   **After**: Enhanced logic that ignores `rurl` when `gameId=0` (lobby)
-   **Impact**: Allows lobby access even when `ref` and `rurl` parameters are present

**4. Enhanced Error Handling**

-   **Change**: Better error modal management and fallback logic
-   **Before**: Some edge cases could cause infinite loading
-   **After**: Comprehensive error handling with proper fallbacks
-   **Impact**: More robust application behavior

### **Current Direct Mode Logic**

```typescript
// Current implementation in url-context.ts
const isDirectMode = !!(ref && effectiveRedirectUrl) || (isSabaPlay && gameId !== 0);

// Where effectiveRedirectUrl is calculated as:
const effectiveRedirectUrl = gameId === 0 ? null : redirectUrl;
```

**Behavior**:

-   **SabaPlay with gameId > 0**: Direct mode enabled
-   **SabaPlay with gameId = 0**: Non-direct mode (lobby access)
-   **ref + rurl with gameId > 0**: Direct mode enabled
-   **ref + rurl with gameId = 0**: Non-direct mode (rurl ignored for lobby)

## 📋 Documentation Overview

### Core Analysis Documents

-   **[Latest Workflow Documentation](latest-workflow-documentation.md)** - Complete workflow based on console.logs and current implementation
-   **[URL Context Analysis](URL_Context_Analysis.md)** - Comprehensive analysis of URL context parameters and their roles
-   **[URL Parameter Combinations](URL_Parameter_Combinations.md)** - Complete matrix of all parameter combinations and behaviors
-   **[URL Context Flow Diagrams](URL_Context_Flow_Diagrams.md)** - Visual flow diagrams for all application scenarios
-   **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** - Comprehensive testing guidelines and test cases
-   **[isDirectMode vs isSabaPlay Analysis](isDirectMode_vs_isSabaPlay_Analysis.md)** - Detailed comparison and confusion analysis

### Testing Documentation

-   **[First Login Redirect Lobby](first-login-redirect-lobby.md)** - Detailed flow analysis for first login to lobby
-   **[First Login Redirect Game](first-login-redirect-game.md)** - Detailed flow analysis for first login to game
-   **[URL Redundancy Handling Guide](URL_Redundancy_Handling_Guide.md)** - Guide for handling redundant URL parameters

### Recent Updates

-   **User-specific latestGameId**: Complete isolation per user
-   **HTML-encoded ampersands**: Fixed URL parsing issues
-   **Smart direct mode logic**: Proper lobby access handling
-   **Enhanced error handling**: Better fallback mechanisms
-   **Comprehensive logging**: Detailed console logs for debugging

## 🐛 Recent Bug Fixes

### 1. Cross-User latestGameId Interference - FIXED ✅

**Issue**: `latestGameId` was stored globally, causing cross-user interference when multiple users accessed the application.

**Root Cause**:

-   Global localStorage key used for all users
-   No user-specific isolation

**Fix Applied**:

-   **Storage Helper**: Added `getUserLatestGameId(username)` and `setUserLatestGameId(username, gameId)`
-   **Splash Screen**: Uses user-specific latestGameId instead of global one
-   **URL Context**: Stores and retrieves user-specific game IDs

**Impact**: Each user now has isolated game tracking, preventing cross-user interference.

### 2. HTML-Encoded Ampersands Breaking URL Parsing - FIXED ✅

**Issue**: URLs with `&amp;` (HTML-encoded ampersands) failed to parse correctly.

**Root Cause**:

-   URLSearchParams didn't handle HTML-encoded ampersands
-   Parsing failed for certain integration scenarios

**Fix Applied**:

-   **URL Context**: Added `searchParams.replace(/&amp;/g, '&')` before parsing
-   **Comprehensive Testing**: Verified all URL parameter combinations work

**Impact**: All URL parsing scenarios now work correctly, including HTML-encoded parameters.

### 3. SabaPlay Lobby Access Issues - FIXED ✅

**Issue**: SabaPlay users with `ref` and `rurl` parameters couldn't access lobby when `gameId=0`.

**Root Cause**:

-   Direct mode logic didn't properly handle lobby access scenarios
-   `rurl` parameter was always considered for direct mode calculation

**Fix Applied**:

-   **URL Context**: Enhanced direct mode logic to ignore `rurl` when `gameId=0`
-   **Effective Redirect URL**: Set to `null` when accessing lobby to prioritize lobby access

**Impact**: SabaPlay users can now access lobby properly regardless of `ref` and `rurl` parameters.

### 4. Dashboard Error Modal for Lobby Access - FIXED ✅

**Issue**: Dashboard showed error modal when accessing lobby in direct mode with `queryGame=0`.

**Root Cause**:

-   `checkIsNotOfferGame` incorrectly treated lobby access as "not in offer"
-   Direct mode logic didn't account for lobby scenarios

**Fix Applied**:

-   **Dashboard Handler**: Fixed `checkIsNotOfferGame` to return `false` for lobby access in direct mode
-   **Special Case Handling**: Added logic for `queryGame=0` in direct mode

**Impact**: Lobby access in direct mode no longer shows error modal.

## 🔧 Key Components

### URL Context Parameters

-   **`gameId`**: Determines which game to load or whether to show the lobby
-   **`isDirectMode`**: Controls SSO redirect logic bypass
-   **`redirectUrl`**: Base64 encoded URL for post-game redirection
-   **`isSabaPlay`**: Identifies SabaPlay platform integration

### Critical Decision Points

-   **Direct Mode vs Non-Direct Mode**: Different game selection logic
-   **SabaPlay Integration**: Auto nickname creation trigger
-   **First SSO to Lobby**: Business requirement for lobby redirection
-   **Game Service Availability**: Fallback logic for unavailable games
-   **User-Specific Storage**: Isolated game tracking per user

## 📊 Test Coverage

The documentation includes comprehensive test cases covering:

-   Happy path scenarios
-   Edge cases and error handling
-   All parameter combinations
-   Integration scenarios
-   User-specific storage scenarios
-   HTML-encoded URL scenarios

## 🚀 Getting Started

1. Start with **[Latest Workflow Documentation](latest-workflow-documentation.md)** for current implementation
2. Review **[URL Context Analysis](URL_Context_Analysis.md)** for detailed parameter analysis
3. Check **[URL Parameter Combinations](URL_Parameter_Combinations.md)** for specific scenarios
4. Use **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** for testing implementation

## 📝 Contributing

When making changes to URL context logic:

1. Update the relevant documentation files
2. Add test cases to the testing guide
3. Update flow diagrams if needed
4. Document any new parameter combinations
5. Ensure user-specific storage is maintained
6. Test HTML-encoded URL scenarios

## 🔍 Testing Scenarios

### Scenario 1: SabaPlay Direct Game Access

-   URL: `?token=xxx&gameId=1003&op=SP`
-   Expected: Direct mode, game 1003, no error modal

### Scenario 2: SabaPlay Lobby Access

-   URL: `?token=xxx&op=SP` (no gameId)
-   Expected: Non-direct mode, lobby, no error modal

### Scenario 3: SabaPlay Lobby with rurl

-   URL: `?token=xxx&ref=d_direct&rurl=xxx&op=SP`
-   Expected: Non-direct mode, lobby, rurl ignored

### Scenario 4: HTML-Encoded URL

-   URL: `?token=xxx&amp;gameId=1003&amp;op=SP`
-   Expected: Properly parsed, direct mode, game 1003

### Scenario 5: User-Specific Storage

-   Multiple users accessing same application
-   Expected: Each user has isolated latestGameId storage
