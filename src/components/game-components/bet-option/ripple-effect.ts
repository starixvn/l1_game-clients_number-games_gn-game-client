export const setRipplePosition = (setRipplePosX: (x: number) => {}, setRipplePosY: (y: number) => {}, rippleElement) => {
    const setPosition = (e, item) => {
        const pos = item.getBoundingClientRect();
        const x = e.pageX - pos.left;
        const y = e.pageY - pos.top;
        setRipplePosX(x);
        setRipplePosY(y);
    };

    if (rippleElement) {
        rippleElement.current.forEach((item) => {
            item?.addEventListener("mousedown", (e) => {
                setPosition(e, item);
            });
        });
    }

    return () => {
        rippleElement?.current?.forEach((item) => {
            item?.removeEventListener("mousedown", setPosition);
        });
    };
};
