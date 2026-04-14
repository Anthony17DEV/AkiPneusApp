import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import {
	DashedBorderComponent,
	HeaderContainer,
	NavigationButton,
	SolidLine,
} from '@src/commonComponents'
import { OrderStepIndicator } from '@src/components'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, Text, View } from 'react-native'
import styles from './style.css'

export function OrderStatus() {
	const {
		bgFullStyle,
		textColorStyle,
		linearColorStyle,
		isDark,
		viewRTLStyle,
		t,
		textRTLStyle,
		currSymbol,
		currPrice,
	}: {
		bgFullStyle: string
		textColorStyle: string
		linearColorStyle: string[]
		isDark: boolean
		viewRTLStyle: string
		t: (key: string) => string
		textRTLStyle: string
		currSymbol: string
		currPrice: number
	} = useValues()
	const navigation = useNavigation()

	const colors: [string, string, ...string[]] = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]

	return (
		<View
			style={[
				commonStyles.commonContainer,
				external.ph_20,
				{ backgroundColor: bgFullStyle },
			]}
		>
			<HeaderContainer value={t('transData.orderStatus')} />
			<View style={[external.as_center, external.mt_20]}>
				<Text style={styles.expectedDataStyle}>
					{t('transData.expectedDelivery')}
				</Text>
				<Text style={[styles.expectedData, { color: textColorStyle }]}>
					{t('transData.expectedData')}
				</Text>
			</View>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[
					styles.whiteContainer,
					{ shadowColor: appColors.shadowColor, borderradius: 6 },
				]}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[
						styles.menuItemContent,
						{ shadowColor: appColors.shadowColor },
					]}
				>
					<View
						style={[styles.trackOrderView, { flexDirection: viewRTLStyle }]}
					>
						<Text style={[commonStyles.titleText19, { color: textColorStyle }]}>
							{t('transData.trackOrder')}
						</Text>
						<Text
							style={[
								commonStyles.subtitleText,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{'Order ID : #4563213'}
						</Text>
					</View>
					<SolidLine />
					<View
						style={[
							external.fd_row,
							external.ai_center,
							{ flexDirection: viewRTLStyle },
						]}
					>
						<View
							style={[
								styles.imgView,
								{ backgroundColor: isDark ? '#1A1C22' : '#F3F5FB' },
							]}
						>
							<Image style={styles.img} source={images.productImageTwo} />
						</View>
						<View>
							<Text
								style={[
									commonStyles.titleText19,
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
							>
								{t('transData.beatssolo')}
							</Text>
							<Text
								style={[commonStyles.subtitleText, { textAlign: textRTLStyle }]}
							>
								{t('transData.colorBlue')}
							</Text>
							<Text
								style={[
									styles.text,
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
							>
								{currSymbol}
								{(currPrice * 456.23).toFixed(2)}
							</Text>
						</View>
					</View>
					<DashedBorderComponent />
					<OrderStepIndicator />
				</LinearGradient>
			</LinearGradient>
			<View style={[external.mt_25]}>
				<NavigationButton
					backgroundColor={appColors.primary}
					title={'Back to Home'}
					color={appColors.screenBg}
					onPress={() => navigation.navigate('Drawer')}
				/>
			</View>
		</View>
	)
}
