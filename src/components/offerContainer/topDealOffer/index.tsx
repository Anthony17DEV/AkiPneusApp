import { useValues } from '@/app/login'
import { HeadingCategory } from '@src/commonComponents'
import { DealContainer } from '@src/components/homeScreen/homeIndex'
import { dealDataThree } from '@src/data/homeScreen'
import { external } from '@src/style/external.css'
import React from 'react'
import { View } from 'react-native'

export function TopDealOffer() {
	const { t } = useValues()
	return (
		<View>
			<View style={[external.mh_20, external.mt_30]}>
				<HeadingCategory value={t('transData.topDeal')} />
			</View>
			<DealContainer data={dealDataThree} show={true} />
		</View>
	)
}
