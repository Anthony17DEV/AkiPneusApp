import { useValues } from '@/app/login'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import React, { useState } from 'react'
import { ImageBackground, Text, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { carouselData } from '../../../data/homeScreenTwo/carouselData'
import styles from './styles'

export function CarouselContainer() {
	const { t } = useValues()
	const [currentPage, setCurrentPage] = useState(0)

	const onPageSelected = (event: any) => {
		setCurrentPage(event.nativeEvent.position)
	}

	return (
		<View style={styles.carouselContainer}>
			<View style={styles.pagination}>
				{carouselData.map((_, index) => (
					<View
						key={index}
						style={[styles.dot, currentPage === index && styles.activeDot]}
					/>
				))}
			</View>
			<PagerView
				style={styles.pagerView}
				initialPage={0}
				onPageSelected={onPageSelected}
			>
				{carouselData.map((item, index) => (
					<View key={index} style={styles.pageContainer}>
						<ImageBackground
							resizeMode="stretch"
							style={styles.imageBackground}
							source={item.img}
						>
							<Text
								style={[
									commonStyles.subtitleText,
									external.mt_40,
									styles.mh_20,
								]}
							>
								{t(item.title)}
							</Text>
							<Text style={[commonStyles.H1Banner, styles.mh_20]}>
								{t(item.subtitle)}
							</Text>
							<Text style={[styles.mh_20, external.mt_10, styles.shopNow]}>
								{t(item.shopNow)}
							</Text>
						</ImageBackground>
					</View>
				))}
			</PagerView>
		</View>
	)
}
