import { useValues } from '@/app/login'
import { HeaderContainer } from '@src/commonComponents'
import { orderHistoryData } from '@src/data'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, ImageSourcePropType, SafeAreaView, Text, View } from 'react-native'
import styles from './style.css'

export function OrderHistory() {
	const {
		isDark,
		textColorStyle,
		linearColorStyle,
		textRTLStyle,
		viewRTLStyle,
		t,
		currSymbol,
		currPrice,
		isRTL,
	} = useValues()

	const colors: [string, string] = isDark
		? ['#808184', '#2E3036']
		: [appColors.screenBg, appColors.screenBg]

	const renderItem = (item: {
		img: ImageSourcePropType
		title: string
		price: number
	}) => (
		<LinearGradient
			start={{ x: 0.0, y: 0.0 }}
			end={{ x: 1.0, y: 1.0 }}
			colors={colors}
			style={[
				{
					flexDirection: viewRTLStyle,
					top: windowHeight(10),
					marginVertical: windowHeight(6),
				},
			]}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyle}
				style={[styles.menuItemContent, { flexDirection: viewRTLStyle }]}
			>
				<View
					style={[
						styles.grayBoxContainer,
						{
							backgroundColor: isDark ? appColors.blackBg : appColors.bgLayout,
						},
					]}
				>
					<Image style={styles.img} source={item.img} />
				</View>
				<View style={[external.mh_8]}>
					<View
						style={[
							external.fd_row,
							external.ai_center,
							{ flexDirection: viewRTLStyle },
						]}
					>
						<Text
							numberOfLines={1}
							style={[
								styles.titleContainer,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t(item.title)}
						</Text>
						<Text
							style={[
								commonStyles.H1Banner,
								{ color: textColorStyle },
								{ fontFamily: 'semiBold' },
							]}
						>
							{currSymbol}
							{(currPrice * item.price).toFixed(2)}
						</Text>
					</View>
					<Text
						style={[commonStyles.subtitleText, { textAlign: textRTLStyle }]}
					>
						{t('transData.colorBlue')}
					</Text>
					<View
						style={[
							external.fd_row,
							external.ai_center,
							{ flexDirection: viewRTLStyle },
						]}
					>
						<Text
							style={[
								styles.deliveryContainer,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t('transData.deliverd')}
						</Text>
						<View
							style={[
								styles.orderContainer,
								{ borderTopEndRadius: isRTL ? windowHeight(9) : undefined },
							]}
						>
							<Text style={styles.buyAgain}>{t('transData.buyAgain')}</Text>
						</View>
					</View>
				</View>
			</LinearGradient>
		</LinearGradient>
	)

	return (
		<SafeAreaView style={[commonStyles.commonContainer, external.ph_20]}>
			<HeaderContainer value={t('transData.orderHistory')} />
			<View>
				{orderHistoryData && orderHistoryData.length > 0 ? (
					orderHistoryData.map((item, index) => {
						return <View key={index}>{renderItem(item)}</View>
					})
				) : (
					<Text
						style={[
							commonStyles.subtitleText,
							{ textAlign: 'center', color: textColorStyle },
						]}
					>
						{t('transData.noOrderHistory')}
					</Text>
				)}
			</View>
		</SafeAreaView>
	)
}
