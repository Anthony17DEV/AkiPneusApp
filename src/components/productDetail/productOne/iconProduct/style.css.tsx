import { StyleSheet } from 'react-native'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    borderRadius: windowHeight(8),
    elevation: 0.5,
    marginTop: windowHeight(10),
    padding: 1,
  },
  verticalLine: {
    height: '70%',
    width: 2,
    backgroundColor: appColors.subtitle,
  },
  deliveryIn: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: windowHeight(8),
    lineHeight: windowHeight(17),
  },

  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
  viewContainer: {
    backgroundColor: '#4D66FF',
    borderRadius: windowHeight(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: windowHeight(8),
    marginHorizontal: windowHeight(3),
    width: windowWidth(78),
    height: windowHeight(48),
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    width: '100%',
    flex: 1,
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowWidth(10),
  },
})

export default styles
