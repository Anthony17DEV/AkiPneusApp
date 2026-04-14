import { useValues } from '@/app/login'
import { HeadingCategory } from '@src/commonComponents'
import { grabToday } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import { LeftSideArrow } from '@src/utils/icon'
import images from '@src/utils/images'
import React from 'react'
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import { TrendingAnimation } from '../trendignAnimation'
import { styles } from './style.css'

export function TrendingOffer() {
	const { t } = useValues()
	return (
		<View style={[external.mt_20]}>
			<HeadingCategory value={t('transData.trendigOffers')} />
			<ImageBackground
				resizeMode="stretch"
				style={styles.imageBackground}
				source={images.sliderBg}
			>
				<Text style={[styles.text, external.ph_20]}>
					20 % off <Text style={styles.subText}>in Headphones & Airpods</Text>
				</Text>
				<Text style={[styles.subTitleText, external.ph_20]}>{grabToday}</Text>
				<TouchableOpacity style={[styles.shopButton]}>
					<Text
						style={[
							commonStyles.titleText19,
							external.ph_5,
							{ fontSize: fontSizes.FONT16 },
						]}
					>
						{t('transData.showNow')}
					</Text>
					<LeftSideArrow />
				</TouchableOpacity>
			</ImageBackground>
			<TrendingAnimation />
		</View>
	)
}
