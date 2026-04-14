import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { Email } from '@src/assets/icons/email'
import {
	HeaderContainer,
	NavigationButton,
	TextInputs,
} from '@src/commonComponents'
import { phoneMo, smithaWilliams, smithaWilliamsMail } from '@src/constant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { Call, Edit, Profile } from '@src/utils/icon'
import images from '@src/utils/images'
import React, { useState } from 'react'
import { ImageBackground, View } from 'react-native'
import styles from './style.css'

export function EditProfile() {
	const [nameValue, setNameValue] = useState<string>(smithaWilliams)
	const [emailValue, setEmailValue] = useState<string>(smithaWilliamsMail)
	const [phoneValue, setPhoneValue] = useState<string>(phoneMo)
	const [buttonColor, setButtonColor] = useState<string>('#d1d6de')
	const navigation = useNavigation<any>()
	const handleNameChange = (text: string): void => {
		setNameValue(text)
		updateButtonColor()
	}

	const handleEmailChange = (text: string): void => {
		setEmailValue(text)
		updateButtonColor()
	}

	const handlePhoneChange = (text: string): void => {
		setPhoneValue(text)
		updateButtonColor()
	}

	const updateButtonColor = (): void => {
		const isValid: boolean = validateInputs()
		const newButtonColor: string = isValid ? '#4D66FF' : '#d1d6de'
		setButtonColor(newButtonColor)
	}

	const validateInputs = (): boolean => {
		const isNameValid: boolean = nameValue.trim().length > 0
		const isEmailValid: boolean = validateEmail(emailValue)
		const isPhoneValid: boolean = validatePhoneNumber(phoneValue)

		return isNameValid && isEmailValid && isPhoneValid
	}

	const validateEmail = (email: string): boolean => {
		const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const validatePhoneNumber = (phoneNumber: string): boolean => {
		return phoneNumber.trim().length === 9 && !isNaN(Number(phoneNumber))
	}

	const handleSaveChanges = (): void => {
		const isValid: boolean = validateInputs()
		if (isValid) {
			console.log('Changes saved!')
		}
	}

	const { bgFullStyle, textColorStyle, iconColorStyle, isDark, t } = useValues()
	return (
		<View
			style={[
				commonStyles.commonContainer,
				external.ph_20,
				{ backgroundColor: bgFullStyle },
			]}
		>
			<HeaderContainer value={t('transData.myAccount')} />
			<View style={[external.as_center]}>
				<ImageBackground
					resizeMode="contain"
					style={styles.imgStyle}
					source={images.user}
				>
					<View
						style={[
							styles.editIconStyle,
							{ backgroundColor: isDark ? '#1A1C22' : '#F3F5FB' },
							{ borderRadius: 100 },
						]}
					>
						<Edit />
					</View>
				</ImageBackground>
			</View>
			<TextInputs
				title={t('transData.name')}
				placeHolder={t('transData.smithaWilliams')}
				color={textColorStyle}
				icon={<Profile />}
				value={nameValue}
				onChangeText={handleNameChange}
			/>
			<TextInputs
				title={t('transData.emailId')}
				placeHolder={t('transData.smithaWilliamsMail')}
				color={textColorStyle}
				icon={<Email color={iconColorStyle} />}
				value={emailValue}
				onChangeText={handleEmailChange}
				keyboardType={'email-address'}
			/>
			<TextInputs
				title={t('transData.phoneNumber')}
				placeHolder={phoneMo}
				color={textColorStyle}
				icon={<Call color={iconColorStyle} />}
				value={phoneValue}
				onChangeText={handlePhoneChange}
				keyboardType={'decimal-pad'}
			/>
			<View style={[external.fx_1, external.js_end, external.Pb_30]}>
				<View
					style={{
						backgroundColor: buttonColor,
						borderRadius: windowHeight(20),
						top: windowHeight(14),
					}}
				>
					<NavigationButton
						title={t('transData.saveChanges')}
						color={buttonColor ? appColors.screenBg : appColors.subtitle}
						onPress={() => navigation.goBack()}
						backgroundColor={'#4D66FF'}
					/>
				</View>
			</View>
		</View>
	)
}
