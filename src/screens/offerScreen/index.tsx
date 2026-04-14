import { useValues } from '@/app/login'
import { HeaderContainer } from '@src/commonComponents'
import {
	TimerContainer,
	TopDealOffer,
	TrendingOffer,
	WatchBand,
} from '@src/components'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { Heart, Search } from '@src/utils/icon'
import React from 'react'
import { View } from 'react-native'

export function OfferScreen() {
	const { bgFullStyle, iconColorStyle, t } = useValues()

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.ph_20]}>
				<HeaderContainer
					value={t('transData.offers')}
					show={true}
					icon={<Heart />}
					iconTwo={<Search color={iconColorStyle} />}
				/>
				<TimerContainer />
				<TrendingOffer />
			</View>
			<TopDealOffer />
			<WatchBand />
		</View>
	)
}
