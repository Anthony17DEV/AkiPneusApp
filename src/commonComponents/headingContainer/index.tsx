import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { BackLeft } from '@src/utils/icon'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { IconBackground } from '../iconBackGround'

interface HeaderContainerProps {
	value?: string
	show?: boolean
	icon?: string | React.ReactNode
	iconTwo?: string | React.ReactNode
	onPress?: () => void
}

export function HeaderContainer({
	value,
	show,
	icon,
	iconTwo,
	onPress,
}: HeaderContainerProps) {
	const navigation = useNavigation()
	const { viewRTLStyle, textColorStyle, imageRTLStyle } = useValues()

	return (
		<View
			style={[
				external.fd_row,
				external.ai_center,
				external.pt_15,
				{ justifyContent: show ? 'space-between' : undefined },
				{ flexDirection: viewRTLStyle },
			]}
		>
			<TouchableOpacity
				onPress={() => navigation.goBack()}
				style={[external.fg_half, { flexDirection: viewRTLStyle }]}
			>
				<View style={{ transform: [{ scale: imageRTLStyle }] }}>
					<BackLeft />
				</View>
			</TouchableOpacity>
			<Text
				style={[
					commonStyles.hederH2,
					external.as_center,
					{ color: textColorStyle },
				]}
			>
				{value}
			</Text>
			{show && (
				<View style={[external.fd_row]}>
					<View style={[external.mh_8]}>
						<IconBackground value={icon} />
					</View>
					<IconBackground value={iconTwo} />
				</View>
			)}
		</View>
	)
}
