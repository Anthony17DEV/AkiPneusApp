import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: windowHeight(85),
    marginTop: windowHeight(3),
  },
  offText: {
    transform: [{ rotate: '-90deg' }],
    color: appColors.screenBg,
    alignSelf: 'flex-start',
    fontFamily: 'semiBold',
    fontSize: fontSizes.FONT21,
    position: 'absolute',
    left: windowHeight(15),
    top: windowHeight(30),
  },
  viewText: {
    marginLeft: '20%',
    marginTop: windowHeight(10),
  },
  applyText: {
    ...commonStyles.subtitleText,
    left: windowHeight(9),
    top: windowHeight(9),
  },
  subtitleText: {
    ...commonStyles.subtitleText,
    width: windowWidth(290),
  },
  viewTitleText: {
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,

    ...commonStyles.H1Banner,
  },
  titleText: {
    ...commonStyles.subtitleText,
    color: appColors.titleText,
    fontSize: fontSizes.FONT19,
  },
})

export default styles
