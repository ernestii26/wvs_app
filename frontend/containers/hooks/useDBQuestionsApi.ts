import { throwContextError, useLogto } from "@logto/rn";
import { BackendURL, API_RESOURCE } from "@/constants/Uri";
import ApiError from "@/lib/ApiError";

export const useDBQuestionsApi = () => {
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

    const GetDBCursorQuestions = async (userId: string, cursor?: string) => {
        const response = await api(`/api/db/questions/cursor`, {
            method: 'POST',
            body: JSON.stringify({ cursor })
        }).then((res) => {
            console.log("[DB Questions API]", `${userId} get questions with cursor success`)
            return res;
        }).catch(error => { 
            console.error("[DB Questions API]", `${userId} get questions with cursor fail`)
            throw error 
        })
        return response;
    };

    const CreateDBQuestion = async (userId: string, title: string, content: string, image?: string) => {
        const response = await api(`/api/db/questions/create`, {
            method: 'POST',
            body: JSON.stringify({ userId, title, content, image })
        }).then((res) => {
            console.log("[DB Questions API]", `${userId} create question success`)
            return res;
        }).catch(error => { 
            console.error("[DB Questions API]", `${userId} create question fail`)
            throw error 
        })
        return response;
    }

    const GetIdDBQuestion = async (userId: string, questionId: string) => {
        const response = await api(`/api/db/questions/id`, {
            method: 'POST',
            body: JSON.stringify({ userId, questionId })
        }).then((res) => {
            if(res == null)
                throw new ApiError("找不到問題", 404);

            console.log("[DB Questions API]", `${userId} get question Id ${questionId} success`);
            return res;
        }).catch(error => {
            console.error("[DB Questions API]", `${userId} get question Id ${questionId} fail`);
            throw error;
        })
        return response;
    }

    const GetDBUserQuestions = async (userId: string, targetUserId: string, cursor?: string) => {
        const response = await api(`/api/db/questions/user`, {
            method: 'POST',
            body: JSON.stringify({ userId: targetUserId, cursor })
        }).then((res) => {
            console.log("[DB Questions API]", `${userId} get user ${targetUserId} questions success`);
            return res;
        }).catch(error => {
            console.error("[DB Questions API]", `${userId} get user ${targetUserId} questions fail`);
            throw error;
        })
        return response;
    }

    return {
        GetDBCursorQuestions,
        CreateDBQuestion,
        GetIdDBQuestion,
        GetDBUserQuestions
    };
};
