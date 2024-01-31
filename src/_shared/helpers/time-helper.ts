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
