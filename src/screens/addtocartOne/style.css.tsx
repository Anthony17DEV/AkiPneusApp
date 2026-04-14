import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    height: windowHeight(55),
    backgroundColor: '#F3F5FB',
    marginVertical: windowHeight(14),
    borderRadius: windowHeight(6),
    padding: windowHeight(10),
    flexDirection: 'row',
    marginHorizontal: windowHeight(14),
  },
  changeText: {
    ...commonStyles.subtitleText,
    color: '#4D66FF',
    textDecorationLine: 'underline',
    paddingTop: windowHeight(10),
  },
  locationIcon: {
    width: windowWidth(63),
    height: windowHeight(35),
    backgroundColor: 'rgba(77, 102, 255, 0.10)',
    borderRadius: windowHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOut: {
    ...commonStyles.titleText19,
    color: appColors.screenBg,
    fontSize: fontSizes.FONT21,
    paddingHorizontal: windowHeight(7),
  },
  bottomContainerView: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  textContainer: {
    ...commonStyles.H1Banner,
    fontSize: fontSizes.FONT23,
    color: appColors.titleText,
    paddingHorizontal: windowHeight(14),
    top: windowHeight(3),
  },
})

export default styles
