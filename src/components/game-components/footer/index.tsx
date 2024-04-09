import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";

const Footer = () => {
    const { t } = useTranslator();

    return (
        <div className="text-center copyright">
            {t(`${ResourceTypes.SABA_NUMBER}.copyright`, { year: new Date().getFullYear() }).replaceTolgeeFormat()}
        </div>
    );
};

export default Footer;
