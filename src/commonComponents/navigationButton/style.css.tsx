import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  linearGradient: {
    borderRadius: windowHeight(35),
    height: windowHeight(40),
    ...external.js_center,
    backgroundColor: appColors.subtitle,
    width: '99%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#d1d6de',
    ...external.ti_center,
    height: windowHeight(19),
    fontSize: fontSizes.FONT20,
  },
  buttonTextLarge: {
    ...commonStyles.titleText19,
    ...external.ti_center,
  },
  icon: {
    ...external.fd_row,
    ...external.as_center,
  },
  cardContainer: {
    borderRadius: windowHeight(35),
    height: windowHeight(40),
    ...external.js_center,
    backgroundColor: appColors.subtitle,
    width: '100%',
    alignItems: 'center',
    margin: 1,
  },
  menuItemContent: {
    borderRadius: windowHeight(35),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
    height: windowHeight(40),
  },
})

export default styles
