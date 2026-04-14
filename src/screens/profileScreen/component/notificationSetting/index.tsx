import { useValues } from '@/app/login'
import {
	HeaderContainer,
	RadioButton,
	SolidLine,
	SwitchComponent,
} from '@src/commonComponents'
import { currencyData } from '@src/data/currencyData'
import { languageData } from '@src/data/languageData'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { getValue, setValue } from '@src/utils/helper/localStorage'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, Text, View } from 'react-native'
import { styles } from './style.css'

export function Settings() {
	const {
		isRTL,
		setIsRTL,
		isDark,
		setIsDark,
		textRTLStyle,
		viewRTLStyle,
		t,
		setCurrSymbol,
		setCurrPrice,
		bgFullStyle,
		textColorStyle,
		linearColorStyle,
	} = useValues()
	const [checkedData, setCheckedData] = useState<string>('en')
	const [checkCurrency, setCheckCurrency] = useState<string>('$')

	useEffect(() => {
		getValues()
	}, [])

	const getValues = async (): Promise<void> => {
		const currSymbol: string | null = await getValue('curr')
		if (currSymbol != null) {
			setCheckCurrency(currSymbol)
		}
		const lang: string | null = await getValue('language')
		if (lang != null) {
			setCheckedData(lang)
		}
	}

	const valData = (id: string): void => {
		setCheckedData(id)
		setValue('language', id)
	}

	const changeLan = (language: string): void => {
		i18n.changeLanguage(language)
		if (language === 'ar') {
			setIsRTL(true)
		} else {
			setIsRTL(false)
		}
	}

	const currencyChecked = (symbol: string, price: number): void => {
		setCheckCurrency(symbol)
		setCurrSymbol(symbol)
		setCurrPrice(price)
		setValue('curr', symbol)
		setValue('currPrice', price.toString())
	}

	const [toggles, setToggles] = useState<
		Array<{ id: string; title: string; value: boolean }>
	>([
		{ id: 'toggle1', title: 'transData.offersUpdate', value: false },
		{ id: 'toggle2', title: 'transData.orderUpdate', value: false },
		{ id: 'toggle3', title: 'transData.newProduct', value: false },
		{ id: 'toggle4', title: 'darkLight', value: isDark },
		{ id: 'toggle5', title: 'Toggle 5', value: isRTL },
	])

	const { i18n } = useTranslation()

	const handleToggle = (toggleId: string): void => {
		if (toggleId === 'toggle4') {
			setIsDark(prevIsDark => !prevIsDark)
			const dark: string = isDark.toString()
			setValue('isDark', dark)
		}
		if (toggleId === 'toggle5') {
			setIsRTL(prevIsRTL => !prevIsRTL)
			const rtl: string = isRTL.toString()
			setValue('isRtl', rtl)
		}
		setToggles(prevToggles =>
			prevToggles.map(toggle =>
				toggle.id === toggleId ? { ...toggle, value: !toggle.value } : toggle,
			),
		)
	}

	const textColor: string = isDark ? appColors.screenBg : appColors.titleText
	const bgColor: string = isDark ? appColors.bgPlaceHolder : appColors.screenBg
	const borderDark: string | object = isDark
		? styles.darklinearStyle
		: styles.linearStyle
	const darkBorder: string = isDark ? '#414348' : appColors.bgLayer

	return (
		<View
			style={[
				external.ph_20,
				commonStyles.commonContainer,
				{ backgroundColor: bgFullStyle },
			]}
		>
			<HeaderContainer value={t('transData.setting')} />
			<ScrollView showsVerticalScrollIndicator={false}>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[
						borderDark,
						{ backgroundColor: bgColor },
						{ shadowColor: appColors.shadowColor },
					]}
				>
					<View style={[external.mv_5]}>
						<Text
							style={[
								styles.titleText,
								{ color: textColorStyle },
								{ textAlign: textRTLStyle },
							]}
						>
							{t('transData.notification')}
						</Text>
						<View>
							<SolidLine color={darkBorder} />
						</View>
					</View>
					<View style={styles.container}>
						{toggles.map((toggle, index) => (
							<View key={toggle.id}>
								{toggle.id !== 'toggle4' && toggle.id !== 'toggle5' && (
									<View
										style={[
											styles.viewContainer,
											{ flexDirection: viewRTLStyle },
										]}
									>
										<Text style={[styles.title, { color: textColor }]}>
											{t(toggle.title)}
										</Text>
										<SwitchComponent
											Enable={toggle.value}
											onPress={() => handleToggle(toggle.id)}
										/>
									</View>
								)}
							</View>
						))}
					</View>
				</LinearGradient>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[
						styles.themeView,
						{ backgroundColor: bgColor },
						{ shadowColor: appColors.shadowColor },
					]}
				>
					<Text
						style={[
							styles.titleText,
							{ color: textColor },
							{ textAlign: textRTLStyle },
						]}
					>
						{t('transData.theme')}
					</Text>
					<View>
						<SolidLine color={darkBorder} />
					</View>
					<View style={styles.container}>
						<View>
							<View
								style={[
									styles.viewContainer,
									external.mt_5,
									{ flexDirection: viewRTLStyle },
								]}
							>
								<Text style={[styles.title, { color: textColor }]}>
									{t('transData.dark')}
								</Text>
								<SwitchComponent
									Enable={toggles[3].value}
									onPress={() => handleToggle('toggle4')}
								/>
							</View>
						</View>
					</View>
					<View style={styles.container}>
						<View>
							<View
								style={[styles.viewContainer, { flexDirection: viewRTLStyle }]}
							>
								<Text style={[styles.title, { color: textColor }]}>
									{t('transData.rtl')}
								</Text>
								<SwitchComponent
									Enable={toggles[4].value}
									onPress={() => handleToggle('toggle5')}
								/>
							</View>
						</View>
					</View>
				</LinearGradient>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[styles.linearStyle, { backgroundColor: bgColor }]}
				>
					<Text
						style={[
							styles.titleText,
							{ color: textColor },
							{ textAlign: textRTLStyle },
						]}
					>
						{t('transData.language')}
					</Text>
					<View>
						<SolidLine color={darkBorder} />
					</View>
					{languageData.map((item, index) => (
						<View
							style={[
								external.fd_row,
								external.ai_center,
								external.js_space,
								external.mv_5,
								external.ph_10,
								{ flexDirection: viewRTLStyle },
							]}
							key={index}
						>
							<Text style={[styles.title, { color: textColor }]}>
								{t(item.title)}
							</Text>
							<RadioButton
								onPress={() => {
									valData(item.code)
									changeLan(item.code)
								}}
								checked={checkedData === item.code}
							/>
						</View>
					))}
				</LinearGradient>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[
						styles.linearStyle,
						external.mb_10,
						{ backgroundColor: bgColor },
					]}
				>
					<Text
						style={[
							styles.titleText,
							{ color: textColor },
							{ textAlign: textRTLStyle },
						]}
					>
						{t('transData.currency')}
					</Text>
					<View>
						<SolidLine color={darkBorder} />
					</View>
					{currencyData.map((item, index) => (
						<View
							style={[
								external.fd_row,
								external.ai_center,
								external.js_space,
								external.mv_5,
								external.ph_10,
								{ flexDirection: viewRTLStyle },
							]}
							key={index}
						>
							<Text style={[styles.title, { color: textColor }]}>
								{t(item.title)}
							</Text>
							<RadioButton
								onPress={() => {
									currencyChecked(item.icon, item.value)
								}}
								checked={checkCurrency === item.icon}
							/>
						</View>
					))}
				</LinearGradient>
			</ScrollView>
		</View>
	)
}
