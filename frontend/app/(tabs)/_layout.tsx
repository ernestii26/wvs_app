import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, OpaqueColorValue } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/containers/hooks/useColorScheme'
import { Image } from 'expo-image';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: 'absolute',
					},
					default: {},
				}),
				tabBarShowLabel: false, // 隱藏底部 tab 的文字
			}}>
					<Tabs.Screen
						name="(home)"
						options={{
							title: 'Home',
							tabBarIcon: ({ color, focused }) => (
								<Image 
								source={focused ? require('@/assets/icons/PostTab1.svg') : require('@/assets/icons/PostTab.svg')} 
								style={{ width: 35, height: 35 }} 
								/>
								),
						}}
					/>
					<Tabs.Screen
						name="test"
						options={{
							title: '自介',
							tabBarIcon: ({ color, focused }) => (
							<Image 
							source={focused ? require('@/assets/icons/CafeTab1.svg') : require('@/assets/icons/CafeTab.svg')} 
							style={{ width: 32, height: 29 }} 
							/>
							),
						}}
     				 />
					{/* <Tabs.Screen
						name="profileself"
						options={{
							title: 'Profile',
							tabBarIcon: ({ color }: {color: string | OpaqueColorValue}) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
						}}
					/> */}
					{/* <Tabs.Screen
						name="post/[postid]"
						options={{
							href: null,
							title: 'Post',
							tabBarIcon: ({ color }: {color: string | OpaqueColorValue}) => <IconSymbol size={28} name="house.fill" color={color} />,
						}}
					/> */}
					<Tabs.Screen
						name="tutor"
						options={{
							title: '貼文',
							tabBarIcon: ({ color, focused }) => (
							<Image 
							source={focused ? require('@/assets/icons/MsgTab1.svg') : require('@/assets/icons/MsgTab.svg')} 
							style={{ width: 36, height: 36 }} 
							/>
							),
						}}
					/>
					<Tabs.Screen
						name="profileself"
						options={{
							title: '自介',
							tabBarIcon: ({ color, focused }) => (
							<Image 
							source={focused ? require('@/assets/icons/ProfileTab1.svg') : require('@/assets/icons/ProfileTab.svg')} 
							style={{ width: 36, height: 36 }} 
							/>
							),
						}}
     				 />
					
		</Tabs>
	);
}
