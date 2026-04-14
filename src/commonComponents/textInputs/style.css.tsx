import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { windowHeight } from '@src/themes/appConstant'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  headingContainer: {
    ...commonStyles.titleText19,
  },
  textInputView: {
    width: '100%',
    backgroundColor: 'white',
    marginTop: windowHeight(6),
    borderRadius: windowHeight(5),
    ...external.fd_row,
    ...external.ai_center,
    ...external.js_space,
    shadowColor: '#EDF0FF',
    elevation: 1,
    borderWidth: windowHeight(1.5),
  },
  textInput: {
    paddingHorizontal: windowHeight(10),
    color: appColors.titleText,
  },
  withoutShow: {
    height: windowHeight(40),
    marginTop: windowHeight(4),
    borderRadius: windowHeight(5),
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    overflow: 'hidden',
  },
  menuItemContent: {
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
  },
})

export default styles
