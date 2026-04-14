import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import React from 'react'
import { Text, View } from 'react-native'

interface JsSpaceContainerProps {
	title: string
	price: string
	color?: string
}

export function JsSpaceContainer({
	title,
	price,
	color,
}: JsSpaceContainerProps) {
	const { textColorStyle, viewRTLStyle } = useValues()

	return (
		<View
			style={[
				external.fd_row,
				external.ai_center,
				external.js_space,
				external.ph_10,
				{ flexDirection: viewRTLStyle },
			]}
		>
			<View>
				<Text style={[commonStyles.subtitleText]}>{title}</Text>
			</View>
			<View>
				<Text
					style={[commonStyles.titleText19, { color: color || textColorStyle }]}
				>
					{price}
				</Text>
			</View>
		</View>
	)
}
