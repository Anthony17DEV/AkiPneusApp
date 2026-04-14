import { useValues } from '@/app/login'
import {
	BottomContainer,
	CommonModal,
	DashedBorderComponent,
	HeaderContainer,
	NavigationButton,
	RadioButton,
	SolidLine,
	TextInputs,
} from '@src/commonComponents'
import { successfullyReset } from '@src/constant'
import { otherPaymentMode } from '@src/data/paymentData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowWidth } from '@src/themes/appConstant'
import { Cross, SendMoney } from '@src/utils/icon'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { styles } from './style.css'

interface CheckoutScreenProps {
	navigation: {
		goBack: () => void
		navigate: (screen: string) => void
	}
}

export function CheckoutScreen({ navigation }: CheckoutScreenProps) {
	const [isModalVisible, setModalVisible] = useState<boolean>(false)
	const [selectedItem, setSelectedItem] = useState<number | null>(null)
	const [addItem, setAddItem] = useState<boolean>(false)

	const paymentDatas = (index: number): void => {
		setSelectedItem(index === selectedItem ? null : index)
	}

	const closeModal = (): void => {
		setModalVisible(false)
	}

	const closeSecondModel = (): void => {
		setAddItem(false)
	}

	const {
		bgFullStyle,
		textColorStyle,
		linearColorStyle,
		isDark,
		t,
		viewRTLStyle,
		textRTLStyle,
	} = useValues()

	const colors: [string, string, ...string[]] = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.mh_20]}>
				<HeaderContainer
					value={t('transData.checkout')}
					onPress={() => navigation.goBack()}
				/>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={colors}
					style={[
						styles.viewContainer,
						{ shadowColor: appColors.shadowColor, borderRadius: 6 },
					]}
				>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 0.0, y: 1.0 }}
						colors={linearColorStyle}
						style={[
							styles.menuItemContent,
							{ shadowColor: appColors.shadowColor },
						]}
					>
						<View
							style={[
								external.fd_row,
								external.js_space,
								{ flexDirection: viewRTLStyle },
							]}
						>
							<Text
								style={[
									commonStyles.subtitleText,
									external.mh_15,
									external.mt_10,
									{ color: textColorStyle, fontSize: fontSizes.FONT19 },
								]}
							>
								{t('transData.creditCard')}
							</Text>
							<TouchableOpacity onPress={() => setAddItem(true)}>
								<Text style={styles.addnewCard}>
									{t('transData.addNewCard')}
								</Text>
							</TouchableOpacity>
						</View>
						<SolidLine />
						{otherPaymentMode.map(
							(item, index) =>
								index < 2 && (
									<View key={index}>
										<View
											style={[
												external.fd_row,
												external.p_10,
												external.ai_center,
												{ flexDirection: viewRTLStyle },
											]}
										>
											<Image style={styles.imgGround} source={item.img} />
											<View style={[external.ph_10, external.fg_9]}>
												<Text
													style={[
														commonStyles.subtitleText,
														{ color: textColorStyle },
														{ textAlign: textRTLStyle },
													]}
												>
													{t(item.title)}
												</Text>
												<Text
													style={[
														commonStyles.subtitleText,
														{ textAlign: textRTLStyle },
													]}
												>
													{t(item.title)}
												</Text>
											</View>
											<RadioButton
												onPress={() => {
													paymentDatas(index)
												}}
												checked={index === selectedItem}
											/>
										</View>
										<DashedBorderComponent />
									</View>
								),
						)}
					</LinearGradient>
				</LinearGradient>
				{otherPaymentMode.map(
					(item, index) =>
						index >= 4 && (
							<LinearGradient
								key={index}
								start={{ x: 0.0, y: 0.0 }}
								end={{ x: 0.0, y: 1.0 }}
								colors={colors}
								style={[
									styles.otherPaymentModeText,
									{ shadowColor: appColors.shadowColor, borderRadius: 6 },
									{ flexDirection: viewRTLStyle },
								]}
							>
								<LinearGradient
									start={{ x: 0.0, y: 0.0 }}
									end={{ x: 0.0, y: 1.0 }}
									colors={linearColorStyle}
									style={[
										styles.menuItemContentTwo,
										{ shadowColor: appColors.shadowColor },
										{ flexDirection: viewRTLStyle },
									]}
								>
									<Image style={styles.imgContainer} source={item.img} />
									<Text
										style={[
											styles.titleBooks,
											{ color: textColorStyle },
											{ textAlign: textRTLStyle },
										]}
									>
										{t(item.title)}
									</Text>
									<RadioButton
										onPress={() => {
											paymentDatas(index)
										}}
										checked={index === selectedItem}
									/>
								</LinearGradient>
							</LinearGradient>
						),
				)}
			</View>
			<View style={[external.fx_1, external.js_end]}>
				<BottomContainer
					leftValue={
						<Text style={[styles.priceText, { color: textColorStyle }]}>
							$3568.31{' '}
							<Text style={[commonStyles.subtitleText]}>(2 items)</Text>
						</Text>
					}
					value={
						<TouchableOpacity
							onPress={() => setModalVisible(true)}
							style={[external.fd_row, external.ai_center, external.pt_4]}
						>
							<SendMoney />
							<Text style={styles.payNowText}>Pay now</Text>
						</TouchableOpacity>
					}
				/>
			</View>
			<CommonModal
				animationType={'fade'}
				isVisible={isModalVisible}
				closeModal={closeModal}
				title={successfullyReset}
				subtitle={
					'Your order is accepted. Your items are on the way and should arrive shortly.'
				}
				value={
					<View>
						<TouchableOpacity style={[external.as_end]} onPress={closeModal}>
							<Cross />
						</TouchableOpacity>
						<Image
							style={styles.imgStyle}
							source={isDark ? images.Successfull : images.successfull}
						/>
						<Text
							style={[
								commonStyles.hederH2,
								external.ti_center,
								{ color: textColorStyle },
							]}
						>
							{'Congratualations !!'}
						</Text>
						<Text
							style={[
								commonStyles.subtitleText,
								external.ti_center,
								{ fontSize: fontSizes.FONT19 },
							]}
						>
							{
								'Your order is accepted. Your items are on the way and should arrive shortly.'
							}
						</Text>
						<View style={[external.mt_20]}>
							<NavigationButton
								backgroundColor={'#4D66FF'}
								title="View Order Status"
								onPress={() => navigation.navigate('OrderStatus')}
								color={appColors.screenBg}
							/>
							<View style={[external.mt_15]}>
								<NavigationButton
									backgroundColor={appColors.screenBg}
									title="Continue Shopping"
									onPress={() => navigation.navigate('Drawer')}
									color={textColorStyle}
									borderWidth={0.3}
								/>
							</View>
						</View>
					</View>
				}
			/>
			<CommonModal
				animationType={'fade'}
				isVisible={addItem}
				closeModal={closeModal}
				title={successfullyReset}
				subtitle={
					'Your order is accepted. Your items are on the way and should arrive shortly.'
				}
				value={
					<View>
						<View
							style={[external.fd_row, external.ai_center, external.js_space]}
						>
							<Text
								style={[commonStyles.titleText19, { color: textColorStyle }]}
							>
								Add New Card
							</Text>
							<TouchableOpacity onPress={closeSecondModel}>
								<Cross />
							</TouchableOpacity>
						</View>
						<SolidLine />
						<TextInputs
							title={'Card Number'}
							placeHolder={'Enter card number'}
						/>
						<TextInputs
							title={'Card Holder Name'}
							placeHolder={'Enter card number'}
						/>
						<View style={[external.fd_row, { width: '50%' }]}>
							<View style={{ width: '95%' }}>
								<TextInputs title={'CVV'} placeHolder={'Enter cvv'} />
							</View>
							<View style={{ width: '95%', marginHorizontal: 15 }}>
								<TextInputs title={'Exp. Date'} placeHolder={'Enter date'} />
							</View>
						</View>
						<View
							style={[
								external.fd_row,
								external.ai_center,
								external.js_space,
								external.mt_30,
							]}
						>
							<View style={{ width: windowWidth(200) }}>
								<NavigationButton
									backgroundColor={appColors.screenBg}
									title={'Cancel'}
									color={appColors.titleText}
									borderWidth={0.3}
									onPress={closeSecondModel}
								/>
							</View>
							<View style={{ width: windowWidth(200) }}>
								<NavigationButton
									backgroundColor={'#4D66FF'}
									title={'Add'}
									color={appColors.screenBg}
									onPress={closeSecondModel}
								/>
							</View>
						</View>
					</View>
				}
			/>
		</View>
	)
}
