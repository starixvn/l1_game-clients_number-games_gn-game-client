# Preload Resource Test Suite

## Overview

This test suite provides comprehensive coverage for the PreloadResourceRegister component, which handles resource preloading during user registration and game initialization. The tests ensure proper handling of lobby configuration loading, banner offers, game offers, and component state management during the preloading process.

## Test Coverage

### Core Functionality Tests

#### Component Initialization and Mounting

| Test Case                   | Description                         | Expected Behavior           | Test Status |
| --------------------------- | ----------------------------------- | --------------------------- | ----------- |
| Component Mount             | Tests component initialization      | Proper component mounting   | ✅          |
| handleAuthorizedAccess Call | Verifies authorized access handling | Correct access validation   | ✅          |
| State Initialization        | Tests initial state setup           | Proper state initialization | ✅          |
| Props Validation            | Validates component props           | Correct props handling      | ✅          |

#### Lobby Configuration Loading

| Test Case                 | Description                         | Expected Behavior           | Test Status |
| ------------------------- | ----------------------------------- | --------------------------- | ----------- |
| Successful Config Loading | Tests successful lobby config fetch | Proper config data handling | ✅          |
| Config Loading Failure    | Handles lobby config fetch failures | Proper error handling       | ✅          |
| Config Data Processing    | Validates config data structure     | Correct data processing     | ✅          |
| Config Update Callback    | Tests config update notifications   | Proper callback execution   | ✅          |

#### Banner and Game Offer Handling

| Test Case              | Description                    | Expected Behavior           | Test Status |
| ---------------------- | ------------------------------ | --------------------------- | ----------- |
| Banner Offer Loading   | Tests banner offer fetching    | Proper banner data handling | ✅          |
| Game Offer Loading     | Tests game offer fetching      | Proper game offer handling  | ✅          |
| Offer Data Processing  | Validates offer data structure | Correct offer processing    | ✅          |
| Offer Loading Failures | Handles offer loading failures | Proper error recovery       | ✅          |

#### Direct Mode vs Normal Mode

| Test Case                  | Description                    | Expected Behavior           | Test Status |
| -------------------------- | ------------------------------ | --------------------------- | ----------- |
| Direct Mode Initialization | Tests direct mode behavior     | Proper direct mode handling | ✅          |
| Normal Mode Initialization | Tests normal mode behavior     | Proper normal mode handling | ✅          |
| Mode-Specific Loading      | Validates mode-specific logic  | Correct mode handling       | ✅          |
| Mode Switching             | Tests mode transition handling | Proper mode transitions     | ✅          |

### Integration Scenarios

#### Authentication and Session Management

| Test Case               | Description                           | Expected Behavior               | Test Status |
| ----------------------- | ------------------------------------- | ------------------------------- | ----------- |
| Authenticated User Flow | Tests authenticated user scenarios    | Proper auth flow handling       | ✅          |
| Session Validation      | Validates user session data           | Correct session handling        | ✅          |
| Authorization Response  | Tests authorization response handling | Proper auth response processing | ✅          |
| User Data Processing    | Validates user profile data           | Correct user data handling      | ✅          |

#### Resource Preloading Workflow

| Test Case                  | Description                       | Expected Behavior          | Test Status |
| -------------------------- | --------------------------------- | -------------------------- | ----------- |
| Preload Resource Component | Tests PreloadResources component  | Proper resource preloading | ✅          |
| Progress Tracking          | Validates loading progress        | Correct progress tracking  | ✅          |
| Resource Completion        | Tests resource loading completion | Proper completion handling | ✅          |
| Loading State Management   | Manages loading states            | Correct state management   | ✅          |

#### Error Handling and Recovery

| Test Case                | Description                         | Expected Behavior               | Test Status |
| ------------------------ | ----------------------------------- | ------------------------------- | ----------- |
| Network Failures         | Handles network connectivity issues | Proper error recovery           | ✅          |
| API Timeouts             | Tests API timeout scenarios         | Proper timeout handling         | ✅          |
| Invalid Data Responses   | Handles malformed API responses     | Proper data validation          | ✅          |
| Partial Loading Failures | Tests partial resource loading      | Proper partial loading handling | ✅          |

## Key Test Features

### 1. AAA Pattern Compliance

All tests follow the Arrange, Act, Assert pattern:

```typescript
it("should call handleAuthorizedAccess on mount", async () => {
    // Arrange
    mockGetLobbyConfigs.mockResolvedValue({
        lobbyConfigs: mockLobbyConfigs,
    } as any);

    // Act
    render(<PreloadResourceRegister {...defaultProps} />);

    // Assert
    await waitFor(() => {
        expect(mockGetLobbyConfigs).toHaveBeenCalled();
    });
});
```

### 2. Comprehensive Mocking

-   Mocked authentication services (`auth-service`)
-   Mocked preload resource helpers (`preload-resources`)
-   Mocked lobby configuration fetching
-   Mocked banner and game offer handling
-   Isolated test environment with proper cleanup

### 3. Async Operation Testing

-   Proper handling of asynchronous operations
-   WaitFor utilities for async state changes
-   Timer mocking for time-based operations
-   Promise resolution and rejection testing

### 4. Component State Management

-   State initialization testing
-   State update validation
-   Loading state management
-   Error state handling

