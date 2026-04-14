import { useValues } from '@/app/login'
import { HeadingCategory, SolidLine } from '@src/commonComponents'
import { seeAll, whatsTrending } from '@src/constant'
import { tredndingTwoData } from '@src/data/homeScreenTwo'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Image, Text, View } from 'react-native'
import styles from './styles.css'

export function WhosTrending() {
	const { textColorStyle, linearColorStyle, linearColorStyleTwo, t } =
		useValues()

	return (
		<View style={[external.mh_20, external.mt_10]}>
			<HeadingCategory value={whatsTrending} seeall={seeAll} />
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyleTwo}
				style={[styles.container]}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={styles.menuItemContent}
				>
					{tredndingTwoData.map((item, index) => (
						<View key={index}>
							<View style={[external.fd_row, external.ai_center]}>
								<Image style={styles.img} source={item.img} />
								<View style={{ paddingHorizontal: windowHeight(2.5) }}>
									<View style={[external.fd_row, external.ai_center]}>
										<Text style={[styles.titleText, { color: textColorStyle }]}>
											{t(item.title)}
										</Text>
										<Text style={styles.price}>${item.price}</Text>
									</View>
									<View style={[external.fd_row, external.ai_center]}>
										<Text style={styles.subtitle}>{t(item.subtitle)}</Text>
										<Text
											style={[commonStyles.H1Banner, { color: textColorStyle }]}
										>
											${item.fullPrice}
										</Text>
									</View>
								</View>
							</View>
							{index === tredndingTwoData.length && -1(<SolidLine />)}
						</View>
					))}
				</LinearGradient>
			</LinearGradient>
		</View>
	)
}
