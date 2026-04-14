import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  circle: {
    width: windowWidth(20),
    height: windowHeight(14),
    borderRadius: windowHeight(17),
    right: windowHeight(3),
  },
  container: {
    width: windowWidth(57),
    height: windowHeight(20),
    borderRadius: windowHeight(14),
    ...external.p_5,
  },
})
export { styles }
