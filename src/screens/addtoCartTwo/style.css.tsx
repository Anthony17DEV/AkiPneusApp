import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  dashBoardView: {
    width: '40%',
    top: windowHeight(3),
    flexGrow: 1,
    alignSelf: 'center',
    marginLeft: windowWidth(12),
    marginRight: windowHeight(8),
  },
  textPrice: {
    textAlign: 'right',
    fontSize: fontSizes.FONT19,
    color: appColors.subtitle,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: windowHeight(8),
    marginTop: windowHeight(8),
    marginVertical: windowHeight(2),
  },
  deliveryLocation: {
    fontSize: fontSizes.FONT21,
    fontWeight: '600',
    color: appColors.titleText,
    fontFamily: 'bold',
    paddingHorizontal: windowHeight(14),
    paddingTop: windowHeight(14),
  },
  orderInfo: {
    fontSize: fontSizes.FONT21,
    fontWeight: '600',
    color: appColors.titleText,
    fontFamily: 'bold',
    paddingHorizontal: windowHeight(14),
    paddingTop: windowHeight(14),
  },
  viewText: {
    ...external.mt_12,
    ...external.mh_20,

    borderWidth: 1,
    borderRadius: windowHeight(10),
    borderColor: appColors.bgLayout,
  },
  viewStyle: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  checkOut: {
    color: appColors.screenBg,
    paddingHorizontal: 5,
    fontSize: fontSizes.FONT19,
    lineHeight: windowHeight(21),
    fontFamily: 'medium',
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',
  },
})

export default styles
