import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  linearView: {
    ...external.fd_row,
    ...external.js_center,
    ...external.ai_center,
    ...external.mt_5,
  },
  linearBorderStyle: {
    width: '25%',
    height: windowHeight(1.5),
  },
  orText: {
    fontSize: fontSizes.FONT17,
    fontWeight: '400',
    ...external.m_10,
    color: appColors.subtitle,
    fontFamily: 'Regular',
  },
  orTextDark: {
    color: appColors.primary,
  },
})

export default styles
