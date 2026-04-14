import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import {
	HeaderContainer,
	ProductContainer,
} from '@src/components/categoryContainer/index'
import { SearchContainer } from '@src/components/homeScreen/homeIndex'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import React, { useEffect } from 'react'
import { View } from 'react-native'

export function CategoryScreen() {
	const { bgFullStyle } = useValues()
	const navigation = useNavigation<any>()

	useEffect(() => {
		const back = () => {
			console.log('function called')

			if (navigation.canGoBack()) {
				navigation.goBack()
			} else {
				navigation.navigate('Home')
			}
		}
	}, [navigation])

	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<View style={[external.pt_10]}>
				<HeaderContainer />
			</View>
			<SearchContainer />
			<ProductContainer />
		</View>
	)
}
