# Test Suites Overview

## Overview

This directory contains comprehensive test suites for the entire application, organized by component type and functionality. All tests follow the AAA (Arrange, Act, Assert) pattern and ensure proper coverage of functionality, error handling, and user experience.

## Test Suite Structure

### Page Components

#### [Splash Screen Tests](./components/README.md)

-   **Location**: `src/__tests__/components/splash-screen.test.tsx`
-   **Purpose**: Tests the initial entry point of the application
-   **Coverage**: Authentication flow, URL parameter processing, component lifecycle
-   **Test Count**: 20+ test cases

#### [Dashboard Tests](../components/page-components/dashboard/__tests__/README.md)

-   **Location**: `src/components/page-components/dashboard/__tests__/dashboard.test.tsx`
-   **Purpose**: Tests the main application interface after authentication
-   **Coverage**: User data handling, game access validation, component state management
-   **Test Count**: 30+ test cases

#### [Dashboard Handler Tests](../components/page-components/dashboard/handlers/__tests__/README.md)

-   **Location**: `src/components/page-components/dashboard/handlers/__tests__/`
-   **Purpose**: Tests core business logic for the Dashboard component
-   **Coverage**: Game access validation, timing issues, error handling
-   **Test Count**: 50+ test cases (Unit + Integration)

#### [Register Component Tests](../components/page-components/dashboard/register/__tests__/README.md)

-   **Location**: `src/components/page-components/dashboard/register/__tests__/register.test.tsx`
-   **Purpose**: Tests user registration and first-time user onboarding
-   **Coverage**: Form validation, user data collection, registration flow
-   **Test Count**: 25+ test cases

#### [Lobby Tests](../components/page-components/lobby/__tests__/README.md)

-   **Location**: `src/components/page-components/lobby/__tests__/`
-   **Purpose**: Tests the main game lobby interface
-   **Coverage**: Game display, user interaction, lobby functionality
-   **Test Count**: 40+ test cases

### Game Components

#### [Provably Fair Tests](../components/game-components/provably-fair/__tests__/README.md)

-   **Location**: `src/components/game-components/provably-fair/__tests__/`
-   **Purpose**: Tests the provably fair system components
-   **Coverage**: Cryptographic verification, user interface, fairness validation
-   **Test Count**: 25+ test cases

#### [Bet History Tests](../components/game-components/bet-history/__tests__/)

-   **Location**: `src/components/game-components/bet-history/__tests__/`
-   **Purpose**: Tests bet history and transaction components
-   **Coverage**: Bet history display, transaction details, modal interactions
-   **Test Count**: 15+ test cases

#### [Countdown Timer Tests](../components/game-components/countdown-timer/__tests__/)

-   **Location**: `src/components/game-components/countdown-timer/__tests__/countdown-timer.test.tsx`
-   **Purpose**: Tests countdown timer functionality
-   **Coverage**: Timer display, countdown logic, state management
-   **Test Count**: 10+ test cases

#### [Chip Slider Tests](../components/game-components/chip-slider/__tests__/)

-   **Location**: `src/components/game-components/chip-slider/__tests__/chip.test.tsx`
-   **Purpose**: Tests chip selection and betting interface
-   **Coverage**: Chip selection, slider interaction, betting logic
-   **Test Count**: 8+ test cases

### Shared Components

#### [React Hooks Tests](../_shared/react-hooks/__tests__/README.md)

-   **Location**: `src/_shared/react-hooks/__tests__/`
-   **Purpose**: Tests shared React hooks used throughout the application
-   **Coverage**: Translation, image caching, highlighting, PWA worker, background music
-   **Test Count**: 30+ test cases

#### [Shared Helpers Tests](../_shared/helpers/__tests__/)

-   **Location**: `src/_shared/helpers/__tests__/storage-helper.test.ts`
-   **Purpose**: Tests shared utility functions and helpers
-   **Coverage**: Storage operations, data management, utility functions
-   **Test Count**: 10+ test cases

#### [Shared Contexts Tests](../_shared/react-contexts/__tests__/)

-   **Location**: `src/_shared/react-contexts/__tests__/url-context.test.ts`
-   **Purpose**: Tests shared React contexts
-   **Coverage**: URL context management, state sharing, context providers
-   **Test Count**: 15+ test cases

### Base Components

#### [Round Base Tests](../components/round-base/__tests__/)

