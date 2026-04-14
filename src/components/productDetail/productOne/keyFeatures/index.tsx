import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import { Right } from '@src/utils/icon'
import React from 'react'
import { Text, View } from 'react-native'
import { keyFeature } from '../../../../data/productDetailBrand'

export function KeyFeatures() {
	const { textColorStyle, t, viewRTLStyle, textRTLStyle } = useValues()

	return (
		<View>
			<View>
				<Text
					style={[
						commonStyles.titleText19,
						external.mb_5,
						external.mt_15,
						{ fontSize: fontSizes.FONT17, color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					Key Features :
				</Text>
				{keyFeature.map((item, index) => (
					<View style={[external.fd_row, { flexDirection: viewRTLStyle }]}>
						<View style={[external.mt_3, external.mh_2]}>
							<Right />
						</View>
						<Text
							style={[
								commonStyles.subtitleText,
								external.Pb_5,
								{ color: textColorStyle, fontSize: fontSizes.FONT17 },
								{ textAlign: textRTLStyle },
							]}
						>
							{t(item.title)}
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}
