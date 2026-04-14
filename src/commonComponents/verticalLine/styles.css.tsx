import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  verticalLine: {
    height: '100%',
    width: windowWidth(4),
    backgroundColor: '#4D66FF',
    marginHorizontal: windowHeight(5),
    borderRadius: 10,
  },
})
export { styles }
