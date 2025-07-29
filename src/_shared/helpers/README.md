# Advanced Logging System

This directory contains an advanced logging system designed to provide comprehensive debugging capabilities for the game client application. The system is built on top of the existing `writeDebugLog` function and provides enhanced features while maintaining full backward compatibility.

## Overview

The advanced logging system consists of several components:

1. **AdvancedLogger** - Core logging class with cycle tracking and log management
2. **React Hooks** - Easy integration with React components
3. **Backward Compatibility** - Maintains compatibility with existing `writeDebugLog` usage

## Key Features

### 🔄 Cycle Tracking

Group related log entries together for easier debugging of complex operations:

```typescript
const cycleId = logger.startCycle("game-round");
// All logs within this cycle will be tagged with the cycle ID
logger.debug("game", "Round started", { roundNumber: 5 });
logger.info("game", "Player bet placed", { amount: 100 });
logger.endCycle("game-round");
```

### 📊 Log Levels

Five different log levels for better organization:

-   **DEBUG** (0) - Detailed debugging information
-   **INFO** (1) - General information about application flow
-   **WARN** (2) - Warning messages for potential issues
-   **ERROR** (3) - Error messages for actual problems
-   **CRITICAL** (4) - Critical errors that may cause application failure

### 🏷️ Categories

Organize logs by functional areas:

-   `game` - Game-specific operations
-   `network` - API calls and network operations
-   `ui` - User interface events
-   `error` - Error handling
-   `general` - General application logs

### 💾 Persistence

-   Automatic localStorage persistence
-   Configurable log retention limits
-   Export functionality for debugging

### 🎨 Console Output

-   Color-coded log levels
-   Collapsible log groups
-   Structured data display

## Files

### Core Files

-   `advanced-logger.ts` - Main logging implementation
-   `debug-helper.ts` - Updated with backward compatibility
-   `advanced-logger-examples.md` - Detailed usage examples

### React Integration

-   `use-advanced-logger.ts` - React hooks for easy integration
-   `use-advanced-logger.test.tsx` - Tests for React hooks

### Tests

-   `advanced-logger.test.ts` - Comprehensive unit tests

## Quick Start

### Basic Usage

```typescript
import { logger } from "../_shared/helpers/advanced-logger";

// Simple logging
logger.debug("game", "Player moved", { x: 100, y: 200 });
logger.info("network", "API call completed", { endpoint: "/api/game" });
logger.warn("ui", "Component re-rendered frequently", { renders: 15 });
logger.error("game", "Failed to process game state", { gameId: 123 }, error);
```

### React Component Integration

```typescript
import { useAdvancedLogger } from "../_shared/react-hooks/use-advanced-logger";

const GameComponent: React.FC = () => {
    const { debug, info, startCycle, endCycle } = useAdvancedLogger({
        componentName: "GameComponent",
    });

    const handleGameAction = () => {
        const cycleId = startCycle("game-action");
        try {
            debug("Processing game action", { action: "bet" });
            // Process action...
            info("Game action completed");
        } finally {
            endCycle("game-action");
        }
    };

    return <button onClick={handleGameAction}>Place Bet</button>;
};
```

### Performance Monitoring

```typescript
import { usePerformanceLogger } from "../_shared/react-hooks/use-advanced-logger";

const ApiComponent: React.FC = () => {
    const { measureOperation } = usePerformanceLogger("ApiComponent");

    const handleApiCall = async () => {
        await measureOperation("api-request", async () => {
            const response = await fetch("/api/data");
            return response.json();
        });
    };

    return <button onClick={handleApiCall}>Fetch Data</button>;
};
```

## Configuration

The logger can be configured through the `updateConfig` method:

```typescript
logger.updateConfig({
    maxLogEntries: 500, // Limit stored logs
    logLevel: LogLevel.WARN, // Only log WARN and above
    enableConsoleOutput: true, // Show in console
    enableLocalStorage: true, // Save to localStorage
    enableCycleTracking: true, // Enable cycle tracking
    categories: ["game", "network", "ui", "error"],
});
```

## Log Management

### Retrieving Logs

```typescript
// Get all logs
const allLogs = logger.getLogs();

// Filter by category
const gameLogs = logger.getLogsByCategory("game");

// Filter by level
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR);

// Get logs for a specific cycle
const cycleLogs = logger.getLogsByCycle(cycleId);
```

### Export and Analysis

```typescript
// Export logs as JSON
const exportedLogs = logger.exportLogs();

// Get summary statistics
const summary = logger.getLogsSummary();
console.log("Total logs:", summary.totalLogs);
console.log("Error count:", summary.levels[LogLevel.ERROR]);
```

## Migration from writeDebugLog

The system maintains full backward compatibility. Existing code will continue to work:

```typescript
// Old way (still works)
writeDebugLog({ player: "user123", action: "bet" });

// New way (recommended)
logger.debug("game", "Player placed bet", { player: "user123", action: "bet" });
```

## Testing

The system includes comprehensive tests covering:

-   ✅ Singleton pattern
-   ✅ Log level filtering
-   ✅ Cycle tracking
-   ✅ localStorage persistence
-   ✅ Error handling
-   ✅ React hook integration
-   ✅ Performance monitoring
-   ✅ Backward compatibility

Run tests with:

```bash
npm test -- --testPathPattern=advanced-logger
```

## Best Practices

1. **Use meaningful categories** - Group related logs consistently
2. **Include relevant context** - Always include data that helps with debugging
3. **Use cycles for complex operations** - Wrap related operations in cycles
4. **Set appropriate log levels** - Use DEBUG for details, INFO for flow, WARN for issues, ERROR for problems
5. **Monitor log summary** - Use `getLogsSummary()` to understand log patterns
6. **Export when needed** - Use `exportLogs()` for detailed analysis

## Performance Considerations

-   Logs are only processed when debugging is enabled
-   Automatic log size limiting prevents memory issues
-   localStorage operations are wrapped in try-catch
-   Console output can be disabled for performance
-   React hooks include automatic cleanup

## Troubleshooting

### Logs not appearing

1. Check if `enableDebugLogs` is true in app settings
2. Verify localStorage debug flag is set to true
3. Ensure log level is set appropriately

### Performance issues

1. Reduce `maxLogEntries` in configuration
2. Disable console output if not needed
3. Use higher log levels to reduce log volume

### localStorage errors

-   The system gracefully handles localStorage unavailability
-   Logs will still work in memory even if localStorage fails

## Future Enhancements

Potential improvements for future versions:

-   Remote log shipping
-   Log compression
-   Advanced filtering and search
-   Real-time log streaming
-   Integration with external monitoring services
