# Splash Screen Test Suite

## Overview

This test suite provides comprehensive coverage for the Splash Screen component, which is the initial entry point of the application. The tests ensure proper handling of URL parameters, authentication flow, and user redirection logic.

## Test Coverage

### Core Functionality Tests

#### Authentication and Session Management

| Test Case           | Description                          | Expected Behavior                             | Test Status |
| ------------------- | ------------------------------------ | --------------------------------------------- | ----------- |
| Authentication Flow | Validates SSO authentication process | Proper session handling and user data loading | ✅          |
| Session Validation  | Tests session token validation       | Correct session state management              | ✅          |
| User Data Loading   | Verifies user profile data retrieval | Complete user data population                 | ✅          |

#### URL Parameter Processing

| Test Case              | Description                                   | Expected Behavior                 | Test Status |
| ---------------------- | --------------------------------------------- | --------------------------------- | ----------- |
| Game ID Parameter      | Processes `gameId` parameter correctly        | Proper game selection and routing | ✅          |
| Direct Mode Parameter  | Handles `ref=d_direct` parameter              | Correct direct mode activation    | ✅          |
| SabaPlay Parameter     | Processes `op=SP` parameter                   | Proper SabaPlay mode handling     | ✅          |
| Redirect URL Parameter | Handles `rurl` parameter with base64 encoding | Correct redirect URL processing   | ✅          |

#### Component Lifecycle

| Test Case         | Description                        | Expected Behavior                      | Test Status |
| ----------------- | ---------------------------------- | -------------------------------------- | ----------- |
| Component Mount   | Tests initial component rendering  | Proper initialization and state setup  | ✅          |
| Component Update  | Validates prop changes handling    | Correct re-rendering and state updates | ✅          |
| Component Unmount | Tests cleanup on component removal | Proper resource cleanup                | ✅          |

### Integration Scenarios

#### User Journey Tests

| Test Case       | Description                | Expected Behavior                      | Test Status |
| --------------- | -------------------------- | -------------------------------------- | ----------- |
| First Time User | New user registration flow | Proper onboarding and data collection  | ✅          |
| Returning User  | Existing user login flow   | Correct session restoration            | ✅          |
| Game Access     | Direct game access flow    | Proper game loading and initialization | ✅          |
| Lobby Access    | Lobby redirection flow     | Correct lobby navigation               | ✅          |

#### Error Handling

| Test Case               | Description                        | Expected Behavior                      | Test Status |
| ----------------------- | ---------------------------------- | -------------------------------------- | ----------- |
| Network Errors          | Handles API call failures          | Proper error display and recovery      | ✅          |
| Invalid Parameters      | Processes malformed URL parameters | Graceful error handling                | ✅          |
| Authentication Failures | Manages auth token issues          | Proper error messaging and retry logic | ✅          |

## Key Test Features

### 1. AAA Pattern Compliance

All tests follow the Arrange, Act, Assert pattern:

```typescript
it("should handle authentication flow correctly", () => {
    // Arrange
    const mockSession = createMockSession();
    const mockProps = createMockProps();

    // Act
    render(<SplashScreen {...mockProps} />);

    // Assert
    expect(screen.getByText("Loading...")).toBeInTheDocument();
});
```

### 2. Comprehensive Mocking

-   Mocked authentication services
-   Mocked URL context and routing
-   Mocked user data and session management
-   Isolated test environment with proper cleanup

### 3. Edge Case Coverage

-   Invalid URL parameters
-   Network timeouts and failures
-   Session expiration scenarios
-   Browser compatibility issues

### 4. User Experience Testing

-   Loading state management
-   Error message display
-   Progress indication
-   Accessibility compliance

## Running the Tests

### Run Splash Screen Tests Only

```bash
npm test -- src/__tests__/components/splash-screen.test.tsx
```

### Run with Coverage

```bash
npm test -- --coverage src/__tests__/components/splash-screen.test.tsx
```

### Run Specific Test Case

```bash
npm test -- --testNamePattern="should handle authentication flow"
```

## Test Results Summary

### Expected Test Count

-   **Total Tests**: 20+ individual test cases
-   **Authentication Tests**: 8+ scenarios
-   **URL Processing Tests**: 6+ scenarios
-   **Integration Tests**: 6+ user journey tests

### Coverage Areas

-   ✅ Authentication flow and session management
-   ✅ URL parameter processing and validation
-   ✅ Component lifecycle and state management
-   ✅ Error handling and recovery
-   ✅ User experience and accessibility
-   ✅ Integration with other components

## Bug Fixes Verified

### 1. URL Parameter Processing - VERIFIED ✅

-   Tests verify proper handling of all URL parameters
-   Base64 decoding of redirect URLs
-   Parameter validation and sanitization

### 2. Authentication Flow - VERIFIED ✅

-   Tests verify complete authentication process
-   Session token management
-   User data loading and validation

### 3. Error Recovery - VERIFIED ✅

-   Tests verify graceful error handling
-   User-friendly error messages
-   Retry mechanisms for transient failures

## Maintenance

### Adding New Test Cases

1. Follow the AAA pattern
2. Use descriptive test names
3. Mock external dependencies
4. Add to appropriate category
5. Update this README

### Updating Tests for Code Changes

1. Review component functionality changes
2. Update expected values if logic changes
3. Add tests for new features
4. Verify all existing tests pass

### Test Data Management

-   Use realistic test data
-   Include production-like scenarios
-   Test boundary conditions
-   Verify error scenarios

## Related Documentation

-   [URL Parameter Combinations](../url-context/README.md)
-   [Dashboard Handler Tests](../page-components/dashboard/handlers/__tests__/README.md)
-   [Issue Tracking Guide](../../../docs/issue-tracking-and-prevention-guide.md)
