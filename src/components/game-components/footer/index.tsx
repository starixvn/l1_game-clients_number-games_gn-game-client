import { useURLContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks/use-translator";
import { ResourceTypes } from "../../../_shared/resources";

const Footer = () => {
    const { t } = useTranslator();
    const { isThirdParty } = useURLContext();

    return <h3 className="text-center copyright"></h3>;
};

export default Footer;
