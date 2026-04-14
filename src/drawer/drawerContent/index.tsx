import { useValues } from '@/app/login'
import { DrawerContentComponentProps } from '@react-navigation/drawer'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import {
	Category,
	HomeIcon,
	MyBegs,
	PageListIcon,
	ProfileTab,
} from '@src/utils/icon'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import {
	Image,
	ScrollView,
	SectionList,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from 'react-native'

export function DrawerContent(props: DrawerContentComponentProps) {
	const { isDark, t, linearColorStyle, textColorStyle, iconColorStyle } =
		useValues()
	const navigation = useNavigation<any>()
	const colors: [string, string] = isDark
		? ['#1A1A2E', '#16213E']
		: ['#5385FC', '#355FE9']
	useEffect(() => {
		const backAction = () => {
			if (navigation.canGoBack()) {
				navigation.goBack()
				return true
			}

			if (navigation.isDrawerOpen()) {
				navigation.closeDrawer()
				return true
			}
			return false
		}
	}, [navigation])
	const DATA: { icon: JSX.Element; title: string; data: string[] }[] = [
		{
			icon: <HomeIcon color={iconColorStyle} />,
			title: 'pages.home',
			data: ['pages.Home Variant 1', 'pages.Home Variant 2'],
		},
		{
			icon: <Category color={iconColorStyle} />,
			title: 'pages.category',
			data: ['pages.Category Variant 1', 'pages.Category Variant 2'],
		},
		{
			icon: <MyBegs color={iconColorStyle} />,
			title: 'pages.myBag',
			data: ['pages.My Bag Variant 1', 'pages.My Bag Variant 2'],
		},
		{
			icon: <ProfileTab color={iconColorStyle} />,
			title: 'pages.product',
			data: [
				'pages.My Product Variant 1',
				'pages.My Product Variant 2',
				'pages.My Product Variant 3',
			],
		},
		{
			icon: <PageListIcon color={iconColorStyle} />,
			title: 'transData.page',
			data: ['pages.pagelist'],
		},
	]

	const handleItemPress = (item: string): void => {
		switch (item) {
			case 'pages.Home Variant 1':
				navigation.navigate('Drawer', { screen: 'Home' })
				break

			case 'pages.Home Variant 2':
				navigation.navigate('Drawer', { screen: 'HomeScreenTwo' })
				break

			case 'pages.Category Variant 1':
				navigation.navigate('Drawer', { screen: 'CategoryScreen' })
				break

			case 'pages.Category Variant 2':
				navigation.navigate('Drawer', { screen: 'CategoryTwo' })
				break

			case 'pages.My Bag Variant 1':
				navigation.navigate('Drawer', { screen: 'AddToCartTwo' })
				break

			case 'pages.My Bag Variant 2':
				navigation.navigate('Drawer', { screen: 'AddToCartTwo' })
				break

			case 'pages.My Product Variant 1':
				navigation.navigate('Drawer', { screen: 'ProductDetailTwo' })
				break

			case 'pages.My Product Variant 2':
				navigation.navigate('Drawer', { screen: 'ProductDetailTwo' })
				break

			case 'pages.My Product Variant 3':
				navigation.navigate('Drawer', { screen: 'ProductDetailThree' })
				break

			case 'pages.pagelist':
				navigation.navigate('Drawer', { screen: 'PageListScreen' })
				break

			default:
				break
		}
	}

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={styles.containerStyle}
			>
				<Image style={styles.logoPng} source={images.logo} />
			</LinearGradient>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyle}
				style={{ backgroundColor: appColors.lightScreenBg, height: '100%' }}
			>
				<SectionList
					sections={DATA}
					keyExtractor={(item, index) => item + index}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => handleItemPress(item)}
							style={styles.item}
						>
							<Text style={[styles.title]}>- {t(item)}</Text>
						</TouchableOpacity>
					)}
					renderSectionHeader={({ section: { title, icon } }) => (
						<View
							style={[
								external.fd_row,
								external.ai_center,
								external.mh_20,
								external.mt_20,
							]}
						>
							{icon}
							<Text style={[styles.header, { color: textColorStyle }]}>
								{t(title)}
							</Text>
						</View>
					)}
				/>
			</LinearGradient>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: StatusBar.currentHeight,
		marginHorizontal: 16,
	},
	item: {
		marginVertical: 8,
		...external.ph_20,
	},
	header: {
		...commonStyles.titleText19,
		top: windowHeight(1.5),
		paddingHorizontal: windowHeight(5),
	},
	title: {
		...commonStyles.subtitleText,
		...external.ph_20,
	},
	containerStyle: {
		width: windowWidth(300),
		height: windowHeight(90),
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoPng: {
		height: 100,
		width: 100,
		resizeMode: 'contain',
	},
})
