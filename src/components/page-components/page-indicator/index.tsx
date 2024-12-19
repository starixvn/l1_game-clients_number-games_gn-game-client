import Style from "./page-indicator.module.scss";

const PageIndicator = () => {
    return (
        <div className={Style["indicator-container"]}>
            <div className={Style["dot"]}></div>
            <div className={Style["dot"]}></div>
            <div className={Style["dot"]}></div>
            <div className={Style["dot"]}></div>
            <div className={Style["dot"]}></div>
            <div className={Style["dot"]}></div>
        </div>
    );
};

export default PageIndicator;
