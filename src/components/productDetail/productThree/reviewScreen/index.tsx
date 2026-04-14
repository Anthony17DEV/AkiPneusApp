import { useValues } from '@/app/login'
import { external } from '@src/style/external.css'
import React from 'react'
import { Text, View } from 'react-native'
import { ratingScreen } from '../../../../data/ratingScreen'
import styles from './styles.css'

export function ReviewScreen() {
	const { textColorStyle, t } = useValues()

	return (
		<View style={[external.pv_5]}>
			{ratingScreen.map((item, index) => (
				<View
					style={[
						external.fd_row,
						external.ai_center,
						external.mh_20,
						external.pt_10,
					]}
					key={index}
				>
					<Text style={[styles.titleText, { color: textColorStyle }]}>
						{t(item.title)}
					</Text>
					<View style={[styles.progressBar]}>
						<View style={[styles.progressBarPrimary, { width: item.width }]} />
					</View>
				</View>
			))}
		</View>
	)
}