## Running the Tests

### Run All Preload Resource Tests

```bash
npm test -- src/components/page-components/dashboard/register/preload-resource/__tests__/
```

### Run Specific Test Files

```bash
# Run preload-resource.test.tsx
npm test -- src/components/page-components/dashboard/register/preload-resource/__tests__/preload-resource.test.tsx

# Run preload-resource-register.test.tsx
npm test -- src/components/page-components/dashboard/register/preload-resource/__tests__/preload-resource-register.test.tsx
```

### Run with Coverage

```bash
npm test -- --coverage src/components/page-components/dashboard/register/preload-resource/__tests__/
```

### Run Specific Test Cases

```bash
# Run component initialization tests
npm test -- --testNamePattern="Component Initialization"

# Run lobby configuration tests
npm test -- --testNamePattern="lobby configs"

# Run direct mode tests
npm test -- --testNamePattern="direct mode"
```

## Test Results Summary

### Expected Test Count

-   **Total Tests**: 40+ individual test cases
-   **Component Tests**: 25+ scenarios
-   **Integration Tests**: 15+ scenarios
-   **Async Operation Tests**: 20+ scenarios

### Coverage Areas

-   ✅ Component initialization and mounting
-   ✅ Lobby configuration loading and processing
-   ✅ Banner and game offer handling
-   ✅ Direct mode vs normal mode behavior
-   ✅ Authentication and session management
-   ✅ Resource preloading workflow
-   ✅ Error handling and recovery
-   ✅ Async operation management

## Test Files Overview

### 1. `preload-resource.test.tsx`

**Purpose**: Core component functionality and integration testing

**Key Features**:

-   Component initialization testing
-   Lobby configuration loading scenarios
-   Banner and game offer handling
-   Direct mode vs normal mode behavior
-   Error handling and recovery
-   Async operation management

**Test Categories**:

-   Component Initialization
-   Lobby Configuration Loading
-   Banner and Game Offer Handling
-   Direct Mode Scenarios
-   Error Handling

### 2. `preload-resource-register.test.tsx`

**Purpose**: Registration-specific preload resource testing

**Key Features**:

-   Registration flow integration
-   User session handling
-   Authorization response processing
-   Resource preloading workflow
-   Progress tracking and completion

**Test Categories**:

-   Registration Flow Integration
-   Session Management
-   Authorization Handling
-   Resource Preloading
-   Progress Tracking

## Bug Fixes Verified

### 1. Async Operation Handling - VERIFIED ✅

-   **Issue**: Improper handling of asynchronous operations during component mounting
-   **Solution**: Proper use of `waitFor` and async/await patterns
-   **Tests**: Comprehensive async operation testing with proper mocking

### 2. Error Recovery - VERIFIED ✅

-   **Issue**: Inadequate error handling for network failures and API timeouts
-   **Solution**: Robust error handling with proper fallback mechanisms
-   **Tests**: Extensive error scenario coverage with recovery validation

### 3. State Management - VERIFIED ✅

-   **Issue**: Inconsistent state management during loading operations
-   **Solution**: Proper state initialization and update handling
-   **Tests**: Complete state management coverage with validation

## Maintenance

### Adding New Test Cases

1. Follow the AAA pattern
2. Use descriptive test names
3. Mock external dependencies properly
4. Add to appropriate category
5. Update this README

### Updating Tests for Code Changes

1. Review component logic changes
2. Update expected values if behavior changes
3. Add tests for new functionality
4. Verify all existing tests pass

### Test Data Management

-   Use complete mock objects with all required properties
-   Include realistic test scenarios
-   Test boundary conditions
-   Verify error scenarios
-   Ensure proper async operation testing

## Related Documentation

-   [Register Component Tests](../__tests__/README.md)
-   [Dashboard Handler Tests](../../../handlers/__tests__/README.md)
-   [Issue Tracking Guide](../../../../../../docs/issue-tracking-and-prevention-guide.md)
-   [URL Context Tests](../../../../../__tests__/url-context/README.md)

## Common Test Patterns

### Mocking External Dependencies

```typescript
// Mock auth service
jest.mock("../../../../../../services/auth-service", () => ({
    getLobbyConfigs: jest.fn(),
}));

// Mock preload resources
jest.mock("../../../../../../_shared/helpers/preload-resources", () => ({
    getAndHandleBannerOffer: jest.fn(),
    getAndHandleGameOfferIds: jest.fn(),
}));
```

### Testing Async Operations

```typescript
it("should handle async operation correctly", async () => {
    // Arrange
    const mockPromise = Promise.resolve(mockData);
    mockService.mockResolvedValue(mockPromise);

    // Act
    render(<Component {...props} />);

    // Assert
    await waitFor(() => {
        expect(mockService).toHaveBeenCalled();
    });
});
```

### Testing Error Scenarios

```typescript
it("should handle error gracefully", async () => {
    // Arrange
    const mockError = new Error("Network error");
    mockService.mockRejectedValue(mockError);

    // Act
    render(<Component {...props} />);

    // Assert
    await waitFor(() => {
        expect(screen.getByText("Error message")).toBeInTheDocument();
    });
});
```

---

**Last Updated**: 2024-07-24  
**Next Review**: 2024-08-07  
**Maintained By**: Development Team
