# URL Parameter Redundancy Handling Guide

## Overview

This guide addresses the redundancy between `ref` (direct mode) and `op=SP` (SabaPlay) URL parameters and provides solutions for handling these combinations effectively.

## Problem Statement

### Redundant Combinations Identified

Based on the URL Parameter Combinations Matrix, the following combinations are redundant:

| Combination | URL Example | Issue | Behavior |
|-------------|-------------|-------|----------|
| 4 | `?gameId=0&ref=true&op=SP` | Redundant SabaPlay flag | Both trigger auto nickname creation |
| 6 | `?gameId=0&ref=true&rurl=<base64>&op=SP` | Redundant SabaPlay flag | Both support redirect URL |
| 10 | `?gameId=123&ref=true&op=SP` | Redundant SabaPlay flag | Both trigger auto nickname creation |
| 12 | `?gameId=123&ref=true&rurl=<base64>&op=SP` | Redundant SabaPlay flag | Both support redirect URL |
| 16 | `?ref=true&op=SP` | Redundant flags | Both trigger auto nickname creation |

### Your Specific Case

**URL**: `http://localhost:3000?token=d5548fbd-06d9-4b23-aff2-b8731a88916e&lang=vi-VN&appType=1&ref=d_direct&op=GN&cg=Credit_VN`

**Analysis**:
- `ref=d_direct` → `isDirectMode = true`
- `op=GN` → `isSabaPlay = false` (only `op=SP` sets this to true)
- **Result**: No redundancy in this case
- **Issue**: Missing `rurl` parameter for post-game redirect

## Enhanced URL Context Solution

### 1. Updated Parameter Parsing

```typescript
// Enhanced redirect URL logic: support rurl for both direct mode and SabaPlay
let redirectUrl = "";
if (isDirectMode) {
    redirectUrl = params.get("rurl") || "";
} else if (isSabaPlay) {
    // Support rurl for SabaPlay even without ref parameter
    redirectUrl = params.get("rurl") || "";
}

// Detect redundant combinations
const isRedundantCombination = isDirectMode && isSabaPlay;

// Determine effective mode for business logic
let effectiveMode: 'direct' | 'sabaplay' | 'normal' = 'normal';
if (isRedundantCombination) {
    // When both are present, prioritize direct mode for game selection logic
    // but keep SabaPlay for UI/branding purposes
    effectiveMode = 'direct';
} else if (isDirectMode) {
    effectiveMode = 'direct';
} else if (isSabaPlay) {
    effectiveMode = 'sabaplay';
}
```

### 2. Utility Functions for Redundancy Handling

```typescript
/**
 * Determines if auto nickname creation should be triggered
 */
export function shouldAutoCreateNickname(context: URLContextModel): boolean {
    return !!(context.isDirectMode || context.isSabaPlay);
}

/**
 * Determines the effective game selection mode
 */
export function getGameSelectionMode(context: URLContextModel): 'direct' | 'sso' {
    // Direct mode always bypasses SSO logic, even when redundant with SabaPlay
    return context.isDirectMode ? 'direct' : 'sso';
}

/**
 * Validates if the URL combination is redundant and provides recommendations
 */
export function validateURLCombination(context: URLContextModel): {
    isValid: boolean;
    isRedundant: boolean;
    recommendations: string[];
    warnings: string[];
}
```

## Recommended URL Patterns

### 1. Direct Access (Recommended)
```
?ref=true&rurl=<base64-encoded-url>
```
- **Use Case**: Direct game access from external systems
- **Behavior**: Bypasses SSO logic, uses URL gameId directly
- **Redirect**: Supports post-game redirect via rurl

### 2. SabaPlay Integration (Recommended)
```
?op=SP&rurl=<base64-encoded-url>
```
- **Use Case**: SabaPlay platform integration
- **Behavior**: Applies SSO logic, platform-specific UI
- **Redirect**: Supports post-game redirect via rurl

### 3. Avoid Redundant Combinations
```
❌ ?ref=true&op=SP&rurl=<base64-encoded-url>  // Redundant
✅ ?ref=true&rurl=<base64-encoded-url>       // Direct access
✅ ?op=SP&rurl=<base64-encoded-url>          // SabaPlay integration
```

## Implementation Guidelines

### 1. Business Logic Decisions

