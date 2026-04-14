import { useValues } from '@/app/login'
import appColors from '@src/themes/appColors'
import { BlurView } from 'expo-blur'
import React, { useEffect, useState } from 'react'
import { Animated, Dimensions, Image, View } from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { sliderData } from '../../../../../data/productDetailBrand'
import { styles } from './styles'

const { width } = Dimensions.get('window')

export function Slider() {
	const { isDark, viewRTLStyle } = useValues()
	const [progress, setProgress] = useState(new Animated.Value(0))
	const barWidth = width - 200

	const [selectIndex, setSelectedIndex] = useState(0)

	const handleSnapToItem = index => {
		setSelectedIndex(index)
		startAnim(index)
	}

	useEffect(() => {
		startAnim(selectIndex)
	}, [])

	const startAnim = index => {
		const progressValue = (index + 1) / sliderData.length
		Animated.timing(progress, {
			toValue: progressValue * barWidth,
			duration: 500,
			useNativeDriver: false,
		}).start()
	}

	return (
		<View style={styles.container}>
			<Carousel
				width={width * 0.8}
				height={250}
				style={{ paddingHorizontal: (width - width * 0.8) / 2 }}
				data={sliderData}
				mode="parallax"
				loop={false}
				onSnapToItem={handleSnapToItem}
				renderItem={({ item, index }) => (
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<View style={styles.item}>
							<Image source={item.images} style={styles.image} />
						</View>
						{index < sliderData.length - 1 && (
							<BlurView
								intensity={80}
								style={[
									styles.previewContainer,
									{ width: width * 0.3, marginLeft: -20 },
								]}
							>
								<Image
									source={
										sliderData[
											(selectIndex + 1 + sliderData.length) % sliderData.length
										].images
									}
									style={[styles.previewImage, { opacity: 0.5 }]}
								/>
							</BlurView>
						)}
					</View>
				)}
			/>

			<View style={[{ flexDirection: viewRTLStyle, width: '100%' }]}>
				<View
					style={[
						styles.barContainer,
						{
							width: barWidth,
							backgroundColor: isDark
								? appColors.darkScreenBg
								: appColors.screenBg,
						},
					]}
				>
					<Animated.View
						style={[
							styles.bar,
							{
								width: progress,
								backgroundColor: isDark
									? appColors.screenBg
									: appColors.primary,
							},
						]}
					/>
				</View>
			</View>
		</View>
	)
}
