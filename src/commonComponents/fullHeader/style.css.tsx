import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'
import { windowHeight, fontSizes } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  cardContainer: {
    width: windowHeight(32),
    height: windowHeight(32),
    borderColor: '#EDF0FF',
    borderWidth: windowHeight(0.2),
    elevation: 1,
    borderRadius: windowHeight(6),
    ...external.ai_center,
    ...external.js_center,
    shadowColor: appColors.shadowColor,
  },
  menuItemContent: {
    borderRadius: windowHeight(6),
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
  },
  container: {
    ...external.mt_15,
    ...external.js_space,
    ...external.fd_row,
    ...external.ai_center,
  },
  titleText: {
    ...commonStyles.hederH2,
    fontSize: fontSizes.FONT21,
    paddingLeft: windowHeight(15),
  },
})

export default styles
