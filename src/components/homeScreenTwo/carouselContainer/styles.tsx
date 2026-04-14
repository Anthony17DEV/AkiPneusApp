import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagerView: {
    height: 210,
    width: windowHeight(300),
    marginTop: windowHeight(10),
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: windowHeight(10),
  },
  mh_20: {
    marginHorizontal: windowHeight(16),
  },
  imageBackground: {
    width: '100%',
    height: windowHeight(165),
    borderRadius: 10,
    overflow: 'hidden',
    right: windowHeight(2),
  },
  shopNow: {
    color: appColors.screenBg,
    textDecorationLine: 'underline',
    fontSize: fontSizes.FONT17,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: windowHeight(160),
    zIndex: 2,
  },
  dot: {
    height: windowHeight(2.5),
    width: windowHeight(10),
    borderRadius: windowHeight(2),
    backgroundColor: '#E0E0E0',
    marginHorizontal: windowHeight(6),
  },
  activeDot: {
    backgroundColor: appColors.screenBg,
    height: windowHeight(4),
    width: windowHeight(4),
  },
})

export default styles
