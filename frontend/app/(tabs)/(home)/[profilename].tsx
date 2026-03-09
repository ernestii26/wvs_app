import Profile from "@/containers/Profile";
import { useSocial } from "@/containers/hooks/useSocial";
import { useLocalSearchParams } from "expo-router";
import Loading from "@/components/Loading";

const ProfileScreen = () => {
    const { user } = useSocial();
    const { profilename } = useLocalSearchParams();

    if(!user){
        return (
            <Loading />
        )
    }
    return (
        <Profile />
    );
}

export default ProfileScreen;
