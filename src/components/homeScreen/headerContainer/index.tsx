import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { IconBackground } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import { Drawer, Heart, Notification, Offer } from '@src/utils/icon'
import images from '@src/utils/images'
import React from 'react'
import { Image, Text, View } from 'react-native'
import styles from './style.css'

interface HeaderContainerProps {
	onPress?: () => void
}

export function HeaderContainer({ onPress }: HeaderContainerProps) {
	const navigation = useNavigation<any>()

	const { textColorStyle, viewRTLStyle, t } = useValues()

	return (
		<View
			style={[
				external.fd_row,
				external.ai_center,
				external.js_space,
				external.ph_20,
				{ flexDirection: viewRTLStyle },
			]}
		>
			<View
				style={[
					external.fd_row,
					external.ai_center,
					{ flexDirection: viewRTLStyle },
				]}
			>
				<IconBackground value={<Drawer />} onPress={onPress} />
				<View style={[external.ml_5]}>
					<Text
						style={[
							commonStyles.titleText19,
							{ color: textColorStyle, top: windowHeight(3) },
						]}
					>
						{t('transData.hiSmitha')}
					</Text>
				</View>
				<Image style={styles.img} source={images.hifi} resizeMode="contain" />
			</View>
			<View style={[external.fd_row, external.ai_center]}>
				<IconBackground
					onPress={() => navigation.navigate('MyWhishList')}
					value={<Heart />}
				/>
				<View style={[external.mh_8]}>
					<IconBackground
						value={<Offer />}
						onPress={() => navigation.navigate('OfferScreen')}
					/>
				</View>
				<IconBackground
					onPress={() => navigation.navigate('NotificationScreen')}
					value={<Notification />}
				/>
			</View>
		</View>
	)
}
