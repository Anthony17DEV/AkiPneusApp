import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { external } from '@src/style/external.css'
import React from 'react'
import {
	StyleProp,
	Text,
	TextStyle,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native'
import styles from './style.css'

interface HeadingCategoryProps {
	value?: string
	seeall?: string
	show?: boolean
}

export function HeadingCategory({ value, seeall, show }: HeadingCategoryProps) {
	const navigation = useNavigation<any>()
	const { textColorStyle, viewRTLStyle } = useValues()

	return (
		<View
			style={[
				styles.container,
				external.fd_row,
				external.js_space,
				{ flexDirection: viewRTLStyle } as StyleProp<ViewStyle>,
			]}
		>
			<Text style={[styles.valueText, { color: textColorStyle } as TextStyle]}>
				{value}
			</Text>
			<TouchableOpacity onPress={() => navigation.navigate('ProductDetailTwo')}>
				{show ? <View /> : <Text style={[styles.seeAllText]}>{seeall}</Text>}
			</TouchableOpacity>
		</View>
	)
}
