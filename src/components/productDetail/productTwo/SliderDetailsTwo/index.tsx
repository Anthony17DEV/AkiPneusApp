import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { Search } from '@src/assets/icons/search'
import { IconBackground } from '@src/commonComponents'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { BackLeft, Heart } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { details } from '../../../../constant'
import { Slider } from './slider'
import { styles } from './slider/styles'

export function SliderDetailsTwo() {
	const navigation = useNavigation()
	const { iconColorStyle, textColorStyle, linearColorStyle } = useValues()
	const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93']
	return (
		<>
			<LinearGradient colors={linearColorStyle} style={styles.linear} />
			<View style={{ paddingHorizontal: windowHeight(13) }}>
				<View style={[external.fd_row, external.js_space, external.pt_15]}>
					<TouchableOpacity onPress={() => navigation.goBack()}>
						<View style={{ top: windowHeight(5) }}>
							<BackLeft />
						</View>
					</TouchableOpacity>
					<Text style={[styles.text, { color: textColorStyle }]}>
						{details}
					</Text>
					<View style={[external.fd_row, external.ai_center]}>
						<View style={[external.mh_5]}>
							<IconBackground value={<Search color={iconColorStyle} />} />
						</View>
						<IconBackground value={<Heart />} />
					</View>
				</View>
			</View>
			<View style={{ height: windowHeight(260) }}>
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
		</>
	)
}
