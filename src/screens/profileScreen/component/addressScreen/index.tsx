import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { CheckBox, CommonModal, HeaderContainer, IconBackground, NavigationButton, SolidLine, TextInputs } from '@src/commonComponents'
import {
	addressOne,
	editAddress,
	phoneMo,
	phoneNumber,
	remove,
	streetAddress,
	title,
	workAddress,
} from '@src/constant'
import { addressData } from '@src/data/addressData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Cross, Edit } from '@src/utils/icon'
import images from '@src/utils/images'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import {
	Image,
	SafeAreaView,
	Text,
	TouchableOpacity,
	View
} from 'react-native'
import styles from './style.css'

export function AddressScreen() {
	const navigation = useNavigation<any>()

	const [selectedItem, setSelectedItem] = useState<number | null>(null)
	const [modalVisible, setModalVisible] = useState<boolean>(false)
	const [editModal, setEditModal] = useState<boolean>(false)
	const [checkedData, setCheckedData] = useState<boolean>(false)
	const [addressValue, setAddressValue] = useState<string>('')

	const paymentData = (index: number) => {
		setSelectedItem(index === selectedItem ? null : index)
	}

	const closeModal = () => {
		setModalVisible(false)
	}

	const handleAddressChange = (text: string) => {
		setAddressValue(text)
	}

	const {
		textColorStyle,
		linearColorStyle,
		bgFullStyle,
		textRTLStyle,
		viewRTLStyle,
		t,
		isDark,
		linearColorStyleTwo,
	} = useValues()

	const valData = () => {
		setCheckedData(!checkedData)
	}

	const back = () => {
		try {
			console.log('Checking canGoBack')
			if (navigation.canGoBack()) {
				console.log('Going back')
				navigation.goBack()
			} else {
				console.log('Navigating to ProfileScreen')
				navigation.navigate('ProfileScreen')
			}
		} catch (error) {
			console.error('Navigation error: ', error)
		}
	}

	useEffect(() => {
		const backAction = () => {
			back()
			return true
		}
	}, [])

	const deleteDark = isDark ? images.deleteDarkGif : images.delete

	const renderItem = ({ item, index }: { item: any; index: number }) => (
		<LinearGradient
			start={{ x: 0.0, y: 0.0 }}
			end={{ x: 0.0, y: 1.0 }}
			colors={linearColorStyle}
			style={styles.container}
		>
			<View style={[styles.viewContainer, { flexDirection: viewRTLStyle }]}>
				<View style={[external.fg_1]}>
					<Text
						style={[
							commonStyles.titleText19,
							{ color: textColorStyle },
							{ textAlign: textRTLStyle },
						]}
					>
						{t(item.title)}
					</Text>
					<Text
						style={[
							commonStyles.subtitleText,
							{ color: textColorStyle },
							{ textAlign: textRTLStyle },
						]}
					>
						{t(item.subtitle)}
					</Text>
				</View>
				<IconBackground
					value={<Edit />}
					borderradius={windowHeight(4)}
					onPress={() => setEditModal(true)}
				/>
			</View>
			<SolidLine />
			<Text
				style={[
					styles.addressItem,
					{ color: textColorStyle },
					{ textAlign: textRTLStyle },
				]}
			>
				{t(item.address)}
			</Text>
			<View style={[styles.monoText, { flexDirection: viewRTLStyle }]}>
				<Text style={[commonStyles.subtitleText, { color: textColorStyle }]}>
					{item.mo}
				</Text>
				<Text> : </Text>
				<Text style={[commonStyles.subtitleText, { color: textColorStyle }]}>
					{item.phoneNumber}
				</Text>
			</View>
			<View style={[styles.defaulText, { flexDirection: viewRTLStyle }]}>
				<CheckBox
					onPress={() => {
						paymentData(index)
					}}
					checked={index === selectedItem}
				/>
				<Text
					style={[
						styles.defaulTextView,
						{ color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					{t(item.defaulText)}
				</Text>
				<TouchableOpacity onPress={() => setModalVisible(true)}>
					<Text style={styles.removeText}>{remove}</Text>
				</TouchableOpacity>
			</View>
		</LinearGradient>
	)

	return (
		<SafeAreaView
			style={[
				commonStyles.commonContainer,
				external.ph_20,
				{ backgroundColor: bgFullStyle },
			]}
		>
			<View
				style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
			>
				<HeaderContainer value={t('transData.manageDeliveryAddress')} />

				{addressData.map((item, index) => renderItem({ item, index }))}

				<CommonModal
					isVisible={modalVisible}
					value={
						<View>
							<TouchableOpacity style={[external.as_end]} onPress={closeModal}>
								<Cross />
							</TouchableOpacity>
							<Image style={styles.deleteText} source={deleteDark} />
							<Text
								style={[
									commonStyles.hederH2,
									external.ti_center,
									external.Pb_5,
									{ color: textColorStyle },
								]}
							>
								{t('transData.successfullyDeleted')}
							</Text>
							<Text
								style={[
									commonStyles.subtitleText,
									external.ti_center,
									{ fontSize: fontSizes.FONT19 },
								]}
							>
								{t('transData.youronePaymentDelelted')}
							</Text>
							<View style={[external.mt_20]}>
								<NavigationButton
									backgroundColor={appColors.primary}
									title={t('transData.tryAgain')}
									onPress={closeModal}
									color={appColors.screenBg}
								/>
							</View>
						</View>
					}
				/>
				<CommonModal
					isVisible={editModal}
					value={
						<View>
							<View
								style={[external.fd_row, external.ai_center, external.js_space]}
							>
								<Text
									style={[commonStyles.titleText19, { color: textColorStyle }]}
								>
									{editAddress}
								</Text>
								<TouchableOpacity onPress={() => setEditModal(false)}>
									<Cross />
								</TouchableOpacity>
							</View>
							<SolidLine />
							<TextInputs
								title={title}
								placeHolder={workAddress}
								onChangeText={handleAddressChange}
							/>
							<TextInputs
								title={phoneNumber}
								placeHolder={phoneMo}
								onChangeText={handleAddressChange}
							/>
							<TextInputs
								title={streetAddress}
								placeHolder={addressOne}
								onChangeText={handleAddressChange}
							/>
							<View style={[external.fd_row, external.ai_center]}>
								<View style={{ width: '45%', marginHorizontal: 10 }}>
									<TextInputs
										title={'City'}
										placeHolder={'Enter city name'}
										onChangeText={handleAddressChange}
									/>
								</View>
								<View style={{ width: '45%', marginHorizontal: 10 }}>
									<TextInputs
										title={'ZIP Code'}
										placeHolder={'Enter zip code'}
										onChangeText={handleAddressChange}
									/>
								</View>
							</View>

							<View
								style={[external.fd_row, external.ai_center, external.mt_3]}
							>
								<CheckBox onPress={valData} checked={checkedData} />
								<Text
									style={[
										commonStyles.subtitleText,
										external.ph_5,
										external.fg_1,
										{ color: textColorStyle, fontSize: fontSizes.FONT16 },
									]}
								>
									{t('transData.makeasadefault')}
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
										backgroundColor={isDark ? linearColorStyle : 'white'}
										title={'Cancel'}
										color={isDark ? appColors.screenBg : appColors.titleText}
										borderWidth={0.3}
										onPress={() => setEditModal(false)}
										borderColor={linearColorStyleTwo}
									/>
								</View>
								<View style={{ width: windowHeight(142) }}>
									<NavigationButton
										backgroundColor={appColors.primary}
										title={'Add'}
										color={appColors.screenBg}
										onPress={() => setEditModal(false)}
									/>
								</View>
							</View>
						</View>
					}
				/>
			</View>

			<View style={[external.Pb_15, external.ph_20]}>
				<NavigationButton
					backgroundColor={appColors.primary}
					title={t('transData.saveChanges')}
					color={appColors.screenBg}
					onPress={back}
				/>
			</View>
		</SafeAreaView>
	)
}
