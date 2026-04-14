import { useValues } from '@/app/login'
import { Email } from '@src/assets/icons/email'
import {
	AuthContainer,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import React, { useState } from 'react'
import { Text, View } from 'react-native'
import styles from './style.css'

interface ForgetPasswordProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function ForgetPassword({ navigation }: ForgetPasswordProps) {
	const [email, setEmail] = useState<string>('')
	const [emailError, setEmailError] = useState<string>('')
	const [emailFocused, setEmailFocused] = useState<boolean>(false)

	const [isEmailTyping, setEmailTyping] = useState<boolean>(false)
	const { t, bgFullStyle } = useValues()

	return (
		<View style={[styles.container, { backgroundColor: bgFullStyle }]}>
			<AuthContainer
				title={t('transData.forgetPassword')}
				subtitle={t('transData.forgetPasswordText')}
				value={
					<View style={{ marginTop: windowHeight(17) }}>
						<TextInputs
							title={t('transData.emailId')}
							placeHolder={t('transData.enterEmail')}
							onChangeText={setEmail}
							onBlur={() => setEmailTyping(false)}
							icon={
								<Email
									color={emailFocused || email ? '#051E47' : appColors.subtitle}
								/>
							}
						/>

						{emailError !== '' && isEmailTyping && (
							<Text style={styles.errorStyle}>{emailError}</Text>
						)}
					</View>
				}
			/>
			<View style={{ bottom: windowHeight(15) }}>
				<NavigationButton
					title={t('transData.getOtp')}
					onPress={() => navigation.navigate('OtpVerfication')}
					backgroundColor={'#4D66FF'}
					color="white"
				/>
			</View>
		</View>
	)
}
