import { useValues } from '@/app/login'
import { CommonModal, RadioButton, SolidLine } from '@src/commonComponents'
import { filterBy, sortBy } from '@src/constant'
import { sortContainerData } from '@src/data/sortingData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Cross, Filter, SortBy } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

export function SortContainer() {
	const [selectedItem, setSelectedItem] = useState(null)
	const paymentData = (index: any) => {
		setSelectedItem(index === selectedItem ? null : index)
	}
	const [isModalVisible, setModalVisible] = useState(false)
	const closeModal = () => {
		setModalVisible(false)
	}
	const { linearColorStyle, isDark, bgFullStyle, textColorStyle } = useValues()
	const colors = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]
	return (
		<View style={[external.mh_20, external.mt_10]}>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[
					styles.container,
					{ shadowColor: appColors.shadowColor, borderradius: 6 },
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
					<TouchableOpacity
						style={styles.sortBycontainer}
						onPress={() => setModalVisible(true)}
					>
						<SortBy />
						<Text
							style={[
								commonStyles.subtitleText,
								external.ph_10,
								{ fontSize: fontSizes.FONT19, color: textColorStyle },
							]}
						>
							{sortBy}
						</Text>
					</TouchableOpacity>
					<View style={styles.viewContainer} />
					<View style={[external.fd_row, external.ai_center]}>
						<Filter />
						<Text
							style={[
								commonStyles.subtitleText,
								{
									fontSize: fontSizes.FONT19,
									color: textColorStyle,
									paddingHorizontal: windowHeight(5),
								},
							]}
						>
							{filterBy}
						</Text>
					</View>
					<CommonModal
						isVisible={isModalVisible}
						closeModal={closeModal}
						value={
							<View>
								<View
									style={[
										external.fd_row,
										external.js_space,
										external.ai_center,
										external.mb_5,
									]}
								>
									<Text
										style={[
											commonStyles.titleText19,
											{ fontSize: fontSizes.FONT21, color: textColorStyle },
										]}
									>
										{sortBy}
									</Text>
									<TouchableOpacity onPress={closeModal}>
										<Cross />
									</TouchableOpacity>
								</View>
								<SolidLine />
								{sortContainerData.map((item, index) => (
									<View style={[external.mv_5]}>
										<View
											style={[
												external.fd_row,
												external.js_space,
												external.ai_center,
											]}
										>
											<Text
												style={[
													commonStyles.subtitleText,
													{
														color: textColorStyle,
														fontSize: fontSizes.FONT19,
														marginVertical: windowHeight(5),
													},
												]}
											>
												{item.title}
											</Text>
											<RadioButton
												onPress={() => {
													paymentData(index)
												}}
												checked={index === selectedItem}
											/>
										</View>
										{index !== sortContainerData.length - 1 && (
											<SolidLine marginVertical={windowHeight(9)} />
										)}
									</View>
								))}
							</View>
						}
					/>
				</LinearGradient>
			</LinearGradient>
		</View>
	)
}
