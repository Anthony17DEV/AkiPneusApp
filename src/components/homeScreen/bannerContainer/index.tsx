import { useValues } from '@/app/login'
import { Apple } from '@src/assets/icons/apple'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import React from 'react'
import { ImageBackground, Text, View } from 'react-native'
import { watch } from '../../../constant'
import images from '../../../utils/images'
import styles from './style.css'

export function BannerContainer() {
	const { t } = useValues()
	return (
		<View style={[external.mt_20, external.mh_20]}>
			<ImageBackground
				resizeMode="cover"
				style={styles.imgStyle}
				source={images.homeBannerOne}
			>
				<View style={styles.viewContainer}>
					<Apple colors={appColors.screenBg} width={windowHeight(20)} />
					<Text style={[commonStyles.H1Banner, external.mh_5, external.mt_3]}>
						{watch}
					</Text>
				</View>
				<Text style={styles.activeText}> {t('transData.activeStyle')}</Text>
				<Text style={styles.seriesText}>{t('transData.series')}</Text>
				<Text style={styles.fullScreenText}>{t('transData.fullScreen')}</Text>
			</ImageBackground>
		</View>
	)
}
