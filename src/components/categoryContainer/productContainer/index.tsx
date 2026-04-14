import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { categoryData } from '@src/data/categoryData'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import styles from './style.css'

export function ProductContainer() {
	const { isDark, textColorStyle, linearColorStyle, t } = useValues()
	const colors: [string, string, ...string[]] = isDark
		? ['#3D3F45', '#45474B', '#2A2C32']
		: [appColors.screenBg, appColors.screenBg]
	const navigation = useNavigation<any>()

	if (categoryData.length === 0) {
		return (
			<View>
				<Text style={[{ color: textColorStyle }]}>No Data Found</Text>
			</View>
		)
	}

	const renderItem = ({ item }: any) => (
		<TouchableOpacity onPress={() => navigation.navigate('CategoryDetail')}>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={colors}
				style={[
					styles.container,
					{ shadowColor: appColors.shadowColor, borderRadius: 6 },
				]}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={[
						styles.menuItemContent,
						{ shadowColor: appColors.shadowColor },
					]}
				>
					{item.img ? (
						<Image style={styles.imgContainer} source={item.img} />
					) : (
						<Text>No Image</Text>
					)}
				</LinearGradient>
			</LinearGradient>
			<Text style={[styles.title, { color: textColorStyle }]}>
				{item.title ? t(item.title) : 'No Title'}
			</Text>
		</TouchableOpacity>
	)

	return (
		<View>
			<FlatList
				numColumns={4}
				data={categoryData}
				renderItem={renderItem}
				contentContainerStyle={[external.mt_10, external.mh_20]}
				keyExtractor={item => item.id.toString()}
			/>
		</View>
	)
}
