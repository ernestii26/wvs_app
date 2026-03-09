import { useSocial } from '@/containers/hooks/useSocial'
import { ThemedView } from '@/components/ThemedView';
import Loading from '@/components/Loading';
import { useRouter } from "expo-router";
import MainPage from './MainPage';

import { useEffect } from 'react';

const App = () => {
    const { isInitialized, isAuthenticated, roles } = useSocial();
    const router = useRouter();

    useEffect(() => {
        console.log("[APP]", isInitialized, isAuthenticated, roles)
        if((isInitialized && !isAuthenticated) || (isInitialized && isAuthenticated && roles?.length == 0)){
            console.log("前往 /singin")
            router.replace("/signin");
        }
    },[isInitialized, isAuthenticated, roles])
    
    // 還沒初始化、登入、載入roles時都不該亂操作
    return (
        <>
            {(!isInitialized || !isAuthenticated || roles == undefined) && <Loading text="" />} 
            <ThemedView style={{flex: 1}}>
                <MainPage />
            </ThemedView>
        </>
    )
};

export default App;