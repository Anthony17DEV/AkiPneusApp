import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    ...external.fx_1,
    backgroundColor: appColors.lightScreenBg,
    paddingTop: windowHeight(20),
  },
  transformLine: {
    height: 10,
    width: windowWidth(120),
    left: -windowHeight(141),
  },
  subtitleText: {
    ...commonStyles.subtitleText,
    ...external.pt_5,
    lineHeight: windowHeight(15.5),
  },
})

export default styles
