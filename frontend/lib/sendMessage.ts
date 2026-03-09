import Toast from 'react-native-toast-message';

const handleError = (error: any, text2?: string) => {
    console.error("API error:", error.message, error.status, error.data);
    let errorMessage = undefined;
    if (error?.status === 401)
        errorMessage = "Token無效";
    else if (error?.status === 403)
        errorMessage = "權限不足";
    else if (error?.status === 404){
        errorMessage = `404 Error`;
    } else
        errorMessage = "未知錯誤"

    Toast.show({
        type: 'error',
        text1: errorMessage,
        ...(text2 && { text2 }),
        visibilityTime: 2000
    });
};

const handleSuccess = (text1: string, text2?: string) => {
    Toast.show({
        type: 'success',
        text1,
        ...(text2 && {text2}),
        visibilityTime: 2000
    });
};

export {handleError, handleSuccess};