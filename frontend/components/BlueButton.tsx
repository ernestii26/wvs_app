/*藍色加號按鈕元件*/
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity } from 'react-native';

interface AddPostProps {
    onPress?: () => void;
    bottom?: number;
    iconSource?: ImageSourcePropType;
}

const AddPost = ({ onPress, bottom = 32, iconSource }: AddPostProps) => {
    return (
        <TouchableOpacity
            style={[styles.container, { bottom }]}
            onPress={onPress || (() => console.log('Button Pressed!'))}
            activeOpacity={0.8}
        >
            <Image 
                source={iconSource || require('@/assets/icons/addpost.png')}
                style={styles.image}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        zIndex: 999,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 0,
        backgroundColor: 'transparent',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default AddPost;