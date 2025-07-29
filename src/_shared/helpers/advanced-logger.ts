import { StorageHelper, localStorageKeys } from "./storage-helper";
import { getAppSettings } from "../app-settings";

// Log levels for different types of logs
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    CRITICAL = 4
}

// Log entry interface
export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    category: string;
    message: string;
    data?: any;
    cycleId?: string;
    sessionId?: string;
    stackTrace?: string;
}

// Logger configuration interface
export interface LoggerConfig {
    maxLogEntries: number;
    enableConsoleOutput: boolean;
    enableLocalStorage: boolean;
    enableCycleTracking: boolean;
    logLevel: LogLevel;
    categories: string[];
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
    maxLogEntries: 1000,
    enableConsoleOutput: true,
    enableLocalStorage: true,
    enableCycleTracking: true,
    logLevel: LogLevel.DEBUG,
    categories: ['general', 'game', 'network', 'ui', 'error']
};

export class AdvancedLogger {
    private static instance: AdvancedLogger;
    private logs: LogEntry[] = [];
    private config: LoggerConfig;
    private sessionId: string;
    private cycleCounter: number = 0;
    private currentCycleId: string | null = null;

    private constructor() {
        this.config = { ...DEFAULT_CONFIG };
        this.sessionId = this.generateSessionId();
        this.loadConfig();
    }

    public static getInstance(): AdvancedLogger {
        if (!AdvancedLogger.instance) {
            AdvancedLogger.instance = new AdvancedLogger();
        }
        return AdvancedLogger.instance;
    }

    /**
     * Start a new log cycle for tracking related operations
     */
    public startCycle(cycleName: string): string {
        if (!this.isLoggingEnabled()) return '';

        this.cycleCounter++;
        this.currentCycleId = `${cycleName}_${this.cycleCounter}_${Date.now()}`;

        this.log(LogLevel.INFO, 'cycle', `Started cycle: ${cycleName}`, { cycleId: this.currentCycleId });

        return this.currentCycleId;
    }

    /**
     * End the current log cycle
     */
    public endCycle(cycleName?: string): void {
        if (!this.isLoggingEnabled() || !this.currentCycleId) return;

        this.log(LogLevel.INFO, 'cycle', `Ended cycle: ${cycleName || 'unnamed'}`, { cycleId: this.currentCycleId });
        this.currentCycleId = null;
    }

    /**
     * Log a debug message
     */
    public debug(category: string, message: string, data?: any): void {
        this.log(LogLevel.DEBUG, category, message, data);
    }

    /**
     * Log an info message
     */
    public info(category: string, message: string, data?: any): void {
        this.log(LogLevel.INFO, category, message, data);
    }

    /**
     * Log a warning message
     */
    public warn(category: string, message: string, data?: any): void {
        this.log(LogLevel.WARN, category, message, data);
    }

    /**
     * Log an error message
     */
    public error(category: string, message: string, data?: any, error?: Error): void {
        this.log(LogLevel.ERROR, category, message, data, error);
    }

    /**
     * Log a critical error message
     */
    public critical(category: string, message: string, data?: any, error?: Error): void {
        this.log(LogLevel.CRITICAL, category, message, data, error);
    }

    /**
     * Main logging method
     */
    private log(level: LogLevel, category: string, message: string, data?: any, error?: Error): void {
        if (!this.isLoggingEnabled() || level < this.config.logLevel) {
            return;
        }

        const logEntry: LogEntry = {
            id: this.generateLogId(),
            timestamp: Date.now(),
            level,
            category,
            message,
            data,
            cycleId: this.currentCycleId,
            sessionId: this.sessionId,
            stackTrace: error?.stack
        };

        this.logs.push(logEntry);

        // Maintain log size limit
        if (this.logs.length > this.config.maxLogEntries) {
            this.logs = this.logs.slice(-this.config.maxLogEntries);
        }

        // Console output
        if (this.config.enableConsoleOutput) {
            this.outputToConsole(logEntry);
        }

        // Local storage output
        if (this.config.enableLocalStorage) {
            this.saveToLocalStorage();
        }
    }

    /**
     * Get all logs
     */
    public getLogs(): LogEntry[] {
        return [...this.logs];
    }

    /**
     * Get logs by category
     */
    public getLogsByCategory(category: string): LogEntry[] {
        return this.logs.filter(log => log.category === category);
    }

