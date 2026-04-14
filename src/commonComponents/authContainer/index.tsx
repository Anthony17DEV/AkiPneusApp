import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { BackLeft } from '@src/utils/icon'
import images from '@src/utils/images'
import { Image } from 'expo-image'
import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

interface AuthContainerProps {
	subtitle?: string
	title?: string
	value?: React.ReactNode
	onPress?: () => void
}

export function AuthContainer({
	subtitle,
	title,
	value,
	onPress,
}: AuthContainerProps) {
	const { bgFullStyle, textColorStyle, textRTLStyle, imageRTLStyle, isRTL } =
		useValues()
	const navigation = useNavigation()

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: bgFullStyle }]}>
			<TouchableOpacity
				onPress={() => navigation.goBack()}
				style={{ transform: [{ scale: imageRTLStyle }] }}
			>
				<BackLeft />
			</TouchableOpacity>
			<View style={{ height: 10, top: windowHeight(22) }}>
				<Image
					source={images.authGif}
					style={[
						styles.transformLine,
						{ left: isRTL ? windowHeight(210) : windowHeight(-30) },
					]}
				/>
			</View>
			<View style={{ marginTop: windowHeight(7) }}>
				<Text
					style={[
						commonStyles.container,
						external.mt_20,
						{ color: textColorStyle },
						{ textAlign: textRTLStyle },
					]}
				>
					{title}
				</Text>
				<Text style={[styles.subtitleText, { textAlign: textRTLStyle }]}>
					{subtitle}
				</Text>
			</View>
			<View>{value}</View>
		</SafeAreaView>
	)
}
