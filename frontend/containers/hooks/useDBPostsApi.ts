import { throwContextError, useLogto } from "@logto/rn";
import { BackendURL, API_RESOURCE } from "@/constants/Uri";
import ApiError from "@/lib/ApiError";

export const useDBPostsApi = () => {
    const { client } = useLogto();

    const api = async ( 
        path: string, 
        options: RequestInit = {}
    ) => {
        try { 
            // 獲取 API 資源的存取令牌
            const token = await client.getAccessToken(API_RESOURCE).catch(error => {
                throw new ApiError("獲取存取令牌失敗", 401, error); 
            });

            const response = await fetch(`${BackendURL}${path}`, {
                ...options, 
                headers: {
                    'Content-Type': 'application/json',
                    // 將存取令牌添加到請求標頭
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            let data;
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const DataText = await response.text(); // HTML 或其他格式
                data = { "message": DataText };
            }

            if (!response.ok){
                console.log(response)
                throw new ApiError(data.message || "伺服器錯誤", response.status, data);
            }
            
            return data;
        } catch (error) {
            console.log(error)
            throw error;
        }
    };

    const GetDBCursorPosts = async (userId: string, cursor?: string) => {
        const response = await api(`/api/db/posts/cursor`, {
            method: 'POST',
            body: JSON.stringify({ cursor })
        }).then((res) => {
            console.log("[DB Posts API]", `${userId} get posts with cursor success`)
            return res;
        }).catch(error => { 
            console.error("[DB Posts API]", `${userId} get posts with cursor fail`)
            throw error 
        })
        return response;
    };

    const CreateDBPost = async (userId: string, title: string, content: string, image?: string) => {
        const response = await api(`/api/db/posts/create`, {
            method: 'POST',
            body: JSON.stringify({ userId, title, content, image })
        }).then((res) => {
            console.log("[DB Posts API]", `${userId} create posts success`)
            return res;
        }).catch(error => { 
            console.error("[DB Posts API]", `${userId} create posts fail`)
            throw error 
        })
        return response;
    }

    const GetIdDBPost = async (userId: string, postId: string) => {
        const response = await api(`/api/db/posts/get`, {
            method: 'POST',
            body: JSON.stringify({ userId, postId })
        }).then((res) => {
            if(res == null)
                throw new ApiError("找不到貼文", 404);

            console.log("[DB Posts API]", `${userId} get post Id ${postId} success`);
            return res;
        }).catch(error => {
            console.error("[DB Posts API]", `${userId} get post Id ${postId} fail`);
            throw error;
        })
        return response;
    }

    const GetDBUserPosts = async (userId: string, targetUserId: string, cursor?: string) => {
        const response = await api(`/api/db/posts/user`, {
            method: 'POST',
            body: JSON.stringify({ userId: targetUserId, cursor })
        }).then((res) => {
            console.log("[DB Posts API]", `${userId} get user ${targetUserId} posts success`);
            return res;
        }).catch(error => {
            console.error("[DB Posts API]", `${userId} get user ${targetUserId} posts fail`);
            throw error;
        })
        return response;
    }

    return { GetDBCursorPosts, CreateDBPost, GetIdDBPost, GetDBUserPosts };
};