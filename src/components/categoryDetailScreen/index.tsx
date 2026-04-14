import { useValues } from '@/app/login'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import {
	ActivityIndicator,
	Image,
	Text,
	View
} from 'react-native'
import { styles } from './style.css'

interface CategoryDetailScreenProps {
	data: Array<{ icon: JSX.Element; images: any }>
	number?: string | number
	isLoading?: boolean
}

export function CategoryDetailScreen({
	data,
	number,
	isLoading = false,
}: CategoryDetailScreenProps) {
	const { linearColorStyle, isDark, bgFullStyle, viewRTLStyle } = useValues()

	const renderItem = (
		item: { icon: JSX.Element; images: any },
		index: number,
	) => (
		<View
			key={index}
			style={{ flex: 1, alignItems: 'center', marginBottom: 10 }}
		>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyle}
				style={styles.linearGradient}
			>
				{item.icon}
			</LinearGradient>
			<Image
				source={item.images}
				style={{ width: 100, height: 100, marginTop: 5 }}
			/>
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

	const chunkData = (array: any[], size: number) => {
		const result: any[] = []
		for (let i = 0; i < array.length; i += size) {
			result.push(array.slice(i, i + size))
		}
		return result
	}

	const chunkedData = chunkData(data, 3)

	return (
		<View
			style={[
				styles.container,
				{ borderColor: isDark ? appColors.solidDark : '#EDF0FF' },
				{ backgroundColor: bgFullStyle },
			]}
		>
			{data.length === 0
				? renderEmpty()
				: chunkedData.map((row, rowIndex) => (
					<View
						key={rowIndex}
						style={{
							flexDirection: viewRTLStyle,
							justifyContent: 'space-around',
							height: windowHeight(70),
						}}
					>
						{row.map((item, index) => renderItem(item, index))}
					</View>
				))}
		</View>
	)
}
