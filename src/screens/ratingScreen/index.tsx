import { useValues } from '@/app/login'
import { CustomRatingBars, HeaderContainer } from '@src/commonComponents'
import { RatingScreenContainer } from '@src/components'
import {
	allReview,
	basedReviews,
	otherReviews,
	reviews,
	writeYourReview,
} from '@src/constant'
import { ratingScreen } from '@src/data'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { DownArrow } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ScrollView, Text, View } from 'react-native'
import styles from './style.css'

export function RatingScreen() {
	const {
		bgFullStyle,
		textColorStyle,
		linearColorStyle,
		linearColorStyleTwo,
		iconColorStyle,
	}: {
		bgFullStyle: string
		textColorStyle: string
		linearColorStyle: string | any
		linearColorStyleTwo: string | any
		iconColorStyle: string
	} = useValues()

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={[external.mh_20]}
				contentContainerStyle={[external.Pb_30]}
			>
				<HeaderContainer value={reviews} />
				<View style={[external.mt_12, external.as_center]}>
					<Text style={[styles.textContext, { color: textColorStyle }]}>
						4.0
					</Text>
					<CustomRatingBars />
					<Text style={[commonStyles.subtitleText, external.pt_10]}>
						{basedReviews}
					</Text>
				</View>
				<LinearGradient
					colors={linearColorStyleTwo}
					style={styles.ratingScreenView}
				>
					<LinearGradient
						colors={linearColorStyle}
						style={styles.ratingScreenView}
					>
						{ratingScreen.map((item, index) => (
							<View key={item.id || index} style={styles.mapView}>
								<Text style={[styles.titleText, { color: textColorStyle }]}>
									{item.title}
								</Text>
								<View style={[styles.progressBar]}>
									<View
										style={[styles.progressBarPrimary, { width: item.width }]}
									/>
								</View>
								<Text
									style={[
										commonStyles.subtitleText,
										external.mh_20,
										{ right: windowHeight(5) },
									]}
								>
									{item.range}
								</Text>
							</View>
						))}
					</LinearGradient>
				</LinearGradient>
				<Text style={styles.writeReview}>{writeYourReview}</Text>
				<View style={styles.viewText}>
					<Text
						style={[
							commonStyles.titleText19,
							{ fontSize: fontSizes.FONT21 },
							{ color: textColorStyle },
						]}
					>
						{otherReviews}
					</Text>
					<LinearGradient colors={linearColorStyle} style={styles.allReview}>
						<LinearGradient colors={linearColorStyle} style={styles.allReview}>
							<Text
								style={[
									commonStyles.titleText19,
									external.ph_8,
									{ color: textColorStyle },
								]}
							>
								{allReview}
							</Text>
							<DownArrow color={iconColorStyle} />
						</LinearGradient>
					</LinearGradient>
				</View>
				<RatingScreenContainer />
			</ScrollView>
		</View>
	)
}
