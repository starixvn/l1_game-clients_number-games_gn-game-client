export const convertToGMT8 = (date) => {
    return new Date(
        date.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
        })
    );
};

export const formatDate = (date, template) => {
    try {
        var z = {
            M: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
        };
        template = template.replace(/(M+|d+|h+|m+|s+)/g, function (v) {
            return ((v.length > 1 ? "0" : "") + z[v.slice(-1)]).slice(-2);
        });

        return template.replace(/(y+)/g, function (v) {
            return date.getFullYear().toString().slice(-v.length);
        });
    } catch (ex) {
        console.log(ex);
        return date.toString();
    }
};

export function sortedCollectionByTime(elements: any[], decrease = true) {
    const newElements = elements?.map((item) => {
        return {
            ...item,
            time: new Date(item.time),
        };
    });
    newElements?.sort((a, b) => {
        return decrease ? b.time - a.time : a.time - b.time;
    });
    return newElements;
}

export function separateDateTime(rawTime: Date, dateFormatLocale = "id", timeFormatLocale = "en-US") {
    const dateFormat = new Intl.DateTimeFormat(dateFormatLocale, { day: "2-digit", month: "2-digit", year: "numeric", hour12: false });
    const timeFormat = new Intl.DateTimeFormat(timeFormatLocale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const date = dateFormat.format(rawTime);
    const time = timeFormat.format(rawTime);
    return { date, time };
}
