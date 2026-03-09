import Post from "@/containers/Post";
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

    const PostScreen = () => {
    const { postid } = useLocalSearchParams();

    // 保護性檢查
    if (typeof postid !== 'string') {
        return <Text>Invalid post ID</Text>;
    }

    return <Post postId={postid} />;
};

export default PostScreen;