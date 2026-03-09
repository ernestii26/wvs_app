import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import ThreadPost from '@/components/ThreadPost';
import { usePostPage } from './hooks/usePostsPage';
import { useState } from 'react';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from '@/components/ThemedView';
import CreatePostModal from '@/components/CreatePostModal';
import { useDBPostsApi } from './hooks/useDBPostsApi';
import { useSocial } from './hooks/useSocial';
import Loading from '@/components/Loading';
import { useRouter } from 'expo-router';
import { handleError } from '@/lib/sendMessage';
import AddPost from '@/components/BlueButton';

const MainPage = () => {
    const { posts, isRefreshing, refreshPosts, loadMorePost } = usePostPage();
    const [isModalVisible, setModalVisible] = useState<boolean>(false);

    const insets = useSafeAreaInsets();
    const router = useRouter();
    
    const { CreateDBPost } = useDBPostsApi();
    const { claims, loadingMessage, setLoadingMessage } = useSocial();

    const handleModalSubmit = async (data: { category: string; content: string; images: string[] }) => {
        if (!claims?.sub) {
            handleError(new Error("請先登入"), "無法創建貼文");
            return;
        }
        
        setLoadingMessage("創建貼文中")
        setModalVisible(false);
        
        try {
            // 使用 category 作為標題，content 作為內容，images[0] 作為圖片（目前只支持一張）
            const image = data.images.length > 0 ? data.images[0] : undefined;
            await CreateDBPost(claims.sub, data.category, data.content, image);
            console.log("[MainPage] 貼文創建成功，正在刷新列表");
            await refreshPosts();
        } catch (error) {
            handleError(error, "創建貼文失敗");
        } finally {
            setLoadingMessage(undefined);
        }
    };

    return (
        <>
            {(loadingMessage != undefined) && <Loading text={loadingMessage} opacity={false}/>}
            <ThemedView style={styles.container}>
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ThreadPost 
                            avatar={item.author.avatar}
                            name={item.author.displayName || item.author.username}
                            handle={`@${item.author.username}`}
                            time={new Date(item.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                            content={`${item.title}\n\n${item.content}`}
                            images={item.image ? [item.image] : []}
                            commentsCount={0}
                            TeacherName={item.teacherName}
                            onPressThread={() => router.push(`/post/${item.id}`)}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={refreshPosts} />
                    }
                    onEndReached={loadMorePost}
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
        backgroundColor: '#fff',
    },
    listContent: {
        paddingHorizontal: 0, // ThreadPost 已有內部 padding
    },
});

export default MainPage;
