import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    ...external.fd_row,
    ...external.pt_10,
    ...external.as_center,
  },
  flexView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: windowHeight(14),
  },
  imgStyle: {
    width: windowWidth(330),
    height: windowHeight(220),
    alignSelf: 'center',
  },
  bagIsEmptyText: {
    ...commonStyles.titleText19,
    ...external.ti_center,
    fontSize: fontSizes.FONT23,
  },
  bagisEmptySomething: {
    ...commonStyles.subtitleText,
    ...external.ti_center,
    ...external.mt_3,
    ...external.mb_20,
    fontSize: fontSizes.FONT19,
  },
})

export default styles
