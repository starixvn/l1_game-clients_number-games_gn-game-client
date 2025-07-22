# URL Context Documentation

This documentation provides comprehensive analysis of the URL context parameters (`isDirectMode`, `redirectUrl`, `isSabaPlay`, `gameId`) and their critical roles in the first login to lobby flow of the gaming application.

## 🚨 Breaking Change Alert

### ⚠️ **Major Change: isDirectMode Now Equals isSabaPlay**

**Change Applied**: `isDirectMode` is now set to the same value as `isSabaPlay` instead of being based on the `ref` parameter.

**Before**:
```typescript
const isDirectMode = !!params.get("ref"); // Based on ref parameter
const isSabaPlay = params.get("op") === "SP";
```

**After**:
```typescript
const isSabaPlay = params.get("op") === "SP";
const isDirectMode = isSabaPlay; // Now identical to isSabaPlay
```

### **Critical Implications**

#### **❌ Breaking Changes**:
- **Direct Mode Access**: URLs with `?ref=true` but `op≠SP` no longer work as direct mode
- **Redirect URLs**: Only available when `op=SP` (SabaPlay mode)
- **Analytics**: Same tracking for direct mode and SabaPlay (may be misleading)
- **Game Selection**: Non-SabaPlay direct access now applies SSO logic

#### **✅ Still Working**:
- `?op=SP&gameId=123` → Direct mode, bypasses SSO
- `?op=SP&gameId=123&rurl=<base64>` → Direct mode with redirect
- `?gameId=123` → Normal SSO flow

#### **❌ No Longer Working**:
- `?ref=true&gameId=123` → No longer direct mode
- `?ref=true&gameId=123&rurl=<base64>` → No redirect URL
- `?ref=true&op=GN&gameId=123` → No longer direct mode

### **Migration Required**

If you have existing integrations using `?ref=true` for direct mode access, you need to:
1. **Change URLs** to use `?op=SP` instead of `?ref=true`
2. **Update Analytics** to account for combined tracking
3. **Test All Flows** to ensure they work with the new logic
4. **Update Documentation** to reflect the new URL patterns

## 📋 Documentation Overview

### Core Analysis Documents
- **[URL Context Analysis](URL_Context_Analysis.md)** - Comprehensive analysis of URL context parameters and their roles
- **[URL Parameter Combinations](URL_Parameter_Combinations.md)** - Complete matrix of all parameter combinations and behaviors
- **[URL Context Flow Diagrams](URL_Context_Flow_Diagrams.md)** - Visual flow diagrams for all application scenarios
- **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** - Comprehensive testing guidelines and test cases
- **[isDirectMode vs isSabaPlay Analysis](isDirectMode_vs_isSabaPlay_Analysis.md)** - Detailed comparison and confusion analysis

### Testing Documentation
- **[Analytics Testing Documentation](Analytics_Testing_Documentation.md)** - Comprehensive testing guidelines for analytics integration
- **[First Login Redirect Lobby](first-login-redirect-lobby.md)** - Detailed flow analysis for first login to lobby
- **[First Login Redirect Game](first-login-redirect-game.md)** - Detailed flow analysis for first login to game

### Recent Updates
- **Breaking Change Applied**: `isDirectMode` now equals `isSabaPlay`
- **Analytics Integration**: Complete test coverage for SSO method classification
- **Comprehensive Testing**: Unit tests, integration tests, and automated test runner

## 🐛 Recent Bug Fixes

### Registration Flow Getting Stuck - FIXED ✅

**Issue**: New users with URLs like `?token=xxx&lang=vi-VN&appType=1&op=GN&cg=Credit_VN` (missing gameId, non-direct mode, non-SabaPlay) would get stuck after registration completion.

**Root Cause**: 
1. `PreloadResourceRegister.handleAuthorizedAccess` was not calling `updateStatePreloadResource()` when lobby configs were successfully loaded
2. `Register.updateToLoadGameId` had no fallback when no enabled games were available

**Fix Applied**:
- **PreloadResourceRegister**: Added `updateStatePreloadResource()` call when lobby configs are successfully loaded and on error
- **Register.updateToLoadGameId**: Added fallback to lobby (`toLoadGameId = 0`) when no enabled games are available

**Impact**: All registration flows now complete successfully with proper error handling.

## 🔧 Key Components

### URL Context Parameters
- **`gameId`**: Determines which game to load or whether to show the lobby
- **`isDirectMode`**: Controls SSO redirect logic bypass
- **`redirectUrl`**: Base64 encoded URL for post-game redirection
- **`isSabaPlay`**: Identifies SabaPlay platform integration

### Critical Decision Points
- **Direct Mode vs Non-Direct Mode**: Different game selection logic
- **SabaPlay Integration**: Auto nickname creation trigger
- **First SSO to Lobby**: Business requirement for lobby redirection
- **Game Service Availability**: Fallback logic for unavailable games

## 📊 Test Coverage

The documentation includes comprehensive test cases covering:
- Happy path scenarios
- Edge cases and error handling
- All 16 parameter combinations
- Integration scenarios
- Recent bug fix scenarios

## 🚀 Getting Started

1. Start with **[URL Context Analysis](URL_Context_Analysis.md)** for an overview
2. Review **[First Login to Lobby Flow](first-login-redirect-lobby.md)** for detailed workflow
3. Check **[URL Parameter Combinations](URL_Parameter_Combinations.md)** for specific scenarios
4. Use **[URL Context Testing Guide](URL_Context_Testing_Guide.md)** for testing implementation

## 📝 Contributing

When making changes to URL context logic:
1. Update the relevant documentation files
2. Add test cases to the testing guide
3. Update flow diagrams if needed
4. Document any new parameter combinations
