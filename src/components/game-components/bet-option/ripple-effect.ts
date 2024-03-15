export const setRipplePosition = (setRipplePosX, setRipplePosY, rippleElement) => {
    let timerId;
    const setPosition = (e, item) => {
        const pos = item.getBoundingClientRect();
        const x = e.pageX - pos.left;
        const y = e.pageY - pos.top;

        setRipplePosX(x);
        setRipplePosY(y);

        e.target.firstChild.className = "ripple-effect active";
    };

    const reset = (e) => {
        e.target.firstChild.className = "ripple-effect";
    };

    if (rippleElement) {
        rippleElement.current.forEach((item) => {
            clearTimeout(timerId);
            item?.addEventListener("mousedown", (e) => {
                setPosition(e, item);
            });

            item?.addEventListener("mouseup", (e) => {
                timerId = setTimeout(() => {
                    reset(e);
                }, 500);
            });
        });
    }

    return () => {
        rippleElement?.current?.forEach((item) => {
            item?.removeEventListener("mousedown", setPosition);
            item?.removeEventListener("mouseup", reset);
        });
    };
};
