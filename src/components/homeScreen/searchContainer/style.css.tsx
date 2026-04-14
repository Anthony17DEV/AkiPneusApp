import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { windowHeight, windowWidth } from '@src/themes/appConstant'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: windowHeight(38),
    marginTop: windowHeight(15),
    borderRadius: windowHeight(5),
    marginHorizontal: windowHeight(14),
    elevation: 1.5,
    borderColor: '#EDF0FF',
    borderWidth: windowHeight(0.2),
    padding: 1,
    overflow: 'hidden',
    shadowColor: appColors.shadowColor,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: windowHeight(14),
  },
  aa: {
    top: windowHeight(2),
  },
  filterStyle: {
    height: '50%',
    width: 1.5,
    backgroundColor: appColors.subtitle,
  },
  containerView: {
    marginHorizontal: windowWidth(70),
  },
  menuItemContent: {
    borderRadius: windowHeight(5),
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: appColors.shadowColor,
    height: windowHeight(38),
  },
})

export default styles
