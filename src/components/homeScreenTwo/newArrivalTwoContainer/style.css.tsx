import { StyleSheet } from 'react-native'
import appColors from '@src/themes/appColors'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const styles = StyleSheet.create({
  plusICon: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: windowHeight(83),

    right: windowHeight(17),
  },
  imgContainer: {
    backgroundColor: appColors.bgLayout,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: windowHeight(14),
    marginHorizontal: windowHeight(10),
    marginTop: windowHeight(8),
    borderRadius: windowHeight(7),
    paddingVertical: windowHeight(14),
  },
  img: {
    resizeMode: 'contain',
    height: windowHeight(62),
    width: windowWidth(140),
  },
  viewContainer: {
    marginHorizontal: windowHeight(0),
    marginTop: windowHeight(5),
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
    borderRadius: 10,
    borderColor: '#EDF0FF',
    marginBottom: windowHeight(10),
    shadowColor: appColors.shadowColor,
    overflow: 'hidden',
    elevation: 2,
    margin: 1,
  },
  ratingContainer: {
    ...commonStyles.titleText19,
    ...external.pt_5,
    ...external.mh_2,
    color: '#FB9927',
    bottom: windowHeight(2),
  },
  menuItemContent: {
    borderRadius: 10,
    width: '100%',

    shadowColor: appColors.shadowColor,
  },
})

export default styles
