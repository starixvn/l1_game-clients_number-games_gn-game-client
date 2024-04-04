import Styles from "./styles.module.scss";

export const LoadingSpinner = () => (
    <div className={Styles["spinner-container"]}>
        <div className={Styles["loader"]}></div>
    </div>
);
