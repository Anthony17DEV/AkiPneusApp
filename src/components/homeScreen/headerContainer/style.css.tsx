import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  img: {
    width: windowWidth(32),
    height: windowHeight(22),
    resizeMode: 'contain',
  },
})

export default styles
