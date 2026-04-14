import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Splash,
  Onboarding,
  OnboardingTwo,
  SignIn,
  ForgetPassword,
  SignUp,
  OtpVerification,
  ResetPassword,
  LoaderScreen,
  NotificationScreen,
  NotificationContainer,
  MyWhishList,
  WhishlitContainer,
  HomeScreenTwo,
  OfferScreen,
  ChangePasswordScreen,
  AddtocartOne,
  AddToCartTwo,
  ChangeAddressScreen,
  CheckoutScreen,
  ProductDetailOne,
  RatingScreen,
  CategoryTwo,
  VoucherScreen,
  CategoryDetail,
  ProductDetailTwo,
  OrderStatus,
  ProductDetailThree,
  AddressScreen,
  EditProfile,
  OrderHistory,
  PaymentScreen,
  Settings,
  PageListScreen,
  ProfileScreen,
  MyBeg,
  CategoryScreen,
} from '@src/screens'

import { DrawerScreen } from '@src/drawer'
import { MyTabs } from '@src/myTab'
import { CustomDrawerNavigator } from '@src/drawer/drawerNavigator'

const RootStack = createNativeStackNavigator()
export function MyStack() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Drawer" component={CustomDrawerNavigator} />
      <RootStack.Screen name="MyTabs" component={MyTabs} />
      <RootStack.Screen name="CategoryScreen" component={CategoryScreen} />

      <RootStack.Screen name="CategoryDetail" component={CategoryDetail} />
      <RootStack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
      />
      <RootStack.Screen
        name="NotificationContainer"
        component={NotificationContainer}
      />
      <RootStack.Screen name="MyWhishList" component={MyWhishList} />
      <RootStack.Screen
        name="WhishlitContainer"
        component={WhishlitContainer}
      />
      <RootStack.Screen name="EditProfile" component={EditProfile} />
      <RootStack.Screen name="OrderHistory" component={OrderHistory} />
      <RootStack.Screen name="HomeScreenTwo" component={HomeScreenTwo} />
      <RootStack.Screen name="OfferScreen" component={OfferScreen} />
      <RootStack.Screen name="Settings" component={Settings} />
      <RootStack.Screen name="PaymentScreen" component={PaymentScreen} />
      <RootStack.Screen
        name="ChangePasswordScreen"
        component={ChangePasswordScreen}
      />
      <RootStack.Screen name="AddressScreen" component={AddressScreen} />
      <RootStack.Screen name="AddtocartOne" component={AddtocartOne} />
      <RootStack.Screen name="AddToCartTwo" component={AddToCartTwo} />
      <RootStack.Screen
        name="ChangeAddressScreen"
        component={ChangeAddressScreen}
      />
      <RootStack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <RootStack.Screen name="ProductDetailOne" component={ProductDetailOne} />
      <RootStack.Screen name="RatingScreen" component={RatingScreen} />

      <RootStack.Screen name="CategoryTwo" component={CategoryTwo} />
      <RootStack.Screen name="VoucherScreen" component={VoucherScreen} />

      <RootStack.Screen name="ProfileScreen" component={ProfileScreen} />
      <RootStack.Screen name="MyBeg" component={MyBeg} />
      <RootStack.Screen name="ProductDetailTwo" component={ProductDetailTwo} />
      <RootStack.Screen
        name="ProductDetailThree"
        component={ProductDetailThree}
      />
    </RootStack.Navigator>
  )
}
