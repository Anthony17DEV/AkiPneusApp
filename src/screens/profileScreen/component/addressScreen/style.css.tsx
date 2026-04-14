import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  container: {
    marginTop: windowHeight(14),
    borderRadius: windowHeight(8),
    shadowColor: appColors.shadowColor,
    elevation: 1,
    marginHorizontal: 1,
    marginBottom: 1,
  },
  viewContainer: {
    flexDirection: 'row',
    marginHorizontal: windowHeight(14),
    marginTop: windowHeight(12),
  },
  addressItem: {
    ...commonStyles.subtitleText,
    ...external.ph_20,
    ...external.pt_5,
    color: appColors.titleText,
  },
  monoText: {
    ...external.fd_row,
    ...external.ai_center,
    ...external.mt_5,
    ...external.ph_20,
  },
  defaulText: {
    ...external.fd_row,
    ...external.mh_20,
    ...external.mt_10,
    ...external.mb_5,
  },
  removeText: {
    ...commonStyles.titleText19,
    color: appColors.primary,
    fontSize: fontSizes.FONT17,
    textDecorationLine: 'underline',
  },
  deleteText: {
    width: windowWidth(215),
    height: windowHeight(140),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    resizeMode: 'contain',
  },
  defaulTextView: {
    ...commonStyles.subtitleText,
    ...external.mh_5,
    color: appColors.titleText,
    flexGrow: 1,
  },
})

export default styles
