import { useValues } from '@/app/login'
import { IconBackground } from '@src/commonComponents'
import { Bus, Refresh } from '@src/utils/icon'
import React from 'react'
import { Text, View } from 'react-native'
import styles from './style.css'

export function IconContainer() {
	const { isDark, textColorStyle } = useValues()
	return (
		<View
			style={[
				styles.refreshIcon,
				{ backgroundColor: isDark ? '#24272d' : '#EEF0F3' },
			]}
		>
			<IconBackground value={<Refresh />} backgroundColor={'#EEF0F3'} />
			<Text style={[styles.upTofive, { color: textColorStyle }]}>
				Up to 7 days returnable
			</Text>
			<View style={styles.verticalLine} />
			<IconBackground value={<Bus />} backgroundColor={'#EEF0F3'} />
			<Text style={[styles.deliveryIn, { color: textColorStyle }]}>
				Delivery in 3 days
			</Text>
		</View>
	)
}