    /**
     * Get logs by level
     */
    public getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logs.filter(log => log.level >= level);
    }

    /**
     * Get logs by cycle ID
     */
    public getLogsByCycle(cycleId: string): LogEntry[] {
        return this.logs.filter(log => log.cycleId === cycleId);
    }

    /**
     * Clear all logs
     */
    public clearLogs(): void {
        this.logs = [];
        this.saveToLocalStorage();
    }

    /**
     * Export logs as JSON
     */
    public exportLogs(): string {
        return JSON.stringify({
            sessionId: this.sessionId,
            timestamp: new Date().toISOString(),
            logs: this.logs
        }, null, 2);
    }

    /**
     * Get logs summary
     */
    public getLogsSummary(): any {
        const summary = {
            totalLogs: this.logs.length,
            sessionId: this.sessionId,
            levels: {} as Record<LogLevel, number>,
            categories: {} as Record<string, number>,
            timeRange: {
                start: this.logs[0]?.timestamp,
                end: this.logs[this.logs.length - 1]?.timestamp
            }
        };

        this.logs.forEach(log => {
            summary.levels[log.level] = (summary.levels[log.level] || 0) + 1;
            summary.categories[log.category] = (summary.categories[log.category] || 0) + 1;
        });

        return summary;
    }

    /**
     * Update logger configuration
     */
    public updateConfig(newConfig: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.saveConfig();
    }

    /**
     * Check if logging is enabled
     */
    private isLoggingEnabled(): boolean {
        return getAppSettings().enableDebugLogs &&
            StorageHelper.get(localStorageKeys.debug) === true;
    }

    /**
     * Generate unique log ID
     */
    private generateLogId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate session ID
     */
    private generateSessionId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    }

    /**
     * Output log to console with proper formatting
     */
    private outputToConsole(logEntry: LogEntry): void {
        const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
        const levelColors = {
            [LogLevel.DEBUG]: 'color: #6c757d',
            [LogLevel.INFO]: 'color: #17a2b8',
            [LogLevel.WARN]: 'color: #ffc107',
            [LogLevel.ERROR]: 'color: #dc3545',
            [LogLevel.CRITICAL]: 'color: #721c24'
        };

        const levelNames = {
            [LogLevel.DEBUG]: 'DEBUG',
            [LogLevel.INFO]: 'INFO',
            [LogLevel.WARN]: 'WARN',
            [LogLevel.ERROR]: 'ERROR',
            [LogLevel.CRITICAL]: 'CRITICAL'
        };

        const prefix = `[${timestamp}] [${levelNames[logEntry.level]}] [${logEntry.category}]`;
        const cycleInfo = logEntry.cycleId ? ` [Cycle: ${logEntry.cycleId}]` : '';

        console.groupCollapsed(`${prefix}${cycleInfo} ${logEntry.message}`);
        console.log('%c' + prefix + cycleInfo, levelColors[logEntry.level]);

        if (logEntry.data) {
            console.log('Data:', logEntry.data);
        }

        if (logEntry.stackTrace) {
            console.log('Stack Trace:', logEntry.stackTrace);
        }

        console.groupEnd();
    }

    /**
     * Save logs to localStorage
     */
    private saveToLocalStorage(): void {
        try {
            const logsKey = buildLocalStorageKey('advanced-logs');
            StorageHelper.set(logsKey, this.logs);
        } catch (error) {
            console.warn('Failed to save logs to localStorage:', error);
        }
    }

    /**
     * Load logs from localStorage
     */
    private loadLogsFromLocalStorage(): void {
        try {
            const logsKey = buildLocalStorageKey('advanced-logs');
            const savedLogs = StorageHelper.get<LogEntry[]>(logsKey);
            if (savedLogs && Array.isArray(savedLogs)) {
                this.logs = savedLogs.slice(-this.config.maxLogEntries);
            }
        } catch (error) {
            console.warn('Failed to load logs from localStorage:', error);
        }
    }

    /**
     * Load configuration from localStorage
     */
    private loadConfig(): void {
        try {
            const configKey = buildLocalStorageKey('logger-config');
            const savedConfig = StorageHelper.get<Partial<LoggerConfig>>(configKey);
            if (savedConfig) {
                this.config = { ...this.config, ...savedConfig };
            }
        } catch (error) {
            console.warn('Failed to load logger config from localStorage:', error);
        }
    }

    /**
     * Save configuration to localStorage
     */
    private saveConfig(): void {
        try {
            const configKey = buildLocalStorageKey('logger-config');
            StorageHelper.set(configKey, this.config);
        } catch (error) {
            console.warn('Failed to save logger config to localStorage:', error);
        }
    }
}

// Helper function to build localStorage key (reusing existing pattern)
function buildLocalStorageKey(key: string): string {
    if (typeof globalThis !== "undefined" && globalThis.location && globalThis.location.hostname) {
        return `${globalThis.location.hostname}.${key}.${getAppSettings().appType}`;
    }
    return key;
}

// Convenience functions for easy usage
export const logger = AdvancedLogger.getInstance();

// Backward compatibility function
export const writeAdvancedDebugLog = (data: any, category: string = 'general', message?: string): void => {
    if (getAppSettings().enableDebugLogs && StorageHelper.get(localStorageKeys.debug) === true) {
        logger.debug(category, message || 'Debug data', data);
    }
};

// Enhanced version of the original writeDebugLog
export const writeDebugLog = (data: any): void => {
    if (getAppSettings().enableDebugLogs && StorageHelper.get(localStorageKeys.debug) === true) {
        logger.debug('legacy', 'Legacy debug log', data);
    }
}; 