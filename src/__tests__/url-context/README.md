# URL Parameter Combinations Test Suite

## Overview

This test suite provides comprehensive coverage for all 16 parameter combinations defined in the URL Parameter Combinations Matrix. The tests follow the AAA (Arrange, Act, Assert) pattern and ensure proper handling of all URL context scenarios.

## Test Coverage

### Complete Parameter Combinations Matrix - All 16 Cases

#### Category 1: Lobby Access (gameId = 0 or absent)

| Case | URL Parameters                               | Expected Behavior                  | Test Status |
| ---- | -------------------------------------------- | ---------------------------------- | ----------- |
| 1    | `?gameId=0`                                  | Normal SSO to Lobby                | ✅          |
| 2    | `?gameId=0&op=SP`                            | SabaPlay to Lobby                  | ✅          |
| 3    | `?gameId=0&ref=d_direct`                     | Normal SSO to Lobby (ref ignored)  | ✅          |
| 4    | `?gameId=0&ref=d_direct&op=SP`               | SabaPlay to Lobby (ref ignored)    | ✅          |
| 5    | `?gameId=0&ref=d_direct&rurl=<base64>`       | Normal SSO to Lobby (rurl ignored) | ✅          |
| 6    | `?gameId=0&ref=d_direct&rurl=<base64>&op=SP` | SabaPlay to Lobby (rurl ignored)   | ✅          |
| 13   | No parameters                                | Default to Lobby                   | ✅          |
| 14   | `?op=SP`                                     | SabaPlay Default                   | ✅          |
| 15   | `?ref=d_direct`                              | Normal SSO to Lobby (ref ignored)  | ✅          |
| 16   | `?ref=d_direct&op=SP`                        | SabaPlay to Lobby (ref ignored)    | ✅          |

#### Category 2: Game Access (gameId > 0)

| Case | URL Parameters                                 | Expected Behavior                            | Test Status |
| ---- | ---------------------------------------------- | -------------------------------------------- | ----------- |
| 7    | `?gameId=123`                                  | Normal SSO to Game                           | ✅          |
| 8    | `?gameId=123&op=SP`                            | SabaPlay to Game                             | ✅          |
| 9    | `?gameId=123&ref=d_direct`                     | Direct Mode to Game                          | ✅          |
| 10   | `?gameId=123&ref=d_direct&op=SP`               | Direct Mode + SabaPlay to Game               | ✅          |
| 11   | `?gameId=123&ref=d_direct&rurl=<base64>`       | Direct Mode to Game with Redirect            | ✅          |
| 12   | `?gameId=123&ref=d_direct&rurl=<base64>&op=SP` | Direct Mode + SabaPlay to Game with Redirect | ✅          |

## Additional Test Categories

### Edge Cases and Error Handling

-   ✅ HTML-Encoded Ampersands Handling
-   ✅ Invalid Parameter Values
-   ✅ Ref Parameter Validation
-   ✅ Parameter Boundary Testing

### URL Context Loading and Storage

-   ✅ `loadURLContext` Function
-   ✅ `updateURLContext` Function
-   ✅ `getURLContext` Function

### User-Specific Storage Integration

-   ✅ Cross-User Isolation
-   ✅ Missing Username Handling

### Production URL Analysis

-   ✅ Current Production URL Case

### Integration Scenarios

-   ✅ Complete User Journey Tests
-   ✅ Network and Storage Failures

## Key Test Features

### 1. AAA Pattern Compliance

All tests follow the Arrange, Act, Assert pattern:

```typescript
it("should handle ?gameId=0 correctly", () => {
    // Arrange
    globalThis.location.search = "?gameId=0";
    const expected: URLContextModel = {
        /* ... */
    };

    // Act
    const result = parseContextFromURL();

    // Assert
    expect(result).toEqual(expected);
});
```

### 2. Comprehensive Mocking

-   Mocked all external dependencies
-   Isolated test environment
-   Proper cleanup between tests

### 3. Edge Case Coverage

-   HTML-encoded ampersands (`&amp;`)
-   Invalid parameter values
-   Boundary conditions
-   Network failures

### 4. User-Specific Storage Testing

-   Cross-user isolation verification
-   Username-based storage keys
-   Missing username scenarios

## Running the Tests

### Run All URL Context Tests

```bash
npm test -- src/__tests__/url-context/
```

### Run Specific Test File

```bash
npm test -- src/__tests__/url-context/url-parameter-combinations.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage src/__tests__/url-context/
```

### Run Specific Test Case

```bash
npm test -- --testNamePattern="Case 1: Normal SSO to Lobby"
```

## Test Results Summary

### Expected Test Count

-   **Total Tests**: 50+ individual test cases
-   **Parameter Combinations**: 16 core combinations
-   **Edge Cases**: 15+ additional scenarios
-   **Integration Tests**: 10+ user journey tests

### Coverage Areas

-   ✅ URL parsing logic
-   ✅ Direct mode calculation
-   ✅ SabaPlay integration
-   ✅ Redirect URL handling
-   ✅ User-specific storage
-   ✅ Error handling
-   ✅ Production scenarios

## Bug Fixes Verified

### 1. Cross-User latestGameId Interference - FIXED ✅

-   Tests verify user-specific storage isolation
-   No cross-user state leakage
-   Proper username-based keys

### 2. HTML-Encoded Ampersands Breaking URL Parsing - FIXED ✅

-   Tests verify proper decoding of `&amp;` to `&`
-   Mixed encoded/non-encoded parameter handling
-   All integration scenarios work

### 3. Smart Direct Mode Logic - FIXED ✅

-   Tests verify lobby access with `ref` and `rurl` parameters
-   `effectiveRedirectUrl` calculation when `gameId=0`
-   Proper direct mode behavior

## Maintenance

### Adding New Test Cases

1. Follow the AAA pattern
2. Use descriptive test names
3. Mock external dependencies
4. Add to appropriate category
5. Update this README

### Updating Tests for Code Changes

1. Review parameter combination matrix
2. Update expected values if logic changes
3. Add tests for new edge cases
4. Verify all existing tests pass

### Test Data Management

-   Use realistic test data
-   Include production URL examples
-   Test boundary conditions
-   Verify error scenarios
