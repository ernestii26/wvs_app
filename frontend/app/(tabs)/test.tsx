import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import { useNotification } from "@/containers/hooks/useNotification";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TestNotificationScreen = () => {
    const { showNotification } = useNotification();
    const insets = useSafeAreaInsets();

    // 測試 1: 基本通知
    const testBasicNotification = () => {
        showNotification({
            title: '系統通知',
            message: '這是一個基本的通知訊息！',
        });
    };

    // 測試 2: 沒有標題的通知
    const testNoTitleNotification = () => {
        showNotification({
            message: '這是一個沒有標題的通知訊息，只有內容部分。',
        });
    };

    // 測試 3: 只有關閉按鈕的通知
    const testCloseOnlyNotification = () => {
        showNotification({
            title: '提示',
            message: '這個通知只有關閉按鈕，沒有確認按鈕。',
            showConfirmButton: false,
        });
    };

    // 測試 4: 有確認回調的通知
    const testWithConfirmCallback = () => {
        showNotification({
            title: '確認操作',
            message: '你確定要執行這個操作嗎？點擊確認按鈕會在控制台顯示訊息。',
            onConfirm: () => {
                console.log('✅ 使用者點擊了確認按鈕！');
                alert('確認操作已執行！');
            },
        });
    };

    // 測試 5: 自訂按鈕文字
    const testCustomButtonText = () => {
        showNotification({
            title: '刪除確認',
            message: '你確定要刪除這個項目嗎？此操作無法復原。',
            confirmText: '刪除',
            closeText: '取消',
            onConfirm: () => {
                console.log('⚠️ 項目已刪除');
            },
        });
    };

    // 測試 6: 長文字內容
    const testLongMessage = () => {
        showNotification({
            title: '重要公告',
            message: '親愛的用戶您好，\n\n系統將於明天凌晨 2:00 - 4:00 進行維護更新。\n\n維護期間將無法使用以下功能：\n• 貼文發布\n• 個人資料編輯\n• 圖片上傳\n\n造成不便，敬請見諒。',
        });
    };

    // 測試 7: 成功訊息
    const testSuccessMessage = () => {
        showNotification({
            title: '✅ 操作成功',
            message: '您的資料已成功儲存！',
            showConfirmButton: false,
            closeText: '知道了',
        });
    };

    // 測試 8: 錯誤訊息
    const testErrorMessage = () => {
        showNotification({
            title: '❌ 操作失敗',
            message: '網路連線異常，請檢查您的網路設定後再試一次。',
            showConfirmButton: false,
            closeText: '我知道了',
        });
    };

    return (
        <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.title}>通知 Dialog 測試頁面</ThemedText>
                <ThemedText style={styles.subtitle}>
                    點擊下方按鈕測試不同的通知效果
                </ThemedText>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>基本功能測試</ThemedText>
                    
                    <TouchableOpacity style={styles.button} onPress={testBasicNotification}>
                        <Text style={styles.buttonText}>1. 基本通知</Text>
                        <Text style={styles.buttonDesc}>有標題 + 內容 + 兩個按鈕</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testNoTitleNotification}>
                        <Text style={styles.buttonText}>2. 無標題通知</Text>
                        <Text style={styles.buttonDesc}>只有內容，沒有標題</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testCloseOnlyNotification}>
                        <Text style={styles.buttonText}>3. 單按鈕通知</Text>
                        <Text style={styles.buttonDesc}>只顯示關閉按鈕</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testWithConfirmCallback}>
                        <Text style={styles.buttonText}>4. 確認回調</Text>
                        <Text style={styles.buttonDesc}>點擊確認會觸發回調函數</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={testCustomButtonText}>
                        <Text style={styles.buttonText}>5. 自訂按鈕文字</Text>
                        <Text style={styles.buttonDesc}>自訂「刪除」和「取消」按鈕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>實際應用場景</ThemedText>

                    <TouchableOpacity style={styles.button} onPress={testLongMessage}>
                        <Text style={styles.buttonText}>6. 系統公告</Text>
                        <Text style={styles.buttonDesc}>較長的通知內容</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.successButton]} onPress={testSuccessMessage}>
                        <Text style={styles.buttonText}>7. 成功訊息 ✅</Text>
                        <Text style={styles.buttonDesc}>操作成功的提示</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={testErrorMessage}>
                        <Text style={styles.buttonText}>8. 錯誤訊息 ❌</Text>
                        <Text style={styles.buttonDesc}>操作失敗的提示</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    successButton: {
        backgroundColor: '#34C759',
    },
    errorButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    buttonDesc: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
    },
});

export default TestNotificationScreen;
