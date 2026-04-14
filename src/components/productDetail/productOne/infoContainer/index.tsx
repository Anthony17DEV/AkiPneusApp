import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import React from 'react'
import { Text, View } from 'react-native'

export function InfoContainer() {
	const { textColorStyle, t } = useValues()

	return (
		<View>
			<View style={[external.mt_15]}>
				<Text
					style={[
						commonStyles.titleText19,
						{ fontSize: fontSizes.FONT17 },
						{ color: textColorStyle },
					]}
				>
					Details :
				</Text>
				<Text
					style={[
						commonStyles.subtitleText,
						external.pt_5,
						{ color: textColorStyle },
					]}
				>
					{t('transData.zebronicText')}
				</Text>
			</View>
		</View>
	)
}
