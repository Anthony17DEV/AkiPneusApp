import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  container: {
    width: windowHeight(25),
    height: windowHeight(25),
    borderRadius: windowHeight(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
