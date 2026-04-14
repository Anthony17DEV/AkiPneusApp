import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { external } from './external.css'
import appColors from '@src/themes/appColors'

const commonStyles = StyleSheet.create({
  container: {
    fontWeight: '500',
    fontSize: fontSizes.FONT27,
    lineHeight: windowHeight(23),
    color: appColors.titleText,
    fontFamily: 'LargeButtonMedium',
  },
  subtitleText: {
    fontSize: fontSizes.FONT17,
    lineHeight: windowHeight(18),
    color: '#9BA6B8',
    fontFamily: 'Regular',
  },
  titleText19: {
    fontSize: fontSizes.FONT19,
    lineHeight: windowHeight(21),
    color: appColors.titleText,
    fontFamily: 'medium',
  },
  H1Banner: {
    fontSize: fontSizes.FONT21,
    lineHeight: windowHeight(21),
    color: appColors.screenBg,
    fontFamily: 'medium',
  },
  hederH2: {
    fontSize: fontSizes.FONT21,
    lineHeight: windowHeight(21),
    color: appColors.titleText,
    fontFamily: 'medium',
  },
  commonContainer: {
    ...external.fx_1,
    backgroundColor: appColors.lightScreenBg,
  },
})
export { commonStyles }
