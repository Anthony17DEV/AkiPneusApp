import { useValues } from '@/app/login'
import {
	AuthContainer,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import appColors from '@src/themes/appColors'
import { Call, EyesHide, EyesShow, Key } from '@src/utils/icon'
import React, { useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
	View,
} from 'react-native'
import styles from './style.css'

interface SignUpProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function SignUp({ navigation }: SignUpProps) {
	const [email, setEmail] = useState<string>('')
	const [phone, setPhone] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [confirmPassword, setConfirmPassword] = useState<string>('')
	const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false)
	const [isConfirmFocused, setConfirmFocused] = useState<boolean>(false)
	const [emailFocused, setEmailFocused] = useState<boolean>(false)
	const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false)
	const [isConfirmPasswordVisible, setConfirmPasswordVisible] =
		useState<boolean>(false)

	const onHandleChange = () => {
		navigation.navigate('LoaderScreen')
	}

	const { bgFullStyle, t } = useValues()

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
				<View style={[styles.container, { backgroundColor: bgFullStyle }]}>
					<AuthContainer
						title={t('transData.createYourAccount')}
						subtitle={t('transData.exploreyourLife')}
						value={
							<View>
								<TextInputs
									title={t('transData.emailId')}
									placeHolder={t('transData.enterEmail')}
									onChangeText={setEmail}
									icon={
										<Key
											color={
												emailFocused || email ? '#051E47' : appColors.subtitle
											}
										/>
									}
								/>

								<TextInputs
									title={t('transData.phoneNumber')}
									placeHolder={t('transData.enterNumber')}
									keyboardType="numeric"
									onChangeText={setPhone}
									icon={
										<Call
											color={
												emailFocused || phone ? '#051E47' : appColors.subtitle
											}
										/>
									}
								/>

								<TextInputs
									title={t('transData.passwords')}
									placeHolder={t('transData.enterYouPassword')}
									onChangeText={setPassword}
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
													color={
														isPasswordFocused || password ? '#000' : '#9BA6B8'
													}
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
									icon={
										<Key
											color={
												isConfirmFocused || confirmPassword
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
														isConfirmFocused || confirmPassword
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
					<NavigationButton
						title={t('transData.signUp')}
						color={appColors.screenBg}
						onPress={onHandleChange}
						backgroundColor={'#4D66FF'}
					/>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	)
}
