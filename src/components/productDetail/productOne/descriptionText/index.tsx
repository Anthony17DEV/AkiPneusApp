import { useValues } from '@/app/login'
import { IconBackground } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes } from '@src/themes/appConstant'
import { Battery, Ble, Minus, Plus, Wifi } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, View } from 'react-native'
import styles from './styles.css'

export function DescriptionText() {
	const {
		viewRTLStyle,
		linearColorStyleTwo,
		iconColorStyle,
		textColorStyle,
		linearColorStyle,
	}: {
		viewRTLStyle: string | any
		linearColorStyleTwo: string[]
		iconColorStyle: string
		textColorStyle: string
		linearColorStyle: string[]
	} = useValues()

	return (
		<View>
			<View
				style={[
					external.fd_row,
					external.js_space,
					external.mt_16,
					{ flexDirection: viewRTLStyle },
				]}
			>
				<View
					style={[
						external.fd_row,
						external.js_space,
						external.ai_center,
						{ flexDirection: viewRTLStyle },
					]}
				>
					<IconBackground
						backgroundColor={appColors.bgLayer}
						value={<Battery />}
					/>
					<View style={[external.mh_20]}>
						<IconBackground
							backgroundColor={appColors.bgLayer}
							value={<Wifi />}
						/>
					</View>
					<IconBackground backgroundColor={appColors.bgLayer} value={<Ble />} />
				</View>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					style={styles.cardContainer}
					colors={linearColorStyleTwo}
				>
					<LinearGradient
						colors={linearColorStyle}
						style={[
							styles.menuItemContent,
							{ backgroundColor: linearColorStyleTwo },
						]}
					>
						<Minus color={iconColorStyle} />
						<Text
							style={[
								commonStyles.subtitleText,
								{ color: textColorStyle, fontSize: fontSizes.FONT21 },
							]}
						>
							1
						</Text>
						<Plus color={iconColorStyle} />
					</LinearGradient>
				</LinearGradient>
			</View>
		</View>
	)
}
