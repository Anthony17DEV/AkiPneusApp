import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderColor: appColors.bgLayout,
    marginTop: windowHeight(10),
    borderRadius: windowHeight(6),
    borderColor: '#EDF0FF',
    borderWidth: windowHeight(0.2),
    height: windowHeight(30),
    backgroundColor: appColors.screenBg,
  },
  sortBycontainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewContainer: {
    height: '100%',
    width: 1,
    backgroundColor: appColors.bgLayer,
    marginHorizontal: windowHeight(20),
  },
  menuItemContent: {
    borderRadius: 6,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: windowHeight(24),
    height: windowHeight(30),
  },
})

export default styles
