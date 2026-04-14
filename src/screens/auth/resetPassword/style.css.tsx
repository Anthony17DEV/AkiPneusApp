import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  headingContainer: {
    flex: 1,
    backgroundColor: appColors.lightScreenBg,
    paddingHorizontal: windowHeight(14),
    paddingBottom: windowHeight(35),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
    fontSize: fontSizes.FONT17,
  },
  succesFullImg: {
    width: windowWidth(310),
    height: windowHeight(200),
    alignSelf: 'center',
  },
})

export default styles
