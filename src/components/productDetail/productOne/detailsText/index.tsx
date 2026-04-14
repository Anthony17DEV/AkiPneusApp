import { useValues } from '@/app/login'
import { external } from '@src/style/external.css'
import React from 'react'
import { Text, View } from 'react-native'
import styles from './styles.css'

export function DetailsTextContainer() {
	const { textColorStyle, viewRTLStyle, currSymbol, currPrice } = useValues()

	return (
		<View>
			<View style={[styles.viewStyle, { flexDirection: viewRTLStyle }]}>
				<View
					style={[
						external.fd_row,
						{ alignItems: 'baseline' },
						{ flexDirection: viewRTLStyle },
					]}
				>
					<Text style={[styles.priceContainer, { color: textColorStyle }]}>
						{currSymbol}
						{(currPrice * 456.23).toFixed(2)}
					</Text>
					<Text style={[styles.priceText, external.ph_5]}>
						{currSymbol}
						{(currPrice * 556.45).toFixed(2)}
					</Text>
				</View>
				<View style={styles.percentageOff}>
					<Text style={styles.textStyle}>10% off</Text>
				</View>
			</View>
		</View>
	)
}
