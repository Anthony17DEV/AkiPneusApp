import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { ErrorContainer } from '@src/commonComponents'
import { commonStyles } from '@src/style/commonStyle.css'
import images from '@src/utils/images'
import React, { useEffect } from 'react'
import { View } from 'react-native'

export function MyWhishList() {
	const navigation = useNavigation()
	const stackNavigation = () => {
		navigation.reset({
			index: 0,
			routes: [{ name: 'MyTabs' }],
		})
	}
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			navigation.navigate('WhishlitContainer')
		}, 1000)

		return () => clearTimeout(timeoutId)
	}, [navigation])
	const { t } = useValues()
	return (
		<View style={[commonStyles.commonContainer]}>
			<ErrorContainer
				Buttontitle={t('transData.addNow')}
				img={images.box}
				title={t('transData.whishlistEmpty')}
				headerTitle={t('transData.myWishlist')}
				Desc={t('transData.whishlistEmptyDesc')}
				onPress={stackNavigation}
			/>
		</View>
	)
}
