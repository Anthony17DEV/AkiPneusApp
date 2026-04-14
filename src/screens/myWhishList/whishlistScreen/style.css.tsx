import { StyleSheet } from 'react-native'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    ...commonStyles.titleText19,
    color: appColors.primary,
    fontSize: fontSizes.FONT17,
  },
})

export default styles
