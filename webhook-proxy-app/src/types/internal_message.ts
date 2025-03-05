import { Params } from "express-serve-static-core";
import { IncomingHttpHeaders } from "http";

export interface ProxyMessage {
    endpointKey: string;
    body: any;
    params: Params;
    headers: IncomingHttpHeaders;
}