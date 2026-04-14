import { StyleSheet, Dimensions } from 'react-native'
import { windowHeight } from '@src/themes/appConstant'

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
    right: windowHeight(2),
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
})

export { styles }
