# Test Documentation Index

## Overview

This centralized index provides quick navigation and reference to all test documentation in the project. Each test suite has its own detailed README with comprehensive coverage information, examples, and maintenance guidelines.

## Quick Navigation

### 🔗 **Direct Links to Test Documentation**

| Test Suite                  | Location                                                                        | Documentation                                                                                      | Test Count | Status    |
| --------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------- | --------- |
| **URL Context Tests**       | `src/__tests__/url-context/`                                                    | [📖 README](./url-context/README.md)                                                               | 50+ tests  | ✅ Active |
| **Splash Screen Tests**     | `src/__tests__/components/`                                                     | [📖 README](./components/README.md)                                                                | 20+ tests  | ✅ Active |
| **Dashboard Tests**         | `src/components/page-components/dashboard/__tests__/`                           | [📖 README](../components/page-components/dashboard/__tests__/README.md)                           | 30+ tests  | ✅ Active |
| **Dashboard Handler Tests** | `src/components/page-components/dashboard/handlers/__tests__/`                  | [📖 README](../components/page-components/dashboard/handlers/__tests__/README.md)                  | 50+ tests  | ✅ Active |
| **Register Tests**          | `src/components/page-components/dashboard/register/__tests__/`                  | [📖 README](../components/page-components/dashboard/register/__tests__/README.md)                  | 25+ tests  | ✅ Active |
| **Preload Resource Tests**  | `src/components/page-components/dashboard/register/preload-resource/__tests__/` | [📖 README](../components/page-components/dashboard/register/preload-resource/__tests__/README.md) | 40+ tests  | ✅ Active |
| **Lobby Tests**             | `src/components/page-components/lobby/__tests__/`                               | [📖 README](../components/page-components/lobby/__tests__/README.md)                               | 40+ tests  | ✅ Active |
| **Provably Fair Tests**     | `src/components/game-components/provably-fair/__tests__/`                       | [📖 README](../components/game-components/provably-fair/__tests__/README.md)                       | 25+ tests  | ✅ Active |
| **React Hooks Tests**       | `src/_shared/react-hooks/__tests__/`                                            | [📖 README](../_shared/react-hooks/__tests__/README.md)                                            | 30+ tests  | ✅ Active |

## Test Suite Categories

### 🏠 **Page Components**

Core page-level components that handle user interfaces and main application flows.

#### [Dashboard Test Suite](../components/page-components/dashboard/__tests__/README.md)

-   **Purpose**: Main application interface after authentication
-   **Key Features**: User data handling, game access validation, component state management
-   **Recent Updates**: Fixed timing issue with `checkIsNotOfferGame()` function
-   **Test Files**: `dashboard.test.tsx`, `dash-board-handler.test.ts`, `dash-board-handler-integration.test.ts`

#### [Dashboard Handler Test Suite](../components/page-components/dashboard/handlers/__tests__/README.md)

-   **Purpose**: Core business logic for Dashboard component
-   **Key Features**: Game access validation, timing issues, error handling
-   **Recent Updates**: Comprehensive timing issue coverage and TypeScript fixes
-   **Test Files**: Unit tests + Integration tests

#### [Register Test Suite](../components/page-components/dashboard/register/__tests__/README.md)

-   **Purpose**: User registration and first-time user onboarding
-   **Key Features**: Form validation, user data collection, registration flow
-   **Test Files**: `register.test.tsx`, `preload-resource.test.tsx`, `preload-resource-register.test.tsx`

#### [Preload Resource Test Suite](../components/page-components/dashboard/register/preload-resource/__tests__/README.md)

-   **Purpose**: Resource preloading during user registration and game initialization
-   **Key Features**: Lobby configuration loading, banner offers, game offers, component state management
-   **Test Files**: `preload-resource.test.tsx`, `preload-resource-register.test.tsx`

#### [Lobby Test Suite](../components/page-components/lobby/__tests__/README.md)

-   **Purpose**: Main game lobby interface
-   **Key Features**: Game display, user interaction, lobby functionality
-   **Test Files**: `lobby.test.tsx`, `games/components/*.test.tsx`

#### [Splash Screen Test Suite](./components/README.md)

-   **Purpose**: Initial entry point of the application
-   **Key Features**: Authentication flow, URL parameter processing, component lifecycle
-   **Test Files**: `splash-screen.test.tsx`

### 🎮 **Game Components**

Game-specific components that handle game logic, betting, and user interactions.

#### [Provably Fair Test Suite](../components/game-components/provably-fair/__tests__/README.md)

-   **Purpose**: Provably fair system components
-   **Key Features**: Cryptographic verification, user interface, fairness validation
-   **Test Files**: `pf-setting.test.tsx`, `pf-guide.test.tsx`, `pf-verify.test.tsx`

#### [Bet History Test Suite](../components/game-components/bet-history/__tests__/)

-   **Purpose**: Bet history and transaction components
-   **Key Features**: Bet history display, transaction details, modal interactions
-   **Test Files**: `bet-history-base.test.tsx`, `bet-history-modal.test.tsx`, `bet-detail-base.test.tsx`, `bet-detail-modal.test.tsx`

#### [Countdown Timer Test Suite](../components/game-components/countdown-timer/__tests__/)

-   **Purpose**: Countdown timer functionality
-   **Key Features**: Timer display, countdown logic, state management
-   **Test Files**: `countdown-timer.test.tsx`

#### [Chip Slider Test Suite](../components/game-components/chip-slider/__tests__/)

