import { commonStyles } from '@src/style/commonStyle.css'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'

const { StyleSheet } = require('react-native')

const styles = StyleSheet.create({
  container: {
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(10),
    marginTop: windowHeight(10),
  },
  containerTwo: {
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(10),
  },
  subtitle: {
    ...commonStyles.subtitleText,
    width: 256,
    color: appColors.titleText,
    fontFamily: 'thin',
  },
  img: {
    width: 37,
    height: 37,
  },
})
export { styles }
