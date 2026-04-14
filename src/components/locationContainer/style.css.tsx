import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  container: {
    height: windowHeight(55),
    marginVertical: windowHeight(14),
    borderRadius: windowHeight(8),
    marginHorizontal: windowHeight(14),
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
    elevation: 1,
  },
  changeText: {
    ...commonStyles.titleText19,
    color: '#4D66FF',
    textDecorationLine: 'underline',
    paddingTop: windowHeight(10),
  },
  locationIcon: {
    width: windowWidth(60),
    height: windowHeight(38),
    backgroundColor: 'rgba(77, 102, 255, 0.10)',
    borderRadius: windowHeight(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    borderRadius: windowHeight(8),
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: windowHeight(10),
  },
})

export default styles
