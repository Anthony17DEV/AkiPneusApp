import { useValues } from '@/app/login'
import {
	CommonModal,
	HeaderContainer,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Cross, Key } from '@src/utils/icon'
import images from '@src/utils/images'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { styles } from './styles.css'

export function ChangePasswordScreen() {
	const { bgFullStyle, t, textColorStyle } = useValues()
	const [modalVisible, setModalVisible] = useState(false)
	const [successfullyVisible, setSuccessfullyVisible] = useState(false)
	const closeModal = () => {
		setModalVisible(false)
		setSuccessfullyVisible(false)
	}
	return (
		<View
			style={[
				commonStyles.commonContainer,
				external.ph_20,
				{ backgroundColor: bgFullStyle },
			]}
		>
			<HeaderContainer value={t('transData.changePassword')} />
			<TextInputs
				title={t('transData.currentPassword')}
				placeHolder={t('transData.enterYourOldPassword')}
				icon={<Key />}
			/>
			<TextInputs
				title={t('transData.newPassword')}
				placeHolder={t('transData.enterYourNewPassword')}
				icon={<Key />}
			/>
			<TextInputs
				title={t('transData.confirmPasswords')}
				placeHolder={t('transData.reEnterPassword')}
				icon={<Key />}
			/>
			<View
				style={[
					external.fx_1,
					external.js_end,
					external.ai_center,
					external.Pb_30,
				]}
			>
				<View style={{ width: '100%', top: windowHeight(13) }}>
					<NavigationButton
						title={t('transData.changePassword')}
						backgroundColor={'#4D66FF'}
						onPress={() => setModalVisible(true)}
						color={'white'}
					/>
				</View>
				<CommonModal
					isVisible={modalVisible}
					value={
						<View>
							<TouchableOpacity style={[external.as_end]} onPress={closeModal}>
								<Cross />
							</TouchableOpacity>
							<Image style={styles.deleteText} source={images.delete} />
							<Text
								style={[
									commonStyles.hederH2,
									external.ti_center,
									external.Pb_5,
									{ color: textColorStyle },
								]}
							>
								{'You Can’t Use Old Password'}
							</Text>
							<Text
								style={[
									commonStyles.subtitleText,
									external.ti_center,
									{ fontSize: fontSizes.FONT19 },
								]}
							>
								{
									'You can not use one of your old password as a new password. Please Change it.'
								}
							</Text>
							<View style={[external.mt_20]}>
								<NavigationButton
									backgroundColor={appColors.primary}
									title={t('transData.tryAgain')}
									onPress={() => setSuccessfullyVisible(true)}
									color={appColors.screenBg}
								/>
							</View>
						</View>
					}
				/>
				<CommonModal
					isVisible={successfullyVisible}
					value={
						<View>
							<TouchableOpacity style={[external.as_end]} onPress={closeModal}>
								<Cross />
							</TouchableOpacity>
							<Image style={styles.deleteText} source={images.delete} />
							<Text
								style={[
									commonStyles.hederH2,
									external.ti_center,
									external.Pb_5,
									{ color: textColorStyle },
								]}
							>
								{'Congratulations !!'}
							</Text>
							<Text
								style={[
									commonStyles.subtitleText,
									external.ti_center,
									{ fontSize: fontSizes.FONT19 },
								]}
							>
								{'Yeah !! Your password has been successully changed.'}
							</Text>
							<View style={[external.mt_20]}>
								<NavigationButton
									backgroundColor={appColors.primary}
									title={'Okay'}
									onPress={closeModal}
									color={appColors.screenBg}
								/>
							</View>
						</View>
					}
				/>
			</View>
		</View>
	)
}
