import { StyleSheet } from 'react-native'
import appFonts from '../../../themes/appFonts'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  container: {
    height: windowHeight(114),
    width: '98%',
    marginHorizontal: windowWidth(27),
    paddingHorizontal: windowHeight(12),
    paddingTop: windowHeight(14),
    marginTop: windowHeight(10),
  },
  title: {
    fontFamily: 'LargeButtonMedium',
    color: appColors.screenBg,
    fontWeight: '600',
    fontSize: fontSizes.FONT21,
  },
  subtitle: {
    fontFamily: 'medium',
    color: appColors.screenBg,
    fontWeight: '600',
    fontSize: fontSizes.FONT17,
  },
  description: {
    fontFamily: 'Regular',
    color: appColors.screenBg,
    fontSize: fontSizes.FONT15,
  },
  actionText: {
    fontFamily: 'Regular',
    color: appColors.screenBg,
    fontSize: fontSizes.FONT19,
    textDecorationLine: 'underline',
    paddingTop: windowHeight(10),
  },
})
export { styles }
