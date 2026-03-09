import { Image, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedTextInput } from './ThemedTextInput';

const ProfileEditView = ({ avatarUrl, username, setUsername, description, setDescription, editable, onAvatarPress, onSave }: {
    avatarUrl: string,
    username: string,
    setUsername: React.Dispatch<React.SetStateAction<string>>,
    description: string,
    setDescription:React.Dispatch<React.SetStateAction<string>>,
    editable: true,
    setEditable: React.Dispatch<React.SetStateAction<boolean>>,
    onAvatarPress: () => void,
    onSave: () => void
}) => {
    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity onPress={onAvatarPress} disabled={!editable}>
                <Image
                    source={avatarUrl ? { uri: avatarUrl } : require('@/assets/avatar-default.jpg')}
                    style={styles.avatar}
                />
            </TouchableOpacity>
            <ThemedTextInput
                value={username}
                onChangeText={(text) => {setUsername(text)}}
                placeholder="輸入使用者名稱"
                style={styles.input}
            />
            <ThemedTextInput
                value={description}
                onChangeText={(text) => {setDescription(text)}}
                placeholder="輸入個人簡介"
                style={[styles.input, styles.multiline]}
                multiline
            />
            <Button 
                title='儲存'
                onPress={onSave}
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
    input: {
        borderWidth: 1,
        borderRadius: 8,
        width: '80%',
        padding: 8,
        marginVertical: 4,
        textAlign: 'center',
    },
    multiline: {
        height: 80,
        textAlignVertical: 'top',
    },
});

export default ProfileEditView;
