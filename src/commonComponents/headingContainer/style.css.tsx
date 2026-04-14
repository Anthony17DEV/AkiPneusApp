import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { fontSizes } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    ...external.ai_center,
  },
  valueText: {
    fontSize: fontSizes.FONT21,
    fontWeight: '600',
    color: appColors.titleText,
    fontFamily: 'bold',
  },
  seeAllText: {
    color: appColors.primary,
    fontSize: fontSizes.FONT17,
    fontFamily: 'medium',
  },
})

export default styles
