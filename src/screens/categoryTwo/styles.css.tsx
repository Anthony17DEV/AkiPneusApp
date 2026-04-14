import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    flex: 1,
  },
  menuColumn: {
    flexDirection: 'column',
    marginTop: windowHeight(10),
    left: windowHeight(3),
  },
  menuItem: {
    width: windowHeight(100),
    height: windowHeight(50),
    justifyContent: 'center',
    alignItems: 'center',
    left: windowHeight(10),
    top: windowHeight(2),
  },
  selectedMenuItem: {
    backgroundColor: appColors.screenBg,
    elevation: 5,
    left: windowHeight(10),
    borderTopLeftRadius: windowHeight(10),
    borderBottomLeftRadius: 10,
    top: windowHeight(2),
  },
  menuItemText: {
    ...commonStyles.titleText19,
    alignSelf: 'flex-start',
    ...external.mh_10,
    color: appColors.subtitle,
    width: windowWidth(100),
  },
  menuItemTextSelect: {
    ...commonStyles.titleText19,
  },
  rightSideTextColor: {
    fontFamily: 'Regular',
    color: appColors.screenBg,
    fontSize: fontSizes.FONT20,
    ...external.as_center,
  },
  price: {
    color: appColors.primary,
    fontSize: fontSizes.FONT23,
    fontWeight: '500',
    ...external.as_center,
  },
  leftsideStyle: {
    width: windowWidth(200),
    height: windowHeight(42),
    ...external.ai_center,
    ...external.js_center,
    backgroundColor: appColors.layoutBg,
    borderRadius: windowHeight(8),
    ...external.mh_20,
  },
  rightsideStyle: {
    width: windowWidth(200),
    height: windowHeight(42),
    ...external.js_center,
    ...external.ai_center,
    ...external.js_center,
    backgroundColor: appColors.primary,
    borderRadius: windowHeight(8),
    ...external.mh_20,
  },
  settingsColumn: {
    marginTop: windowHeight(17),
    ...external.mh_20,
  },
})

export { styles }
