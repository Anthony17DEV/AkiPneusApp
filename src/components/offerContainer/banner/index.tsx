import { useValues } from '@/app/login'
import React from 'react'
import { ImageBackground, Text, View } from 'react-native'
import { bdt } from '../../../constant'
import images from '../../../utils/images'
import { styles } from './style.css'

export function WatchBand() {
	const { t } = useValues()
	return (
		<View>
			<ImageBackground
				resizeMode="stretch"
				style={styles.container}
				source={images.watchBand}
			>
				<Text style={styles.title}>
					{t('transData.miSmart')}
					<Text style={styles.subtitle}>{bdt}</Text>
				</Text>
				<Text style={styles.description}>{t('transData.amoledDisplay')}</Text>
				<Text style={styles.actionText}>{t('transData.showNow')}</Text>
			</ImageBackground>
		</View>
	)
}
