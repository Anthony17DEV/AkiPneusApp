import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  deleteText: {
    width: windowWidth(215),
    height: windowHeight(140),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
})
export { styles }
