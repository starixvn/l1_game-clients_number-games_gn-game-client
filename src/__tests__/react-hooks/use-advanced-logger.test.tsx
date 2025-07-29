import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAdvancedLogger, useLogger, usePerformanceLogger } from '../../_shared/react-hooks/use-advanced-logger';
import { logger } from '../../_shared/helpers/advanced-logger';

// Mock the advanced logger
jest.mock('../../_shared/helpers/advanced-logger');
const mockLogger = logger as jest.Mocked<typeof logger>;

// Test component for useAdvancedLogger
const TestComponent: React.FC<{ componentName: string; enableLifecycle?: boolean }> = ({
    componentName,
    enableLifecycle = true
}) => {
    const { debug, info, warn, error, startCycle, endCycle } = useAdvancedLogger({
        componentName,
        enableLifecycleLogging: enableLifecycle
    });

    const handleClick = () => {
        debug('Button clicked', { buttonId: 'test-button' });
    };

    const handleAsyncOperation = async () => {
        const cycleId = startCycle('async-operation');
        try {
            await new Promise(resolve => setTimeout(resolve, 10));
            info('Async operation completed');
        } finally {
            endCycle('async-operation');
        }
    };

    return (
        <div>
            <button onClick={handleClick} data-testid="debug-button">Debug</button>
            <button onClick={handleAsyncOperation} data-testid="async-button">Async</button>
            <button onClick={() => warn('Warning triggered')} data-testid="warn-button">Warn</button>
            <button onClick={() => error('Error triggered')} data-testid="error-button">Error</button>
        </div>
    );
};

// Test component for useLogger
const SimpleLoggerComponent: React.FC<{ componentName: string }> = ({ componentName }) => {
    const { debug } = useLogger(componentName);

    const handleClick = () => {
        debug('Simple log message');
    };

    return <button onClick={handleClick} data-testid="simple-log-button">Log</button>;
};

// Test component for usePerformanceLogger
const PerformanceLoggerComponent: React.FC<{ componentName: string }> = ({ componentName }) => {
    const { measureOperation } = usePerformanceLogger(componentName);

    const handleSyncOperation = () => {
        measureOperation('sync-operation', () => {
            // Simulate some work
            const start = Date.now();
            while (Date.now() - start < 5) {
                // Busy wait
            }
        });
    };

    const handleAsyncOperation = async () => {
        await measureOperation('async-operation', async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
    };

    return (
        <div>
            <button onClick={handleSyncOperation} data-testid="sync-perf-button">Sync Perf</button>
            <button onClick={handleAsyncOperation} data-testid="async-perf-button">Async Perf</button>
        </div>
    );
};

describe('useAdvancedLogger', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock logger methods
        mockLogger.debug.mockImplementation(() => { });
        mockLogger.info.mockImplementation(() => { });
        mockLogger.warn.mockImplementation(() => { });
        mockLogger.error.mockImplementation(() => { });
        mockLogger.startCycle.mockReturnValue('test-cycle-id');
        mockLogger.endCycle.mockImplementation(() => { });
    });

    describe('Component Lifecycle Logging', () => {
        it('should log component mount when lifecycle logging is enabled', () => {
            // Arrange & Act
            render(<TestComponent componentName="TestComponent" enableLifecycle={true} />);

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'ui',
                'Component mounted',
                expect.objectContaining({
                    component: 'TestComponent',
                    mountTime: expect.any(Number),
                    timestamp: expect.any(String)
                })
            );
        });

        it('should not log component mount when lifecycle logging is disabled', () => {
            // Arrange & Act
            render(<TestComponent componentName="TestComponent" enableLifecycle={false} />);

            // Assert
            expect(mockLogger.debug).not.toHaveBeenCalledWith(
                'ui',
                'Component mounted',
                expect.any(Object)
            );
        });

        it('should log component unmount when component is destroyed', () => {
            // Arrange
            const { unmount } = render(<TestComponent componentName="TestComponent" />);

            // Act
            unmount();

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'ui',
                'Component unmounted',
                expect.objectContaining({
                    component: 'TestComponent',
                    mountTime: expect.any(Number),
                    unmountTime: expect.any(Number),
                    lifetime: expect.any(Number),
                    timestamp: expect.any(String)
                })
            );
        });

        it('should log component renders', () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act - trigger a re-render
            fireEvent.click(screen.getByTestId('debug-button'));

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'ui',
                'Component rendered',
                expect.objectContaining({
                    component: 'TestComponent',
                    renderTime: expect.any(Number),
                    timestamp: expect.any(String)
                })
            );
        });
    });

    describe('Logging Methods', () => {
        it('should log debug messages with component context', () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act
            fireEvent.click(screen.getByTestId('debug-button'));

            // Assert
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'ui',
                'Button clicked',
                expect.objectContaining({
                    component: 'TestComponent',
                    buttonId: 'test-button'
                })
            );
        });

        it('should log info messages with component context', async () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act
            fireEvent.click(screen.getByTestId('async-button'));
            await waitFor(() => {
                expect(mockLogger.info).toHaveBeenCalled();
            });

            // Assert
            expect(mockLogger.info).toHaveBeenCalledWith(
                'ui',
                'Async operation completed',
                expect.objectContaining({
                    component: 'TestComponent'
                })
            );
        });

        it('should log warning messages with component context', () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act
            fireEvent.click(screen.getByTestId('warn-button'));

            // Assert
            expect(mockLogger.warn).toHaveBeenCalledWith(
                'ui',
                'Warning triggered',
                expect.objectContaining({
                    component: 'TestComponent'
                })
            );
        });

        it('should log error messages with component context', () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act
            fireEvent.click(screen.getByTestId('error-button'));

            // Assert
            expect(mockLogger.error).toHaveBeenCalledWith(
                'ui',
                'Error triggered',
                expect.objectContaining({
                    component: 'TestComponent'
                }),
                undefined
            );
        });
    });

    describe('Cycle Management', () => {
        it('should start and end cycles correctly', async () => {
            // Arrange
            render(<TestComponent componentName="TestComponent" />);

            // Act
            fireEvent.click(screen.getByTestId('async-button'));
            await waitFor(() => {
                expect(mockLogger.endCycle).toHaveBeenCalled();
            });

            // Assert
            expect(mockLogger.startCycle).toHaveBeenCalledWith('TestComponent-async-operation');
            expect(mockLogger.endCycle).toHaveBeenCalledWith('async-operation');
        });
    });
});

