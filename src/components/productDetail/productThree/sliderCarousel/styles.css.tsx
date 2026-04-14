import { StyleSheet } from 'react-native'
import { commonStyles } from '@src/style/commonStyle.css'
import { fontSizes, windowHeight } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  text: {
    ...commonStyles.titleText19,
    marginLeft: '20%',
    fontSize: fontSizes.FONT21,
  },
  colorMap: {
    height: 20,
    width: 20,
    borderRadius: 20,
    marginVertical: 1,
    marginBottom: 25,
    marginHorizontal: 5,
  },
  viewStyle: {
    flexDirection: 'row',
    bottom: -windowHeight(60),
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
})

export { styles }
