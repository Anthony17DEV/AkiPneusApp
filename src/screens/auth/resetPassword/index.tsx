import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import {
	AuthContainer,
	CommonModal,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import { passwordReset, successfullyReset } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { Cross, EyesHide, EyesShow, Key } from '@src/utils/icon'
import images from '@src/utils/images'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

export function ResetPassword() {
	const navigation = useNavigation<any>()
	const [password, setPassword] = useState<string>('')
	const [confirmPassword, setConfirmPassword] = useState<string>('')
	const [isModalVisible, setModalVisible] = useState<boolean>(false)
	const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false)
	const [isConfirmPasswordVisible, setConfirmPasswordVisible] =
		useState<boolean>(false)
	const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false)
	const [isConfirmPasswordFocused, setConfirmPasswordFocused] =
		useState<boolean>(false)

	const onHandleChange = (): void => {
		setModalVisible(true)
	}

	const closeModal = (): void => {
		setModalVisible(false)
	}

	const stackClear = (navigation: any): void => {
		navigation.navigate('SignIn')
	}

	const { bgFullStyle, t } = useValues()

	return (
		<View style={[styles.headingContainer, { backgroundColor: bgFullStyle }]}>
			<AuthContainer
				title={t('transData.resetYourPassword')}
				subtitle={t('transData.newResetYourPassword')}
				value={
					<View style={{ marginTop: windowHeight(17) }}>
						<TextInputs
							title={t('transData.newPassword')}
							placeHolder={t('transData.newPassword')}
							onChangeText={setPassword}
							onFocus={() => setPasswordFocused(true)}
							onBlur={() => setPasswordFocused(false)}
							icon={
								<Key
									color={
										isPasswordFocused || password
											? '#051E47'
											: appColors.subtitle
									}
								/>
							}
							icon1={
								<TouchableOpacity
									onPress={() => setPasswordVisible(prev => !prev)}
								>
									{isPasswordVisible ? (
										<EyesShow />
									) : (
										<EyesHide
											color={isPasswordFocused || password ? '#000' : '#9BA6B8'}
										/>
									)}
								</TouchableOpacity>
							}
							secureTextEntry={!isPasswordVisible}
						/>
						<TextInputs
							title={t('transData.confirmPasswords')}
							placeHolder={t('transData.reEnterPassword')}
							onChangeText={setConfirmPassword}
							onFocus={() => setConfirmPasswordFocused(true)}
							onBlur={() => setConfirmPasswordFocused(false)}
							icon={
								<Key
									color={
										isConfirmPasswordFocused || confirmPassword
											? '#051E47'
											: appColors.subtitle
									}
								/>
							}
							icon1={
								<TouchableOpacity
									onPress={() => setConfirmPasswordVisible(prev => !prev)}
								>
									{isConfirmPasswordVisible ? (
										<EyesShow />
									) : (
										<EyesHide
											color={
												isConfirmPasswordFocused || confirmPassword
													? '#000'
													: '#9BA6B8'
											}
										/>
									)}
								</TouchableOpacity>
							}
							secureTextEntry={!isConfirmPasswordVisible}
						/>
					</View>
				}
			/>
			<View style={{ top: windowHeight(21) }}>
				<NavigationButton
					title={t('transData.resetPassword')}
					color={'white'}
					onPress={onHandleChange}
					backgroundColor={'#4D66FF'}
				/>
			</View>

			{isModalVisible && (
				<CommonModal
					isVisible={isModalVisible}
					closeModal={closeModal}
					title={successfullyReset}
					subtitle={passwordReset}
					value={
						<View>
							<TouchableOpacity style={[external.as_end]} onPress={closeModal}>
								<Cross />
							</TouchableOpacity>
							<Image style={styles.succesFullImg} source={images.successfull} />
							<Text style={[commonStyles.hederH2, external.ti_center]}>
								{'Successfully Reset !'}
							</Text>
							<Text
								style={[
									commonStyles.subtitleText,
									external.ti_center,
									{ fontSize: fontSizes.FONT19 },
								]}
							>
								{'Wohhoo !! Your password has been successfully reset.'}
							</Text>
							<View style={[external.mt_20]}>
								<NavigationButton
									backgroundColor={'#4D66FF'}
									title="Go to home"
									onPress={() => stackClear(navigation)}
									color={appColors.screenBg}
								/>
							</View>
						</View>
					}
				/>
			)}
		</View>
	)
}
