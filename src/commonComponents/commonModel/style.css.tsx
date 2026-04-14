import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...external.js_end,
    ...external.ai_center,
    backgroundColor: appColors.modelBg,
  },
  valueBar: {
    backgroundColor: appColors.screenBg,
    width: '100%',
    paddingVertical: windowHeight(14),
    borderRadius: 10,
    paddingHorizontal: windowHeight(14),
  },
})

export { styles }
