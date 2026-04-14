import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  container: {
    borderWidth: 0.3,
    marginHorizontal: windowWidth(25),
    marginTop: windowHeight(10),
    borderRadius: 8,
    borderColor: appColors.cardBorder,
    backgroundColor: appColors.screenBg,
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(10),
  },
  viewContainer: {
    marginTop: 15,
    borderRadius: 10,
    borderColor: appColors.solideLine,
    backgroundColor: appColors.screenBg,
    padding: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  payNowText: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT21,
    paddingHorizontal: windowHeight(7),
  },
  priceText: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT23,
    color: appColors.titleText,
    paddingHorizontal: windowHeight(14),
    top: windowHeight(3),
  },
  titleBooks: {
    ...commonStyles.subtitleText,
    ...external.ph_10,
    fontSize: fontSizes.FONT18,
    color: appColors.titleText,
    flexGrow: 0.96,
  },
  otherPaymentModeText: {
    backgroundColor: appColors.screenBg,
    marginVertical: windowHeight(7),
    top: windowHeight(10),
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  imgContainer: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  imgGround: {
    width: 34,
    height: 27,
    resizeMode: 'contain',
  },
  addnewCard: {
    ...commonStyles.titleText19,
    ...external.mh_15,
    ...external.mt_10,
    color: '#4D66FF',
    fontSize: fontSizes.FONT19,
    textDecorationLine: 'underline',
  },
  imgStyle: {
    width: windowWidth(310),
    height: windowHeight(200),
    alignSelf: 'center',
  },
  succesfullImg: {
    width: windowWidth(310),
    height: windowHeight(200),
    alignSelf: 'center',
  },
  menuItemContent: {
    borderRadius: 6,
    width: '100%',
  },
  menuItemContentTwo: {
    borderRadius: 10,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
})

export { styles }
