import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    width: windowWidth(50),
    height: windowHeight(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    padding: 1,
    overflow: 'hidden',
    margin: 1,
    elevation: 1.5,
    borderWidth: windowHeight(0.4),
    borderColor: '#EDF0FF',
    shadowColor: appColors.shadowColor,
  },
  menuItemContent: {
    borderRadius: 6,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
  },
})

export default styles
