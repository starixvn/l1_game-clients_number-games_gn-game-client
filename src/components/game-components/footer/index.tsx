import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";
const Footer = () => {
    const { t } = useTranslator();

    return (
        <h3 className="text-center copyright">
            {t(`${ResourceTypes.SABANUMBER}.copyright`, { year: new Date().getFullYear() }).replaceTolgeeFormat()}
        </h3>
    );
};

export default Footer;
