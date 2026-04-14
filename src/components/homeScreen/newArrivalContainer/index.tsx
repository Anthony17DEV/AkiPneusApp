import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { YellowStar } from '@src/assets/icons/yellowStar'
import { HeadingCategory } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { MinusIcon, Plus, PlusRadial } from '@src/utils/icon'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
	Image,
	ImageSourcePropType,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import styles from './styles.css'

interface NewArrivalContainerProps {
	data: Array<{
		img: ImageSourcePropType
		title: string
		subtitle: string
		rating: number
		price: number
		underlinePrice: number
	}>
	value: string
	show: boolean
	showPlus: boolean
	marginTop?: number
}

export function NewArrivalContainer({
	data,
	value,
	show,
	showPlus,
	marginTop,
}: NewArrivalContainerProps) {
	const {
		linearColorStyle,
		textColorStyle,
		isDark,
		imageContainer,
		textRTLStyle,
		viewRTLStyle,
		t,
		linearColorStyleTwo,
		currSymbol,
		currPrice,
	} = useValues()
	const navigation = useNavigation<any>()

	const colors = isDark
		? (['#3D3F45', '#45474B', '#2A2C32'] as const)
		: ([appColors.screenBg, appColors.screenBg] as const)

	const renderItem = (item: {
		img: ImageSourcePropType
		title: string
		subtitle: string
		rating: number
		price: number
		underlinePrice: number
	}) => (
		<TouchableOpacity
			onPress={() => navigation.navigate('ProductDetailOne')}
			activeOpacity={0.9}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[
					styles.container,
					{ shadowColor: appColors.shadowColor },
					{ flexDirection: viewRTLStyle },
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
					]}
				>
					<View
						style={[styles.imageContainer, { backgroundColor: imageContainer }]}
					>
						<Image style={styles.image} source={item.img} />
					</View>
					<View style={styles.textContainer}>
						<View
							style={[styles.ratingContainer, { flexDirection: viewRTLStyle }]}
						>
							<Text
								style={[
									styles.title,
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
							>
								{t(item.title)}
							</Text>
							{showPlus && (
								<TouchableOpacity style={styles.ratingContainer}>
									<YellowStar />
									<Text style={[styles.ratingText]}>{item.rating}</Text>
								</TouchableOpacity>
							)}
						</View>
						<Text style={[styles.subtitle, { textAlign: textRTLStyle }]}>
							{t(item.subtitle)}
						</Text>
						<View
							style={[styles.priceContainer, { flexDirection: viewRTLStyle }]}
						>
							<View
								style={[
									external.fd_row,
									external.ai_center,
									{ width: '75%' },
									{ flexDirection: viewRTLStyle },
								]}
							>
								<Text style={[styles.price, { color: textColorStyle }]}>
									{currSymbol}
									{(currPrice * item.price).toFixed(2)}
								</Text>
								<Text style={[styles.underlinePrice]}>
									{currSymbol}
									{(currPrice * item.underlinePrice).toFixed(2)}
								</Text>
							</View>
							{showPlus ? (
								<LinearGradient
									style={[
										styles.linearBorderStyle,
										{
											alignItems: isRTL ? 'center' : 'center',
											justifyContent: 'center',
										},
									]}
									colors={['#5385FC', '#355FE9']}
								>
									<Plus />
								</LinearGradient>
							) : (
								<LinearGradient
									start={{ x: 0.0, y: 5.0 }}
									end={{ x: 5.0, y: 0.0 }}
									colors={linearColorStyleTwo}
									style={[
										styles.showLinear,
										{
											left: isRTL ? 0 : windowHeight(150),
											right: isRTL ? windowHeight(160) : 0,
										},
									]}
								>
									<PlusRadial />
									<Text
										style={[
											commonStyles.titleText19,
											{ fontFamily: 'semiBold' },
											{ color: textColorStyle },
										]}
									>
										1
									</Text>
									<MinusIcon />
								</LinearGradient>
							)}
						</View>
					</View>
				</LinearGradient>
			</LinearGradient>
		</TouchableOpacity>
	)

	const { isRTL } = useValues()

	return (
		<View style={styles.newArrivalContainer}>
			<View style={{ marginTop: marginTop || windowHeight(14) }}>
				{show && (
					<HeadingCategory value={value} seeall={t('transData.seeAll')} />
				)}
			</View>
			<View>
				{data.map((item, index) => (
					<React.Fragment key={index}>{renderItem(item)}</React.Fragment>
				))}
			</View>
		</View>
	)
}
