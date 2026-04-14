import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  container: {
    width: windowWidth(87),
    height: windowHeight(56),
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: appColors.bgLayout,
    marginHorizontal: windowHeight(8.5),
    right: windowHeight(6),
    elevation: 1,
    padding: 1,
    overflow: 'hidden',
  },
  imgContainer: {
    width: windowWidth(60),
    height: windowHeight(35),
    resizeMode: 'stretch',
  },
  title: {
    ...commonStyles.subtitleText,
    ...external.ti_center,
    width: windowWidth(100),
    paddingVertical: 12,
    color: appColors.titleText,
    fontSize: fontSizes.FONT16,
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default styles
