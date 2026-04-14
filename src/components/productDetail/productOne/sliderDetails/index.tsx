import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { Search } from '@src/assets/icons/search'
import { IconBackground } from '@src/commonComponents'
import { details } from '@src/constant'
import { sliderData } from '@src/data'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import { BackLeft, Heart } from '@src/utils/icon'
import images from '@src/utils/images'
import React, { useState } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { sliderStyles } from './styles.css'

export function SliderDetails() {
	const [selected, setSelected] = useState(0)
	const [productImage, setProductImage] = useState(images.productImage)
	const { isDark, textColorStyle, iconColorStyle } = useValues()
	const colors = ['#97B086', '#EFA86F', '#4775F4', '#E2DF93']
	const navigation = useNavigation<any>()

	const renderItem = (item, index) => {
		const isSelected = item.id === selected
		return (
			<View style={[sliderStyles.sliderItemContainer]}>
				<TouchableOpacity
					onPress={() => {
						setSelected(index)
						setProductImage(item.images)
					}}
					style={
						isSelected
							? [
								sliderStyles.sliderItemSelected,
								{ backgroundColor: isDark ? '#1A1C22' : 'white' },
							]
							: [sliderStyles.sliderItemUnselected]
					}
				>
					<Image
						style={[
							sliderStyles.sliderImage,
							isSelected
								? sliderStyles.sliderImageSelected
								: sliderStyles.sliderImageUnselected,
						]}
						source={item.images}
					/>
				</TouchableOpacity>
			</View>
		)
	}

	return (
		<View
			style={[
				sliderStyles.container,
				{ backgroundColor: isDark ? '#202329' : '#F3F5FB' },
			]}
		>
			<View style={sliderStyles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<BackLeft />
				</TouchableOpacity>
				<Text
					style={[
						commonStyles.titleText19,
						sliderStyles.titleText,
						{ color: textColorStyle },
					]}
				>
					{details}
				</Text>
				<View style={sliderStyles.iconContainer}>
					<TouchableOpacity style={sliderStyles.iconMargin}>
						<IconBackground
							onPress={() => navigation.navigate('CategoryDetail')}
							value={<Search color={iconColorStyle} />}
						/>
					</TouchableOpacity>
					<IconBackground
						onPress={() => navigation.navigate('MyWhishList')}
						value={<Heart />}
					/>
				</View>
			</View>

			<View>
				{colors.map((color, index) => (
					<View
						key={index}
						style={[sliderStyles.colorMap, { backgroundColor: color }]}
					/>
				))}
			</View>
			<View style={{ height: windowHeight(5) }}>
				<Image
					source={images.circle}
					style={{
						alignSelf: 'center',
						height: windowHeight(80),
						resizeMode: 'cover',
						width: windowWidth(250),
					}}
				/>
			</View>

			<Image style={sliderStyles.productImage} source={productImage} />

			<Image
				style={sliderStyles.productImageTwo}
				source={images.productRound}
			/>

			{/* Replacing FlatList with .map and ScrollView */}
			{sliderData.length > 0 ? (
				<ScrollView
					horizontal
					contentContainerStyle={[
						external.as_center,
						{ marginTop: windowHeight(40) },
					]}
					showsHorizontalScrollIndicator={false}
				>
					{sliderData.map((item, index) => renderItem(item, index))}
				</ScrollView>
			) : (
				<Text
					style={{
						textAlign: 'center',
						marginTop: windowHeight(20),
						color: textColorStyle,
					}}
				>
					No data available
				</Text>
			)}
		</View>
	)
}
