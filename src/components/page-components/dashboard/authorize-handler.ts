import { AuthorizeResponse } from "sc-user-service-client/dist/auth";

export type AuthorizeHandlerProps = {
    authorizeResponse: AuthorizeResponse;
};

export class AuthorizeHandler {
    private authorizeInfo: null;

    constructor(private readonly props: AuthorizeHandlerProps) { }


}
