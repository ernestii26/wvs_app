
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToCache = async (key: string, data: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(data)).then((res) => {
        console.log(`[Cache] cache 儲存 ${key} 成功`);
        return res;
    }).catch((error) => {
        console.error(`[Cache] cache 儲存 ${key} 失敗`, error);
    });
};

export const loadFromCache = async <T = any>(key: string): Promise<T | null> => {
    const json = await AsyncStorage.getItem(key).then((res) => {
        console.log(`[Cache] cache 讀取 ${key} 成功`);
        return res;
    }).catch((error) => {
        console.error(`[Cache] cache 讀取 ${key} 失敗`, error);
    });
    return json ? JSON.parse(json) : null;
};

export const clearCache = async () => {
    await AsyncStorage.clear().then((res) => {
        console.log("[Cache] cache 清理成功")
        return res
    }).catch((error) => {
        console.error("[Cache] cache 清除失敗", error);
    });
};
