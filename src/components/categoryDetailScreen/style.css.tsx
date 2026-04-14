import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

export const styles = StyleSheet.create({
  container: {
    height: '95%',
    borderWidth: windowHeight(0.5),
    width: windowWidth(298),
    marginTop: windowHeight(12.4),
    borderLeftColor: '#EDF0FF',
    borderTopColor: '#EDF0FF',
    borderRightColor: '#EDF0FF',
    borderBottomColor: '#EDF0FF',
    paddingTop: windowHeight(10),
    left: windowHeight(4.5),
    elevation: 3,
    shadowColor: appColors.shadowColor,
  },
  linearGradient: {
    width: windowWidth(75),
    height: windowHeight(50),
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    top: windowHeight(6),
    marginHorizontal: windowHeight(6),
    elevation: 5,
    borderRadius: windowHeight(4),
    shadowColor: appColors.shadowColor,
    borderColor: '#EDF0FF',
  },
})
