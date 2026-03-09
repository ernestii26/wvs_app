import { Stack } from 'expo-router';

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen name="[profilename]" options={{ headerShown: false }} />
			<Stack.Screen name="post/[postid]" options={{ headerShown: false }} />
			<Stack.Screen name="index" options={{ headerShown: false }} />
		</Stack>
	);
}
