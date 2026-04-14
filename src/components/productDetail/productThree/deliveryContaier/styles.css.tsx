import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  refreshIcon: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    marginTop: windowHeight(10),
    paddingVertical: windowHeight(13),
    paddingHorizontal: windowHeight(15),
    backgroundColor: appColors.bgLayout,
  },
  upTofive: {
    ...commonStyles.titleText19,
    width: windowWidth(105),
    fontSize: fontSizes.FONT17,
    marginHorizontal: 10,
    lineHeight: windowHeight(17),
  },
  verticalLine: {
    height: '90%',
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
})

export default styles
