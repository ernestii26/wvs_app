import ThreadPost from '@/components/ThreadPost';
import { useDBPostsApi } from './hooks/useDBPostsApi';
import { useSocial } from './hooks/useSocial';
import { useLogtoUsersApi } from './hooks/useLogtoUsersApi';
import React, { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { handleError } from '@/lib/sendMessage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import EditProfileModal from '@/components/EditProfileModal';

// 模擬金幣庫資料
const mockCoinItems = [
    {
        id: 1,
        image: require('@/assets/images/react-logo.png'),
        coins: 50,
        title: '和世界志工社的老師們一起去郊遊~~'
    },
    {
        id: 2,
        image: require('@/assets/images/react-logo.png'),
        coins: 30,
        title: '價值非凡的大驚喜！'
    },
    {
        id: 3,
        image: require('@/assets/images/react-logo.png'),
        coins: 15,
        title: '小獎品~下一季一起加油！'
    }
];

export default function Profile2() {
    const [activeTab, setActiveTab] = useState('posts');
    const [isTabsSticky, setIsTabsSticky] = useState(false);
    const [tabsOffsetY, setTabsOffsetY] = useState(0);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);
    const [cursor, setCursor] = useState<string | undefined>(undefined);
    const [hasMorePosts, setHasMorePosts] = useState(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    
    const { GetDBUserPosts } = useDBPostsApi();
    const { user, setUser, claims, loadingMessage } = useSocial();
    const { GetLogtoUser } = useLogtoUsersApi();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    useEffect(() => {
        if (claims?.sub) {
            loadUserPosts();
        }
    }, [claims?.sub]);

    const loadUserPosts = async (loadMore = false) => {
        if (!claims?.sub || isLoadingPosts) return;
        
        setIsLoadingPosts(true);
        try {
            const { newPosts, nextCursor } = await GetDBUserPosts(
                claims.sub, 
                claims.sub,
                loadMore ? cursor : undefined
            );
            
            if (loadMore) {
                setUserPosts(prev => [...prev, ...newPosts]);
            } else {
                setUserPosts(newPosts);
            }
            
            setCursor(nextCursor);
            setHasMorePosts(nextCursor != null);
        } catch (error) {
            handleError(error, "無法載入貼文");
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        
        try {
            if (claims?.sub) {
                const newUser = await GetLogtoUser(claims.sub);
                setUser(newUser);
                await loadUserPosts();
            }
        } catch (error) {
            handleError(error, "刷新失敗");
        } finally {
            setRefreshing(false);
        }
    }, [claims?.sub]);

    const handlePressThread = (postId: string) => {
        router.push(`/post/${postId}`);
    };

    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setIsTabsSticky(scrollY >= tabsOffsetY);
    };

    const handleTabsLayout = (event: any) => {
        const { y } = event.nativeEvent.layout;
        setTabsOffsetY(y);
    };

    const handleEditProfile = () => {
        setIsEditModalVisible(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalVisible(false);
    };

    const handleProfileUpdated = (updatedData: any) => {
        // 更新本地 user state
        setUser({
            ...user,
            customData: {
                ...user?.customData,
                displayName: updatedData.name,
                description: updatedData.bio,
            },
            avatar: updatedData.avatar,
        });
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#4FD1C5" />
            </View>
        );
    }

    return (
        <>
            {(loadingMessage != undefined) && <Loading text={loadingMessage} opacity={false} />}
            
            <EditProfileModal
                visible={isEditModalVisible}
                onClose={handleCloseEditModal}
                userData={{
                    name: user?.customData?.displayName || user?.username || '',
                    bio: user?.customData?.description || '',
                    school: user?.customData?.school || '',
                    grade: user?.customData?.grade || '',
                    birthday: user?.customData?.birthday || '',
                    avatar: user?.avatar || '',
                }}
                onProfileUpdated={handleProfileUpdated}
                userId={claims?.sub || ''}
            />

            <View style={styles.container}>
                <ScrollView 
                    style={styles.scrollView}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                >
                    {/* Top Banner */}
                    <View style={styles.topBanner} />

                    {/* Profile Header Area */}
                    <View style={styles.headerContent}>
                        {/* Avatar */}
                        <View style={styles.avatarContainer}>
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                            ) : (
                                <Image 
                                    source={require('@/assets/avatar-default.jpg')} 
                                    style={styles.avatar} 
                                />
                            )}
                        </View>

                        {/* Name and Edit Button Row */}
                        <View style={styles.nameRow}>
                            <View>
                                <Text style={styles.userName}>{user?.customData?.displayName || user?.username || '使用者'}</Text>
                                <Text style={styles.userAccount}>@{user?.username || 'user'}</Text>
                            </View>
                            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                                <Text style={styles.editButtonText}>編輯資料</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bio */}
                        <View style={styles.bioContainer}>
                            <Text style={styles.bioText}>
                                {user?.customData?.description || '尚未設定個人簡介'}
                            </Text>
                        </View>
                    </View>

                    {/* Tabs Placeholder */}
                    {isTabsSticky && <View style={styles.tabsPlaceholder} />}

                    {/* Tabs */}
                    <View 
                        style={styles.tabContainer}
                        onLayout={handleTabsLayout}
                    >
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                            onPress={() => setActiveTab('posts')}
                        >
                            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                                貼文
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'coins' && styles.activeTab]}
                            onPress={() => setActiveTab('coins')}
                        >
                            <Text style={[styles.tabText, activeTab === 'coins' && styles.activeTabText]}>
                                金幣庫
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    <View style={styles.contentContainer}>
                        {activeTab === 'posts' ? (
                            <View style={styles.postsContainer}>
                                {isLoadingPosts && userPosts.length === 0 ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator size="large" color="#4FD1C5" />
                                    </View>
                                ) : userPosts.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Text style={styles.emptyText}>尚無貼文</Text>
                                    </View>
                                ) : (
                                    <>
                                        {userPosts.map((post) => (
                                            <ThreadPost
                                                key={post.id}
                                                avatar={post.author?.avatar || user?.avatar}
                                                name={post.author?.displayName || post.author?.username || user?.customData?.displayName || user?.username}
                                                handle={`@${post.author?.username || user?.username}`}
                                                time={new Date(post.createdAt).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}
                                                content={`${post.title}\n\n${post.content}`}
                                                images={post.image ? [post.image] : []}
                                                commentsCount={0}
                                                TeacherName={post.teacherName}
                                                onPressThread={() => handlePressThread(post.id)}
                                            />
                                        ))}
                                        {isLoadingPosts && (
                                            <View style={styles.loadingMoreContainer}>
                                                <ActivityIndicator size="small" color="#4FD1C5" />
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        ) : (
                            <View style={styles.coinLibrary}>
                                {/* Season Reward */}
                                <View style={styles.seasonRewardContainer}>
                                    <Text style={styles.seasonRewardTitle}>這一季的累積獎金......！</Text>
                                    <Text style={styles.seasonRewardScore}>50/50</Text>
                                </View>

                                {/* Progress Bar */}
                                <View style={styles.progressBarContainer}>
                                    <View style={styles.progressBar}>
                                        <View style={[styles.progressFill, { width: '100%' }]} />
                                    </View>
                                </View>

                                {/* Coin Items List */}
                                <View style={styles.coinItemsList}>
                                    {mockCoinItems.map((item) => (
                                        <View key={item.id} style={styles.coinItem}>
                                            <Image source={item.image} style={styles.coinItemImage} />
                                            <View style={styles.coinBadge}>
                                                <Text style={styles.coinBadgeText}>{item.coins}</Text>
                                            </View>
                                            <Text style={styles.coinItemTitle}>{item.title}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Sticky Tabs */}
                {isTabsSticky && (
                    <View style={styles.stickyTabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                            onPress={() => setActiveTab('posts')}
                        >
                            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                                貼文
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'coins' && styles.activeTab]}
                            onPress={() => setActiveTab('coins')}
                        >
                            <Text style={[styles.tabText, activeTab === 'coins' && styles.activeTabText]}>
                                金幣庫
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    scrollView: {
        flex: 1,
    },
    topBanner: {
        height: 120,
        backgroundColor: '#E0F7FA',
    },
    headerContent: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        marginTop: -40,
        marginBottom: 10,
        borderWidth: 4,
        borderColor: '#FFF',
        backgroundColor: '#FFF',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#D3D3D3',
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    userAccount: {
        fontSize: 14,
        color: '#888',
    },
    editButton: {
        borderWidth: 1,
        borderColor: '#D3D3D3',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    editButtonText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '600',
    },
    bioContainer: {
        marginTop: 8,
    },
    bioText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
    tabsPlaceholder: {
        height: 50,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
    },
    stickyTabContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFF',
        zIndex: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#A0E0E0',
    },
    tabText: {
        fontSize: 16,
        color: '#888',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    postsContainer: {
        paddingBottom: 20,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingMoreContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    coinLibrary: {
        padding: 20,
    },
    seasonRewardContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seasonRewardTitle: {
        fontSize: 15,
        color: '#000',
        fontWeight: 'bold',
    },
    seasonRewardScore: {
        fontSize: 15,
        color: '#000',
        fontWeight: 'bold',
    },
    progressBarContainer: {
        marginBottom: 30,
    },
    progressBar: {
        height: 24,
        backgroundColor: '#FFC0CB',
        borderRadius: 12,
        overflow: 'hidden',
        opacity: 0.5,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFB6C1',
        borderRadius: 12,
    },
    coinItemsList: {
        gap: 20,
    },
    coinItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    coinItemImage: {
        width: 100,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#E0F7FA',
    },
    coinBadge: {
        backgroundColor: '#F5F0E6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coinBadgeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    coinItemTitle: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        fontWeight: '500',
    },
});
