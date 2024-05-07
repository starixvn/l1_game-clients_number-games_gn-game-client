export function animateValue(obj: HTMLElement, start: number, end: number, duration: number): void {
    let startTimestamp: number | null = null;
    const step = (timestamp: number): void => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
