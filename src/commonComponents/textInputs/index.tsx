import { useValues } from '@/app/login'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useState } from 'react'
import {
	NativeSyntheticEvent,
	Pressable,
	Text,
	TextInput,
	TextInputFocusEventData,
	View,
} from 'react-native'
import styles from './style.css'

interface TextInputsProps {
	title?: string
	placeHolder?: string
	show?: boolean
	value?: string | JSX.Element
	onChangeText?: (text: string) => void
	color?: string
	width?: string | number
	validation?: () => boolean | string
	icon?: JSX.Element
	icon1?: JSX.Element
	keyboardType?:
	| 'default'
	| 'email-address'
	| 'numeric'
	| 'phone-pad'
	| 'ascii-capable'
	| 'numbers-and-punctuation'
	| 'url'
	| 'number-pad'
	| 'decimal-pad'
	| 'twitter'
	| 'web-search'
	| undefined
	fullWidth?: string | number
	fullWidthTwo?: string | number
	paddingHorizontalTwo?: number
	secureTextEntrysecureTextEntry?: boolean
	onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void
	secureTextEntry?: boolean
	onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void
}

export function TextInputs({
	title,
	placeHolder,
	show,
	value,
	onChangeText,
	color,
	width,
	validation,
	icon,
	icon1,
	keyboardType,
	fullWidth,
	secureTextEntry,
	fullWidthTwo,
	paddingHorizontalTwo,
	onBlur,
	onFocus,
}: TextInputsProps) {
	const [error, setError] = useState<string>('')
	const [isFocused, setIsFocused] = useState<boolean>(false)
	const handleValidation = () => {
		if (validation && typeof validation === 'function') {
			const validationResult = validation()
			if (validationResult !== true) {
				setError(validationResult as string)
			} else {
				setError('')
			}
		}
	}

	const {
		isDark,
		textColorStyle,
		linearColorStyle,
		textRTLStyle,
		viewRTLStyle,
		isRTL,
	} = useValues()

	const colors = isDark
		? (['#808184', '#2E3036'] as const)
		: ([appColors.screenBg, appColors.screenBg] as const)

	return (
		<View style={[external.mt_10]}>
			<View style={[external.mb_5]}>
				<Text
					style={[
						styles.headingContainer,
						{ color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					{title}
				</Text>
				<View>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 1.0, y: 1.0 }}
						colors={colors}
						style={[
							show ? styles.textInputView : styles.withoutShow,
							{ shadowColor: appColors.shadowColor },
							{ width: typeof fullWidth === 'number' ? fullWidth : '100%' },
							{
								borderColor: isFocused ? '#EDF0FF' : '#EDF0FF',
								borderWidth: windowHeight(1.5),
							},
						]}
					>
						<LinearGradient
							start={{ x: 0.0, y: 0.0 }}
							end={{ x: 0.0, y: 1.0 }}
							colors={linearColorStyle}
							style={[
								styles.menuItemContent,
								{ shadowColor: appColors.shadowColor },
								{ flexDirection: viewRTLStyle },
								{ width: typeof fullWidth === 'number' ? fullWidth : '100%' },
								{ paddingHorizontal: paddingHorizontalTwo || windowHeight(8) },
							]}
						>
							{icon}
							<Pressable
								style={{
									position: 'absolute',
									left: isRTL ? windowHeight(12) : undefined,
									right: isRTL ? undefined : windowHeight(12),
									justifyContent: 'center',
								}}
							>
								{icon1}
							</Pressable>
							<TextInput
								keyboardType={keyboardType}
								secureTextEntry={secureTextEntry === 'true'}
								style={[
									styles.textInput,
									{ width: typeof width === 'number' ? width : undefined },
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
								placeholder={placeHolder}
								placeholderTextColor={color || appColors.subtitle}
								onChangeText={text => {
									onChangeText?.(text)
									if (text !== false) {
										setError('')
									}
								}}
								onBlur={() => {
									setIsFocused(false)
									handleValidation()
								}}
								onFocus={() => setIsFocused(true)}
							/>

							{show && <Pressable style={[external.mh_10]}>{value}</Pressable>}
						</LinearGradient>
					</LinearGradient>
				</View>
				{error !== '' && (
					<Text style={{ color: 'red', marginTop: 5 }}>{error}</Text>
				)}
			</View>
		</View>
	)
}
