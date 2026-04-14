import { useValues } from '@/app/login'
import { Cart } from '@src/assets/icons/cart'
import { BottomContainer, HeadingCategory } from '@src/commonComponents'
import {
	DescText,
	IconContainer,
	KeyFeatureContainer,
	NewArrivalBigContainer,
	SliderDetailsTwo,
} from '@src/components'
import { newArrivalBigData } from '@src/data/homeScreenTwo'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowWidth } from '@src/themes/appConstant'
import { Plus } from '@src/utils/icon'
import React, { useState } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Row, Rows, Table, TableWrapper } from 'react-native-table-component'
import styles from './style.css'

interface TableData {
	tableData: string[][]
	tableHead?: string[]
}

interface ProductDetailTwoProps {
	navigation: {
		navigate: (screen: string) => void
	}
}

const tableData: TableData = {
	tableData: [
		['Brands', 'Zebronics'],
		['Model', 'ZEB-RETRO'],
		['Driver Size', '40mm'],
		['Dimensions', '181*181*89'],
		['Sensitivity', '105±3 dB | Microphone:-58dB'],
		['Frequency', '20hz to 20k hz'],
	],
}

export function ProductDetailTwo({ navigation }: ProductDetailTwoProps) {
	const [data, setData] = useState<TableData>(tableData)
	const { bgFullStyle, textColorStyle, isDark } = useValues()
	return (
		<View
			style={[commonStyles.commonContainer, { backgroundColor: bgFullStyle }]}
		>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View>
					<SliderDetailsTwo />
					<View
						style={
							([external.mh_20],
							{
								marginTop: windowWidth(60),
								paddingHorizontal: windowWidth(16),
							})
						}
					>
						<DescText />
					</View>
					<View style={styles.container}>
						<Table
							style={{ borderRadius: 10, overflow: 'hidden', width: '100%' }}
							borderStyle={{ borderWidth: 1, borderColor: '#EDF0FF' }}
						>
							<Row
								data={data.tableHead}
								flexArr={[1, 2, 2]}
								textStyle={styles.text}
							/>
							<TableWrapper>
								<Rows
									data={data.tableData}
									flexArr={[1, 2, 2]}
									style={styles.row}
									textStyle={[styles.text]}
								/>
							</TableWrapper>
						</Table>
					</View>

					<IconContainer />
					<KeyFeatureContainer />
					<NewArrivalBigContainer
						data={newArrivalBigData}
						horizontal={true}
						width={windowWidth(220)}
						style={{ left: windowWidth(10) }}
					/>
				</View>
			</ScrollView>
			<HeadingCategory />
			<View>
				<BottomContainer
					onPress={() => navigation.navigate('AddtocartOne')}
					leftValue={
						<View style={[external.fd_row, external.ai_center, external.mh_20]}>
							<View
								style={[external.mh_15, external.fd_row, external.ai_center]}
							>
								<Plus color={appColors.titleText} />
								<Text style={[styles.addToBeg, { color: textColorStyle }]}>
									Add to Bag
								</Text>
							</View>
						</View>
					}
					value={
						<TouchableOpacity
							onPress={() => navigation.navigate('AddtocartOne')}
							style={[external.fd_row, external.ai_center, external.pt_4]}
						>
							<Cart />
							<Text style={styles.buyNowText}>Buy Now</Text>
						</TouchableOpacity>
					}
				/>
			</View>
		</View>
	)
}
