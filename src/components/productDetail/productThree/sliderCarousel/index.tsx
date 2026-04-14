import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { Search } from '@src/assets/icons/search'
import { IconBackground } from '@src/commonComponents'
import { details } from '@src/constant'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { BackLeft, Heart } from '@src/utils/icon'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Slider } from './slider'
import { styles } from './styles.css'

export function SliderCarousel() {
	const navigation = useNavigation()
	const { textColorStyle, iconColorStyle, isDark } = useValues()
	const BgColor = isDark ? '#23252B' : '#f4f5fb'
	const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93']

	const back = () => {
		if (navigation.canGoBack()) {
			navigation.goBack()
		} else {
		}
	}

	return (
		<View style={{ backgroundColor: BgColor }}>
			<View
				style={[
					external.fd_row,
					external.js_space,
					external.pt_15,
					external.mh_20,
					external.ai_center,
				]}
			>
				<TouchableOpacity onPress={back}>
					<BackLeft />
				</TouchableOpacity>
				<Text style={[styles.text, { color: textColorStyle }]}>{details}</Text>
				<View style={[external.fd_row, external.ai_center]}>
					<View style={[external.mh_5]}>
						<IconBackground value={<Search color={iconColorStyle} />} />
					</View>
					<IconBackground value={<Heart />} />
				</View>
			</View>
			<View style={{ height: windowHeight(220) }}>
				<Slider />
			</View>
			<View style={styles.viewStyle}>
				{colors.map((color, index) => (
					<View
						key={index}
						style={[styles.colorMap, { backgroundColor: color }]}
					/>
				))}
			</View>
		</View>
	)
}