```typescript
// Auto nickname creation
if (shouldAutoCreateNickname(urlContext)) {
    console.log(`Auto creating nickname - DirectMode: ${urlContext.isDirectMode}, SabaPlay: ${urlContext.isSabaPlay}`);
    authorizeInfo = await autoCreateNickname(session, signOut);
}

// Game selection logic
const gameSelectionMode = getGameSelectionMode(urlContext);
if (gameSelectionMode === 'direct') {
    currentGameId = urlContext.gameId; // Use URL gameId directly
} else {
    currentGameId = applySSOLogic(urlContext.gameId); // Apply SSO logic
}

// Analytics tracking
const analyticsMethod = getAnalyticsMethod(urlContext);
```

### 2. Validation and Warnings

```typescript
// Validate URL combination
const validation = validateURLCombination(urlContext);
if (validation.isRedundant) {
    console.warn("Redundant URL parameters detected:", validation.warnings);
    console.log("Recommendations:", validation.recommendations);
}
```

### 3. Redirect URL Handling

```typescript
// Enhanced redirect URL support
if (urlContext.redirectUrl) {
    // Store for post-game redirect
    const decodedUrl = GameUtils.base64Decode(urlContext.redirectUrl);
    console.log("Post-game redirect URL:", decodedUrl);
}
```

## Migration Strategy

### Phase 1: Backward Compatibility
- Keep existing logic working
- Add redundancy detection and warnings
- Support rurl for both direct mode and SabaPlay

### Phase 2: Documentation and Training
- Update integration documentation
- Train partners on recommended URL patterns
- Provide migration examples

### Phase 3: Enforcement (Optional)
- Add validation to reject redundant combinations
- Implement URL parameter cleaning
- Monitor usage patterns

## Testing Scenarios

### 1. Your Specific Case
```typescript
// Test URL: ?ref=d_direct&op=GN
const context = parseContextFromURL();
expect(context.isDirectMode).toBe(true);
expect(context.isSabaPlay).toBe(false);
expect(context.isRedundantCombination).toBe(false);
expect(context.effectiveMode).toBe('direct');
```

### 2. Redundant Combination
```typescript
// Test URL: ?ref=true&op=SP
const context = parseContextFromURL();
expect(context.isDirectMode).toBe(true);
expect(context.isSabaPlay).toBe(true);
expect(context.isRedundantCombination).toBe(true);
expect(context.effectiveMode).toBe('direct');
```

### 3. SabaPlay with Redirect
```typescript
// Test URL: ?op=SP&rurl=<base64>
const context = parseContextFromURL();
expect(context.isDirectMode).toBe(false);
expect(context.isSabaPlay).toBe(true);
expect(context.redirectUrl).toBe('<base64>');
expect(context.effectiveMode).toBe('sabaplay');
```

## Best Practices

### 1. URL Parameter Guidelines
- **Use `ref=true`** for direct access scenarios
- **Use `op=SP`** for SabaPlay platform integration
- **Always include `rurl`** when post-game redirect is needed
- **Avoid combining both** `ref` and `op=SP` in the same URL

### 2. Integration Examples

#### Direct Game Access
```
https://game.example.com?token=<token>&ref=true&gameId=123&rurl=<base64-encoded-redirect>
```

#### SabaPlay Integration
```
https://game.example.com?token=<token>&op=SP&gameId=123&rurl=<base64-encoded-redirect>
```

#### Lobby Access
```
https://game.example.com?token=<token>&gameId=0
```

### 3. Error Handling
```typescript
// Handle invalid redirect URLs
if (urlContext.redirectUrl) {
    try {
        const decodedUrl = GameUtils.base64Decode(urlContext.redirectUrl);
        if (!isValidURL(decodedUrl)) {
            console.warn("Invalid redirect URL format");
            urlContext.redirectUrl = "";
        }
    } catch (error) {
        console.error("Failed to decode redirect URL:", error);
        urlContext.redirectUrl = "";
    }
}
```

## Conclusion

The enhanced URL context solution provides:

1. **Backward Compatibility**: Existing URLs continue to work
2. **Redundancy Detection**: Clear identification of redundant combinations
3. **Enhanced Functionality**: Support for rurl in both direct mode and SabaPlay
4. **Clear Guidelines**: Recommended URL patterns for different use cases
5. **Validation Tools**: Utilities to validate and clean URL combinations

This approach maintains flexibility while providing clear guidance for avoiding redundancy and ensuring proper functionality across all integration scenarios. 