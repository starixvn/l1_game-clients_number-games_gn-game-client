import { AdvancedLogger, LogLevel, logger, writeAdvancedDebugLog, writeDebugLog } from '../../_shared/helpers/advanced-logger';
import { StorageHelper, localStorageKeys } from '../../_shared/helpers/storage-helper';
import { getAppSettings } from '../../_shared/app-settings';

// Mock dependencies
jest.mock('../../_shared/helpers/storage-helper');
jest.mock('../../_shared/app-settings');

const mockStorageHelper = StorageHelper as jest.Mocked<typeof StorageHelper>;
const mockGetAppSettings = getAppSettings as jest.MockedFunction<typeof getAppSettings>;

describe('AdvancedLogger', () => {
    let advancedLogger: AdvancedLogger;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock app settings
        mockGetAppSettings.mockReturnValue({
            enableDebugLogs: true,
            appType: 1
        } as any);

        // Mock localStorage
        mockStorageHelper.get.mockReturnValue(true);
        mockStorageHelper.set.mockImplementation(() => { });

        // Get fresh instance for each test
        advancedLogger = AdvancedLogger.getInstance();
        advancedLogger.clearLogs();
    });

    afterEach(() => {
        // Clean up
        advancedLogger.clearLogs();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance when getInstance is called multiple times', () => {
            // Arrange
            const instance1 = AdvancedLogger.getInstance();
            const instance2 = AdvancedLogger.getInstance();

            // Assert
            expect(instance1).toBe(instance2);
        });
    });

    describe('Logging Enabled/Disabled', () => {
        it('should not log when debug logs are disabled in app settings', () => {
            // Arrange
            mockGetAppSettings.mockReturnValue({
                enableDebugLogs: false,
                appType: 1
            } as any);

            // Act
            advancedLogger.debug('test', 'test message');

            // Assert
            expect(advancedLogger.getLogs()).toHaveLength(0);
        });

        it('should not log when debug flag is false in localStorage', () => {
            // Arrange
            mockStorageHelper.get.mockReturnValue(false);

            // Act
            advancedLogger.debug('test', 'test message');

            // Assert
            expect(advancedLogger.getLogs()).toHaveLength(0);
        });

        it('should log when both conditions are met', () => {
            // Arrange
            mockGetAppSettings.mockReturnValue({
                enableDebugLogs: true,
                appType: 1
            } as any);
            mockStorageHelper.get.mockReturnValue(true);

            // Act
            advancedLogger.debug('test', 'test message');

            // Assert
            expect(advancedLogger.getLogs()).toHaveLength(1);
        });
    });

    describe('Log Levels', () => {
        it('should log debug messages correctly', () => {
            // Arrange
            const category = 'test';
            const message = 'debug message';
            const data = { test: 'data' };

            // Act
            advancedLogger.debug(category, message, data);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.DEBUG,
                category,
                message,
                data
            });
        });

        it('should log info messages correctly', () => {
            // Arrange
            const category = 'test';
            const message = 'info message';

            // Act
            advancedLogger.info(category, message);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.INFO,
                category,
                message
            });
        });

        it('should log warning messages correctly', () => {
            // Arrange
            const category = 'test';
            const message = 'warning message';

            // Act
            advancedLogger.warn(category, message);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.WARN,
                category,
                message
            });
        });

        it('should log error messages correctly', () => {
            // Arrange
            const category = 'test';
            const message = 'error message';
            const error = new Error('test error');

            // Act
            advancedLogger.error(category, message, null, error);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.ERROR,
                category,
                message,
                stackTrace: error.stack
            });
        });

        it('should log critical messages correctly', () => {
            // Arrange
            const category = 'test';
            const message = 'critical message';

            // Act
            advancedLogger.critical(category, message);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.CRITICAL,
                category,
                message
            });
        });
    });

    describe('Cycle Tracking', () => {
        it('should start a cycle and return cycle ID', () => {
            // Arrange
            const cycleName = 'test-cycle';

            // Act
            const cycleId = advancedLogger.startCycle(cycleName);

            // Assert
            expect(cycleId).toBeTruthy();
            expect(cycleId).toContain(cycleName);

            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0].cycleId).toBe(cycleId);
        });

        it('should end a cycle correctly', () => {
            // Arrange
            const cycleName = 'test-cycle';
            const cycleId = advancedLogger.startCycle(cycleName);

            // Act
            advancedLogger.endCycle(cycleName);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(2);
            expect(logs[1].message).toContain('Ended cycle');
        });

        it('should track logs within a cycle', () => {
            // Arrange
            const cycleName = 'test-cycle';
            const cycleId = advancedLogger.startCycle(cycleName);

            // Act
            advancedLogger.debug('test', 'message 1');
            advancedLogger.info('test', 'message 2');
            advancedLogger.endCycle();

            // Assert
            const cycleLogs = advancedLogger.getLogsByCycle(cycleId);
            expect(cycleLogs).toHaveLength(3);
        });

        it('should not start cycle when logging is disabled', () => {
            // Arrange
            mockGetAppSettings.mockReturnValue({
                enableDebugLogs: false,
                appType: 1
            } as any);

            // Act
            const cycleId = advancedLogger.startCycle('test');

            // Assert
            expect(cycleId).toBe('');
            expect(advancedLogger.getLogs()).toHaveLength(0);
        });
    });

    describe('Log Filtering', () => {
        beforeEach(() => {
            // Add some test logs
            advancedLogger.debug('category1', 'debug message');
            advancedLogger.info('category1', 'info message');
            advancedLogger.warn('category2', 'warning message');
            advancedLogger.error('category2', 'error message');
        });

        it('should filter logs by category', () => {
            // Act
            const category1Logs = advancedLogger.getLogsByCategory('category1');
            const category2Logs = advancedLogger.getLogsByCategory('category2');

            // Assert
            expect(category1Logs).toHaveLength(2);
            expect(category2Logs).toHaveLength(2);
        });

        it('should filter logs by level', () => {
            // Act
            const errorLogs = advancedLogger.getLogsByLevel(LogLevel.ERROR);
            const warnAndAboveLogs = advancedLogger.getLogsByLevel(LogLevel.WARN);

            // Assert
            expect(errorLogs).toHaveLength(1);
            expect(warnAndAboveLogs).toHaveLength(2);
        });

        it('should return all logs when no filters applied', () => {
            // Act
            const allLogs = advancedLogger.getLogs();

            // Assert
            expect(allLogs).toHaveLength(4);
        });
    });

    describe('Log Management', () => {
        it('should clear all logs', () => {
            // Arrange
            advancedLogger.debug('test', 'message');
            expect(advancedLogger.getLogs()).toHaveLength(1);

            // Act
            advancedLogger.clearLogs();

            // Assert
            expect(advancedLogger.getLogs()).toHaveLength(0);
        });

        it('should export logs as JSON', () => {
            // Arrange
            advancedLogger.debug('test', 'message', { data: 'test' });

            // Act
            const exported = advancedLogger.exportLogs();
            const parsed = JSON.parse(exported);

            // Assert
            expect(parsed).toHaveProperty('sessionId');
            expect(parsed).toHaveProperty('timestamp');
            expect(parsed).toHaveProperty('logs');
            expect(parsed.logs).toHaveLength(1);
        });

        it('should provide logs summary', () => {
            // Arrange
            advancedLogger.debug('category1', 'debug message');
            advancedLogger.info('category1', 'info message');
            advancedLogger.warn('category2', 'warning message');

            // Act
            const summary = advancedLogger.getLogsSummary();

            // Assert
            expect(summary.totalLogs).toBe(3);
            expect(summary.levels[LogLevel.DEBUG]).toBe(1);
            expect(summary.levels[LogLevel.INFO]).toBe(1);
            expect(summary.levels[LogLevel.WARN]).toBe(1);
            expect(summary.categories.category1).toBe(2);
            expect(summary.categories.category2).toBe(1);
        });
    });

    describe('Configuration', () => {
        it('should update configuration correctly', () => {
            // Arrange
            const newConfig = {
                maxLogEntries: 500,
                logLevel: LogLevel.WARN
            };

            // Act
            advancedLogger.updateConfig(newConfig);

            // Assert
            // Add a debug log which should be filtered out due to WARN level
            advancedLogger.debug('test', 'debug message');
            expect(advancedLogger.getLogs()).toHaveLength(0);

            // Add a warn log which should be included
            advancedLogger.warn('test', 'warn message');
            expect(advancedLogger.getLogs()).toHaveLength(1);
        });
    });

    describe('Convenience Functions', () => {
        it('should work with writeAdvancedDebugLog', () => {
            // Arrange
            const data = { test: 'data' };
            const category = 'test-category';
            const message = 'test message';

            // Act
            writeAdvancedDebugLog(data, category, message);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.DEBUG,
                category,
                message,
                data
            });
        });

        it('should work with writeDebugLog for backward compatibility', () => {
            // Arrange
            const data = { test: 'data' };

            // Act
            writeDebugLog(data);

            // Assert
            const logs = advancedLogger.getLogs();
            expect(logs).toHaveLength(1);
            expect(logs[0]).toMatchObject({
                level: LogLevel.DEBUG,
                category: 'legacy',
                message: 'Legacy debug log',
                data
            });
        });
    });

    describe('Log Entry Structure', () => {
        it('should create log entries with correct structure', () => {
            // Arrange
            const category = 'test';
            const message = 'test message';
            const data = { test: 'data' };

            // Act
            advancedLogger.info(category, message, data);

            // Assert
            const log = advancedLogger.getLogs()[0];
            expect(log).toHaveProperty('id');
            expect(log).toHaveProperty('timestamp');
            expect(log).toHaveProperty('level');
            expect(log).toHaveProperty('category');
            expect(log).toHaveProperty('message');
            expect(log).toHaveProperty('data');
            expect(log).toHaveProperty('sessionId');
            expect(log.id).toMatch(/^\d+_[a-z0-9]+$/);
            expect(log.timestamp).toBeGreaterThan(0);
        });
    });

    describe('Error Handling', () => {
        it('should handle errors gracefully when localStorage is not available', () => {
            // Arrange
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            mockStorageHelper.set.mockImplementation(() => {
                throw new Error('localStorage not available');
            });

            // Act
            advancedLogger.debug('test', 'message');

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to save logs to localStorage:',
                expect.any(Error)
            );
            consoleSpy.mockRestore();
        });
    });
}); 