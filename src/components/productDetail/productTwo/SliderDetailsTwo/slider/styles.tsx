import { Dimensions, StyleSheet } from 'react-native'
import { fontSizes, windowHeight, windowWidth } from '@src/themes/appConstant'
import { external } from '@src/style/external.css'
import { commonStyles } from '@src/style/commonStyle.css'

const { width, height } = Dimensions.get('window')

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    right: windowHeight(35),
  },
  previewImage: {
    width: '75%',
    height: '90%',
    resizeMode: 'contain',
  },
  item: {
    width: width * 0.75,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 10,
    paddingHorizontal: 20,
  },
  image: {
    width: '65%',
    height: '70%',
    resizeMode: 'contain',
  },
  contentContainer: {
    alignItems: 'center',
    right: 20,
  },
  barContainer: {
    height: 4,
    borderRadius: 10,
    right: windowHeight(92),
  },

  bar: {
    height: windowHeight(4),
    borderRadius: 10,
    marginTop: windowHeight(91),
  },
  chairColors: {
    width: windowHeight(22),
    height: windowHeight(22),
    borderRadius: windowHeight(11),
    borderWidth: 5,
    marginLeft: windowWidth(4),
  },
  colorMap: {
    height: 20,
    width: 20,
    borderRadius: 20,
    marginVertical: 1,
    marginBottom: 25,
    marginHorizontal: 5,
  },
  linear: {
    ...external.ph_20,
    backgroundColor: '#23262c',
    width: '55%',
    height: 330,
    position: 'absolute',
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 20,
  },
  text: {
    ...commonStyles.titleText19,
    marginLeft: '20%',
    fontSize: fontSizes.FONT21,
    top: windowHeight(7),
  },
  viewStyle: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
  },
})

export { styles }
