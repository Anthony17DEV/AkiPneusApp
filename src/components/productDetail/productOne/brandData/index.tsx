import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes } from '@src/themes/appConstant'
import React from 'react'
import { Text, View } from 'react-native'
import { brandData } from '../../../../data/productDetailBrand'

export function BrandData() {
	const { textColorStyle, viewRTLStyle, textRTLStyle, isRTL } = useValues()

	return (
		<View>
			<View style={[external.mt_10]}>
				{brandData.map((item, index) => (
					<View
						style={[
							external.fd_row,
							external.mt_5,
							{ flexDirection: viewRTLStyle },
						]}
					>
						<Text
							style={[
								commonStyles.subtitleText,
								{ width: isRTL ? null : '35%' },
								{ textAlign: textRTLStyle },
							]}
						>
							{item.title}
						</Text>
						<View style={[external.fd_row, { flexDirection: viewRTLStyle }]}>
							<Text
								style={[
									commonStyles.titleText19,
									external.ph_10,
									{ color: appColors.subtitle, fontSize: fontSizes.FONT17 },
									{ textAlign: textRTLStyle },
								]}
							>
								:
							</Text>
							<Text
								style={[
									commonStyles.subtitleText,
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
							>
								{item.subttile}
							</Text>
						</View>
					</View>
				))}
			</View>
		</View>
	)
}
