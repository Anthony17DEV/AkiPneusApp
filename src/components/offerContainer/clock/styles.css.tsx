import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  timer: {
    backgroundColor: '#051E47',
    height: windowHeight(32),
    width: windowWidth(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: windowHeight(6),
    elevation: 10,
  },
})

export default styles
