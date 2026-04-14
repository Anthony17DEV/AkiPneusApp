import appColors from '@src/themes/appColors'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  headingBox: {
    height: windowHeight(64),
    width: '100%',
    backgroundColor: appColors.primary,
    borderRadius: windowWidth(10),
    justifyContent: 'center',
    paddingHorizontal: windowWidth(25),
  },
  mainView: {
    marginVertical: windowHeight(30),
  },
  title: {
    fontSize: fontSizes.FONT22,
    color: '#FFFFFF',
    fontFamily: 'semiBold',
  },
  subTitle: {
    fontSize: fontSizes.FONT18,
    color: '#EEEEEE',
    fontFamily: 'regular',
  },
  view: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: windowHeight(5),
  },
  screenName: {
    fontSize: fontSizes.FONT20,
    color: '#000',
    fontFamily: 'medium',
  },
})

export default styles
