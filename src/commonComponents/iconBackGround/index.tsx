import { useValues } from '@/app/login'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import styles from './style.css'

interface IconBackgroundProps {
	onPress?: () => void
	value?: React.ReactNode
	height?: number
	backgroundColor?: string
	borderradius?: string | number
}

export function IconBackground({
	onPress,
	value,
	height,
	backgroundColor,
}: IconBackgroundProps) {
	const { linearColorStyle, linearColorStyleTwo } = useValues()

	return (
		<TouchableOpacity
			activeOpacity={0.7}
			onPress={onPress}
			style={[{ height: height || windowHeight(30) }]}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyleTwo}
				style={[styles.container]}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={styles.menuItemContent}
				>
					{value}
				</LinearGradient>
			</LinearGradient>
		</TouchableOpacity>
	)
}
