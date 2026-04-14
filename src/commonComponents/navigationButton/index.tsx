import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface NavigationButtonProps {
	title?: string
	onPress?: () => void
	gray?: boolean
	value?: React.ReactNode
	color?: string
	backgroundColor?: string
	borderWidth?: number
	borderColor?: string
}

export function NavigationButton({
	title,
	onPress,
	gray = false,
	value,
	color,
	backgroundColor,
	borderWidth,
	borderColor,
}: NavigationButtonProps) {
	const { isDark, linearColorStyleTwo, linearColorStyle } = useValues()
	return (
		<View>
			{isDark ? (
				<TouchableOpacity
					onPress={onPress}
					activeOpacity={0.7}
					style={[
						styles.linearGradient,
						{
							backgroundColor: backgroundColor,
							borderWidth: borderWidth,
							borderColor: borderColor,
						},
					]}
				>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 0.0, y: 1.0 }}
						colors={isDark ? linearColorStyleTwo : ['white', 'white']}
						style={[styles.cardContainer]}
					>
						<LinearGradient
							start={{ x: 0.0, y: 0.0 }}
							end={{ x: 0.0, y: 1.0 }}
							colors={linearColorStyle}
							style={[styles.menuItemContent]}
						>
							<View style={[gray ? styles.icon : null]}>
								{gray && (
									<View style={[external.mh_5, external.mt_2]}>{value}</View>
								)}
								<Text style={[commonStyles.titleText19, { color: color }]}>
									{title}
								</Text>
							</View>
						</LinearGradient>
					</LinearGradient>
				</TouchableOpacity>
			) : (
				<TouchableOpacity
					onPress={onPress}
					activeOpacity={0.7}
					style={[
						styles.linearGradient,
						{
							backgroundColor: backgroundColor,
							borderWidth: borderWidth,
							borderColor: borderColor,
						},
					]}
				>
					<View style={[gray ? styles.icon : null]}>
						{gray && (
							<View style={[external.mh_5, external.mt_2]}>{value}</View>
						)}
						<Text style={[commonStyles.titleText19, { color: color }]}>
							{title}
						</Text>
					</View>
				</TouchableOpacity>
			)}
		</View>
	)
}
