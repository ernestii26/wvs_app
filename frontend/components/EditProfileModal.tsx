import { useEditProfile, UserProfileData } from '@/containers/hooks/useProfile';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Button from './Button';

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    userData: UserProfileData;
    onProfileUpdated: (updatedData: UserProfileData) => void;
    userId: string;
}

export default function EditProfileModal({
    visible,
    onClose,
    userData,
    onProfileUpdated,
    userId,
}: EditProfileModalProps) {
    const [name, setName] = useState(userData.name);
    const [bio, setBio] = useState(userData.bio);
    const [school, setSchool] = useState(userData.school || '');
    const [grade, setGrade] = useState(userData.grade || '');
    const [birthday, setBirthday] = useState(userData.birthday || '');
    const [avatarUri, setAvatarUri] = useState(userData.avatar);
    const { updateProfile, uploadAvatar, loading } = useEditProfile();

    const handlePickImage = async () => {
        try {
            // 請求權限
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('權限不足', '需要相簿權限才能選擇照片');
                return;
            }

            // 開啟圖片選擇器
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setAvatarUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('選擇圖片錯誤:', error);
            Alert.alert('錯誤', '選擇圖片失敗');
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('錯誤', '名字不能為空');
            return;
        }

        try {
            // 如果有新的頭像，先上傳頭像
            let newAvatarUrl = avatarUri;
            if (avatarUri && avatarUri !== userData.avatar) {
                newAvatarUrl = await uploadAvatar(userId, avatarUri);
            }

            // 更新個人資料
            const updatedData = await updateProfile(userId, {
                name: name.trim(),
                bio: bio.trim(),
                school: school.trim(),
                grade: grade.trim(),
                birthday: birthday.trim(),
            });

            // 更新成功後通知父組件
            onProfileUpdated({
                ...userData,
                name: name.trim(),
                bio: bio.trim(),
                school: school.trim(),
                grade: grade.trim(),
                birthday: birthday.trim(),
                avatar: newAvatarUrl,
            });

            Alert.alert('成功', '資料已更新');
            onClose();
        } catch (error: any) {
            // 捕獲 30 天冷卻期錯誤
            if (error?.data?.code === 'DISPLAY_NAME_COOLDOWN') {
                const remainingDays = error.data.remainingDays || 30;
                Alert.alert(
                    '無法更新', 
                    `顯示名稱每 30 天只能改一次\n\n還需等待 ${remainingDays} 天`
                );
            } else {
                Alert.alert('錯誤', error?.message || '更新失敗，請稍後再試');
            }
        }
    };

    const handleCancel = () => {
        // 重置為原始值
        setName(userData.name);
        setBio(userData.bio);
        setSchool(userData.school || '');
        setGrade(userData.grade || '');
        setBirthday(userData.birthday || '');
        setAvatarUri(userData.avatar);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleCancel}
        >
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Top Banner */}
                    <View style={styles.topBanner} />

                    {/* Avatar */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
                            {avatarUri ? (
                                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder} />
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>顯示名稱</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="输入显示名称"
                                    placeholderTextColor="#CCC"
                                />
                                <Text style={styles.helperText}>每 30 天只能修改一次</Text>
                            </View>
                        </View>

                        {/* Bio */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>自我介紹</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="介紹一下你自己..."
                                placeholderTextColor="#CCC"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* School */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>學校</Text>
                            <TextInput
                                style={styles.input}
                                value={school}
                                onChangeText={setSchool}
                                placeholder="輸入學校"
                                placeholderTextColor="#CCC"
                            />
                        </View>

                        {/* Grade */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>年級</Text>
                            <TextInput
                                style={styles.input}
                                value={grade}
                                onChangeText={setGrade}
                                placeholder="輸入年級"
                                placeholderTextColor="#CCC"
                            />
                        </View>

                        {/* Birthday */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>生日</Text>
                            <TextInput
                                style={styles.input}
                                value={birthday}
                                onChangeText={setBirthday}
                                placeholder="輸入生日 (例：2000/01/01)"
                                placeholderTextColor="#CCC"
                            />
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <Button 
                            title="取消" 
                            onPress={handleCancel} 
                            color="#D9E2FF" 
                            textStyle={{ color: '#5C80B8' }}
                            style={styles.cancelButton}
                            paddingVertical={0}
                        />
                        <Button 
                            title="儲存" 
                            onPress={handleSave} 
                            color="#2B6CB0" 
                            textStyle={{ color: '#FFF' }}
                            style={styles.saveButton}
                            paddingVertical={0}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
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
    scrollContent: {
        paddingBottom: 40,
    },
    topBanner: {
        height: 120,
        backgroundColor: '#E0F7FA',
    },
    avatarSection: {
        paddingHorizontal: 20,
        marginTop: -40,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: '#FFF',
        borderWidth: 4,
        borderColor: '#FFF',
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
    formSection: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    label: {
        width: 80,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginTop: 12,
    },
    inputWrapper: {
        flex: 1,
    },
    input: {
        flex: 1,
        backgroundColor: '#FDF6E3',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
    },
    helperText: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
    bioInput: {
        height: 120,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 40,
        marginTop: 40,
        marginBottom: 20,
    },
    cancelButton: {
        width: '45%',
        height: 50,
        borderRadius: 10,
    },
    saveButton: {
        width: '45%',
        height: 50,
        borderRadius: 10,
    }
});
