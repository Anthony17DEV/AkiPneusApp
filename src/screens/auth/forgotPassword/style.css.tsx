import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    ...commonStyles.commonContainer,
    paddingHorizontal: windowHeight(14),
  },
  headingContainer: {
    flex: 1,
    backgroundColor: appColors.lightScreenBg,
    paddingHorizontal: windowHeight(14),
    paddingBottom: 50,
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
    fontSize: fontSizes.FONT17,
  },
})

export default styles
