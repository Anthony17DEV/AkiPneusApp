import { useValues } from '@/app/login'
import { SolidLine } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import React from 'react'
import { Text, View } from 'react-native'
import { ProductDetailTwoData } from '../../../../data/productDetailTwoData'
import styles from './style.css'

export function DescText() {
	const { textColorStyle } = useValues()
	return (
		<View>
			<Text style={[commonStyles.titleText19, { color: textColorStyle }]}>
				Beats solo3 Bluetooth Headset | Blue
			</Text>
			<Text style={[commonStyles.subtitleText]}>
				16 Hours playback, On ear headphones
			</Text>
			<View
				style={[
					external.fd_row,
					external.ai_center,
					external.js_space,
					external.mt_10,
				]}
			>
				<View style={[external.fd_row, { alignItems: 'baseline' }]}>
					<Text style={[styles.priceContainer, { color: textColorStyle }]}>
						$456.23
					</Text>
					<Text style={[styles.priceText, external.ph_5]}>$556.45</Text>
				</View>
				<View style={styles.percentageOff}>
					<Text
						style={[
							commonStyles.titleText19,
							{
								color: appColors.red,
								fontSize: fontSizes.FONT17,
								paddingTop: windowHeight(3),
							},
						]}
					>
						10% off
					</Text>
				</View>
			</View>
			<SolidLine marginVertical={windowHeight(15)} />
			<View style={[external.fd_row, external.ai_center, external.js_space]}>
				{ProductDetailTwoData.map((item, index) => (
					<View>
						<View style={[external.ai_center]}>{item.icon}</View>
						<Text
							style={[
								commonStyles.subtitleText,
								external.ti_center,
								{ width: windowWidth(91), color: textColorStyle },
							]}
						>
							{item.title}
						</Text>
					</View>
				))}
			</View>
			<SolidLine marginVertical={windowHeight(15)} />
			<View>
				<Text
					style={[
						commonStyles.titleText19,
						{ fontSize: fontSizes.FONT17 },
						{ color: textColorStyle },
					]}
				>
					- Details
				</Text>
				<Text
					style={[
						commonStyles.subtitleText,
						external.pt_5,
						{ color: textColorStyle, fontSize: fontSizes.FONT18 },
					]}
				>
					Zebronics soloheadphones are made to be an upgrade from the white ear
					buds that come with your device. More durability, better sound, and a
					chance to do real justice to your music. If you have an Apple device
					and demand excellent quality...Read more
				</Text>
			</View>
		</View>
	)
}
