import ProfileView from "@/components/ProfileView";
import ProfileEditView from "@/components/ProfileEditView";

import { useSocial } from "@/containers/hooks/useSocial";
import { useLogtoUsersApi } from "@/containers/hooks/useLogtoUsersApi";
import { RefreshControl } from 'react-native';
import { ThemedView } from "@/components/ThemedView";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { ThemedActivityIndicator } from "@/components/ThemedActivityIndicator";
import { useState, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Loading from "@/components/Loading";
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
    const { user, setUser, claims, loadingMessage, setLoadingMessage, InitDataSignOut } = useSocial();
    const { GetLogtoUser, handleLogtoUpdataUser, handleLogtoUpdateCustomData } = useLogtoUsersApi();
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const insets = useSafeAreaInsets();

    const [editable, setEditable] = useState<boolean>(false);

    const [avatar, setAvatar] = useState<string>(user?.avatar);
    const [username, setUsername] = useState<string>(user?.username);
    const [description, setDescription] = useState<string>(user?.customData?.description ?? "");

    const onAvatarPress = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
        return null;
    };
    const onSave = async () => {
        setLoadingMessage("");
        if(user?.avatar !== avatar){
            console.log("需要更新頭像");
            await handleLogtoUpdataUser(claims.sub, {
                "avatar": avatar
            }, setUser).catch(error => {
                setAvatar(user?.avatar);
            });
        }
        if(user?.username !== username){
            console.log("需要更新使用者名稱");
            await handleLogtoUpdataUser(claims.sub, {
                "username": username
            }, setUser).catch(error => {
                setUsername(user?.username);
            });
        }
        if(user?.customData?.description !== description){
            console.log("需要更新使用者簡介");
            await handleLogtoUpdateCustomData(claims.sub, {
                "description": description
            }, setUser).catch(error => {
                setDescription(user?.customData?.description ?? "")
            });
        }
        setEditable(false);
        setLoadingMessage(undefined);
    };

    const onRefresh = useCallback(async() => {
        setRefreshing(true);

        const newUser = await GetLogtoUser(claims?.sub);
        setUser(newUser);

        setAvatar(newUser?.avatar);
        setUsername(newUser?.username);
        setDescription(newUser?.customData?.description ?? "");
        
        setRefreshing(false);
    }, []);

    return (
        <>
        {(loadingMessage != undefined) && <Loading text={loadingMessage} opacity={false} />}
        <ThemedScrollView
            contentContainerStyle={{ flexGrow: 1, minHeight: '120%'}}  // 確保內容區域可以佔滿整個畫面
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {refreshing && (
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'center'}}>
                    <ThemedActivityIndicator size="large" />
                </ThemedView>
            )}
            <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: insets.top + 40}}>
            {editable? 
                <ProfileEditView
                    avatarUrl={avatar}
                    username={username}
                    setUsername={setUsername}
                    description={description}
                    setDescription={setDescription}
                    editable={editable}
                    setEditable={setEditable}
                    onAvatarPress={onAvatarPress}
                    onSave={onSave} 
                />:
                <ProfileView 
                    avatarUrl={avatar}
                    username={username}
                    description={description}
                    setEditable={setEditable}
                    signOut={InitDataSignOut}
                />
            }
            </ThemedView>
        </ThemedScrollView>
        </>
    );
};

export default Profile;