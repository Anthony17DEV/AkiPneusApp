import { StyleSheet } from 'react-native'
import appFonts from '../../../../themes/appFonts'
import appColors from '@src/themes/appColors'
import { fontSizes, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  priceContainer: {
    fontSize: fontSizes.FONT30,
    color: appColors.titleText,
    fontFamily: 'semiBold',
    lineHeight: 30,
  },
  percentageOff: {
    backgroundColor: '#FDDBDB',
    width: windowWidth(90),
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceText: {
    ...commonStyles.subtitleText,
    textDecorationLine: 'line-through',
  },
})

export default styles
