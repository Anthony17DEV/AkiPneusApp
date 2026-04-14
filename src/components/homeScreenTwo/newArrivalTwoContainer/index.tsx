import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { YellowStar } from '@src/assets/icons/yellowStar'
import { HeadingCategory, PlusIcon } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowWidth } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
	ActivityIndicator,
	Image,
	ImageSourcePropType,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import styles from './style.css'

interface NewArrivalBigContainerProps {
	data: Array<{
		img: any
		title: string
		subtitle: string
		price: number
		rating: number
		id: number
	}>
	width?: number
	value?: string
	horizontal?: boolean
	numColumns?: number
	valueTwo?: string
	show?: boolean
	style?: object
	isLoading?: boolean
}

export function NewArrivalBigContainer({
	data,
	width,
	value,
	horizontal,
	numColumns,
	valueTwo,
	show,
	style,
	isLoading,
}: NewArrivalBigContainerProps) {
	const {
		bgFullStyle,
		textColorStyle,
		linearColorStyle,
		linearColorStyleTwo,
		isDark,
		isRTL,
		textRTLStyle,
		viewRTLStyle,
		t,
		currSymbol,
		currPrice,
	} = useValues()
	const color: string = isDark ? appColors.blackBg : '#F3F5FB'
	const navigation = useNavigation<any>()

	const renderItem = (item: {
		img: ImageSourcePropType
		title: string
		subtitle: string
		price: number
		rating: number
		id: number
	}) => (
		<View style={{ paddingHorizontal: windowWidth(12) }}>
			<TouchableOpacity
				activeOpacity={0.9}
				onPress={() => navigation.navigate('ProductDetailOne', { id: item.id })}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyleTwo}
					style={[
						styles.viewContainer,
						style,
						{ backgroundColor: bgFullStyle },
						{ width: width || windowWidth(200) },
					]}
				>
					<LinearGradient
						start={{ x: 0.0, y: 0.0 }}
						end={{ x: 0.0, y: 1.0 }}
						colors={linearColorStyle}
						style={styles.menuItemContent}
					>
						<View style={[styles.imgContainer, { backgroundColor: color }]}>
							<Image style={styles.img} source={item.img} />
						</View>
						<View style={styles.plusICon}>
							<PlusIcon />
						</View>
						<View style={[external.ph_10, external.pt_10]}>
							<Text
								style={[
									commonStyles.titleText19,
									{ color: textColorStyle },
									{ textAlign: textRTLStyle },
								]}
							>
								{t(item.title)}
							</Text>
							<Text
								style={[commonStyles.subtitleText, { textAlign: textRTLStyle }]}
							>
								{t(item.subtitle)}
							</Text>
							<View
								style={[
									external.fd_row,
									external.ai_center,
									{ flexDirection: viewRTLStyle },
								]}
							>
								<View style={[external.fg_1]}>
									<Text
										style={[
											commonStyles.H1Banner,
											{ color: textColorStyle },
											{ textAlign: textRTLStyle },
											{ fontFamily: 'semiBold' },
										]}
									>
										{currSymbol}
										{(currPrice * item.price).toFixed(2)}
									</Text>
								</View>
								<View
									style={[
										external.fd_row,
										external.ai_center,
										{ flexDirection: viewRTLStyle },
									]}
								>
									<YellowStar />
									<Text style={styles.ratingContainer}>{item.rating}</Text>
								</View>
							</View>
						</View>
					</LinearGradient>
				</LinearGradient>
			</TouchableOpacity>
		</View>
	)

	const renderEmpty = () => {
		if (isLoading) {
			return <ActivityIndicator size="large" color={appColors.primary} />
		}
		return (
			<Text style={[commonStyles.subtitleText, { textAlign: 'center' }]}>
				No Data Found
			</Text>
		)
	}

	return (
		<View>
			{show && (
				<View style={[external.mh_20, external.mt_15, { top: windowWidth(3) }]}>
					<HeadingCategory
						value={value}
						seeall={valueTwo || t('transData.seeAll')}
					/>
				</View>
			)}
			{horizontal ? (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{
						flexDirection: viewRTLStyle,
					}}
				>
					{data.length === 0
						? renderEmpty()
						: data.map(item => renderItem(item))}
				</ScrollView>
			) : (
				<View>
					{data.length === 0
						? renderEmpty()
						: data.map(item => renderItem(item))}
				</View>
			)}
		</View>
	)
}
