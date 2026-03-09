import { useState } from 'react';
import { useLogtoUsersApi } from './useLogtoUsersApi';
import { useDBUsersApi } from './useDBUsersApi';
import { handleError, handleSuccess } from '@/lib/sendMessage';
import ApiError from '@/lib/ApiError';

export interface UserProfileData {
    name: string;
    bio: string;
    school?: string;
    grade?: string;
    birthday?: string;
    avatar: string;
}

export const useEditProfile = () => {
    const [loading, setLoading] = useState(false);
    const { handleLogtoUpdataUser, handleLogtoUpdateCustomData } = useLogtoUsersApi();
    const { UpsertDBUser } = useDBUsersApi();

    const updateProfile = async (userId: string, profileData: Partial<UserProfileData>) => {
        setLoading(true);
        try {
            // 更新 displayName（顯示名稱）
            if (profileData.name !== undefined) {
                // 1. 先更新到數據庫（會檢查 30 天冷卻期）
                try {
                    await UpsertDBUser(userId, {
                        displayName: profileData.name
                    });
                } catch (error: any) {
                    if (error.data?.code === 'DISPLAY_NAME_COOLDOWN') {
                        throw new ApiError(
                            error.data.message || '顯示名稱每 30 天只能改一次',
                            429,
                            error.data
                        );
                    }
                    throw error;
                }

                // 2. 同步到 Logto customData
                await handleLogtoUpdateCustomData(
                    userId,
                    { displayName: profileData.name },
                    () => {}
                );
            }

            // 更新自訂資料
            const customDataToUpdate: any = {};
            if (profileData.bio !== undefined) customDataToUpdate.description = profileData.bio;
            if (profileData.school !== undefined) customDataToUpdate.school = profileData.school;
            if (profileData.grade !== undefined) customDataToUpdate.grade = profileData.grade;
            if (profileData.birthday !== undefined) customDataToUpdate.birthday = profileData.birthday;

            // 只有當有資料需要更新時才呼叫 API
            if (Object.keys(customDataToUpdate).length > 0) {
                await handleLogtoUpdateCustomData(
                    userId,
                    customDataToUpdate,
                    () => {} // 這裡不需要 setUser，因為會在 modal 關閉後處理
                );
            }

            setLoading(false);
            return profileData;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const uploadAvatar = async (userId: string, avatarUri: string): Promise<string> => {
        setLoading(true);
        try {
            // 這裡應該實作圖片上傳到伺服器的邏輯
            // 暫時先返回原 URI，實際應用中需要上傳到雲端儲存服務
            
            // TODO: 實作圖片上傳功能
            // 例如上傳到 AWS S3, Cloudinary, 或自己的伺服器
            
            // 暫時使用本地 URI
            console.log('[useProfile] 圖片上傳功能尚未實作，使用本地 URI');
            
            // 更新使用者頭像
            await handleLogtoUpdataUser(
                userId,
                { avatar: avatarUri },
                () => {} // 這裡不需要 setUser，因為會在 modal 關閉後處理
            );

            setLoading(false);
            return avatarUri;
        } catch (error) {
            setLoading(false);
            handleError(error, '上傳頭像失敗');
            throw error;
        }
    };

    return {
        updateProfile,
        uploadAvatar,
        loading,
    };
};
