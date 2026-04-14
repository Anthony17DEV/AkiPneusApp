import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  singUpView: {
    flexDirection: 'row',
    marginTop: windowHeight(5),
    alignItems: 'center',
  },
  container: {
    ...commonStyles.commonContainer,
    paddingHorizontal: windowHeight(14),
  },
  otpTextInput: {
    backgroundColor: appColors.screenBg,
    elevation: 10,
    borderColor: '#4D66FF1A',
    borderWidth: windowHeight(1.5),
    borderRadius: windowHeight(2.5),
    width: windowWidth(65),
    height: windowHeight(43),
    borderBottomWidth: windowHeight(1.5),
    color: appColors.blackBg,
    textAlign: 'center',
    fontSize: fontSizes.FONT22,
    marginHorizontal: windowHeight(8.3),
  },
  viewOtp: {
    marginTop: windowHeight(3),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
    fontSize: fontSizes.FONT17,
  },
})

export default styles
