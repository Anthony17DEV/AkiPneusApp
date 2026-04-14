import { StyleSheet } from 'react-native'
import appFonts from '../../../themes/appFonts'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
const styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    height: windowHeight(130),
    marginTop: 10,
  },
  text: {
    fontFamily: 'LargeButtonMedium',
    fontSize: fontSizes.FONT27,
    color: appColors.screenBg,
    width: windowWidth(295),
    paddingTop: windowHeight(12),
    lineHeight: windowHeight(19),
  },
  subText: {
    fontFamily: 'LargeButtonMedium',
    fontSize: fontSizes.FONT21,
  },
  subTitleText: {
    ...commonStyles.subtitleText,
  },
  productImage: {
    width: '50%',
    height: '90%',
    alignSelf: 'flex-end',
    top: -windowHeight(70),
    right: windowHeight(10),
  },
  shopButton: {
    backgroundColor: appColors.screenBg,
    width: windowWidth(150),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: windowHeight(5),
    marginHorizontal: windowHeight(14),
    height: windowHeight(29),
    marginTop: windowHeight(17),
    flexDirection: 'row',
  },
})
export { styles }
