import { useValues } from '@/app/login'
import { HeadingCategory } from '@src/commonComponents'
import { topBrandData } from '@src/data/homeScreen'
import { external } from '@src/style/external.css'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { ScrollView, View } from 'react-native'
import styles from './style.css'

export function TopBrandContainerTwo() {
	const { linearColorStyle, linearColorStyleTwo, t } = useValues()

	const renderItem = (item: any) => (
		<View key={item.id} style={[external.fd_row, external.ai_center]}>
			<LinearGradient
				start={{ x: 0.0, y: 0.0 }}
				end={{ x: 0.0, y: 1.0 }}
				colors={linearColorStyleTwo}
				style={[styles.viewStyle]}
			>
				<LinearGradient
					start={{ x: 0.0, y: 0.0 }}
					end={{ x: 0.0, y: 1.0 }}
					colors={linearColorStyle}
					style={styles.menuItemContent}
				>
					<View style={styles.brandIconContainer}>{item.icon}</View>
				</LinearGradient>
			</LinearGradient>
			<View style={styles.separator} />
		</View>
	)
	const chunkedData = []
	const columnCount = 3
	for (let i = 0; i < topBrandData.length; i += columnCount) {
		chunkedData.push(topBrandData.slice(i, i + columnCount))
	}

	return (
		<View style={styles.container}>
			<HeadingCategory value={t('transData.topBrands')} show={false} />
			<View style={styles.headingContainer}>
				<ScrollView>
					{chunkedData.map((row, rowIndex) => (
						<View style={external.fd_row} key={rowIndex}>
							{row.map(item => renderItem(item))}
						</View>
					))}
				</ScrollView>
			</View>
		</View>
	)
}
