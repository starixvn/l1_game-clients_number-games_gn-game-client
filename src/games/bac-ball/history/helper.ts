export function seperateDateTime(rawTime: Date) {
    const dateFormat = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "2-digit", year: "numeric", hour12: false });
    const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const date = dateFormat.format(rawTime);
    const time = timeFormat.format(rawTime);
    return { date, time };
}

export function preprocessBetLogTime(elements: any[]) {
    const newElements = elements?.map((item) => {
        return {
            ...item,
            time: new Date(item.time),
        };
    });
    newElements?.sort((a, b) => {
        return b.time - a.time;
    });
    return newElements;
}
