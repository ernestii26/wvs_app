import { Image, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export default function PostCard({
    postLink,
    imageUri,
    title,
    content,
    username,
}: {
    postLink: () => void;
    imageUri: string;
    title: string;
    content: string;
    username: string;
}) {
    return (
        <Pressable onPress={postLink} style={styles.card}>
        <Image
            source={{ uri: imageUri }}
            resizeMode="cover"
            style={styles.image}
        />
        <ThemedView style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText numberOfLines={2} style={styles.body}>
            {content}
            </ThemedText>
            <ThemedText style={styles.author}>by {username}</ThemedText>
        </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 8,
        backgroundColor: '#fff',
        elevation: 2, // for Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // for iOS shadow
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    image: {
        width: '100%',
        height: 200,
    },
    content: {
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    body: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
    },
    author: {
        fontSize: 12,
        color: '#888',
    },
});
