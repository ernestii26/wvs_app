/*問題列表、刷新、分頁*/

import { useContext, createContext, useState, useEffect, useCallback } from "react";
import { loadFromCache, saveToCache } from "@/lib/cache";
import { useDBQuestionsApi } from "./useDBQuestionsApi";
import { useSocial } from "./useSocial";
import { handleError } from "@/lib/sendMessage";

const CACHE_KEY = "questions";

type QuestionPageContextType = {
    questions: any[];
    isRefreshing: boolean;
    refreshQuestions: () => Promise<void>;
    loadMoreQuestions: () => Promise<void>;
    isLoadingMoreQuestions: boolean;
    getIdDBQuestionCache: (userId: string, questionId: string) => Promise<any>;
};

const QuestionPageContext = createContext<QuestionPageContextType | null>(null);

const QuestionPageProvider = (props: any) => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [cursor, setCursor] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [isLoadingMoreQuestions, setIsLoadingMoreQuestions] = useState<boolean>(false);
    const [hasMoreQuestions, setHasMoreQuestions] = useState<boolean>(true);
    const { claims } = useSocial();
    const { GetDBCursorQuestions, GetIdDBQuestion } = useDBQuestionsApi();

    // 初始載入 cache
    useEffect(() => { 
        const handleLoadFromCache = async() => {
            console.log("[QuestionsPage]", "Start Init load Questions")
            const cached = await loadFromCache<any[]>(CACHE_KEY);
            if (cached)
                setQuestions(cached);
            await refreshQuestions();
        }
        if(claims)
            void handleLoadFromCache();
    }, [claims?.sub]);

    // Refresh 資料
    const refreshQuestions = useCallback(async () => {
        if (claims?.sub == undefined)
            return
        setIsRefreshing(true);
        try {
            const { newQuestions, nextCursor } = await GetDBCursorQuestions(claims?.sub); // 不需要cursor
            setQuestions(newQuestions);
            setCursor(nextCursor);
            setHasMoreQuestions(nextCursor != null);
            await saveToCache(CACHE_KEY, newQuestions);
        } catch (error) {
            handleError(error, "無法刷新問題")
        } finally {
            setIsRefreshing(false);
        }
    }, [claims?.sub]);

    // Lazy load 更多
    const loadMoreQuestions = useCallback(async () => {
        if (isLoadingMoreQuestions || !hasMoreQuestions || claims?.sub == undefined)
            return;
        setIsLoadingMoreQuestions(true);
        try {
            const { newQuestions, nextCursor } = await GetDBCursorQuestions(claims?.sub, cursor);
            if (nextCursor == null)
                setHasMoreQuestions(false);
            else {
                setQuestions((prev) => [...prev, ...newQuestions]);
                setCursor(nextCursor);
            }
        } catch (e) {
            console.error("[QuestionPage] Load more failed", e);
        } finally {
            setIsLoadingMoreQuestions(false);
        }
    }, [cursor, isLoadingMoreQuestions, hasMoreQuestions, claims?.sub]);

    const getIdDBQuestionCache = async (userId: string, questionId: string) => {
        const targetQuestion = questions.find(q => q.id === questionId);
        if(!targetQuestion){
            console.log("[QuestionPage]", `${userId} get id question with cache miss. Call api with backend.`)
            return await GetIdDBQuestion(userId, questionId).catch(error => { throw error })
        }
        console.log("[QuestionPage]", `${userId} get id question with cache success`)
        return targetQuestion;
    }

    return (
        <QuestionPageContext.Provider
            value={{
                questions, isRefreshing, refreshQuestions, loadMoreQuestions, isLoadingMoreQuestions, getIdDBQuestionCache
            }}
            {...props}
        />
    );
}

const useQuestionPage = () => {
    const context = useContext(QuestionPageContext);
    if (!context) throw new Error("useQuestionPage must be used within a QuestionPageProvider");
    return context;
};
export { QuestionPageProvider, useQuestionPage };
