import { useValues } from '@/app/login'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import { CustomDrawerNavigator } from '@src/drawer/drawerNavigator'
import {
	CategoryScreen,
	ForgetPassword,
	HomeScreen,
	LoaderScreen,
	MyBeg,
	Onboarding,
	OnboardingTwo,
	OtpVerification,
	PageListScreen,
	ProfileScreen,
	ResetPassword,
	SignIn,
	SignUp,
	Splash,
} from '@src/screens'
import { external } from '@src/style/external.css'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import {
	Category,
	CategoryLight,
	HomeIcon,
	HomeLight,
	MyBegDis,
	MyBegs,
	ProfileLight,
	ProfileTab,
} from '@src/utils/icon'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React, { FC, useState } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'

const HomeStack = createNativeStackNavigator()
const AuthStack = createNativeStackNavigator()

export function AuthStackScreen() {
	return (
		<AuthStack.Navigator screenOptions={{ headerShown: false }}>
			<AuthStack.Screen name="Splash" component={Splash} />
			<AuthStack.Screen name="Onboarding" component={Onboarding} />
			<AuthStack.Screen name="OnboardingTwo" component={OnboardingTwo} />
			<AuthStack.Screen name="SignIn" component={SignIn} />
			<AuthStack.Screen name="SignUp" component={SignUp} />
			<AuthStack.Screen name="OtpVerification" component={OtpVerification} />
			<AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
			<AuthStack.Screen name="ResetPassword" component={ResetPassword} />
			<AuthStack.Screen name="LoaderScreen" component={LoaderScreen} />
		</AuthStack.Navigator>
	)
}
const Stack = createStackNavigator()

export default function AppNavigator() {
	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="LoaderScreen" component={LoaderScreen} />
				<Stack.Screen name="AuthStack" component={AuthStackScreen} />
				<Stack.Screen name="MainApp" component={CustomDrawerNavigator} />
				<Stack.Screen name="PageListScreen" component={PageListScreen} />
			</Stack.Navigator>
		</NavigationContainer>
	)
}

const Tab = createBottomTabNavigator()

interface CustomTabBarProps {
	state: {
		routes?: Array<{
			key?: string
			name?: string
		}>
	}
	descriptors: {
		[key: string]: {
			options: {
				tabBarLabel?: string
				title?: string
				tabBarIcon?: React.FC
				activeTabBarIcon?: React.FC
			}
		}
	}
	navigation: {
		navigate: (routeName: string) => void
		emit: (event: {
			type: string
			target: string
			canPreventDefault: boolean
		}) => { defaultPrevented: boolean }
	}
}

const CustomTabBar: FC<CustomTabBarProps> = ({
	state,
	descriptors,
	navigation,
}: any) => {
	const [activeTab, setActiveTab] = useState<string>(state.routes[0].name)

	const handleTabPress = (routeName: string) => {
		setActiveTab(routeName)
		navigation.navigate(routeName)
	}

	const { linearColorStyle, viewRTLStyle } = useValues()

	return (
		<LinearGradient
			start={{ x: 0.0, y: 0.0 }}
			end={{ x: 0.0, y: 1.0 }}
			colors={linearColorStyle}
			style={{
				flexDirection: viewRTLStyle,
				backgroundColor: '#ffffff',
				height: windowHeight(55),
				borderColor: '#E9E9E9',
				elevation: 10,
			}}
		>
			{state.routes.map((route: any, index: number) => {
				const { options } = descriptors[route.key]

				const label =
					options.tabBarLabel !== undefined
						? options.tabBarLabel
						: options.title !== undefined
							? options.title
							: route.name
				const IconComponent = options.tabBarIcon
				const ActiveIcon = options.activeTabBarIcon
				const isFocused = state.index === index

				const onPress = () => {
					const event = navigation.emit({
						type: 'tabPress',
						target: route.key,
						canPreventDefault: true,
					})

					if (!isFocused && !event.defaultPrevented) {
						handleTabPress(route.name)
					}
				}

				return (
					<TouchableOpacity
						key={route.key}
						onPress={onPress}
						style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
					>
						<View>{isFocused ? <ActiveIcon /> : <IconComponent />}</View>

						{isFocused && (
							<View style={[external.ai_center]}>
								<View
									style={{
										width: windowHeight(3),
										height: windowHeight(3),
										borderRadius: windowHeight(3),
										backgroundColor: '#4D66FF',
										marginVertical: 4,
									}}
								/>
								<Image
									source={images.bottom}
									style={{
										width: windowWidth(65),
										height: windowHeight(15),
										position: 'absolute',
										bottom: -windowHeight(18),
										resizeMode: 'contain',
									}}
								/>
							</View>
						)}
					</TouchableOpacity>
				)
			})}
		</LinearGradient>
	)
}

export function MyTabs() {
	return (
		<Tab.Navigator
			initialRouteName="HomeScreen"
			screenOptions={{ headerShown: false }}
			tabBar={props => <CustomTabBar {...props} />}
			tabBarOptions={{
				activeTintColor: '#000000',
				inactiveTintColor: '#808080',
			}}
		>
			<Tab.Screen
				name="HomeScreen"
				component={HomeScreen}
				options={{
					tabBarLabel: 'Home',
					tabBarIcon: () => <HomeLight />,
					activeTabBarIcon: () => <HomeIcon />,
				}}
			/>
			<Tab.Screen
				name="CategoryScreen"
				component={CategoryScreen}
				options={{
					tabBarLabel: 'Category',
					tabBarIcon: () => <CategoryLight />,
					activeTabBarIcon: () => <Category />,
				}}
			/>
			<Tab.Screen
				name="MyBeg"
				component={MyBeg}
				options={{
					tabBarLabel: 'My Bag',
					tabBarIcon: () => <MyBegDis />,
					activeTabBarIcon: () => <MyBegs />,
				}}
			/>
			<Tab.Screen
				name="ProfileScreen"
				component={ProfileScreen}
				options={{
					tabBarLabel: 'Profile',
					tabBarIcon: () => <ProfileLight />,
					activeTabBarIcon: () => <ProfileTab />,
				}}
			/>
		</Tab.Navigator>
	)
}
