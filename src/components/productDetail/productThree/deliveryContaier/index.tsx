import { useValues } from '@/app/login'
import { IconBackground } from '@src/commonComponents'
import appColors from '@src/themes/appColors'
import { Bus, Refresh } from '@src/utils/icon'
import React from 'react'
import { Text, View } from 'react-native'
import styles from './styles.css'

export function DeliverContainer() {
	const { textColorStyle } = useValues()
	return (
		<View>
			<View style={styles.refreshIcon}>
				<IconBackground
					value={<Refresh />}
					backgroundColor={appColors.screenBg}
				/>
				<Text style={[styles.upTofive, { color: textColorStyle }]}>
					Up to 7 days returnable
				</Text>
				<View style={styles.verticalLine} />
				<IconBackground value={<Bus />} backgroundColor={appColors.screenBg} />
				<Text style={[styles.deliveryIn, { color: textColorStyle }]}>
					Delivery in 3 days
				</Text>
			</View>
		</View>
	)
}
