import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { RightSmallArrow } from '@src/utils/icon'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ratingScreen } from '../../../../data/ratingScreen'
import styles from './styles.css'

export function RatingScreen() {
	const { textColorStyle, t, viewRTLStyle, textRTLStyle } = useValues()
	const navigation = useNavigation<any>()
	return (
		<View>
			<View
				style={{
					backgroundColor: appColors.bgLayout,
					marginTop: windowHeight(15),
				}}
			>
				<View style={[external.ph_20, external.pv_15]}>
					<View
						style={[
							external.fd_row,
							external.ai_center,
							{ flexDirection: viewRTLStyle },
						]}
					>
						<Text
							style={[
								commonStyles.titleText19,
								external.fg_1,
								{ fontSize: fontSizes.FONT17 },
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t('transData.reviews')} :
						</Text>
						<TouchableOpacity
							style={[external.fd_row, external.ai_center]}
							onPress={() => navigation.navigate('RatingScreen')}
						>
							<Text
								style={[
									commonStyles.titleText19,
									{ fontSize: fontSizes.FONT17 },
									{ color: textColorStyle },
								]}
							>
								{'105 reviews'}
							</Text>
							<RightSmallArrow />
						</TouchableOpacity>
					</View>
					<View
						style={[
							external.fd_row,
							{ alignItems: 'flex-start' },
							{ flexDirection: viewRTLStyle },
						]}
					>
						<View style={styles.viewContainer}>
							<Text style={styles.fourPointOne}>4.1</Text>
							<Text style={styles.outOfFive}>out of 5</Text>
						</View>
						<View>
							{ratingScreen.map((item, index) => (
								<View style={styles.ratingScreen} key={item.id}>
									<Text style={[styles.titleView, { color: textColorStyle }]}>
										{t(item.title)}
									</Text>
									<View style={[styles.progressBar]}>
										<View
											style={[styles.progressBarPrimary, { width: item.width }]}
										/>
									</View>
								</View>
							))}
						</View>
					</View>
				</View>
			</View>
		</View>
	)
}
