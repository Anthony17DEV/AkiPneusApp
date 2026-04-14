import {
  Cards,
  Key,
  Location,
  LogOut,
  OrderHistory,
  Profile,
  Setting,
} from '@src/utils/icon'
export const profileData = [
  {
    id: 0,
    title: 'transData.myAccount',
    icon: <Profile />,
    screenName: 'EditProfile',
  },
  {
    id: 1,
    title: 'transData.manageDeliveryAddress',
    icon: <Location />,
    screenName: 'AddressScreen',
  },
  {
    id: 2,
    title: 'transData.orderHistory',
    icon: <OrderHistory />,
    screenName: 'OrderHistory',
  },
  {
    id: 3,
    title: 'transData.setting',
    icon: <Setting />,
    screenName: 'Settings',
  },
  {
    id: 4,
    title: 'transData.managePaymentMethod',
    icon: <Cards />,
    screenName: 'PaymentScreen',
  },
  {
    id: 5,
    title: 'transData.changePassword',
    icon: <Key width={24} height={24} />,
    screenName: 'ChangePasswordScreen',
  },
  {
    id: 6,
    title: 'transData.logOut',
    icon: <LogOut />,
    screenName: '',
  },
]
