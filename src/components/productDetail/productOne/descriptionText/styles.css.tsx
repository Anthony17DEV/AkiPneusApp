import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  minus: {
    borderWidth: 1,
    width: windowWidth(165),
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: windowHeight(34),
    elevation: 1,
    backgroundColor: appColors.screenBg,
  },
  cardContainer: {
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: windowHeight(35),
    elevation: 1,

    width: windowWidth(159),
    margin: 1,
  },
  menuItemContent: {
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: windowHeight(34),
    width: windowWidth(158),
    padding: 1,
  },
})

export default styles
