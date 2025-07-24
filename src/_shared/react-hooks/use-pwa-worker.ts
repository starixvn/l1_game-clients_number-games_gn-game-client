import { useEffect, useRef } from "react";

export function usePWAWoker() {
    const workerRef = useRef(null);

    useEffect(() => {
        try {
            if (window.Worker) {
                workerRef.current = new Worker("/worker.js", { type: "module" });
                workerRef.current.onmessage = (evt) => workerRef.current.postMessage(evt.data);
            } else {
                // Your browser doesn't support web workers.
            }
        } catch (error) {
            // Error: error
        }
        return () => {
            workerRef.current && workerRef.current.terminate();
        };
    }, []);

    return workerRef;
}
