import { useLogto } from "@logto/rn";
import { BackendURL, API_RESOURCE } from "@/constants/Uri";
import ApiError from "@/lib/ApiError";

export const useDBCommentsApi = () => {
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

    const GetPostComments = async (postId: string) => {
        const response = await api(`/api/db/comments/post`, {
            method: 'POST',
            body: JSON.stringify({ postId })
        }).then((res) => {
            console.log("[DB Comments API]", `get comments for post ${postId} success`)
            return res;
        }).catch(error => { 
            console.error("[DB Comments API]", `get comments for post ${postId} fail`)
            throw error 
        })
        return response;
    };

    const CreateComment = async (postId: string, userId: string, content: string) => {
        const response = await api(`/api/db/comments/create`, {
            method: 'POST',
            body: JSON.stringify({ postId, userId, content })
        }).then((res) => {
            console.log("[DB Comments API]", `${userId} create comment success`)
            return res;
        }).catch(error => { 
            console.error("[DB Comments API]", `${userId} create comment fail`)
            throw error 
        })
        return response;
    }

    const DeleteComment = async (commentId: number, userId: string) => {
        const response = await api(`/api/db/comments/delete`, {
            method: 'POST',
            body: JSON.stringify({ commentId, userId })
        }).then((res) => {
            console.log("[DB Comments API]", `${userId} delete comment ${commentId} success`);
            return res;
        }).catch(error => {
            console.error("[DB Comments API]", `${userId} delete comment ${commentId} fail`);
            throw error;
        })
        return response;
    }

    return {
        GetPostComments,
        CreateComment,
        DeleteComment
    };
};
