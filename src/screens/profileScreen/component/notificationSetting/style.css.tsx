import { StyleSheet } from 'react-native'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    ...external.fd_row,
    ...external.ai_center,
  },
  title: {
    ...commonStyles.subtitleText,
    color: appColors.titleText,
  },
  viewContainer: {
    ...external.fd_row,
    ...external.js_space,
    ...external.ai_center,
    ...external.mh_20,
    ...external.mb_15,
  },
  linearStyle: {
    backgroundColor: appColors.screenBg,
    ...external.mt_10,
    elevation: 2,
    borderRadius: windowHeight(10),
    marginHorizontal: 1,
  },
  darklinearStyle: {
    backgroundColor: appColors.screenBg,
    ...external.mt_10,
    elevation: 2,
    borderRadius: windowHeight(10),
    shadowColor: appColors.bgLayer,
  },
  themeView: {
    backgroundColor: appColors.screenBg,
    elevation: 2,
    borderRadius: windowHeight(10),
    marginTop: windowHeight(20),
    ...external.mv_5,
    marginHorizontal: 1,
  },
  titleText: {
    ...commonStyles.titleText19,
    ...external.ph_10,
    ...external.mt_5,
    ...external.mv_5,
  },
})
export { styles }
