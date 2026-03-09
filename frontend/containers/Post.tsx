import { ThemedText } from "@/components/ThemedText";
import { Image, Pressable, View, FlatList, TextInput, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Text } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { useSocial } from "./hooks/useSocial";
import { useEffect, useState } from "react";
import { handleError } from "@/lib/sendMessage";
import Loading from '@/components/Loading';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePostPage } from "./hooks/usePostsPage";
import { useDBCommentsApi } from "./hooks/useDBCommentsApi";
import { Ionicons } from '@expo/vector-icons';

const Post = ({postId} : {postId: string}) => {
    const { getIdDBPostCache } = usePostPage();
    const { user, loadingMessage, setLoadingMessage } = useSocial();
    const { GetPostComments, CreateComment } = useDBCommentsApi();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState<string>("");
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const data = await getIdDBPostCache(user.id, postId);
                setPost(data);
                
                // 獲取評論
                const commentsData = await GetPostComments(postId);
                setComments(commentsData);
            } catch (error) {
                handleError(error);
            }
        };

        if (postId && user) {
            setLoadingMessage("");
            fetchPost();
            setLoadingMessage(undefined);
        }
    }, [postId, user]);

    const router = useRouter();

    const pressAvatar = () => {
        router.push(`/${post.author.username}`);
    }

    const handleSubmitComment = async () => {
        if (!commentText.trim() || !user) return;

        try {
            setLoadingMessage("發送評論中...");
            const newComment = await CreateComment(postId, user.id, commentText.trim());
            setComments([...comments, newComment]);
            setCommentText("");
        } catch (error) {
            handleError(error, "發送評論失敗");
        } finally {
            setLoadingMessage(undefined);
        }
    };

    if(loadingMessage !== undefined || !post){
        return <Loading />;
    }

    const renderComment = ({ item }: { item: any }) => (
        <View style={styles.commentContainer}>
            <Image
                source={{ uri: item.author.avatar }}
                style={styles.commentAvatar}
            />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{item.author.displayName || item.author.username}</Text>
                    <Text style={styles.commentHandle}>@{item.author.username}</Text>
                    <Text style={styles.commentDot}>·</Text>
                    <Text style={styles.commentTime}>
                        {new Date(item.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                    </Text>
                </View>
                <Text style={styles.commentText}>{item.content}</Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={insets.top}
        >
            <ThemedView style={styles.container}>
                {/* 頂部導航欄 */}
                <View style={[styles.header, { paddingTop: insets.top }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>貼文</Text>
                    <View style={styles.headerRight} />
                </View>

                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderComment}
                    ListHeaderComponent={
                        <View>
                            {/* 主貼文 */}
                            <View style={styles.mainPost}>
                                {/* 使用者資訊 */}
                                <Pressable onPress={pressAvatar} style={styles.authorRow}>
                                    <Image
                                        source={{ uri: post.author.avatar }}
                                        style={styles.avatar}
                                    />
                                    <View>
                                        <Text style={styles.username}>{post.author.displayName || post.author.username}</Text>
                                        <Text style={styles.handle}>@{post.author.username}</Text>
                                    </View>
                                </Pressable>

                                {/* 內文 */}
                                <Text style={styles.content}>{post.content}</Text>

                                {/* 圖片 */}
                                {post.image && (
                                    <Image 
                                        source={{ uri: post.image }}
                                        style={styles.postImage}
                                    />
                                )}

                                {/* 時間 */}
                                <Text style={styles.timestamp}>
                                    {new Date(post.createdAt).toLocaleTimeString('zh-TW', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })} · {new Date(post.createdAt).toLocaleDateString('zh-TW', { 
                                        year: 'numeric',
                                        month: 'numeric', 
                                        day: 'numeric' 
                                    })} · <Text style={styles.source}>NTUWVS</Text>
                                </Text>

                                {/* 互動按鈕 */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.actionButton}>
                                        <Ionicons name="chatbubble-outline" size={18} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.divider} />
                        </View>
                    }
                    contentContainerStyle={styles.listContent}
                    style={{ marginBottom: 60 }}
                />

                {/* 底部輸入框 */}
                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 20) + 60 }]}>
                    <Image
                        source={{ uri: user?.avatar }}
                        style={styles.inputAvatar}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="有什麼有趣的想法一起分享吧！"
                        placeholderTextColor="#999"
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                    />
                    <TouchableOpacity 
                        onPress={handleSubmitComment}
                        disabled={!commentText.trim()}
                        style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                    >
                        <Ionicons 
                            name="send" 
                            size={20} 
                            color={commentText.trim() ? "#1DA1F2" : "#ccc"} 
                        />
                    </TouchableOpacity>
                </View>
            </ThemedView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e1e8ed',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    headerRight: {
        width: 40,
    },
    listContent: {
        paddingBottom: 20,
    },
    mainPost: {
        padding: 16,
        backgroundColor: '#fff',
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
    },
    username: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    handle: {
        fontSize: 14,
        color: '#666',
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
        color: '#14171a',
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 250,
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: '#f5f5f5',
    },
    timestamp: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    source: {
        color: '#1DA1F2',
    },
    actionRow: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e1e8ed',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 30,
    },
    divider: {
        height: 8,
        backgroundColor: '#f7f9f9',
    },
    commentContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    commentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    commentContent: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    commentAuthor: {
        fontWeight: '600',
        fontSize: 14,
        color: '#000',
        marginRight: 4,
    },
    commentHandle: {
        fontSize: 14,
        color: '#666',
        marginRight: 4,
    },
    commentDot: {
        color: '#666',
        marginHorizontal: 4,
    },
    commentTime: {
        fontSize: 14,
        color: '#666',
    },
    commentText: {
        fontSize: 15,
        lineHeight: 20,
        color: '#14171a',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e1e8ed',
        backgroundColor: '#fff',
    },
    inputAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    input: {
        flex: 1,
        maxHeight: 100,
        fontSize: 15,
        paddingVertical: 8,
        paddingHorizontal: 16,
        color: '#14171a',
        backgroundColor: '#D1E8FF',
        borderRadius: 20,
    },
    sendButton: {
        padding: 8,
        marginLeft: 8,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default Post;