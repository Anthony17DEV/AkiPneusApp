import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  headingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: appColors.screenBg,
    width: windowWidth(130),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 1,
    marginHorizontal: 10,
    borderTopColor: appColors.bgLayout,
    padding: 1,
  },
  flexView: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: windowHeight(20),
  },
  singUpView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(11),
    alignItems: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    marginHorizontal: windowHeight(34),
  },
  container: {
    ...commonStyles.commonContainer,
    paddingHorizontal: windowHeight(14),
  },
  transformLine: {
    height: 10,
    width: windowWidth(320),
    left: -windowHeight(141),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
    fontSize: fontSizes.FONT17,
  },
  rememberText: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    ...external.fg_1,
    color: appColors.titleText,
    fontSize: fontSizes.FONT16,
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: appColors.shadowColor,
    paddingVertical: windowHeight(12),
  },
  signup: {},
})

export default styles
