import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import { notificationData } from '../../../data/notificationData'
import styles from './style.css'

interface NotificationItem {
	id?: string
	icon?: JSX.Element | React.ReactNode
	title?: string
	subttile?: string
	time?: string
	isread?: number
}

interface NotificationData {
	id?: string
	title?: string
	data?: NotificationItem[]
	time?: string
}

export function NotificationLayout() {
	const {
		linearColorStyle,
		isDark,
		textColorStyle,
		imageContainer,
		viewRTLStyle,
		textRTLStyle,
	} = useValues()

	const colors: string[] = isDark
		? (['#3D3F45', '#45474B', '#2A2C32'] as const)
		: ([appColors.screenBg, appColors.screenBg] as const)

	const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
		<LinearGradient
			start={{ x: 0.0, y: 0.0 }}
			end={{ x: 0.0, y: 1.0 }}
			colors={colors}
			style={[
				styles.container,
				{ shadowColor: appColors.shadowColor, borderRadius: 6 },
				{ flexDirection: viewRTLStyle },
			]}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyle}
				style={[
					styles.menuItemContent,
					{ shadowColor: appColors.shadowColor },
					{ flexDirection: viewRTLStyle },
				]}
			>
				<View style={[styles.radiusView, { backgroundColor: imageContainer }]}>
					{item.icon}
				</View>
				<View style={[external.ph_10]}>
					<Text
						style={[
							commonStyles.subtitleText,
							{ color: textColorStyle, fontSize: fontSizes.FONT19 },
							{ textAlign: textRTLStyle },
						]}
					>
						{item.title || 'No Title'}
					</Text>
					<Text
						style={[
							styles.subtitleText,
							{
								color: item.isread === 0 ? textColorStyle : appColors.subtitle,
							},
							{ textAlign: textRTLStyle },
						]}
					>
						{item.subttile || 'No Subtitle'}
					</Text>
					<Text style={[styles.time, { textAlign: textRTLStyle }]}>
						{item.time || 'No Time'}
					</Text>
				</View>
			</LinearGradient>
		</LinearGradient>
	)

	return (
		<ScrollView>
			{notificationData.map((item: any, index: number) => {
				if (!item.data || item.data.length === 0) return null

				return (
					<View key={item.id || index}>
						<Text
							style={[
								commonStyles.subtitleText,
								external.pt_10,
								{ textAlign: textRTLStyle },
							]}
						>
							{item.time || 'No Time'}
						</Text>
						{item.data.map(
							(notificationItem: NotificationItem, subIndex: number) => (
								<React.Fragment key={notificationItem.id || subIndex}>
									{renderNotificationItem({ item: notificationItem })}
								</React.Fragment>
							),
						)}
					</View>
				)
			})}
		</ScrollView>
	)
}
