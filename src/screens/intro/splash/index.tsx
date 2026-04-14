import { useValues } from '@/app/login'
import { external } from '@src/style/external.css'
import { getValue } from '@src/utils/helper/localStorage'
import images from '@utils/images'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Animated,
	Easing,
	ImageBackground,
	ImageStyle,
	View,
} from 'react-native'

interface SplashProps {
	navigation: {
		navigate: (route: string) => void
	}
}

export function Splash({ navigation }: SplashProps) {
	const logoSize = useRef(new Animated.Value(1)).current
	const logoHeight: Animated.AnimatedInterpolation = logoSize.interpolate({
		inputRange: [0, 2],
		outputRange: [25, 90],
	})
	const logoWidth: Animated.AnimatedInterpolation = logoSize.interpolate({
		inputRange: [0, 2],
		outputRange: [25, 90],
	})

	useEffect(() => {
		getValues()
		const animationTimeout = setTimeout(() => {
			Animated.timing(logoSize, {
				toValue: 2,
				duration: 500,
				easing: Easing.linear,
				useNativeDriver: false,
			}).start()
			const navigationTimeout = setTimeout(() => {
				navigation.navigate('Onboarding')
			}, 2000)

			return () => clearTimeout(navigationTimeout)
		}, 500)

		return () => clearTimeout(animationTimeout)
	}, [navigation])

	const { setCurrSymbol, setCurrPrice, setIsDark, setIsRTL } = useValues()
	const { i18n } = useTranslation()

	const getValues = async (): Promise<void> => {
		const language: string | null = await getValue('language')
		const currSymbol: string | null = await getValue('curr')
		const currPrice: string | null = await getValue('currPrice')
		const dark: string | null = await getValue('isDark')
		const rtl: string | null = await getValue('isRtl')
		const darkVal: boolean = dark === 'true'
		const rtlVal: boolean = rtl === 'true'

		if (language != null) {
			i18n.changeLanguage(language)
		}
		if (currSymbol != null) {
			setCurrSymbol(currSymbol)
			setCurrPrice(parseFloat(currPrice as string))
		}
		if (dark != null) {
			setIsDark(!darkVal)
		}
		if (rtl != null) {
			setIsRTL(!rtlVal)
		}
	}

	return (
		<ImageBackground style={[external.fx_1]} source={images.splash}>
			<View style={[external.fx_1, external.js_center, external.ai_center]}>
				<Animated.Image
					source={images.logo}
					style={[
						external.rm_contain,
						{
							transform: [{ scale: logoSize }],
							height: logoHeight as unknown as number,
							width: logoWidth as unknown as number,
						} as ImageStyle,
					]}
				/>
			</View>
		</ImageBackground>
	)
}
