import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.screenBg,
  },
  imgStyle: {
    width: windowHeight(100),
    height: windowHeight(100),
    borderRadius: windowHeight(100),
  },
  imgStyleDark: {
    width: windowHeight(200),
    height: windowHeight(200),
    borderRadius: windowHeight(200),
  },

  gif: {
    resizeMode: 'contain',
    height: windowHeight(200),
    width: windowWidth(300),
    alignSelf: 'center',
    top: windowHeight(2),
  },
})

export default styles
