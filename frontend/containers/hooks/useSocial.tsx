/*
認證、使用者資料、角色
*/
import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { useLogto, type IdTokenClaims } from "@logto/rn";
import { handleError } from "@/lib/sendMessage";
import { useLogtoUsersApi } from "./useLogtoUsersApi";
import { useDBUsersApi } from "./useDBUsersApi";
import { saveToCache, loadFromCache, clearCache } from "@/lib/cache";
import { RedirectUri, API_RESOURCE } from "@/constants/Uri";

type SocialContextType = {
    signIn: (redirectUri: string) => Promise<void>;
    signOut: () => Promise<void>;
    client: any;
    isAuthenticated: boolean;
    isInitialized: boolean;
    getIdTokenClaims: () => Promise<IdTokenClaims | undefined>;
    claims: IdTokenClaims | undefined;
    setClaims: React.Dispatch<React.SetStateAction<IdTokenClaims | undefined>>;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    roles: any;
    setRoles: React.Dispatch<React.SetStateAction<any>>;
    LoadingSignIn: () => Promise<void>;
    InitDataSignOut: () => Promise<void>;
    loadingMessage: string | undefined;
    setLoadingMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
    initLoading: boolean;
    setInitLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SocialContext = createContext<SocialContextType | null>(null);

const SocialProvider = (props: any) => {
    const { signIn, signOut, client, isAuthenticated, isInitialized, getIdTokenClaims } = useLogto();
    const [claims, setClaims] = useState<IdTokenClaims>();
    const [user, setUser] = useState<any>();
    const [roles, setRoles] = useState<any>();
    const [loadingMessage, setLoadingMessage] = useState<string | undefined>(undefined);
    const [initLoading, setInitLoading] = useState<boolean>(false);

    // 使用 useCallback 確保 Function Reference 穩定，避免 useEffect 無限觸發
    const InitDataSignOut = useCallback(async () => {
        setLoadingMessage("登出中...");
        try {
            setClaims(undefined);
            setUser(undefined);
            setRoles(undefined);
            await clearCache();
            await signOut();
            console.log("[Social] 狀態已完全重置並登出");
        } catch (e) {
            console.error("[Social] 登出過程發生錯誤", e);
        } finally {
            setLoadingMessage(undefined);
        }
    }, [signOut]);

    const LoadingSignIn = async () => {
        setLoadingMessage("登入中...");
        try {
            await signIn(RedirectUri);
        } catch (e) {
            console.error("登入失敗", e);
        } finally {
            setLoadingMessage(undefined);
        }
    };

    const { GetLogtoUser, GetLogtoRoleToUsers } = useLogtoUsersApi();
    const { UpsertDBUser } = useDBUsersApi();

    useEffect(() => {
        let isMounted = true;
        let logoutInitiated = false;

        const syncUserData = async () => {
            // 1. 基礎檢查
            if (!isInitialized || !isAuthenticated) return;

            setInitLoading(true);

            try {
                // --- 步驟 A：先拿身份證明 (ID Token Claims) ---
                // 這是目前 SDK 存儲的「我是誰」的唯一真理
                const currentClaims = await getIdTokenClaims();
                if (!currentClaims?.sub) throw new Error("Invalid Identity Claims");

                // --- 步驟 B：強制身份比對與污染清理 ---
                const cachedClaims = await loadFromCache<IdTokenClaims>("claims");
                
                // 關鍵判斷：如果快取存在，但 sub 對不上，說明是「不同人」或是「登出不乾淨」
                if (cachedClaims && cachedClaims.sub !== currentClaims.sub) {
                    console.warn("[Social] 偵測到身份不一致 (污染風險)！執行強制清理...");
                    
                    // 立即清空所有記憶體狀態與快取磁碟
                    if (isMounted) {
                        setClaims(undefined);
                        setUser(undefined);
                        setRoles(undefined);
                    }
                    await clearCache(); 
                    
                    // 確保新的身份被寫入快取，鎖定 B 的身份
                    await saveToCache("claims", currentClaims);
                } else if (!cachedClaims) {
                    // 第一次登入或快取為空，直接寫入身份
                    await saveToCache("claims", currentClaims);
                }

                if (isMounted) setClaims(currentClaims);

                // --- 步驟 C：實質授權校驗 (拿 Access Token) ---
                // 只有在身份鎖定後，才去拿鑰匙 (Access Token)
                const token = await client.getAccessToken(API_RESOURCE);
                if (!token) throw new Error("Not authenticated");

                console.log("[Social] 身份校驗通過，當前使用者:", currentClaims.sub);

                // --- 步驟 D：讀取快取或抓取新資料 ---
                // 這裡已經安全了，因為快取若有資料，保證是同一個 sub 的
                const [cachedUser, cachedRoles] = await Promise.all([
                    loadFromCache<any>("user"),
                    loadFromCache<any>("roles")
                ]);

                if (isMounted) {
                    if (cachedUser) setUser(cachedUser);
                    if (cachedRoles) setRoles(cachedRoles);
                }

                // 抓取 API 最新資料
                const newUser = await GetLogtoUser(currentClaims.sub);
                if (!isMounted) return;
                const newRoles = await GetLogtoRoleToUsers(currentClaims.sub);
                if (!isMounted) return;

                // 更新快取與狀態
                if (isMounted) {
                    setUser(newUser);
                    setRoles(newRoles);
                    await saveToCache("user", newUser);
                    await saveToCache("roles", newRoles);
                }

                // 背景更新 DB
                UpsertDBUser(currentClaims.sub, {
                    username: newUser.username,
                    displayName: newUser.customData?.displayName || newUser.username,
                    avatar: newUser.avatar
                }, {
                    username: newUser.username,
                    displayName: newUser.customData?.displayName || newUser.username,
                    avatar: newUser.avatar
                }).catch(err => console.error("[DB] 背景同步失敗", err));

            } catch (error: any) {
                const errorMsg = error?.message || "";
                // 只要偵測到授權失效，立即觸發徹底登出
                if (errorMsg.includes("Not authenticated") || error?.status === 401) {
                    if (!logoutInitiated && isMounted) {
                        logoutInitiated = true;
                        console.warn("[Social] 授權失效或身份異常，執行安全登出...");
                        await InitDataSignOut();
                    }
                } else {
                    handleError(error, "同步用戶資料失敗");
                }
            } finally {
                if (isMounted) setInitLoading(false);
            }
        };

        syncUserData();
        return () => { isMounted = false; };
    }, [isInitialized, isAuthenticated, getIdTokenClaims, client, InitDataSignOut]);

    return (
        <SocialContext.Provider
            value={{
                signIn, signOut, client, isAuthenticated, isInitialized, getIdTokenClaims, claims, setClaims, 
                user, setUser, roles, setRoles, LoadingSignIn, InitDataSignOut, loadingMessage, setLoadingMessage, initLoading, setInitLoading
            }}
        >
            {props.children}
        </SocialContext.Provider>
    );
};

const useSocial = () => {
    const context = useContext(SocialContext);
    if (!context) throw new Error("useSocial must be used within a SocialProvider");
    return context;
};

export { SocialProvider, useSocial };