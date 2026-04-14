import { useValues } from '@/app/login'
import appColors from '@src/themes/appColors'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface BottomContainerProps {
	value?: React.ReactNode
	leftValue?: React.ReactNode
	onPress?: () => void
}

export function BottomContainer({
	value,
	leftValue,
	onPress,
}: BottomContainerProps) {
	const { isDark, linearColorStyle } = useValues()
	const colors: [string, string, ...string[]] = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]

	return (
		<>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[styles.container]}
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
					<TouchableOpacity onPress={onPress}>
						<View>{leftValue}</View>
					</TouchableOpacity>
					<View style={styles.valueContainer}>{value}</View>
				</LinearGradient>
			</LinearGradient>
		</>
	)
}
