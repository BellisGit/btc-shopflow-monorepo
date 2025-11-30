export type NumberAuthVendor = 'CM' | 'CU' | 'CT';
export type NumberAuthMethod = 'getTokenInfo' | 'authGetToken' | 'getAccessCode';

export interface NumberAuthConfigResponse {
  vendor: NumberAuthVendor;
  sdkPayload: {
    method: NumberAuthMethod;
    data: Record<string, any>;
    extraOptions?: Record<string, any>;
  };
  /** 需要回传给后端的上下文（例如 requestId、traceId 等） */
  loginContext?: Record<string, any>;
}

export interface NumberAuthLoginRequest {
  vendor: NumberAuthVendor;
  carrierResult: Record<string, any>;
  context?: Record<string, any>;
}

