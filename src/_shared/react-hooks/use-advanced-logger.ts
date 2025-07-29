import { useEffect, useRef, useCallback } from 'react';
import { logger, LogLevel } from '../helpers/advanced-logger';

interface UseAdvancedLoggerOptions {
    componentName: string;
    enableLifecycleLogging?: boolean;
    logLevel?: LogLevel;
}

export const useAdvancedLogger = (options: UseAdvancedLoggerOptions) => {
    const { componentName, enableLifecycleLogging = true, logLevel = LogLevel.DEBUG } = options;
    const cycleIdRef = useRef<string>('');
    const mountTimeRef = useRef<number>(Date.now());

    // Create logger methods with component context
    const debug = useCallback((message: string, data?: any) => {
        logger.debug('ui', message, { component: componentName, ...data });
    }, [componentName]);

    const info = useCallback((message: string, data?: any) => {
        logger.info('ui', message, { component: componentName, ...data });
    }, [componentName]);

    const warn = useCallback((message: string, data?: any) => {
        logger.warn('ui', message, { component: componentName, ...data });
    }, [componentName]);

    const error = useCallback((message: string, data?: any, error?: Error) => {
        logger.error('ui', message, { component: componentName, ...data }, error);
    }, [componentName]);

    const critical = useCallback((message: string, data?: any, error?: Error) => {
        logger.critical('ui', message, { component: componentName, ...data }, error);
    }, [componentName]);

    // Start cycle for component lifecycle
    const startCycle = useCallback((cycleName: string) => {
        cycleIdRef.current = logger.startCycle(`${componentName}-${cycleName}`);
        return cycleIdRef.current;
    }, [componentName]);

    // End current cycle
    const endCycle = useCallback((cycleName?: string) => {
        if (cycleIdRef.current) {
            logger.endCycle(cycleName);
            cycleIdRef.current = '';
        }
    }, []);

    // Log component lifecycle events
    useEffect(() => {
        if (enableLifecycleLogging) {
            debug('Component mounted', {
                mountTime: mountTimeRef.current,
                timestamp: new Date().toLocaleTimeString()
            });
        }

        return () => {
            if (enableLifecycleLogging) {
                const unmountTime = Date.now();
                const lifetime = unmountTime - mountTimeRef.current;

                debug('Component unmounted', {
                    mountTime: mountTimeRef.current,
                    unmountTime,
                    lifetime,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        };
    }, [enableLifecycleLogging, debug]);

    // Log component updates
    useEffect(() => {
        if (enableLifecycleLogging) {
            debug('Component rendered', {
                renderTime: Date.now(),
                timestamp: new Date().toLocaleTimeString()
            });
        }
    });

    return {
        debug,
        info,
        warn,
        error,
        critical,
        startCycle,
        endCycle,
        logger: {
            getLogs: logger.getLogs.bind(logger),
            getLogsByCategory: logger.getLogsByCategory.bind(logger),
            getLogsByLevel: logger.getLogsByLevel.bind(logger),
            getLogsByCycle: logger.getLogsByCycle.bind(logger),
            clearLogs: logger.clearLogs.bind(logger),
            exportLogs: logger.exportLogs.bind(logger),
            getLogsSummary: logger.getLogsSummary.bind(logger),
            updateConfig: logger.updateConfig.bind(logger)
        }
    };
};

// Convenience hook for simple logging
export const useLogger = (componentName: string) => {
    return useAdvancedLogger({ componentName, enableLifecycleLogging: false });
};

// Hook for performance monitoring
export const usePerformanceLogger = (componentName: string) => {
    const { debug, startCycle, endCycle } = useAdvancedLogger({
        componentName,
        enableLifecycleLogging: false
    });

    const measureOperation = useCallback((operationName: string, operation: () => void | Promise<void>) => {
        const cycleId = startCycle(operationName);
        const startTime = performance.now();

        debug(`Operation started: ${operationName}`, { startTime });

        try {
            const result = operation();

            if (result instanceof Promise) {
                return result.finally(() => {
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    debug(`Operation completed: ${operationName}`, {
                        endTime,
                        duration,
                        durationMs: Math.round(duration)
                    });
                    endCycle(operationName);
                });
            } else {
                const endTime = performance.now();
                const duration = endTime - startTime;
                debug(`Operation completed: ${operationName}`, {
                    endTime,
                    duration,
                    durationMs: Math.round(duration)
                });
                endCycle(operationName);
                return result;
            }
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            debug(`Operation failed: ${operationName}`, {
                endTime,
                duration,
                durationMs: Math.round(duration),
                error: error instanceof Error ? error.message : String(error)
            });
            endCycle(operationName);
            throw error;
        }
    }, [debug, startCycle, endCycle]);

    return {
        measureOperation,
        debug,
        startCycle,
        endCycle
    };
}; 