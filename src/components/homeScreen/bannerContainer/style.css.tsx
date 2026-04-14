import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  imgStyle: {
    width: '100%',
    height: windowHeight(115),
  },
  viewContainer: {
    ...external.ph_20,
    ...external.mt_10,
    ...external.fd_row,
    ...external.ai_center,
  },
  activeText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    letterSpacing: -1.2,
    color: '#1FC7EC',
  },
  seriesText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    ...external.pt_15,
    color: '#FE881A',
  },
  fullScreenText: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    fontSize: fontSizes.FONT15,
  },
})

export default styles
