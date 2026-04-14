import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import { Right } from '@src/utils/icon'
import React from 'react'
import { Text, View } from 'react-native'
import { keyFeature } from '../../../../data/productDetailBrand'

export function KeyFeatureContainer() {
	const { textColorStyle } = useValues()
	return (
		<View>
			<Text
				style={[
					commonStyles.titleText19,
					external.mb_5,
					external.mt_15,
					external.mh_20,
					{ fontSize: fontSizes.FONT17, color: textColorStyle },
				]}
			>
				- Key Features
			</Text>
			{keyFeature.map((item, index) => (
				<View style={[external.fd_row, external.mh_20]} key={item.id}>
					<View style={[external.mt_3]}>
						<Right />
					</View>
					<Text
						style={[
							commonStyles.subtitleText,
							external.Pb_5,
							{ color: textColorStyle, fontSize: fontSizes.FONT17 },
						]}
					>
						{item.title}
					</Text>
				</View>
			))}
		</View>
	)
}
