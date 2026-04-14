import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,
    elevation: 10,
    backgroundColor: appColors.screenBg,
  },
  valueContainer: {
    backgroundColor: appColors.primary,
    height: windowHeight(48),
    borderTopLeftRadius: windowHeight(37),
    ...external.ai_center,
    ...external.js_center,
    width: windowWidth(260),
  },
  menuItemContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    ...external.js_space,
    overflow: 'hidden',
  },
})

export default styles
