import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    marginVertical: windowHeight(8),
    borderColor: appColors.bgLayer,
    borderRadius: windowHeight(8),
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: 'gray',
    padding: 1,
  },
  img: {
    width: windowWidth(54),
    height: windowHeight(35),
    resizeMode: 'contain',
  },
  titleText: {
    ...commonStyles.titleText19,
    fontSize: fontSizes.FONT17,
    lineHeight: 22,
    fontFamily: 'semiBold',
  },
  menuItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    padding: windowHeight(10),
  },
})

export default styles
