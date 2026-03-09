
import { useLogto } from "@logto/rn";
import { BackendURL, API_RESOURCE } from "@/constants/Uri";
import { handleError, handleSuccess } from "@/lib/sendMessage";
import ApiError from "@/lib/ApiError";

export const useLogtoUsersApi = () => {
    const { client } = useLogto();

    const api = async (
        path: string, 
        options: RequestInit = {}
    ) => {
        try { 
            // 獲取 API 資源的存取令牌
            const token = await client.getAccessToken(API_RESOURCE);
            if (!token) {
                throw new ApiError("獲取存取令牌失敗", 401);  
            }
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
            console.error(error)
            throw error;
        }
    };

    const GetLogtoUser = async (userId: string) => {
        const response = await api(`/api/logto/users/${userId}`).then((res) => {
            console.log("[Logto User Api]", `${userId} get user success`)
            return res;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} get user fail`)
            throw error 
        });
        return response;
    };

    const UpdateLogtoUser = async (userId: string, userData: any) => {
        const response = await api(`/api/logto/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({userData}),
        }).then((res) => {
            console.log("[Logto User Api]", `${userId} update user data ${userData} success`);
            return res;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} update user data ${userData} fail`);
            throw error 
        });
        return response;
    };

    const GetLogtoUserCustomData = async (userId: string) => {
        const response = await api(`/api/logto/users/${userId}/custom-data`).then((res) => {
            console.log("[Logto User Api]", `${userId} get user custom data success`)
            return res;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} get user custom data fail`)
            throw error 
        });
        return response;
    }

    const UpdateLogtoUserCustomData = async (userId: string, customData: any) => {
        const response = await api(`/api/logto/users/${userId}/custom-data`, {
            method: 'PATCH',
            body: JSON.stringify({ "customData": customData }),
        }).then((res) => {
            console.log("[Logto User Api]", `${userId} update user custom data ${customData} success`);
            return res;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} update user custom data ${customData} fail`);
            throw error 
        });
        return response;
    };

    const GetLogtoRoleToUsers = async (userId: string) => {
        const response = await api(`/api/logto/users/${userId}/roles`).then((res) => {
            console.log("[Logto User Api]", `${userId} get user roles success`);
            return res;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} get user roles fail`);
            throw error 
        });
        return response;
    };

    const UpdateLogtoRoleToUsers = async (userId: string, roles: string[], email: string) => {
        await api(`/api/logto/users/${userId}/roles`, {
            method: 'PUT',
            body: JSON.stringify({ roles, email }),
        }).then(() => {
            console.log("[Logto User Api]", `${userId} update user roles ${roles} with email ${email} success`);
            return;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} update user roles ${roles} with email ${email} fail`)
            throw error 
        });
        return;
    };

    const AssignLogtoRoleToUsers = async (userId: string, roles: string[], email: string) => {
        await api(`/api/logto/users/${userId}/roles`, {
            method: 'POST',
            body: JSON.stringify({ roles, email }),
        }).then(() => {
            console.log("[Logto User Api]", `${userId} assign user roles ${roles} with email ${email} success`);
            return;
        }).catch(error => { 
            console.error("[Logto User Api]", `${userId} assign user roles ${roles} with email ${email} fail`)
            throw error 
        });
        return;
    };

    const handleLogtoUpdataUser = async (userId: string, userData: any, setUser: React.Dispatch<React.SetStateAction<any>>) => {
        await UpdateLogtoUser(userId, userData).then((res) => {
            setUser((prev: any) => ({
                ...prev,
                ...userData
            }))
            handleSuccess("操作成功", "資料已更新");
        }).catch(error => {
            handleError(error, error.message ?? "修改用戶資料失敗");
            throw error;
        })
    }

    const handleLogtoUpdateCustomData = async (userId: string, customData: any, setUser: React.Dispatch<React.SetStateAction<any>>) => {
        await UpdateLogtoUserCustomData(userId, customData).then((res) => {
            setUser((prev: any) => ({
                ...prev,
                "customData": customData
            }))
            handleSuccess("操作成功", "資料已更新");
        }).catch(error => {
            handleError(error, error.message ?? "修改用戶資料失敗");
            throw error;
        })
    }

    const handleLogtoUpdateRoles = async (userId: string, roles: string[], setRoles: React.Dispatch<React.SetStateAction<any>>, email: string) => {
        await UpdateLogtoRoleToUsers(userId, roles, email).then(() => {
            setRoles(roles);
            handleSuccess("操作成功", `角色為${roles}`);
        }).catch(error => {
            handleError(error, error.message ?? "修改角色失敗");
            throw error;
        });
    };

    return { GetLogtoUser, UpdateLogtoUser, GetLogtoUserCustomData, UpdateLogtoUserCustomData, 
        GetLogtoRoleToUsers, UpdateLogtoRoleToUsers, AssignLogtoRoleToUsers, 
        handleLogtoUpdataUser, handleLogtoUpdateCustomData, handleLogtoUpdateRoles };
};