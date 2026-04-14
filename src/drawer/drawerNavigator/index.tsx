import { useValues } from '@/app/login'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { MyTabs } from '@src/myTab'
import {
	AddtocartOne,
	AddToCartTwo,
	CategoryScreen,
	CategoryTwo,
	HomeScreenTwo,
	PageListScreen,
	ProductDetailOne,
	ProductDetailThree,
	ProductDetailTwo,
} from '@src/screens'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import React from 'react'
import { DrawerContent } from '../drawerContent'

const Drawer = createDrawerNavigator()

export function CustomDrawerNavigator() {
	const { isRTL } = useValues()

	return (
		<Drawer.Navigator
			initialRouteName="Home"
			drawerContent={props => <DrawerContent {...props} />}
			screenOptions={{
				drawerStyle: {
					width: windowWidth(290),
					borderTopRightRadius: 20,
					borderBottomEndRadius: isRTL ? 0 : windowWidth(30),
					borderBottomLeftRadius: isRTL ? windowHeight(18) : 0,
					borderTopEndRadius: windowHeight(14),
					borderTopStartRadius: windowHeight(14),
					overflow: 'hidden',
				},
				headerShown: false,
				drawerPosition: isRTL ? 'right' : 'left',
			}}
		>
			<Drawer.Screen name="Home" component={MyTabs} />
			<Drawer.Screen name="HomeScreenTwo" component={HomeScreenTwo} />
			<Drawer.Screen name="CategoryScreen" component={CategoryScreen} />
			<Drawer.Screen name="CategoryTwo" component={CategoryTwo} />
			<Drawer.Screen name="PageListScreen" component={PageListScreen} />
			<Drawer.Screen name="AddToCartTwo" component={AddToCartTwo} />
			<Drawer.Screen name="AddtocartOne" component={AddtocartOne} />
			<Drawer.Screen name="ProductDetailOne" component={ProductDetailOne} />
			<Drawer.Screen name="ProductDetailTwo" component={ProductDetailTwo} />
			<Drawer.Screen name="ProductDetailThree" component={ProductDetailThree} />
		</Drawer.Navigator>
	)
}
