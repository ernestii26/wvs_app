import { FlatList, RefreshControl, StyleSheet, Image, TouchableOpacity, Text, View } from 'react-native';
import { useQuestionPage } from '@/containers/hooks/useQuestionsPage';
import { useState } from 'react';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from '@/components/ThemedView';
import CreatePostModal from '@/components/CreatePostModal';
import { useDBQuestionsApi } from '@/containers/hooks/useDBQuestionsApi';
import { useSocial } from '@/containers/hooks/useSocial';
import Loading from '@/components/Loading';
import { useRouter } from 'expo-router';
import { handleError } from '@/lib/sendMessage';
import AddPost from '@/components/BlueButton';

const Tutor = () => {
    const { questions, isRefreshing, refreshQuestions, loadMoreQuestions } = useQuestionPage();
    const [isModalVisible, setModalVisible] = useState<boolean>(false);

    const insets = useSafeAreaInsets();
    const router = useRouter();
    
    const { CreateDBQuestion } = useDBQuestionsApi();
    const { claims, loadingMessage, setLoadingMessage } = useSocial();

    const handleModalSubmit = async (data: { category: string; content: string; images: string[] }) => {
        if (!claims?.sub) {
            handleError(new Error("請先登入"), "無法創建問題");
            return;
        }
        
        setLoadingMessage("創建問題中")
        setModalVisible(false);
        
        try {
            const image = data.images.length > 0 ? data.images[0] : undefined;
            await CreateDBQuestion(claims.sub, data.category, data.content, image);
            console.log("[TutorScreen] 問題創建成功，正在刷新列表");
            await refreshQuestions();
        } catch (error) {
            handleError(error, "創建問題失敗");
        } finally {
            setLoadingMessage(undefined);
        }
    };

    return (
        <>
            {(loadingMessage != undefined) && <Loading text={loadingMessage} opacity={false}/>}
            <ThemedView style={styles.container}>
                <FlatList
                    data={questions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.postCard}>

                            {/* 用戶信息 */}
                            <View style={styles.userInfo}>
                                <Image 
                                    source={typeof item.author.avatar === 'string' ? { uri: item.author.avatar } : item.author.avatar}
                                    style={styles.avatar}
                                />
                                <View style={styles.userDetails}>
                                    <View style={styles.userNameRow}>
                                        <Text style={styles.userName}>{item.author.displayName || item.author.username}</Text>
                                        <Text style={styles.userHandle}>@{item.author.username}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* 內容 */}
                            <Text style={styles.content}>{item.content}</Text>

                            {/* 圖片 */}
                            {item.image && (
                                <Image 
                                    source={{ uri: item.image }}
                                    style={styles.contentImage}
                                />
                            )}

                            {/* 查看輪盤按鈕 (底部) */}
                            <TouchableOpacity 
                                style={styles.viewButton}
                                onPress={() => router.push(`/question/${item.id}`)}
                            >
                                <Text style={styles.viewButtonText}>查看解答</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={refreshQuestions} />
                    }
                    onEndReached={loadMoreQuestions}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }
                    ]}
                />

                <AddPost 
                    onPress={() => setModalVisible(true)}
                    bottom={insets.bottom + 80}
                    iconSource={require('@/assets/icons/questionpost.png')}
                />
                <CreatePostModal 
                    visible={isModalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleModalSubmit}
                />
            </ThemedView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    postCard: {
        marginBottom: 16,
    },
    bubbleAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    viewButton: {
        backgroundColor: '#5B9FFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    viewButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    userInfo: {
         flexDirection: 'column',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userDetails: {
    flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    userName: {
        fontWeight: '600',
        fontSize: 14,
        color: '#333',
    },
    userHandle: {
        fontSize: 12,
        color: '#999',
    },
    content: {
        fontSize: 13,
        color: '#555',
        lineHeight: 20,
        marginBottom: 12,
    },
    contentImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#d4d4d4',
    },
});

export default Tutor;
