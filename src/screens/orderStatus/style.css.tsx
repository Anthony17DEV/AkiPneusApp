import { StyleSheet } from 'react-native'
import appFonts from '../../themes/appFonts'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  text: {
    fontSize: fontSizes.FONT20,
    color: appColors.titleText,
    fontFamily: 'semiBold',
  },
  imgView: {
    width: windowWidth(108),
    height: windowHeight(70),
    backgroundColor: '#F3F5FB',
    marginHorizontal: 10,
    borderRadius: windowHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  img: {
    width: windowWidth(86),
    height: windowHeight(48),
    resizeMode: 'contain',
  },
  trackOrderView: {
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,
    ...external.ph_10,
    ...external.pt_10,
    ...external.Pb_5,
  },
  whiteContainer: {
    borderRadius: windowHeight(8),
    backgroundColor: appColors.screenBg,
    marginTop: windowHeight(20),
    padding: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  expectedData: {
    ...commonStyles.titleText19,
    ...external.ti_center,
    ...external.mt_2,
    fontSize: fontSizes.FONT24,
  },
  expectedDataStyle: {
    ...commonStyles.subtitleText,
    ...external.ti_center,
    fontSize: fontSizes.FONT15,
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    width: '100%',
  },
})

export default styles
