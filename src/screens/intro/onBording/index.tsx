import { useValues } from '@/app/login'
import { BottomContainer } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { LeftSideArrow } from '@src/utils/icon'
import images from '@src/utils/images'
import React, { useRef, useState } from 'react'
import {
	Image,
	ImageBackground,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import Swiper from 'react-native-swiper'
import { skip } from '../../../constant'
import styles from './style.css'

const OnboardingSlide = ({
	imageSource,
	onNextPress,
	isLastSlide,
	backgroundColor,
	color,
	onPress,
}: any) => (
	<View style={styles.slide1}>
		<View style={styles.viewContainer}>
			<Image
				resizeMode="contain"
				style={styles.imgContainer}
				source={require('../../../assets/images/onboarding/smallLogoTwo.png')}
			/>
			<Image style={styles.imgSourceContainer} source={imageSource} />
		</View>

		<View style={[external.fx_1, external.js_end]}>
			<View
				style={[styles.bottomContainer, { backgroundColor: backgroundColor }]}
			>
				<Text style={[styles.title, { color: color }]}>
					Welcome to Your Favorite Store
				</Text>
				<Text style={[commonStyles.subtitleText, styles.description]}>
					Enjoy your life with a clear & good sound also with the best things.
				</Text>
				<View style={styles.bottomButtonContainer}>
					<BottomContainer
						leftValue={
							<TouchableOpacity
								onPress={onPress}
								style={styles.leftValueContainer}
							>
								<Text style={[commonStyles.subtitleText, styles.skipText]}>
									{skip}
								</Text>
							</TouchableOpacity>
						}
						value={
							<TouchableOpacity onPress={onNextPress}>
								<View style={styles.nextButtonContainer}>
									<Text style={[commonStyles.subtitleText, styles.nextText]}>
										{isLastSlide ? 'Go to Home' : 'Next'}
									</Text>
									<LeftSideArrow color={'white'} />
								</View>
							</TouchableOpacity>
						}
					/>
				</View>
			</View>
		</View>
	</View>
)

export function Onboarding({ navigation }: any) {
	const { isDark } = useValues()
	const swiperRef = useRef(null)
	const [currentIndex, setCurrentIndex] = useState(0)
	const slides = [
		images.onboardingImageTwo,
		images.onboardingImageThree,
		images.onboardingImageFour,
	]

	const handleNextPress = () => {
		if (currentIndex === slides.length - 1) {
			navigation.navigate('OnboardingTwo')
		} else {
			if (swiperRef.current) {
				swiperRef.current.scrollBy(1)
			}
		}
	}

	const handleIndexChanged = index => {
		setCurrentIndex(index)
	}
	const imagesDark = isDark ? images.onboardingDark : images.onboarding
	return (
		<View style={styles.container}>
			<View style={[external.fx_1]}>
				<ImageBackground
					resizeMode="stretch"
					style={styles.backgroundImage}
					source={imagesDark}
				>
					<Swiper
						autoplay={false}
						ref={swiperRef}
						bounces={false}
						style={styles.wrapper}
						onIndexChanged={handleIndexChanged}
						loop={false}
						showsPagination={false}
					>
						{slides.map((imageSource, index) => (
							<OnboardingSlide
								key={`slide-${index}`}
								imageSource={imageSource}
								onNextPress={handleNextPress}
								isLastSlide={index === slides.length - 1}
								backgroundColor={isDark ? '#1A1C22' : 'white'}
								color={isDark ? 'white' : appColors.primary}
								onPress={() => navigation.navigate('SignIn')}
							/>
						))}
					</Swiper>
				</ImageBackground>
			</View>
		</View>
	)
}
