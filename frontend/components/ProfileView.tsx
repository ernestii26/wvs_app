import { Image, Button, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

const ProfileView = ({ avatarUrl, username, description, setEditable, signOut }: {
    avatarUrl: string,
    username: string,
    description: string,
    setEditable: React.Dispatch<React.SetStateAction<boolean>>,
    signOut: () => void
}) => {
    return (
        <ThemedView style={styles.container}>
            <Image
                source={avatarUrl ? { uri: avatarUrl } : require('@/assets/avatar-default.jpg')}
                style={styles.avatar}
            />
            <ThemedText type='title'>{username}</ThemedText>
            <ThemedText type='subtitle'>{description}</ThemedText>
            <Button 
                title='編輯'
                onPress={() => {
                    setEditable(true);
                }}
            />
            <Button 
                title='登出'
                onPress={signOut}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: 16,
    },
});

export default ProfileView;
