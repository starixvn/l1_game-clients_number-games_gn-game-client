# Issue Tracking and Prevention Guide

## Overview

This document tracks issues, errors, and best practices encountered during development to prevent similar problems in the future. It serves as a reference for maintaining code quality and ensuring robust testing practices.

## Recent Issues Resolved

### 1. Dashboard Handler Timing Issue (Resolved: 2024-07-24)

#### **Issue Description**

-   **Problem**: `checkIsNotOfferGame()` function returned `true` on first load, causing `ErrorNoGameOffer` to be thrown, but worked correctly on refresh
-   **Root Cause**: Timing issue where `authorizeResponse` and `lobbyConfigs` were not available when the function was called in `componentDidMount`
-   **Impact**: Users couldn't access the lobby on first load in normal mode (not `op=SP` or direct mode)

#### **Solution Implemented**

```typescript
checkIsNotOfferGame = () => {
    // Fix: When queryGame is 0, it means lobby, not a specific game
    // So it should not be treated as "not in offer"
    if (this.props.queryGame === 0) {
        return false;
    }
    // ... rest of the function
```

#### **Why This Solution Works**

1. **Logical Correctness**: Lobby access should never trigger "no game offer" error
2. **Eliminates Timing Issues**: No dependency on data availability for lobby access
3. **User-Friendly**: Users can always access the lobby regardless of offer games
4. **Simplifies Logic**: Reduces complexity and potential bugs

#### **Tests Added/Updated**

-   ✅ Updated `dash-board-handler.test.ts` to match new logic
-   ✅ Updated `dash-board-handler-integration.test.ts` to match new logic
-   ✅ Fixed TypeScript compilation errors in test data

## Common Issues and Prevention Strategies

### 1. TypeScript Compilation Errors

#### **Common Causes**

-   Missing required properties in mock data
-   Incorrect property types (e.g., `number` vs `object`)
-   Incomplete interface implementations

#### **Prevention Checklist**

-   [ ] Verify all required properties are included in test mocks
-   [ ] Check property types match interface definitions
-   [ ] Run `npm run type-check` before committing
-   [ ] Use TypeScript strict mode in development

#### **Example Fix Applied**

```typescript
// Before (causing TypeScript error)
user: {
    UID: 123,
    // Missing required properties
}

// After (fixed)
user: {
    UID: 123,
    availSpins: 0,  // Added missing property
    scoins: 0       // Added missing property
}
```

### 2. Test Data Structure Issues

#### **Common Problems**

-   Incomplete mock objects
-   Wrong data types for properties
-   Missing nested object properties

#### **Prevention Guidelines**

```typescript
// ✅ Good: Complete mock with all required properties
const mockAuthorizeResponse = {
    authorized: true,
    user: {
        UID: 123,
        avatarId: 1,
        currency: "USD",
        name: "testuser",
        red: 1000,
        settings: { theme: "light" },
        enabledGameIds: [1001, 1002],
        offerGames: [
            {
                gameId: 1001,
                minBet: 1,
                maxBet: 100,
                maxBetPerChoices: {}, // Object, not number
            },
        ],
        fractionalOddsFormat: false,
        isSignedInSM: true,
        isDisplayPlayerCurrency: true,
        availSpins: 0, // Required property
        scoins: 0, // Required property
    },
};

// ✅ Good: Complete lobby configs
const mockLobbyConfigs = {
    name: "test",
    currencyGroupIds: ["USD"],
    miniPanelGameIds: [1001],
    categories: [
        {
            id: 1,
            name: "test",
            gameSettings: [
                {
                    gameId: 1001,
                    bigSize: false, // Required property
                    newTag: false, // Required property
                },
            ],
        },
    ],
    banners: [],
};
```

### 3. Timing Issues in React Components

#### **Common Scenarios**

-   Data not available on first render
-   Async operations completing after component mount
-   Props changing after initial render

#### **Prevention Strategies**

1. **Early Returns**: Check for required data availability first
2. **Loading States**: Show appropriate loading indicators
3. **Default Values**: Provide sensible defaults for missing data
4. **Retry Mechanisms**: Implement retry logic for critical operations

#### **Example Pattern**

