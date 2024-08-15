import { useURLContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";

const Footer = () => {
    const { t } = useTranslator();
    const { isThirdParty } = useURLContext();

    return (
        <h3 className="text-center copyright">
            {t(`${ResourceTypes.SABA_NUMBER}.copyright${isThirdParty ? "_sabaplay" : ""}`, {
                year: new Date().getFullYear(),
            }).replaceTolgeeFormat()}
        </h3>
    );
};

export default Footer;
