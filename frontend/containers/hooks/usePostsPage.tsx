/*貼文列表、刷新、分頁*/

import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { loadFromCache, saveToCache } from "@/lib/cache";
import { useDBPostsApi } from "./useDBPostsApi";
import { useSocial } from "./useSocial";
import { handleError } from "@/lib/sendMessage";

const CACHE_KEY = "posts";

type PostPageContextType = {
    posts: any[];
    isRefreshing: boolean;
    refreshPosts: () => Promise<void>;
    loadMorePost: () => Promise<void>;
    isLoadingMorePost: boolean;
    getIdDBPostCache: (userId: string, postId: string) => Promise<any>;
};

const PostPageContext = createContext<PostPageContextType | null>(null);

const PostPageProvider = (props: any) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isLoadingMorePost, setIsLoadingMorePost] = useState<boolean>(false);
    const [hasMorePost, setHasMorePost] = useState<boolean>(true);
    const { claims } = useSocial();
    const { GetDBCursorPosts, GetIdDBPost } = useDBPostsApi();

    // 初始載入 cache
    useEffect(() => { 
        const handleLoadFromCache = async() => {
            console.log("[PostsPage]", "Start Init load Posts")
            const cached = await loadFromCache<any[]>(CACHE_KEY);
            if (cached)
                setPosts(cached);
            await refreshPosts();
        }
        if(claims)
            void handleLoadFromCache();
    }, [claims?.sub]);

    // Refresh 資料
    const refreshPosts = useCallback(async () => {
        if (claims?.sub == undefined)
            return
        setIsRefreshing(true);
        try {
            const { newPosts, nextCursor } = await GetDBCursorPosts(claims?.sub); // 不需要cursor
            setPosts(newPosts);
            setCursor(nextCursor);
            setHasMorePost(nextCursor != null);
            await saveToCache(CACHE_KEY, newPosts);
        } catch (error) {
            handleError(error, "無法刷新貼文")
        } finally {
            setIsRefreshing(false);
        }
    }, [claims?.sub]);

    // Lazy load 更多
    const loadMorePost = useCallback(async () => {
        if (isLoadingMorePost || !hasMorePost || claims?.sub == undefined)
            return;
        setIsLoadingMorePost(true);
        try {
            const { newPosts, nextCursor } = await GetDBCursorPosts(claims?.sub, cursor);
            if (nextCursor == null)
                setHasMorePost(true);
            else {
                setPosts((prev) => [...prev, ...newPosts]);
                setCursor(nextCursor);
            }
        } catch (e) {
            console.error("[PostPage] Load more failed", e);
        } finally {
            setIsLoadingMorePost(false);
        }
    }, [cursor, isLoadingMorePost, hasMorePost, claims?.sub]);

    const getIdDBPostCache = async (userId: string, postId: string) => {
        const targetPost = posts.find(post => post.id === postId);
        if(!targetPost){
            console.log("[PostPage]", `${userId} get id post with cache success. Call api with backend.`)
            return await GetIdDBPost(userId, postId).catch(error => { throw error })
        }
        console.log("[PostPage]", `${userId} get id post with cache success`)
        return targetPost;
    }

    return (
        <PostPageContext.Provider
            value={{
                posts, isRefreshing, refreshPosts, loadMorePost, isLoadingMorePost, getIdDBPostCache
            }}
            {...props}
        />
    );
}

const usePostPage = () => {
    const context = useContext(PostPageContext);
    if (!context) throw new Error("usePostPage must be used within a PostPageProvider");
    return context;
};
export { PostPageProvider, usePostPage };
