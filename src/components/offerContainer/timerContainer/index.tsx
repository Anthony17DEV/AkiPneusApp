import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import React from 'react'
import { Text, View } from 'react-native'
import { ClockTimer } from '../clock'
import styles from './style.css'

export function TimerContainer() {
	const { t, viewRTLStyle } = useValues()
	return (
		<View style={[styles.container, { flexDirection: viewRTLStyle }]}>
			<Text style={styles.buyText}>{t('transData.buyAnyone')}</Text>
			<View style={[external.fd_row, external.ai_center]}>
				<ClockTimer price={12} />
				<Text
					style={[
						commonStyles.titleText19,
						external.mh_5,
						{ fontSize: fontSizes.FONT30 },
					]}
				>
					:
				</Text>
				<ClockTimer price={5} />
				<Text
					style={[
						commonStyles.titleText19,
						external.mh_5,
						{ fontSize: fontSizes.FONT30 },
					]}
				>
					:
				</Text>
				<ClockTimer price={40} />
			</View>
		</View>
	)
}
