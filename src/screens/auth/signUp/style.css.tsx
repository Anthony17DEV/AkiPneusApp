import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  singUpView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(10),
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: appColors.lightScreenBg,
    paddingHorizontal: windowHeight(14),
    paddingBottom: 20,
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
  },
})

export default styles
