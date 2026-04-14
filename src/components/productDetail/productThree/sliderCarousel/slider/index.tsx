import { useValues } from '@/app/login'
import React, { useEffect, useState } from 'react'
import {
	Animated,
	Dimensions,
	Image,
	ImageSourcePropType,
	View,
} from 'react-native'
import Carousel from 'react-native-reanimated-carousel'
import { sliderDataTwo } from '../../../../../data/productDetailBrand'
import { styles } from './styles'

const { width } = Dimensions.get('window')

interface SliderData {
	id: string
	images: ImageSourcePropType
}

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
		const progressValue = (index + 1) / sliderDataTwo.length
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
				data={sliderDataTwo}
				mode="parallax"
				loop={false}
				onSnapToItem={handleSnapToItem}
				renderItem={({ item, index }) => (
					<View style={{ flexDirection: viewRTLStyle, alignItems: 'center' }}>
						<View style={styles.item}>
							<Image source={item.images} style={styles.image} />
						</View>
						{index < sliderDataTwo.length - 1 && (
							<View
								style={[
									styles.previewContainer,
									{ width: width * 0.15, marginLeft: -20 },
								]}
							>
								<Image
									source={
										sliderDataTwo[
											(selectIndex + 1 + sliderDataTwo.length) %
											sliderDataTwo.length
										].images
									}
									style={[styles.previewImage, { opacity: 1 }]}
								/>
							</View>
						)}
					</View>
				)}
			/>
		</View>
	)
}
