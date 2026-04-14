import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    right: windowWidth(120),
  },
  headerContent: {
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  bgImage: {
    height: windowHeight(30),
    width: windowWidth(80),
    resizeMode: 'contain',
    marginLeft: windowWidth(9),
    marginTop: windowHeight(9),
  },
})
export { styles }
