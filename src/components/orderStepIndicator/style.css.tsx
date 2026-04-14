import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: windowHeight(10),
    height: windowHeight(330),
    borderRadius: windowHeight(10),
  },
  stepIndicator: {
    paddingHorizontal: windowHeight(7),
  },
  lableContainer: {
    width: windowWidth(300),
  },
  lableText: {
    color: appColors.primary,
  },
})

export { styles }
