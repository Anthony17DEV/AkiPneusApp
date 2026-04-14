import { useValues } from '@/app/login'
import { Apple } from '@src/assets/icons/apple'
import { Email } from '@src/assets/icons/email'
import {
	AuthContainer,
	CheckBox,
	LinearBoderText,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import { apple, facebook } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { EyesHide, EyesShow, FaceBook, Google, Key } from '@src/utils/icon'
import appColors from '@theme/appColors'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import styles from './style.css'

export function SignIn({ navigation }: any) {
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [emailError, setEmailError] = useState<string>('')
	const [passwordError, setPasswordError] = useState<string>('')
	const [checkedData, setCheckedData] = useState<boolean>(false)
	const [isPwdTyping, setPwdTyping] = useState<boolean>(false)
	const [isPasswordFocused, setPasswordFocused] = useState<boolean>(false)
	const [emailFocused, setEmailFocused] = useState<boolean>(false)
	const [isPasswordVisible, setPasswordVisible] = useState<boolean>(false)

	const valData = (): void => {
		setCheckedData(!checkedData)
	}

	const {
		bgFullStyle,
		textColorStyle,
		t,
		linearColorStyleTwo,
		linearColorStyle,
	} = useValues()

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			<View style={[styles.container, { backgroundColor: bgFullStyle }]}>
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					<AuthContainer
						title={t('transData.letYouIn')}
						subtitle={t('transData.heyMissed')}
						value={
							<View style={{ marginTop: windowHeight(10) }}>
								<TextInputs
									title={t('transData.emailId')}
									placeHolder={t('transData.enterEmail')}
									onChangeText={setEmail}
									icon={
										<Email
											color={
												emailFocused || email ? '#051E47' : appColors.subtitle
											}
										/>
									}
								/>
								{emailError !== '' && (
									<Text style={styles.errorStyle}>{emailError}</Text>
								)}

								<TextInputs
									title={t('transData.passwords')}
									placeHolder={t('transData.enterYouPassword')}
									onBlur={() => setPwdTyping(false)}
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
								{passwordError !== '' && (
									<Text style={styles.errorStyle}>{passwordError}</Text>
								)}
								<View
									style={[external.fd_row, external.ai_center, external.mt_3]}
								>
									<CheckBox onPress={valData} checked={checkedData} />
									<Text
										style={[
											commonStyles.subtitleText,
											external.ph_5,
											external.fg_1,
											{
												color: textColorStyle,
												fontSize: fontSizes.FONT16,
												top: windowHeight(2),
												marginHorizontal: windowHeight(5),
											},
										]}
									>
										{t('transData.rememberMe')}
									</Text>
									<TouchableOpacity
										onPress={() => navigation.navigate('ForgetPassword')}
									>
										<Text
											style={[
												commonStyles.subtitleText,
												{ color: '#4D66FF', fontSize: fontSizes.FONT16 },
											]}
										>
											{t('transData.forgetPassword')}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						}
					/>
				</ScrollView>
				<View style={{ flex: 2.4 }}>
					<NavigationButton
						title={t('transData.signIn')}
						color={appColors.screenBg}
						onPress={() => navigation.navigate('LoaderScreen')}
						backgroundColor={'#4D66FF'}
					/>
					<View style={styles.singUpView}>
						<Text style={[commonStyles.subtitleText]}>
							{t('transData.dontHaveAccount')}
						</Text>
						<TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
							<Text
								style={[
									commonStyles.titleText19,
									external.ph_5,
									{ color: textColorStyle },
									styles.signup,
								]}
							>
								{t('transData.signUp')}
							</Text>
						</TouchableOpacity>
					</View>
					<LinearBoderText />
					<View
						style={[
							external.fd_row,
							external.ai_center,
							external.mb_40,
							{ alignSelf: 'center' },
						]}
					>
						<LinearGradient
							start={{ x: 0.0, y: 0.0 }}
							end={{ x: 0.0, y: 1.0 }}
							colors={linearColorStyleTwo}
							style={[styles.headingContainer]}
						>
							<LinearGradient
								start={{ x: 0.0, y: 0.0 }}
								end={{ x: 0.0, y: 1.0 }}
								colors={linearColorStyle}
								style={[styles.menuItemContent]}
							>
								<Google />
								<Text
									style={[
										commonStyles.titleText19,
										external.mt_2,
										{ color: textColorStyle },
									]}
								>
									{t('transData.google')}
								</Text>
							</LinearGradient>
						</LinearGradient>
						<LinearGradient
							start={{ x: 0.0, y: 0.0 }}
							end={{ x: 0.0, y: 1.0 }}
							colors={linearColorStyleTwo}
							style={[styles.headingContainer]}
						>
							<LinearGradient
								start={{ x: 0.0, y: 0.0 }}
								end={{ x: 0.0, y: 1.0 }}
								colors={linearColorStyle}
								style={[styles.menuItemContent]}
							>
								<FaceBook />
								<Text
									style={[
										commonStyles.titleText19,
										external.mt_3,
										{ color: textColorStyle },
									]}
								>
									{facebook}
								</Text>
							</LinearGradient>
						</LinearGradient>
						<LinearGradient
							start={{ x: 0.0, y: 0.0 }}
							end={{ x: 0.0, y: 1.0 }}
							colors={linearColorStyleTwo}
							style={[styles.headingContainer]}
						>
							<LinearGradient
								start={{ x: 0.0, y: 0.0 }}
								end={{ x: 0.0, y: 1.0 }}
								colors={linearColorStyle}
								style={[styles.menuItemContent]}
							>
								<Apple />
								<Text
									style={[
										commonStyles.titleText19,
										external.mt_3,
										{ color: textColorStyle },
									]}
								>
									{apple}
								</Text>
							</LinearGradient>
						</LinearGradient>
					</View>
				</View>
			</View>
		</KeyboardAvoidingView>
	)
}
