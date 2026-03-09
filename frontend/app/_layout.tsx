import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from '@/containers/hooks/useColorScheme';

import { SocialProvider } from "@/containers/hooks/useSocial";
import { PostPageProvider } from '@/containers/hooks/usePostsPage';
import { QuestionPageProvider } from '@/containers/hooks/useQuestionsPage';
import { NotificationProvider } from '@/containers/hooks/useNotification';
import { LogtoProvider, Prompt, UserScope } from "@logto/rn";
import { ENDPOINT, AppId, API_RESOURCE } from "@/constants/Uri";
import Toast from 'react-native-toast-message';

import "@/global.css"
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
	});

	
	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<LogtoProvider 
				config={{ 
					endpoint: ENDPOINT, 
					appId: AppId,
					resources: [API_RESOURCE],
					scopes: ['all'], 
					// For better demonstration, override the default prompt to always show the login screen.
					// Default value is `Prompt.Consent`.
					// With `Prompt.Consent` settings, user will automatically be consented if they have a valid session.
					// prompt: Prompt.Login
				}}
			>
				<SocialProvider> 
					<PostPageProvider>
						<QuestionPageProvider>
							<NotificationProvider>
								<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
										<Stack>
											<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
											<Stack.Screen name="signin" options={{ headerShown: false }} />
											<Stack.Screen name="+not-found" />
										</Stack>
										<StatusBar style="auto" />
								</ThemeProvider>
								<Toast />
							</NotificationProvider>
						</QuestionPageProvider>
					</PostPageProvider>
				</SocialProvider>
			</LogtoProvider>
		</SafeAreaProvider>
	);
}
