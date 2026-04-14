import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { IconBackground } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Notification } from '@src/utils/icon'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function HeaderContainer() {
	const { textColorStyle, viewRTLStyle, t } = useValues()
	const navigation = useNavigation<any>()
	return (
		<View>
			<View
				style={[
					external.fd_row,
					external.ai_center,
					{ flexDirection: viewRTLStyle },
				]}
			>
				<Text
					style={[
						commonStyles.titleText19,
						external.ti_center,
						external.fg_1,
						{
							color: textColorStyle,
							fontSize: fontSizes.FONT21,
							marginLeft: windowHeight(30),
						},
					]}
				>
					{t('transData.categories')}
				</Text>
				<TouchableOpacity>
					<IconBackground
						onPress={() => navigation.navigate('NotificationScreen')}
						value={<Notification />}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}
