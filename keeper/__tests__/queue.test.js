const ExecutionQueue = require('../src/queue');

describe('ExecutionQueue', () => {
    let queue;

    beforeEach(() => {
        // Reset process state
        process.env.MAX_CONCURRENT_EXECUTIONS = '2';
        queue = new ExecutionQueue();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should respect concurrency limits', async () => {
        const delays = [];
        let concurrentExecutions = 0;
        let maxObservedConcurrent = 0;

        const fakeExecutor = async (taskId) => {
            concurrentExecutions++;
            if (concurrentExecutions > maxObservedConcurrent) {
                maxObservedConcurrent = concurrentExecutions;
            }

            // Simulate task execution
            await new Promise(res => setTimeout(res, 50));
            
            concurrentExecutions--;
        };

        const taskIds = ['task1', 'task2', 'task3', 'task4'];
        await queue.enqueue(taskIds, fakeExecutor);

        expect(maxObservedConcurrent).toBeLessThanOrEqual(2);
    });

    it('should track cycle completions accurately', async () => {
        const events = [];
        queue.on('cycle:complete', (stats) => {
            events.push(stats);
        });

        const fakeExecutor = async (taskId) => {
            if (taskId === 'task_fail') {
                throw new Error('Task Failed');
            }
        };

        const taskIds = ['task1', 'task2', 'task_fail', 'task3'];
        await queue.enqueue(taskIds, fakeExecutor);

        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject({
            completed: 3,
            failed: 1,
            depth: 0,
            inFlight: 0
        });

        // Ensure tasks that failed are not re-queued
        await queue.enqueue(['task_fail', 'task4'], fakeExecutor);

        expect(events).toHaveLength(2);
        // Only 1 new task successfully completed in cycle 2
        expect(events[1]).toMatchObject({
            completed: 1,
            failed: 0,
            depth: 0,
            inFlight: 0
        });
    });

    it('should drain in-flight tasks securely', async () => {
        let task2Started = false;
        
        const fakeExecutor = async (taskId) => {
            if (taskId === 't2') {
                task2Started = true;
            }
            await new Promise(res => setTimeout(res, 100));
        };

        // Queue 4 tasks with limit 2
        const p = queue.enqueue(['t1', 't2', 't3', 't4'], fakeExecutor);
        
        // Wait briefly so t1 and t2 start, but before they finish
        await new Promise(res => setTimeout(res, 30));
        
        expect(queue.limit.activeCount).toBe(2);
        expect(queue.limit.pendingCount).toBe(2);
        
        await queue.drain();

        // Drain clears pending count (t3 and t4 should be canceled/never executed)
        expect(queue.limit.pendingCount).toBe(0);
        
        // At this point p has t1 and t2 running, but t3 and t4 are canceled and won't resolve. 
        // We only wait for the active promises in queue that we know run, or use queue.drain() to wait instead of 'p'.
        // Since we already awaited queue.drain(), t1 and t2 have completed!
        // So we don't await `p` since it will indefinitely hang due to unresolved cancelled tasks from pLimit.
        
        expect(task2Started).toBe(true);
    });
});
