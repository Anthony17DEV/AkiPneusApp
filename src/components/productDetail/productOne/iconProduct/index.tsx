import { useValues } from '@/app/login'
import { IconBackground } from '@src/commonComponents'
import appColors from '@src/themes/appColors'
import { Bus, Refresh } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, View } from 'react-native'
import styles from './style.css'

export function IconProduct() {
	const { textColorStyle, linearColorStyle, isDark } = useValues()
	const colors = isDark
		? (['#3D3F45', '#45474B', '#2A2C32'] as const)
		: ([appColors.screenBg, appColors.screenBg] as const)

	return (
		<LinearGradient
			start={{ x: 0.0, y: 0.0 }}
			end={{ x: 0.0, y: 1.0 }}
			colors={colors}
			style={[
				styles.refreshIcon,
				{ shadowColor: appColors.shadowColor, borderRadius: 6 },
			]}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyle}
				style={[styles.menuItemContent, { shadowColor: appColors.shadowColor }]}
			>
				<IconBackground value={<Refresh />} />
				<Text style={[styles.upTofive, { color: textColorStyle }]}>
					Up to 7 days returnable
				</Text>
				<View style={styles.verticalLine} />
				<IconBackground value={<Bus />} />
				<Text style={[styles.deliveryIn, { color: textColorStyle }]}>
					Delivery in 3 days
				</Text>
			</LinearGradient>
		</LinearGradient>
	)
}
