# Advanced Logger Usage Guide

The Advanced Logger provides comprehensive logging capabilities with cycle tracking, log levels, and localStorage persistence. It's designed to be backward compatible with the existing `writeDebugLog` function while offering much more powerful debugging features.

## Basic Usage

### Import the Logger

```typescript
import { logger, writeAdvancedDebugLog, writeDebugLog } from "../_shared/helpers/advanced-logger";
```

### Simple Logging

```typescript
// Basic debug log
logger.debug("game", "Player moved", { x: 100, y: 200 });

// Info log
logger.info("network", "API call completed", { endpoint: "/api/game", responseTime: 150 });

// Warning log
logger.warn("ui", "Component re-rendered too frequently", { component: "GameBoard", renders: 15 });

// Error log with stack trace
try {
    // Some risky operation
} catch (error) {
    logger.error("game", "Failed to process game state", { gameId: 123 }, error);
}

// Critical error
logger.critical("system", "Application crashed", { reason: "Memory overflow" });
```

## Cycle Tracking

Cycle tracking allows you to group related log entries together for easier debugging of complex operations.

```typescript
// Start a game round cycle
const cycleId = logger.startCycle("game-round");

// All logs within this cycle will be tagged with the cycle ID
logger.debug("game", "Round started", { roundNumber: 5 });
logger.info("game", "Player bet placed", { amount: 100, player: "user123" });
logger.debug("game", "Cards dealt", { cards: ["A♠", "K♥"] });

// End the cycle
logger.endCycle("game-round");

// Later, you can retrieve all logs for this specific cycle
const cycleLogs = logger.getLogsByCycle(cycleId);
```

## Log Filtering and Retrieval

```typescript
// Get all logs
const allLogs = logger.getLogs();

// Get logs by category
const gameLogs = logger.getLogsByCategory("game");
const networkLogs = logger.getLogsByCategory("network");

// Get logs by level (includes all levels above the specified level)
const errorLogs = logger.getLogsByLevel(LogLevel.ERROR); // ERROR and CRITICAL
const warningAndAbove = logger.getLogsByLevel(LogLevel.WARN); // WARN, ERROR, CRITICAL
```

## Log Management

```typescript
// Clear all logs
logger.clearLogs();

// Export logs as JSON for debugging
const exportedLogs = logger.exportLogs();
console.log(exportedLogs);

// Get a summary of logs
const summary = logger.getLogsSummary();
console.log("Total logs:", summary.totalLogs);
console.log("Error count:", summary.levels[LogLevel.ERROR]);
console.log("Game category logs:", summary.categories.game);
```

## Configuration

```typescript
// Update logger configuration
logger.updateConfig({
    maxLogEntries: 500, // Limit log entries to prevent memory issues
    logLevel: LogLevel.WARN, // Only log WARN and above
    enableConsoleOutput: true, // Show logs in console
    enableLocalStorage: true, // Save logs to localStorage
    enableCycleTracking: true, // Enable cycle tracking
    categories: ["game", "network", "ui", "error"], // Allowed categories
});
```

## Backward Compatibility

The advanced logger maintains full backward compatibility with the existing `writeDebugLog` function:

```typescript
// Old way (still works)
writeDebugLog({ player: "user123", action: "bet" });

// New way (recommended)
writeAdvancedDebugLog({ player: "user123", action: "bet" }, "game", "Player placed bet");
```

## Real-World Examples

### Game State Tracking

```typescript
class GameManager {
    private logger = logger;

    startGame(gameId: number) {
        const cycleId = this.logger.startCycle(`game-${gameId}`);

        this.logger.info("game", "Game started", { gameId, timestamp: Date.now() });

        try {
            this.initializeGameState(gameId);
            this.logger.debug("game", "Game state initialized", { gameId });

            this.loadPlayerData(gameId);
            this.logger.debug("game", "Player data loaded", { gameId });
        } catch (error) {
            this.logger.error("game", "Failed to start game", { gameId }, error);
            throw error;
        } finally {
            this.logger.endCycle(`game-${gameId}`);
        }
    }
}
```

### Network Request Tracking

```typescript
class ApiService {
    private logger = logger;

    async makeRequest(endpoint: string, data: any) {
        const cycleId = this.logger.startCycle(`api-${endpoint}`);

        this.logger.debug("network", "API request started", { endpoint, data });

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(data),
            });

            this.logger.info("network", "API request completed", {
                endpoint,
                status: response.status,
                responseTime: Date.now(),
            });

            return await response.json();
        } catch (error) {
            this.logger.error("network", "API request failed", { endpoint }, error);
            throw error;
        } finally {
            this.logger.endCycle(`api-${endpoint}`);
        }
    }
}
```

### UI Component Debugging

```typescript
class GameComponent {
    private logger = logger;

    componentDidMount() {
        this.logger.debug("ui", "Component mounted", {
            component: "GameComponent",
            props: this.props,
        });
    }

    componentDidUpdate(prevProps: any) {
        this.logger.debug("ui", "Component updated", {
            component: "GameComponent",
            changedProps: this.getChangedProps(prevProps),
        });
    }

    handleUserAction(action: string, data: any) {
        this.logger.info("ui", "User action received", {
            component: "GameComponent",
            action,
            data,
        });

        // Process action...
    }
}
```

## Debugging Tips

1. **Use meaningful categories**: Group related logs with consistent category names
2. **Include relevant data**: Always include context data that helps with debugging
3. **Use cycles for complex operations**: Wrap related operations in cycles for easier tracking
4. **Set appropriate log levels**: Use DEBUG for detailed info, INFO for general flow, WARN for potential issues, ERROR for actual problems
5. **Export logs when needed**: Use `exportLogs()` to save logs for later analysis
6. **Monitor log summary**: Use `getLogsSummary()` to understand log distribution and identify patterns

## Performance Considerations

-   The logger automatically limits the number of stored logs to prevent memory issues
-   Logs are only processed when debugging is enabled
-   localStorage operations are wrapped in try-catch to handle storage limitations
-   Console output can be disabled if needed for performance

## Integration with Existing Code

To migrate from the old `writeDebugLog` to the new advanced logger:

1. Replace `writeDebugLog(data)` with `logger.debug('category', 'message', data)`
2. Add meaningful categories and messages
3. Use cycles for complex operations
4. Take advantage of filtering and export capabilities

The advanced logger provides much better debugging capabilities while maintaining full backward compatibility with your existing code.
