
export interface ADERequestParams {
  endpoint?: string;
  year?: string;
  location?: string;
  type?: string;
  referer?: string;
}

export interface ADEAuthenticatedParams extends ADERequestParams {
  credentials: string;
}

export interface ADESessionParams extends ADEAuthenticatedParams {
  cookieString: string;
}

export interface TreeRequestParams extends ADESessionParams {
  nodeId: number | string;
}

export type ExpandNodeTypes = "category" | "branch";

export interface TreeExpandParams extends TreeRequestParams {
  nodeType: ExpandNodeTypes;
}

export type ApiFunction<T> = (params: { credentials: string; cookieString: string }) => Promise<T>;