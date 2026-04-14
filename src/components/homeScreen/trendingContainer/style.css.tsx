import { StyleSheet } from 'react-native'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  priceContainer: {
    ...external.mt_5,
  },
  price: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT21,
    fontFamily: 'semiBold',
    fontWeight: '600',
  },
  underlinePrice: {
    ...commonStyles.subtitleText,
    ...external.mh_2,
    textDecorationLine: 'line-through',
  },
  container: {
    width: windowWidth(190),
    marginTop: windowHeight(10),
    borderRadius: windowHeight(9),
    padding: 1,
    elevation: 1.8,
    borderColor: '#EDF0FF',
    borderWidth: windowHeight(0.5),
    overflow: 'hidden',
    left: windowHeight(3.5),
    margin: 1,
  },
  viewContainer: {
    borderRadius: windowHeight(7),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: windowHeight(6),
    marginBottom: windowHeight(5),
  },
  imgContainerView: {
    width: windowWidth(95),
    height: windowHeight(42),
  },
  menuItemContent: {
    borderRadius: windowHeight(9),
    width: '100%',
    flex: 1,

    paddingHorizontal: windowHeight(8),
    paddingBottom: windowHeight(5),
    paddingTop: windowHeight(8),
  },
})

export default styles
