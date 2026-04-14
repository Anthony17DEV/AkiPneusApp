import { useValues } from '@/app/login'
import {
	CheckBox,
	CommonModal,
	HeaderContainer,
	NavigationButton,
	RadioButton,
	SolidLine,
	TextInputs,
} from '@src/commonComponents'
import { changeAddressData } from '@src/data/addressData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Cross } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import { styles } from './style.css'

interface ChangeAddressScreenProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function ChangeAddressScreen({ navigation }: ChangeAddressScreenProps) {
	const [selectedItem, setSelectedItem] = useState<number | null>(null)
	const [isModalVisible, setModalVisible] = useState<boolean>(false)

	const closeModal = (): void => {
		setModalVisible(false)
	}

	const paymentData = (index: number): void => {
		setSelectedItem(index === selectedItem ? null : index)
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

	const colors: [string, string] = isDark
		? ['#3D3F45', '#45474B']
		: [appColors.screenBg, appColors.screenBg]

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.mh_20]}>
				<HeaderContainer value={t('transData.changeAddress')} />
			</View>
			{changeAddressData.map((item, index) => (
				<TouchableOpacity
					key={index}
					onPress={() => paymentData(index)}
					style={{ elevation: 1 }}
				>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 0.0, y: 1.0 }}
						colors={colors}
						style={[
							styles.container,
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
									external.ai_center,
									{ flexDirection: viewRTLStyle },
								]}
							>
								<RadioButton
									onPress={() => {
										paymentData(index)
									}}
									checked={index === selectedItem}
								/>
								<Text
									style={[
										commonStyles.titleText19,
										external.ph_10,
										{ color: textColorStyle },
									]}
								>
									{t(item.title)}
								</Text>
							</View>
							<View style={[external.ph_10]}>
								<Text
									style={[
										commonStyles.subtitleText,
										{ textAlign: textRTLStyle },
										external.ph_20,
										{
											color:
												index === selectedItem
													? textColorStyle
													: appColors.subtitle,
											paddingVertical: windowHeight(2),
											fontSize: fontSizes.FONT16,
										},
									]}
								>
									{t(item.address)}
								</Text>
								<View
									style={[
										external.fd_row,
										external.ai_center,
										external.ph_20,
										{ flexDirection: viewRTLStyle },
									]}
								>
									<Text
										style={[
											commonStyles.subtitleText,
											{ color: textColorStyle },
										]}
									>
										{item.mo} :
									</Text>
									<Text style={[commonStyles.subtitleText]}>
										{item.phoneNumber}
									</Text>
								</View>
							</View>
						</LinearGradient>
					</LinearGradient>
				</TouchableOpacity>
			))}
			<TouchableOpacity onPress={() => setModalVisible(true)}>
				<Text style={[styles.textContainer, { textAlign: textRTLStyle }]}>
					+ Add New Address
				</Text>
			</TouchableOpacity>
			<View
				style={[external.fx_1, external.js_end, external.Pb_30, external.ph_20]}
			>
				<View style={{ top: windowHeight(15) }}>
					<NavigationButton
						backgroundColor={'#4D66FF'}
						color={appColors.screenBg}
						title={'Select'}
						onPress={() => navigation.navigate('CheckoutScreen')}
					/>
				</View>
				<CommonModal
					isVisible={isModalVisible}
					closeModal={closeModal}
					value={
						<View>
							<View
								style={[external.fd_row, external.ai_center, external.js_space]}
							>
								<Text
									style={[commonStyles.titleText19, { color: textColorStyle }]}
								>
									Add New Address
								</Text>
								<Pressable onPress={closeModal}>
									<Cross />
								</Pressable>
							</View>
							<SolidLine />
							<TextInputs title={'Title'} placeHolder={'Enter Title'} />
							<TextInputs
								title={'Phone Number'}
								placeHolder={'Enter phone number'}
							/>
							<TextInputs
								title={'Street Address'}
								placeHolder={'Enter address'}
							/>
							<View style={[external.fd_row, external.ai_center]}>
								<View style={{ width: '45%', marginHorizontal: 10 }}>
									<TextInputs title={'City'} placeHolder={'Enter city name'} />
								</View>
								<View style={{ width: '45%', marginHorizontal: 10 }}>
									<TextInputs
										title={'ZIP Code'}
										placeHolder={'Enter zip code'}
									/>
								</View>
							</View>
							<View style={[external.fd_row]}>
								<CheckBox />
								<Text
									style={[
										commonStyles.subtitleText,
										external.ph_5,
										{ color: textColorStyle },
									]}
								>
									Make as a default
								</Text>
							</View>
							<View
								style={[
									external.fd_row,
									external.ai_center,
									external.js_space,
									external.mt_30,
								]}
							>
								<View style={{ width: 170 }}>
									<NavigationButton
										backgroundColor={appColors.screenBg}
										title={'Cancel'}
										color={textColorStyle}
										borderWidth={0.3}
										onPress={closeModal}
									/>
								</View>
								<View style={{ width: 170 }}>
									<NavigationButton
										backgroundColor={'#4D66FF'}
										title={'Add'}
										color={appColors.screenBg}
										onPress={closeModal}
									/>
								</View>
							</View>
						</View>
					}
				/>
			</View>
		</View>
	)
}