-   **Purpose**: Chip selection and betting interface
-   **Key Features**: Chip selection, slider interaction, betting logic
-   **Test Files**: `chip.test.tsx`

### 🔧 **Shared Components**

Reusable components, hooks, and utilities used throughout the application.

#### [React Hooks Test Suite](../_shared/react-hooks/__tests__/README.md)

-   **Purpose**: Shared React hooks used throughout the application
-   **Key Features**: Translation, image caching, highlighting, PWA worker, background music
-   **Test Files**: `use-translator.test.ts`, `use-memoried-image.test.ts`, `use-high-light.test.ts`, `use-pwa-worker.test.ts`, `use-background-music.test.ts`

#### [Shared Helpers Test Suite](../_shared/helpers/__tests__/)

-   **Purpose**: Shared utility functions and helpers
-   **Key Features**: Storage operations, data management, utility functions
-   **Test Files**: `storage-helper.test.ts`

#### [Shared Contexts Test Suite](../_shared/react-contexts/__tests__/)

-   **Purpose**: Shared React contexts
-   **Key Features**: URL context management, state sharing, context providers
-   **Test Files**: `url-context.test.ts`

### 🎯 **Core Logic Components**

Base components that handle game logic and state management.

#### [Round Base Test Suite](../components/round-base/__tests__/)

-   **Purpose**: Round-based game logic components
-   **Key Features**: Round state management, round ID handling
-   **Test Files**: `round-state-handler.test.ts`, `round-id-handler.test.ts`

#### [Turn Base Test Suite](../components/turn-base/__tests__/)

-   **Purpose**: Turn-based game logic components
-   **Key Features**: Turn state management, turn time counter
-   **Test Files**: `turn-state-handler.test.ts`, `turn-time-counter-handler.test.ts`

### 🌐 **URL Context Tests**

URL parameter processing and routing logic.

#### [URL Parameter Combinations Test Suite](./url-context/README.md)

-   **Purpose**: All 16 URL parameter combinations
-   **Key Features**: URL parsing, parameter validation, routing logic
-   **Test Files**: `url-parameter-combinations.test.ts`

## Test Statistics

### 📊 **Overall Coverage**

-   **Total Test Files**: 27+ test files
-   **Total Test Cases**: 440+ individual tests
-   **Coverage Areas**: All major components and functionality
-   **Test Status**: All tests passing ✅

### 🎯 **Coverage by Category**

-   **Page Components**: 205+ tests
-   **Game Components**: 78+ tests
-   **Shared Components**: 55+ tests
-   **Core Logic**: 18+ tests
-   **URL Context**: 50+ tests

## Quick Commands

### 🚀 **Run All Tests**

```bash
npm test
```

### 📊 **Run with Coverage**

```bash
npm test -- --coverage
```

### 🎯 **Run Specific Categories**

```bash
# Page Components
npm test -- src/components/page-components/

# Game Components
npm test -- src/components/game-components/

# Shared Components
npm test -- src/_shared/

# URL Context
npm test -- src/__tests__/url-context/
```

### 🔍 **Run Specific Test Suites**

```bash
# Dashboard Tests
npm test -- src/components/page-components/dashboard/__tests__/

# Lobby Tests
npm test -- src/components/page-components/lobby/__tests__/

# Provably Fair Tests
npm test -- src/components/game-components/provably-fair/__tests__/

# React Hooks Tests
npm test -- src/_shared/react-hooks/__tests__/
```

## Recent Updates

### 🆕 **Latest Changes**

-   **Dashboard Handler**: Fixed timing issue with `checkIsNotOfferGame()` function
-   **TypeScript**: Resolved compilation errors in test mock data
-   **Documentation**: Added comprehensive README files for all test suites
-   **Test Coverage**: Enhanced timing issue and error handling coverage

### 🐛 **Bug Fixes Verified**

-   ✅ **Timing Issue Resolution**: Dashboard handler timing problems fixed
-   ✅ **TypeScript Compilation**: All test mock data properly typed
-   ✅ **Lobby Access Logic**: Lobby access validation corrected
-   ✅ **Error Handling**: Comprehensive error scenario coverage

## Maintenance Guidelines

### 📝 **Adding New Tests**

1. Follow the AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names
3. Mock external dependencies
4. Add to appropriate test suite
5. Update relevant README documentation

### 🔄 **Updating Existing Tests**

1. Review functionality changes
2. Update expected values if logic changes
3. Add tests for new features
4. Verify all existing tests pass
5. Update documentation

### 📊 **Test Data Management**

-   Use realistic test data
-   Include production-like scenarios
-   Test boundary conditions
-   Verify error scenarios

## Related Documentation

### 📚 **Project Documentation**

-   [Issue Tracking Guide](../../docs/issue-tracking-and-prevention-guide.md)
-   [URL Parameter Combinations](../../docs/URL_Parameter_Combinations.md)
-   [First Login Redirect Game](../../docs/first-login-redirect-game.md)
-   [First Login Redirect Lobby](../../docs/first-login-redirect-lobby.md)

### 🛠 **Development Tools**

-   [Jest Configuration](../../jest.config.js)
-   [TypeScript Configuration](../../tsconfig.json)
-   [Package.json Scripts](../../package.json)

## Contact & Support

### 👥 **Team Resources**

-   **Test Standards**: Follow AAA pattern and comprehensive mocking
-   **Code Review**: Ensure all new tests are documented
-   **Maintenance**: Regular updates to test documentation
-   **Quality**: Maintain high test coverage and reliability

---

**Last Updated**: 2024-07-24  
**Next Review**: 2024-08-07  
**Maintained By**: Development Team
