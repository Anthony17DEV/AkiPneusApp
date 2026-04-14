import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import {
	DealContainer,
	HeaderContainer,
	SearchContainer,
} from '@src/components/homeScreen/homeIndex'
import {
	CarouselContainer,
	NewArrivalBigContainer,
	SwiperProduct,
	TopBrandContainerTwo,
	WhosTrending,
} from '@src/components/homeScreenTwo/index'
import { justWatcheds } from '@src/constant'
import { dealDataTwo } from '@src/data'
import {
	justWatchedData,
	newArrivalBigData,
	topRatingData,
} from '@src/data/homeScreenTwo'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import React from 'react'
import { ScrollView } from 'react-native'
import styles from './style.css'

export function HomeScreenTwo() {
	const { bgFullStyle } = useValues()
	const navigation = useNavigation()
	const { t } = useValues()

	return (
		<ScrollView
			contentContainerStyle={[external.Pb_80]}
			style={[styles.container, { backgroundColor: bgFullStyle }]}
			showsVerticalScrollIndicator={false}
		>
			<HeaderContainer onPress={() => navigation.goBack()} />
			<SearchContainer show={true} />
			<CarouselContainer />
			<SwiperProduct />
			<NewArrivalBigContainer
				data={newArrivalBigData}
				value={t('transData.newArrival')}
				horizontal={true}
				show={true}
				style={{ left: windowHeight(7.5) }}
			/>
			<WhosTrending />
			<NewArrivalBigContainer
				data={topRatingData}
				value={t('transData.topRating')}
				horizontal={true}
				show={true}
				style={{ left: windowHeight(9) }}
			/>
			<DealContainer data={dealDataTwo} />
			<NewArrivalBigContainer
				data={justWatchedData}
				width={178}
				value={justWatcheds}
				horizontal={true}
				show={true}
				style={{ left: windowHeight(9) }}
			/>
			<TopBrandContainerTwo />
		</ScrollView>
	)
}
