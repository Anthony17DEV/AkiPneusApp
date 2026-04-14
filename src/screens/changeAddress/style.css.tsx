import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { commonStyles } from '@src/style/commonStyle.css'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  container: {
    marginHorizontal: windowWidth(25),
    marginTop: windowHeight(10),
    borderRadius: windowHeight(8),
    borderColor: appColors.cardBorder,
    marginVertical: windowHeight(5),
    elevation: 1,
    padding: 1,
  },
  textContainer: {
    ...commonStyles.titleText19,
    ...external.ph_10,
    fontSize: fontSizes.FONT16,
    textDecorationLine: 'underline',
    color: '#4D66FF',
    paddingTop: windowHeight(5),
    paddingHorizontal: windowWidth(29),
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    paddingHorizontal: windowWidth(20),
    paddingTop: windowHeight(10),
    paddingVertical: windowHeight(8),
  },
})

export { styles }
