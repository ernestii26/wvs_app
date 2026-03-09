import { useSocial } from "@/containers/hooks/useSocial";
import { useRouter } from "expo-router";
import Login from "@/components/Login";
import ChooseRole from "./ChooseRole";
import Loading from "@/components/Loading";
import { useEffect } from "react";


const SignIn = () => {
    const { isAuthenticated, client, LoadingSignIn, isInitialized, roles, loadingMessage } = useSocial();
    const router = useRouter();

    useEffect(() => {
        if(isInitialized && isAuthenticated && roles?.length > 0){
            console.log("前往 /")
            router.replace('/')
        } 
    },[isInitialized, isAuthenticated, roles])

    if(!isAuthenticated){
        // 考慮到Login中可能有需要Load的部分，先加Load
        // 登入介面
        return (
            <>
                {(loadingMessage != undefined) && <Loading text={loadingMessage} opacity={false} />}
                <Login client={client} signIn={async () => {await LoadingSignIn()}} />
            </>
        );
    } else if (roles == undefined){
        // 雖然在App.tsx中判斷過roles是否為undefined，但需要考慮未登入的情況，剛登入完一段時間roles可能還沒跑好，還沒跑好前不該亂做事
        return <Loading />
    } else if (roles.length === 0){
        // 確定roles load好了之後才應該跳到choose role的介面，否則可能會讓已經有role的人再選一次role
        // 可能需要Load，先加
        // 選角色介面
        return (
            <>
                {(loadingMessage != undefined) && <Loading text={loadingMessage} />}
                <ChooseRole />
            </>
        );
    }

    return null;
};   

export default SignIn;  