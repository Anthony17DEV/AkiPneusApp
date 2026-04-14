import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import React from 'react'
import {
	ImageBackground,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import images from '../../utils/images'
import styles from './style.css'

export function VoucherCard() {
	const navigation = useNavigation<any>()

	const { viewRTLStyle } = useValues()
	const { isDark, textColorStyle } = useValues()
	const DarkImg = isDark ? images.darkApplyCode : images.applyCode
	return (
		<View style={[external.mh_20, external.mv_15]}>
			<ImageBackground
				resizeMode="stretch"
				style={[styles.container, { flexDirection: viewRTLStyle }]}
				source={DarkImg}
			>
				<TextInput
					style={[
						commonStyles.subtitleText,
						{
							fontSize: fontSizes.FONT18,
							color: textColorStyle,
							paddingHorizontal: windowHeight(15),
						},
					]}
				>
					#FIRSTORDER458ABC
				</TextInput>
				<TouchableOpacity onPress={() => navigation.navigate('VoucherScreen')}>
					<Text style={styles.applyNow}>Apply Now</Text>
				</TouchableOpacity>
			</ImageBackground>
		</View>
	)
}