describe('useLogger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger.debug.mockImplementation(() => { });
    });

    it('should provide simple logging without lifecycle events', () => {
        // Arrange
        render(<SimpleLoggerComponent componentName="SimpleComponent" />);

        // Act
        fireEvent.click(screen.getByTestId('simple-log-button'));

        // Assert
        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Simple log message',
            expect.objectContaining({
                component: 'SimpleComponent'
            })
        );
    });

    it('should not log lifecycle events', () => {
        // Arrange & Act
        render(<SimpleLoggerComponent componentName="SimpleComponent" />);

        // Assert
        expect(mockLogger.debug).not.toHaveBeenCalledWith(
            'ui',
            'Component mounted',
            expect.any(Object)
        );
    });
});

describe('usePerformanceLogger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger.debug.mockImplementation(() => { });
        mockLogger.startCycle.mockReturnValue('perf-cycle-id');
        mockLogger.endCycle.mockImplementation(() => { });
    });

    it('should measure synchronous operations', () => {
        // Arrange
        render(<PerformanceLoggerComponent componentName="PerfComponent" />);

        // Act
        fireEvent.click(screen.getByTestId('sync-perf-button'));

        // Assert
        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Operation started: sync-operation',
            expect.objectContaining({
                component: 'PerfComponent',
                startTime: expect.any(Number)
            })
        );

        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Operation completed: sync-operation',
            expect.objectContaining({
                component: 'PerfComponent',
                endTime: expect.any(Number),
                duration: expect.any(Number),
                durationMs: expect.any(Number)
            })
        );
    });

    it('should measure asynchronous operations', async () => {
        // Arrange
        render(<PerformanceLoggerComponent componentName="PerfComponent" />);

        // Act
        fireEvent.click(screen.getByTestId('async-perf-button'));
        await waitFor(() => {
            expect(mockLogger.debug).toHaveBeenCalledWith(
                'ui',
                'Operation completed: async-operation',
                expect.any(Object)
            );
        });

        // Assert
        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Operation started: async-operation',
            expect.objectContaining({
                component: 'PerfComponent',
                startTime: expect.any(Number)
            })
        );

        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Operation completed: async-operation',
            expect.objectContaining({
                component: 'PerfComponent',
                endTime: expect.any(Number),
                duration: expect.any(Number),
                durationMs: expect.any(Number)
            })
        );
    });

    it('should handle operation failures', () => {
        // Arrange
        const TestErrorComponent: React.FC = () => {
            const { measureOperation } = usePerformanceLogger('ErrorComponent');

            const handleErrorOperation = () => {
                measureOperation('error-operation', () => {
                    throw new Error('Test error');
                });
            };

            return <button onClick={handleErrorOperation} data-testid="error-perf-button">Error Perf</button>;
        };

        render(<TestErrorComponent />);

        // Act & Assert
        expect(() => {
            fireEvent.click(screen.getByTestId('error-perf-button'));
        }).toThrow('Test error');

        expect(mockLogger.debug).toHaveBeenCalledWith(
            'ui',
            'Operation failed: error-operation',
            expect.objectContaining({
                component: 'ErrorComponent',
                error: 'Test error'
            })
        );
    });
}); 