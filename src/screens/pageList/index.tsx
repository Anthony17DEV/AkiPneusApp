import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { RightArrow } from '@src/assets/icons/rightArrow'
import { HeaderContainer } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { pagesData } from './data'
import styles from './style'

export function PageListScreen() {
	const { t, bgFullStyle, isDark, isRTL } = useValues()

	const navigation = useNavigation<any>()

	const back = () => {
		if (navigation.canGoBack()) {
			navigation.goBack()
		} else {
		}
	}

	const CommonHeading = ({
		title,
		subTitle,
	}: {
		title: string
		subTitle?: string
	}) => {
		return (
			<View style={styles.mainView}>
				<View style={styles.headingBox}>
					<Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>
						{title}
					</Text>
					{subTitle && (
						<Text
							style={[styles.subTitle, { textAlign: isRTL ? 'right' : 'left' }]}
						>
							{subTitle}
						</Text>
					)}
				</View>
			</View>
		)
	}

	const handlePagePress = (screen: string | undefined) => {
		if (!screen) {
			console.log('No screen found!')
			return
		}
		console.log('Navigating to:', screen)
		navigation.navigate(screen)
	}

	return (
		<View
			style={[
				commonStyles.commonContainer,
				{ backgroundColor: bgFullStyle, paddingBottom: windowHeight(50) },
			]}
		>
			<View style={[external.mh_20]}>
				<HeaderContainer value={t('transData.page')} onPress={back} />
				<ScrollView showsVerticalScrollIndicator={false}>
					{pagesData.map((item, index) => (
						<View key={item.title + index}>
							<CommonHeading
								title={t(item.title)}
								subTitle={t(item.subtitle)}
							/>
							{item.innerPages.map((innerItem, innerIndex) => (
								<TouchableOpacity
									key={innerItem.screen + innerIndex}
									style={[
										styles.view,
										{ flexDirection: isRTL ? 'row-reverse' : 'row' },
									]}
									onPress={() => handlePagePress(innerItem.screen)}
								>
									<Text
										style={[
											styles.screenName,
											{ color: isDark ? '#FFF' : '#000' },
											{ textAlign: isRTL ? 'right' : 'left' },
										]}
									>
										{t(innerItem.title)}
									</Text>
									<RightArrow
										style={{ transform: isRTL ? [{ rotateY: '180deg' }] : [] }}
									/>
								</TouchableOpacity>
							))}
						</View>
					))}
				</ScrollView>
			</View>
		</View>
	)
}
