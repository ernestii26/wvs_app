interface LogtoClient {
  /** * 實例化時傳入的原始配置 
   * 包含 appId, endpoint, resources 等
   */
  readonly config: LogtoConfig;

  /* --- 核心授權方法 --- */

  /** 檢查目前是否有有效的 Access Token 或 Refresh Token */
  isAuthenticated(): Promise<boolean>;
  /** 檢查 Logto SDK 是否已初始化完成 */
  isInitialized(): boolean;
  /** * 獲取 Access Token (這就是你在 SocialProvider 中使用的核心方法) 
   * 它比 Hook 提供的版本更底層，能直接指定 resource
   */
  getAccessToken(resource?: string): Promise<string | undefined>;

  /** 獲取 ID Token 原始字串 */
  getIdToken(): Promise<string | undefined>;

  /** 獲取 ID Token 內的 Claims (同 Hook 版本) */
  getIdTokenClaims(): Promise<IdTokenClaims | undefined>;

  /** 獲取 Refresh Token (通常用於需要極長效授權的場景) */
  getRefreshToken(): Promise<string | undefined>;

  /* --- 使用者資訊 --- */

  /** 從 /oidc/me 端點抓取使用者資訊 (同 Hook 版本) */
  fetchUserInfo(): Promise<UserInfoResponse | undefined>;

  /* --- 流程控制 --- */

  /** 開始登入流程 */
  signIn(redirectUri: string): Promise<void>;

  /** * 處理登入回調 (Internal)
   * 通常在 React Native 的深層連結 (Deep Link) 觸發時使用
   */
  handleSignInCallback(callbackUri: string): Promise<void>;

  /** 開始登出流程 */
  signOut(postLogoutRedirectUri?: string): Promise<void>;
}