import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import {
	BottomContainer,
	HeaderContainer,
	SubtotalContainer,
} from '@src/commonComponents'
import {
	InmyBegContainer,
	LocationContainer,
	VoucherCard,
} from '@src/components'
import { change } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { CheckOutIcon } from '@src/utils/icon'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

export function AddtocartOne() {
	const navigation = useNavigation<any>()

	const { bgFullStyle, t, currSymbol, currPrice, textColorStyle } = useValues()
	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.mh_20]}>
				<HeaderContainer value={t('transData.myBeg')} />
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: windowHeight(70) }}
			>
				<LocationContainer
					borderColor={appColors.bgLayer}
					backgroundColor={appColors.bgLayout}
					locationBg={'rgba(77, 102, 255, 0.10)'}
					borderRadius={windowHeight(6)}
					value={<Text style={styles.changeText}>{change}</Text>}
					navigation={navigation}
				/>
				<InmyBegContainer />
				<VoucherCard />
				<SubtotalContainer />
			</ScrollView>
			<View style={styles.bottomContainerView}>
				<BottomContainer
					leftValue={
						<Text style={[styles.textContainer, { color: textColorStyle }]}>
							{currSymbol}
							{(currPrice * 3568.31).toFixed(2)}
							<Text style={[commonStyles.subtitleText, { letterSpacing: 0.5 }]}>
								{' '}
								(2 items)
							</Text>
						</Text>
					}
					value={
						<TouchableOpacity
							onPress={() => navigation.navigate('CheckoutScreen')}
							style={[external.fd_row, external.ai_center, external.pt_4]}
						>
							<CheckOutIcon />
							<Text style={[styles.checkOut]}>Check Out</Text>
						</TouchableOpacity>
					}
				/>
			</View>
		</View>
	)
}
