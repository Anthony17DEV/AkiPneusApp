import { useValues } from '@/app/login'
import { Cart } from '@src/assets/icons/cart'
import { BottomContainer, HeadingCategory } from '@src/commonComponents'
import {
	BrandData,
	DescriptionText,
	DetailsTextContainer,
	IconProduct,
	InfoContainer,
	KeyFeatures,
	NewArrivalBigContainer,
	RatingScreen,
	SliderDetails,
} from '@src/components'
import { addtoBag, buyNow, writeYourReview } from '@src/constant'
import { newArrivalBigData } from '@src/data/homeScreenTwo'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowWidth } from '@src/themes/appConstant'
import { Plus } from '@src/utils/icon'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface ProductDetailOneProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function ProductDetailOne({ navigation }: ProductDetailOneProps) {
	const { bgFullStyle, textColorStyle, t, textRTLStyle, iconColorStyle } =
		useValues()
	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[external.Pb_80]}
				style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
			>
				<View>
					<SliderDetails />
					<View style={[external.mh_20]}>
						<Text
							style={[
								commonStyles.titleText19,
								external.mt_8,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t('transData.Beatssolo3')}
						</Text>
						<Text
							style={[commonStyles.subtitleText, { textAlign: textRTLStyle }]}
						>
							{t('transData.headphones')}
						</Text>
						<DetailsTextContainer />
						<DescriptionText />
						<InfoContainer />
						<BrandData />
						<IconProduct />
						<KeyFeatures />
					</View>
				</View>
				<RatingScreen />
				<Text style={styles.writeYourReview}>{writeYourReview}</Text>
				<View style={[external.mh_20, external.mt_20]}>
					<HeadingCategory
						value={'Similar Products'}
						seeall={t('transData.seeAll')}
					/>
					<NewArrivalBigContainer
						data={newArrivalBigData}
						horizontal={true}
						width={windowWidth(205)}
						style={{ right: windowWidth(10) }}
					/>
				</View>
			</ScrollView>
			<View style={styles.bottomContainerView}>
				<BottomContainer
					onPress={() => navigation.navigate('AddtocartOne')}
					leftValue={
						<View style={[external.fd_row, external.ai_center, external.mh_20]}>
							<View
								style={[external.mh_15, external.fd_row, external.ai_center]}
							>
								<Plus color={iconColorStyle} />
								<Text style={[styles.addToBeg, { color: textColorStyle }]}>
									{addtoBag}
								</Text>
							</View>
						</View>
					}
					value={
						<TouchableOpacity
							onPress={() => navigation.navigate('AddtocartOne')}
							style={[external.fd_row, external.ai_center, external.pt_4]}
						>
							<Cart />
							<Text style={styles.buyNowText}>{buyNow}</Text>
						</TouchableOpacity>
					}
				/>
			</View>
		</View>
	)
}
