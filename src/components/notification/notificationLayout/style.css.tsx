import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: appColors.bgLayer,
    marginTop: windowHeight(12),
    flexDirection: 'row',
    padding: 1,
    elevation: 1,
    margin: 1,
  },
  radiusView: {
    width: windowHeight(28),
    height: windowHeight(28),
    backgroundColor: '#E7E8ED',
    borderRadius: windowHeight(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleText: {
    ...commonStyles.subtitleText,
    ...external.mt_2,
    color: appColors.titleText,
    fontSize: fontSizes.FONT17,
    width: windowWidth(350),
    lineHeight: windowHeight(17),
  },
  time: {
    ...commonStyles.subtitleText,
    fontSize: fontSizes.FONT15,
    paddingTop: 3,
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
})

export default styles
