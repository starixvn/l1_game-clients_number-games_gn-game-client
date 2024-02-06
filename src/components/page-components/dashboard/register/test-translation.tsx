import { useTranslate } from "@tolgee/react";
import "../../../../_shared/helpers/string-helper";
export default function TestTranslation() {
    const { t, isLoading } = useTranslate(["Common", "SabaNumber"]);

    return (
        <>
            {isLoading ? (
                <>Loading...</>
            ) : (
                <>
                    {t({
                        key: "message_endgame_failed",
                        params: { gameName: "Sicbo", gameRoundId: "1234569", errorCode: "1234" },
                        noWrap: true,
                    }).replaceTogleeFormat()}
                </>
            )}
        </>
    );
}
