import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  container: {
    ...external.mh_20,
    ...external.mt_10,
  },
  headingContainer: {
    backgroundColor: appColors.screenBg,
    borderColor: appColors.bgLayout,
    borderRadius: windowHeight(10),
    marginTop: windowHeight(10),
    elevation: 1,
    margin: 1,
  },
  separator: {
    height: '40%',
    width: 2,
    backgroundColor: appColors.bgLayout,
  },
  brandIconContainer: {
    height: windowHeight(32),
    width: windowWidth(100),
    marginHorizontal: windowHeight(14),
    marginTop: windowHeight(14),
  },
  viewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default styles
