import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  textContext: {
    ...commonStyles.H1Banner,
    color: appColors.titleText,
    fontFamily: 'semiBold',
    textAlign: 'center',
    fontSize: fontSizes.FONT30,
    color: appColors.screenBg,
    marginTop: windowHeight(10),
  },
  progressBar: {
    width: windowWidth(245),
    backgroundColor: appColors.bgLayer,
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
  allReview: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: appColors.bgLayer,
    paddingHorizontal: 10,
    borderRadius: windowHeight(4),
    paddingVertical: 5,
  },
  allReviewMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: appColors.bgLayer,
    paddingHorizontal: 10,
    borderRadius: windowHeight(4),
  },
  viewText: {
    ...external.mt_5,
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,
  },
  writeReview: {
    ...commonStyles.titleText19,
    color: appColors.primary,
    textDecorationLine: 'underline',
    marginTop: windowHeight(8),
    fontSize: fontSizes.FONT17,
  },
  titleText: {
    ...commonStyles.subtitleText,
    width: windowWidth(95),
    color: appColors.titleText,
  },
  ratingScreenView: {
    borderRadius: 10,
    borderColor: appColors.bgLayer,
    elevation: 1,
    margin: 1,
  },
  menuItemContent: {
    borderRadius: 10,
    marginTop: 20,
    borderColor: appColors.bgLayer,
    elevation: 1,
  },
  mapView: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mh_20,
    ...external.pt_10,
  },
})

export default styles
