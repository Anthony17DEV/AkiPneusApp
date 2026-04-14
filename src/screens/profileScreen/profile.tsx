import { useValues } from '@/app/login'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RightArrow } from '@src/assets/icons/rightArrow'
import { profileData } from '@src/data/profileData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import {
	Image,
	Pressable,
	ScrollView,
	Text,
	View
} from 'react-native'
import styles from './style.css'

export function ProfileScreen({ navigation }: any) {
	useEffect(() => {
		const backAction = () => {
			navigation.navigate('HomeScreen')
			return true
		}
	}, [navigation])

	const handleLogout = async () => {
		try {
			await AsyncStorage.removeItem('userToken')
			navigation.navigate('SignIn')
		} catch (error) {
			console.error('Error logging out:', error)
		}
	}

	const {
		textColorStyle,
		linearColorStyle,
		bgFullStyle,
		isDark,
		viewRTLStyle,
		textRTLStyle,
		imageRTLStyle,
		t,
	} = useValues()

	const colors: any = isDark
		? ['#43454A', '#24262C']
		: [appColors.screenBg, appColors.screenBg]

	return (
		<View style={[styles.viewContainer, { backgroundColor: bgFullStyle }]}>
			<Text
				style={[
					external.ti_center,
					commonStyles.hederH2,
					{ color: textColorStyle },
				]}
			>
				{t('transData.myProfile')}
			</Text>
			<View style={[external.as_center]}>
				<View
					style={[
						styles.grayBorder,
						{ borderColor: isDark ? '#202439' : '#EBEEFD' },
					]}
				>
					<View>
						<Image style={styles.imgStyle} source={images.user} />
					</View>
				</View>
				<Text style={[styles.nameText, { color: textColorStyle }]}>
					{t('transData.smithaWilliams')}
				</Text>
				<Text style={[commonStyles.subtitleText, external.ti_center]}>
					{t('transData.smithaWilliamsMail')}
				</Text>
			</View>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={[external.mt_10]}>
					{profileData.map((item, index) => (
						<Pressable
							key={index}
							onPress={() => {
								if (item.id === 6) {
									handleLogout()
								} else {
									navigation.navigate(item.screenName)
								}
							}}
						>
							<LinearGradient
								start={{ x: 0.0, y: 0.0 }}
								end={{ x: 0.0, y: 1.0 }}
								colors={colors}
								style={styles.container}
							>
								<LinearGradient
									start={{ x: 0.0, y: 0.0 }}
									end={{ x: 0.0, y: 1.0 }}
									colors={linearColorStyle}
									style={styles.menuItemContent}
								>
									<View
										style={[
											external.fd_row,
											external.ai_center,
											{ flexDirection: viewRTLStyle },
										]}
									>
										{item.icon}
										<View style={{ width: '86%' }}>
											<Text
												style={[
													styles.titleText,
													{ color: textColorStyle },
													{ textAlign: textRTLStyle },
												]}
											>
												{t(item.title)}
											</Text>
										</View>
										<View style={{ transform: [{ scale: imageRTLStyle }] }}>
											<RightArrow />
										</View>
									</View>
								</LinearGradient>
							</LinearGradient>
						</Pressable>
					))}
				</View>
			</ScrollView>
		</View>
	)
}
