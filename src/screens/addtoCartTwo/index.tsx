import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { RightArrow } from '@src/assets/icons/rightArrow'
import {
	BottomContainer,
	DashedBorderComponent,
	HeaderContainer,
} from '@src/commonComponents'
import { LocationContainer, NewArrivalBigContainer } from '@src/components'
import { myBagTwoItem } from '@src/constant'
import { OrderInfoData } from '@src/data'
import { newArrivalBigData } from '@src/data/homeScreenTwo'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { CheckOutIcon } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface AddToCartTwoProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function AddToCartTwo() {
	const {
		bgFullStyle,
		t,
		linearColorStyleTwo,
		linearColorStyle,
		textColorStyle,
		textRTLStyle,
	} = useValues()

	const navigation = useNavigation<any>()
	const checkOut = (): void => {
		navigation.navigate('CheckoutScreen')
	}

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.ph_20]}>
				<HeaderContainer value={myBagTwoItem} />
			</View>
			<View>
				<Text
					style={[
						styles.deliveryLocation,
						{ color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					{t('transData.deliveryLocation')}
				</Text>
				<LocationContainer
					value={<RightArrow />}
					borderColor={appColors.bgLayout}
				/>
				<Text
					style={[
						styles.orderInfo,
						{ color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					{'Order Info'}
				</Text>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyleTwo}
					style={[styles.viewText]}
				>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 0.0, y: 1.0 }}
						colors={linearColorStyle}
						style={[styles.menuItemContent]}
					>
						{OrderInfoData.map(
							(item: { title: string; price: string | number }) => (
								<View style={styles.container} key={item.title}>
									<Text style={[commonStyles.subtitleText]}>{item.title}</Text>
									<View style={styles.dashBoardView}>
										<DashedBorderComponent />
									</View>
									<Text
										style={[
											commonStyles.titleText19,
											{ color: textColorStyle },
										]}
									>
										{Number(item.price)}$
									</Text>
								</View>
							),
						)}
					</LinearGradient>
				</LinearGradient>
			</View>

			<NewArrivalBigContainer
				data={newArrivalBigData}
				value={t('transData.newArrival')}
				horizontal={true}
				show={true}
				style={{ left: windowHeight(7.5) }}
			/>
			<View style={styles.viewStyle}>
				<BottomContainer
					leftValue={
						<Text
							style={[
								commonStyles.H1Banner,
								{
									fontSize: fontSizes.FONT23,
									color: appColors.titleText,
									paddingHorizontal: windowHeight(14),
								},
								{ color: textColorStyle },
							]}
						>
							$3568.31{' '}
							<Text style={[commonStyles.subtitleText]}>(2 items)</Text>
						</Text>
					}
					value={
						<TouchableOpacity onPress={checkOut}>
							<View
								style={[external.fd_row, external.ai_center, external.pt_4]}
							>
								<CheckOutIcon />
								<Text style={[styles.checkOut]}>Check Out</Text>
							</View>
						</TouchableOpacity>
					}
				/>
			</View>
		</View>
	)
}
