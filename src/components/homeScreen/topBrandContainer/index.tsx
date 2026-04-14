import { useValues } from '@/app/login'
import { HeadingCategory } from '@src/commonComponents'
import { topBrandData } from '@src/data/homeScreen'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import styles from './style.css'

interface TopBrandContainerProps {
	isLoading?: boolean
}

export function TopBrandContainer({
	isLoading = false,
}: TopBrandContainerProps) {
	const { linearColorStyle, isDark, isRTL, t } = useValues()

	const colors = isDark
		? (['#3F4146', '#26282D'] as const)
		: ([appColors.screenBg, appColors.screenBg] as const)

	const renderItem = ({ item }: any) => (
		<View
			style={{
				marginTop: windowHeight(0),
				top: windowHeight(0),
				alignSelf: 'center',
				alignContent: 'center',
				alignItems: 'center',
			}}
		>
			<LinearGradient
				start={{ x: 0.0, y: 5.0 }}
				end={{ x: 5.0, y: 0.0 }}
				style={styles.container}
				colors={colors}
			>
				<LinearGradient
					start={{ x: 0.0, y: 5.0 }}
					end={{ x: 5.0, y: 0.0 }}
					style={styles.menuItemContent}
					colors={linearColorStyle}
				>
					<View>{item.icon}</View>
				</LinearGradient>
			</LinearGradient>
		</View>
	)
	const renderEmpty = () => {
		return (
			<View style={{ flex: 1 }}>
				{isLoading ? (
					<ActivityIndicator size="large" color={appColors.primary} />
				) : (
					<Text>No Data Found</Text>
				)}
			</View>
		)
	}

	return (
		<View style={[external.mh_20]}>
			<View style={{ marginTop: windowHeight(15) }}>
				<HeadingCategory value={t('transData.topBrands')} show={false} />
			</View>
			<FlatList
				numColumns={3}
				data={topBrandData}
				renderItem={renderItem}
				inverted={isRTL ? true : false}
				keyExtractor={item => item.id.toString()}
				ListEmptyComponent={renderEmpty}
				scrollEnabled={false}
			/>
		</View>
	)
}