```typescript
checkIsNotOfferGame = () => {
    // Early return for lobby access (no data dependency)
    if (this.props.queryGame === 0) {
        return false;
    }

    // Check data availability before proceeding
    if (!this.props.authorizeResponse || !this.props.lobbyConfigs) {
        console.warn("Required data not available yet");
        return false; // Don't show error when data is loading
    }

    // Proceed with validation when data is available
    // ... rest of logic
};
```

## Testing Best Practices

### 1. Test Structure (AAA Pattern)

#### **Arrange**

-   Set up all required mocks and test data
-   Ensure complete data structures
-   Mock external dependencies

#### **Act**

-   Call the function/method under test
-   Use clear, descriptive test names

#### **Assert**

-   Verify expected outcomes
-   Check function calls and side effects
-   Use strict equality assertions

### 2. Test Data Management

#### **Do's**

-   ✅ Create complete mock objects with all required properties
-   ✅ Use TypeScript interfaces to ensure type safety
-   ✅ Create reusable mock factories
-   ✅ Test edge cases and error scenarios

#### **Don'ts**

-   ❌ Use incomplete mock objects
-   ❌ Ignore TypeScript errors in tests
-   ❌ Hardcode values that should be configurable
-   ❌ Skip testing error conditions

### 3. Integration Testing

#### **Key Areas to Test**

-   Component lifecycle methods
-   Data flow between components
-   Error handling and recovery
-   Timing-sensitive operations

## Code Quality Guidelines

### 1. Function Design

#### **Principles**

-   **Single Responsibility**: Each function should do one thing well
-   **Early Returns**: Handle edge cases early to reduce nesting
-   **Clear Naming**: Use descriptive function and variable names
-   **Documentation**: Add comments for complex logic

#### **Example**

```typescript
// ✅ Good: Clear, single responsibility, early returns
checkIsNotOfferGame = () => {
    // Lobby access is always allowed
    if (this.props.queryGame === 0) {
        return false;
    }

    // Check data availability
    if (!this.hasRequiredData()) {
        return false;
    }

    // Validate game access
    return this.isGameNotInOffer();
};

// Helper methods for clarity
hasRequiredData = () => {
    return this.props.authorizeResponse && this.props.lobbyConfigs;
};

isGameNotInOffer = () => {
    const offerGames = getOfferGamesIds(this.props.authorizeResponse);
    return !offerGames?.includes(this.props.queryGame);
};
```

### 2. Error Handling

#### **Best Practices**

-   Provide meaningful error messages
-   Log errors with context information
-   Handle errors gracefully without breaking the UI
-   Implement retry mechanisms for transient failures

## Monitoring and Maintenance

### 1. Regular Checks

#### **Daily Development**

-   [ ] Run tests before committing code
-   [ ] Check TypeScript compilation
-   [ ] Verify no console errors in browser
-   [ ] Test critical user flows

#### **Weekly Reviews**

-   [ ] Review test coverage
-   [ ] Check for unused code
-   [ ] Update documentation
-   [ ] Review error logs

### 2. Issue Tracking

#### **When Issues Occur**

1. **Document the Issue**: Add to this document with full details
2. **Root Cause Analysis**: Understand why it happened
3. **Implement Fix**: Apply the solution
4. **Add Tests**: Ensure the issue doesn't recur
5. **Update Guidelines**: Add prevention strategies

### 3. Continuous Improvement

#### **Regular Updates**

-   Update this document with new issues and solutions
-   Refine prevention strategies based on experience
-   Share learnings with the team
-   Review and improve testing practices

## Quick Reference

### **Before Committing Code**

-   [ ] All tests pass
-   [ ] No TypeScript errors
-   [ ] No console errors
-   [ ] Critical user flows tested
-   [ ] Documentation updated if needed

### **When Adding New Features**

-   [ ] Add comprehensive tests
-   [ ] Handle edge cases
-   [ ] Consider timing implications
-   [ ] Update this document if new patterns emerge

### **When Fixing Bugs**

-   [ ] Document the issue here
-   [ ] Add regression tests
-   [ ] Verify fix works in all scenarios
-   [ ] Update prevention guidelines

## Conclusion

This document serves as a living guide for maintaining code quality and preventing common issues. Regular updates and team adherence to these guidelines will help ensure robust, maintainable code.

**Last Updated**: 2024-07-24
**Next Review**: 2024-08-07
