import { StyleSheet } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  headingContainer: {
    height: 101,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: appColors.screenBg,
    width: 101,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 1,
    marginHorizontal: 10,
    borderCurve: 'continuous',
  },
  flexView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: windowHeight(20),
  },
  singUpView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: windowHeight(10),
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: windowHeight(14),
  },
  errorStyle: {
    color: appColors.red,
    marginBottom: windowHeight(4),
    fontFamily: 'bold',
  },
})

export default styles
