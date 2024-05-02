import * as Sentry from "@sentry/nextjs";
import { NextPageContext } from "next";
import { useTheme } from "next-themes";
import NextErrorComponent from "next/error";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { buildVersion } from "../_shared/constants";

const errorMsg = {
    en: "An error has occurred, please contact CSD for details.",
    vi: "Đã xảy ra lỗi. Vui lòng liên hệ với bộ phận CSKH để được hỗ trợ.",
};

const MyError = ({ statusCode, hasGetInitialPropsRun, err }) => {
    if (!hasGetInitialPropsRun && err) {
        Sentry.captureException(err);
    }

    const router = useRouter();
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(false);
    }, [router.isReady]);

    if (isLoading) {
        return <></>;
    }

    return (
        <div className="error-page">
            <img className="error-background small" src={`/static/images/error-${theme}.svg?v=${buildVersion}`} alt="error" />
            <p className="info">{`${errorMsg[router.locale]}(${statusCode})`}</p>
        </div>
    );
};

MyError.getInitialProps = async (context: NextPageContext) => {
    const initialProps = await NextErrorComponent.getInitialProps(context);

    const errorInitialProps = {
        ...initialProps,
        hasGetInitialPropsRun: true,
    };

    context.err
        ? Sentry.captureException(context.err)
        : Sentry.captureException(new Error(`_error.js getInitialProps missing data at path: ${context.asPath}`));

    await Sentry.flush(2000);

    return errorInitialProps;
};

export default MyError;
