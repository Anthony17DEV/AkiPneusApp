import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { HeaderContainer } from '@src/commonComponents'
import { apply, myCoupon, off } from '@src/constant'
import { voucherData } from '@src/data'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import React from 'react'
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

export function VoucherScreen() {
	const navigation = useNavigation<any>()
	const { bgFullStyle, isDark, textColorStyle } = useValues()
	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.ph_20]}>
				<HeaderContainer value={myCoupon} />
			</View>
			{voucherData.map((item, index) => (
				<View key={index}>
					<ImageBackground
						style={styles.img}
						source={isDark ? item.imgDark : item.img}
					>
						<Text
							style={[
								styles.offText,
								{
									color: item.textColor
										? appColors.bgLayer
										: appColors.subtitle,
								},
							]}
						>
							{item.off}
							<Text
								style={[
									commonStyles.titleText19,
									{
										color: item.textColor
											? appColors.bgLayer
											: appColors.subtitle,
									},
								]}
							>
								{off}
							</Text>
						</Text>
						<View style={styles.viewText}>
							<View style={styles.viewTitleText}>
								<Text style={[styles.viewTitleText, { color: textColorStyle }]}>
									{item.title}
								</Text>
								<View style={{ marginRight: windowHeight(23) }}>
									{item.icon}
								</View>
							</View>
							<View style={[external.fd_row, external.ai_center]}>
								<Text style={styles.subtitleText}>
									{item.subtitle}
									{''}
									<Text
										style={{
											color: item.textColor
												? textColorStyle
												: appColors.subtitle,
										}}
									>
										{item.voucherCode}
									</Text>
								</Text>
								<TouchableOpacity onPress={() => navigation.goBack()}>
									<Text
										style={[
											styles.applyText,
											{
												color: item.textColor
													? appColors.primary
													: appColors.subtitle,
											},
										]}
									>
										{apply}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ImageBackground>
				</View>
			))}
		</View>
	)
}
