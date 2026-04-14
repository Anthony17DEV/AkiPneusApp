import { StyleSheet } from 'react-native'
import appFonts from '../../../themes/appFonts'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  textContext: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: 'semiBold',
    textAlign: 'center',
    marginTop: windowHeight(9),
  },
  progressBar: {
    width: windowWidth(205),
    backgroundColor: '#E8EAEE',
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    ...external.mh_5,
  },
  progressBarPrimary: {
    backgroundColor: appColors.primary,
    height: windowHeight(3),
    borderRadius: windowHeight(4),
    ...external.ai_center,
    position: 'absolute',
    alignSelf: 'flex-start',
    width: windowWidth(150),
  },
  buyNowText: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT21,
    paddingHorizontal: windowHeight(7),
  },
  addToBeg: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT21,
    color: appColors.titleText,
    paddingHorizontal: windowHeight(3),
  },
  bottomContainerView: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  priceContainer: {
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: 'semiBold',
    lineHeight: 30,
  },
  percentageOff: {
    backgroundColor: '#FDDBDB',
    width: windowWidth(90),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    borderWidth: 1,
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(8),
    marginTop: windowHeight(10),
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
    elevation: 0.5,
    backgroundColor: appColors.screenBg,
  },
  verticalLine: {
    height: '70%',
    width: 2,
    backgroundColor: appColors.subtitle,
  },
  deliveryIn: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: windowHeight(8),
    lineHeight: windowHeight(17),
  },
  minus: {
    borderWidth: 1,
    width: windowWidth(165),
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: windowHeight(34),
    elevation: 1,
    backgroundColor: appColors.screenBg,
  },
  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  viewContainer: {
    backgroundColor: appColors.primary,
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight(8),
    marginHorizontal: windowHeight(3),
    width: windowWidth(78),
    height: windowHeight(48),
  },
  writeYourReview: {
    ...commonStyles.titleText19,
    ...external.ph_20,
    ...external.mt_5,
    color: appColors.primary,
    fontSize: fontSizes.FONT17,
  },
  outOfFive: {
    ...commonStyles.subtitleText,
    color: appColors.screenBg,
    lineHeight: 15,
    top: windowHeight(3),
  },
  fourPointOne: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontFamily: 'semiBold',
    lineHeight: windowHeight(17),
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  titleView: {
    ...commonStyles.subtitleText,
    width: 75,
    color: appColors.titleText,
  },
  ratingScreen: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mh_10,
    marginVertical: 3,
  },
})

export default styles
