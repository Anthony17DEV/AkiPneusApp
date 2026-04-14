import { useValues } from '@/app/login'
import { AuthContainer, NavigationButton } from '@src/commonComponents'
import { getOtp } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import { Text, View } from 'react-native'
import OTPTextInput from 'react-native-otp-textinput'
import styles from './style.css'

interface OtpVerificationProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function OtpVerification({ navigation }: OtpVerificationProps) {
	const [otpValue, setOtpValue] = useState<string>('')

	const onHandleChange = (code: string): void => {
		setOtpValue(code)
	}

	const { bgFullStyle, textColorStyle, t, linearColorStyle, isDark } =
		useValues()

	return (
		<View style={[styles.container, { backgroundColor: bgFullStyle }]}>
			<AuthContainer
				title={t('transData.verificationCode')}
				subtitle={t('transData.verificationTitle')}
				value={
					<View style={{ marginTop: windowHeight(25) }}>
						<Text style={[commonStyles.titleText19, { color: textColorStyle }]}>
							{t('transData.otp')}
						</Text>
						<View style={styles.viewOtp}>
							<LinearGradient
								colors={linearColorStyle}
								style={[{ borderRadius: windowHeight(4) }]}
							>
								<OTPTextInput
									handleTextChange={onHandleChange}
									inputCount={5}
									textInputStyle={[
										styles.otpTextInput,
										{ backgroundColor: bgFullStyle },
										{ color: textColorStyle },
										{ borderColor: isDark ? '#47484D' : '#4D66FF1A' },
									]}
									containerStyle={[external.as_center]}
									selectionColor={textColorStyle}
									keyboardType="numeric"
									tintColor={'#D2D8FE'}
									offTintColor={'#EDF0FF'}
								/>
							</LinearGradient>
						</View>
						<View style={styles.singUpView}>
							<Text style={[commonStyles.subtitleText]}>
								{t('transData.ifYouNtReceived')}
							</Text>
							<Text
								style={[
									commonStyles.titleText19,
									external.ph_5,
									{ color: textColorStyle },
								]}
							>
								{t('transData.resendCode')}
							</Text>
						</View>
					</View>
				}
			/>
			<View style={{ bottom: windowHeight(15) }}>
				<NavigationButton
					title={getOtp}
					color={'white'}
					onPress={() => navigation.navigate('ResetPassword')}
					backgroundColor={'#4D66FF'}
				/>
			</View>
		</View>
	)
}
