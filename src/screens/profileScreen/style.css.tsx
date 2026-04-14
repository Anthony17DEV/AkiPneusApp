import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    marginVertical: windowHeight(7),

    flexDirection: 'row',
    borderColor: appColors.cardBorder,
    borderRadius: windowHeight(8),
    padding: 1,
    elevation: 1,
    shadowColor: appColors.shadowColor,
    margin: 1,
  },
  imgStyle: {
    width: windowWidth(97),
    height: windowHeight(58),
    resizeMode: 'contain',
  },
  viewContainer: {
    ...external.pt_15,
    ...external.ph_20,
    ...external.fx_1,
    backgroundColor: appColors.lightScreenBg,
  },
  titleText: {
    ...commonStyles.subtitleText,
    ...external.ph_10,
    color: appColors.titleText,

    fontSize: fontSizes.FONT18,
  },
  nameText: {
    ...commonStyles.H1Banner,
    ...external.ti_center,
    paddingTop: windowHeight(3),
    fontSize: fontSizes.FONT19,
    color: appColors.titleText,
  },
  grayBorder: {
    borderWidth: windowHeight(7),
    width: windowHeight(70),
    height: windowHeight(70),
    alignSelf: 'center',
    borderRadius: windowHeight(70),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#EBEEFD',
    marginTop: windowHeight(15),
  },
  primaryBorder: {
    borderWidth: 2,
    width: windowHeight(60),
    height: windowHeight(60),
    alignSelf: 'center',
    borderRadius: windowHeight(60),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: appColors.primary,
  },
  menuItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
})

export default styles
