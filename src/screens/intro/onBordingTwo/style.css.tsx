import { StyleSheet } from 'react-native'
import { windowHeight, windowWidth } from '@src/themes/appConstant'
import { external } from '@src/style/external.css'

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: windowHeight(160),
    marginVertical: windowHeight(7),
    bottom: windowHeight(23),
  },
  face: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  back: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  imgStyle: {
    height: windowHeight(125),
    width: windowHeight(130),
    resizeMode: 'contain',
  },
  smallImage: {
    height: windowHeight(110),
    width: windowHeight(130),
    marginTop: windowHeight(50),
    resizeMode: 'contain',
  },
  rowStyle: {
    flexDirection: 'row',
    marginTop: '40%',
    justifyContent: 'space-between',
    marginHorizontal: windowHeight(22),
  },
  VerticalLineView: {
    ...external.fd_row,
    ...external.ai_center,
    bottom: windowHeight(8),
    ...external.mh_15,
  },
  imageBg: {
    bottom: windowHeight(90),
    height: '73%',
  },
  navigationBtnView: {
    ...external.mh_20,
    ...external.mb_20,
    bottom: '23%',
  },
  smallLogo: {
    width: windowWidth(190),
    height: windowHeight(100),
    resizeMode: 'cover',
    alignSelf: 'center',
  },
})
export { styles }
