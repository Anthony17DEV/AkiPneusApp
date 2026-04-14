import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    borderRadius: windowHeight(9),
    marginTop: windowHeight(10),
    elevation: 1.5,
    margin: 1,
    shadowColor: appColors.shadowColor,
    padding: 1,
  },
  menuItemContent: {
    borderRadius: 6,
    width: '100%',
    flex: 1,
    shadowColor: appColors.shadowColor,
    padding: windowHeight(11),
  },
  subtitle: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    width: '70%',
  },
  img: {
    height: windowHeight(41),
    width: windowWidth(67),
    marginVertical: windowHeight(8),
  },
  price: {
    ...commonStyles.subtitleText,
    ...external.ph_5,
    textDecorationLine: 'line-through',
    paddingHorizontal: windowHeight(3),
  },
  titleText: {
    ...commonStyles.titleText19,
    ...external.ph_5,
    width: '73%',
  },
})

export default styles
