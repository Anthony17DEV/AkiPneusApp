import { useValues } from '@/app/login'
import { NavigationButton, VerticalLine } from '@src/commonComponents'
import {
	create_An_Account,
	i_Have_An_Account,
	skip
} from '@src/constant'
import { productImages, productImagesFront } from '@src/data'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import images from '@src/utils/images'
import React, { useEffect, useState } from 'react'
import {
	Image,
	ImageBackground,
	ImageSourcePropType,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import FlipCard from 'react-native-flip-card'
import { styles } from './style.css'

interface OnboardingTwoProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

export function OnboardingTwo({ navigation }: OnboardingTwoProps) {
	const [isFlipped, setIsFlipped] = useState<boolean>(false)

	useEffect(() => {
		const flipInterval = setInterval(() => {
			setIsFlipped(prevState => !prevState)
		}, 1500)

		return () => clearInterval(flipInterval)
	}, [])

	const renderFlipCards = (): JSX.Element[] => {
		const numberOfCards: number = 2
		const cards: JSX.Element[] = []
		const numberOfRows: number = Math.ceil(productImages.length / numberOfCards)

		for (let i: number = 0; i < numberOfRows; i++) {
			const row: JSX.Element[] = []
			for (let j: number = 0; j < numberOfCards; j++) {
				const index: number = i * numberOfCards + j
				if (index < productImages.length) {
					const isIndex1 = index === 1
					const isIndex2 = index === 2
					const isIndex3 = index === 3

					const imageStyle =
						isIndex1 || isIndex2 ? styles.smallImage : styles.imgStyle
					let additionalStyle = {}
					if (isIndex1) {
						additionalStyle = {
							marginTop: windowHeight(60),
							right: windowHeight(6),
						}
					} else if (isIndex2) {
						additionalStyle = {
							bottom: windowHeight(20),
							left: windowHeight(8),
						}
					} else if (isIndex3) {
						additionalStyle = {
							marginTop: windowHeight(58),
							left: windowHeight(0),
						}
					}
					row.push(
						<FlipCard
							key={index}
							style={styles.card}
							friction={10}
							perspective={2000}
							flipHorizontal={true}
							flipVertical={false}
							flip={isFlipped}
							clickable={true}
							onFlipEnd={() => { }}
							useNativeDriver={true}
						>
							<View style={styles.face}>
								<Image
									style={[imageStyle, additionalStyle]}
									source={productImagesFront[index].source}
								/>
							</View>
							<View style={styles.back}>
								<Image
									style={[imageStyle, additionalStyle]}
									source={productImages[index].source}
								/>
							</View>
						</FlipCard>,
					)
				}
			}
			cards.push(
				<View key={i} style={styles.rowStyle}>
					{row}
				</View>,
			)
		}

		return cards
	}

	const { bgFullStyle, isDark, textColorStyle } = useValues()
	const imageBg: ImageSourcePropType = isDark
		? images.onboardingTwoDark
		: images.onboardingTwo
	const imageBgSmall = isDark ? images.smallLogoTwo : images.smallLogo

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.fd_row, external.ai_center, external.js_center]}>
				<View style={[external.fg_8]}>
					<Image style={styles.smallLogo} source={imageBgSmall} />
				</View>
				<TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
					<Text style={[commonStyles.subtitleText, { bottom: '12%' }]}>
						{skip}
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.VerticalLineView}>
				<VerticalLine dynamicHeight={'145%'} />
				<View>
					<Text
						style={[
							commonStyles.H1Banner,
							{
								color: textColorStyle,
								fontSize: fontSizes.FONT30,
								height: 135,
								bottom: windowHeight(23.3),
								marginHorizontal: windowHeight(7),
							},
						]}
					>
						<Text style={{ color: isDark ? 'white' : 'black' }}>Discover </Text>
						<Text style={{ color: 'blue' }}>new </Text>
						<Text style={{ color: isDark ? 'white' : 'black' }}>upcoming </Text>
						<Text style={{ color: isDark ? 'white' : 'black' }}>things</Text>
					</Text>
				</View>
			</View>
			<ImageBackground style={styles.imageBg} source={imageBg}>
				<View style={styles.container}>{renderFlipCards()}</View>
			</ImageBackground>
			<View style={styles.navigationBtnView}>
				<View style={{ bottom: windowHeight(3.5) }}>
					<NavigationButton
						title={i_Have_An_Account}
						backgroundColor={appColors.primary}
						onPress={() => navigation.navigate('SignIn')}
						color={appColors.screenBg}
					/>
				</View>
				<View style={[external.mv_10]}>
					<NavigationButton
						title={create_An_Account}
						color={textColorStyle}
						borderColor={'#EDF0FF'}
						borderWidth={windowHeight(1.5)}
						onPress={() => navigation.navigate('SignUp')}
					/>
				</View>
			</View>
		</View>
	)
}