-   **Location**: `src/components/round-base/__tests__/`
-   **Purpose**: Tests round-based game logic components
-   **Coverage**: Round state management, round ID handling
-   **Test Count**: 8+ test cases

#### [Turn Base Tests](../components/turn-base/__tests__/)

-   **Location**: `src/components/turn-base/__tests__/`
-   **Purpose**: Tests turn-based game logic components
-   **Coverage**: Turn state management, turn time counter
-   **Test Count**: 10+ test cases

### URL Context Tests

#### [URL Parameter Combinations Tests](./url-context/README.md)

-   **Location**: `src/__tests__/url-context/url-parameter-combinations.test.ts`
-   **Purpose**: Tests all 16 URL parameter combinations
-   **Coverage**: URL parsing, parameter validation, routing logic
-   **Test Count**: 50+ test cases

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Page Components
npm test -- src/__tests__/components/
npm test -- src/components/page-components/dashboard/__tests__/
npm test -- src/components/page-components/lobby/__tests__/

# Game Components
npm test -- src/components/game-components/provably-fair/__tests__/
npm test -- src/components/game-components/bet-history/__tests__/

# Shared Components
npm test -- src/_shared/react-hooks/__tests__/
npm test -- src/_shared/helpers/__tests__/
npm test -- src/_shared/react-contexts/__tests__/

# URL Context
npm test -- src/__tests__/url-context/
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test Files

```bash
npm test -- --testPathPattern="splash-screen.test.tsx"
npm test -- --testPathPattern="dashboard.test.tsx"
npm test -- --testPathPattern="dash-board-handler.test.ts"
```

## Test Standards

### AAA Pattern

All tests follow the Arrange, Act, Assert pattern:

-   **Arrange**: Set up test data and mocks
-   **Act**: Execute the function or component under test
-   **Assert**: Verify expected outcomes

### Mocking Strategy

-   Mock external dependencies (APIs, services)
-   Mock browser APIs and storage
-   Mock complex computations and timers
-   Use realistic test data

### Error Handling

-   Test error scenarios and edge cases
-   Verify graceful error handling
-   Test recovery mechanisms
-   Validate error message clarity

### Performance

-   Test loading states and transitions
-   Verify efficient resource usage
-   Test memory management and cleanup
-   Validate optimization features

## Test Results Summary

### Total Coverage

-   **Total Test Files**: 25+ test files
-   **Total Test Cases**: 400+ individual tests
-   **Coverage Areas**: All major components and functionality
-   **Test Status**: All tests passing ✅

### Key Areas Covered

-   ✅ User authentication and session management
-   ✅ URL parameter processing and routing
-   ✅ Component lifecycle and state management
-   ✅ Game access validation and permissions
-   ✅ Error handling and recovery
-   ✅ User experience and accessibility
-   ✅ Performance optimization
-   ✅ Security measures and validation

## Maintenance

### Adding New Tests

1. Follow the AAA pattern
2. Use descriptive test names
3. Mock external dependencies
4. Add to appropriate test suite
5. Update relevant README documentation

### Updating Existing Tests

1. Review functionality changes
2. Update expected values if logic changes
3. Add tests for new features
4. Verify all existing tests pass
5. Update documentation

### Test Data Management

-   Use realistic test data
-   Include production-like scenarios
-   Test boundary conditions
-   Verify error scenarios

## Related Documentation

-   [Issue Tracking Guide](../../docs/issue-tracking-and-prevention-guide.md)
-   [URL Parameter Combinations](../../docs/URL_Parameter_Combinations.md)
-   [First Login Redirect Game](../../docs/first-login-redirect-game.md)
-   [First Login Redirect Lobby](../../docs/first-login-redirect-lobby.md)

## Quick Reference

### Common Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- src/components/page-components/dashboard/__tests__/

# Run specific test file
npm test -- --testPathPattern="dashboard.test.tsx"

# Run specific test case
npm test -- --testNamePattern="should handle component initialization"
```

### Test File Naming Convention

-   Component tests: `component-name.test.tsx`
-   Hook tests: `hook-name.test.ts`
-   Handler tests: `handler-name.test.ts`
-   Integration tests: `component-name-integration.test.ts`

### Test Organization

-   Group related tests in describe blocks
-   Use clear, descriptive test names
-   Follow consistent naming conventions
-   Maintain proper test isolation
