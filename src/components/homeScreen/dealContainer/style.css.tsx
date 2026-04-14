import { StyleSheet } from 'react-native'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  imgStyle: {
    width: windowWidth(198),
    height: windowHeight(140),
    marginTop: windowHeight(5),
    marginHorizontal: windowHeight(1),
  },
  textStyle: {
    ...commonStyles.subtitleText,
    textAlign: 'center',
    paddingTop: windowHeight(10),
  },
  priceContainer: {
    ...commonStyles.H1Banner,
    textAlign: 'center',
  },
  textTwoStyle: {
    textAlign: 'center',
    paddingTop: windowHeight(14),
    color: appColors.screenBg,
    fontFamily: 'sofiasansMedium',
    alignSelf: 'center',
    lineHeight: windowHeight(13),
    fontSize: fontSizes.FONT16,
    width: '80%',
  },
  priceContainerTwo: {
    fontSize: fontSizes.FONT17,
  },
})

export default styles
