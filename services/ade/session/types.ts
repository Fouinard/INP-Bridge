
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

export type ApiFunction<T> = (params: { credentials: string; cookieString: string }) => Promise<T>;