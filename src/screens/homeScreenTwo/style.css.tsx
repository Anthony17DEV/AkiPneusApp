import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.lightScreenBg,
    paddingBottom: windowHeight(14),
    paddingTop: windowHeight(20),
  },
})

export default styles
