import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    marginVertical: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectedMenuItemText: {
    color: appColors.screenBg,
  },

  selectedMenuItem: {
    backgroundColor: appColors.primary,
    borderRadius: 6,
  },
})

export default styles
