import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { Location } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface LocationContainerProps {
	backgroundColor?: string
	locationBg?: string
	value?: React.ReactNode
	borderRadius?: number
	navigation?: {
		navigate: (screen: string) => void
	}
	borderColor?: string
}

export function LocationContainer({
	backgroundColor,
	locationBg,
	value,
	borderRadius,
}: LocationContainerProps) {
	const {
		linearColorStyle,
		isDark,
		t,
		textColorStyle,
		viewRTLStyle,
		textRTLStyle,
	} = useValues()
	const colors: [string, string, ...string[]] = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]

	const navigation = useNavigation<any>()

	return (
		<>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[styles.container, { backgroundColor }]}
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
					<View
						style={[
							styles.locationIcon,
							{ backgroundColor: locationBg },
							{ borderRadius },
						]}
					>
						<Location />
					</View>
					<View style={[external.mh_8, external.fg_1]}>
						<Text
							style={[commonStyles.subtitleText, { textAlign: textRTLStyle }]}
						>
							{t('transData.yourDeliveryAddress')}
						</Text>
						<Text
							style={[
								commonStyles.titleText19,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t('transData.jodgeHawaii')}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => navigation.navigate('ChangeAddressScreen')}
						style={[external.ai_center]}
					>
						{value}
					</TouchableOpacity>
				</LinearGradient>
			</LinearGradient>
		</>
	)
}
