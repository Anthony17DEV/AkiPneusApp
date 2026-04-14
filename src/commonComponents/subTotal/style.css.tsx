import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    backgroundColor: appColors.screenBg,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: windowHeight(6),
    padding: 1,
    elevation: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    borderRadius: windowHeight(6),
    width: '100%',
    flex: 1,
    paddingVertical: windowHeight(10),
  },
})
export { styles }
