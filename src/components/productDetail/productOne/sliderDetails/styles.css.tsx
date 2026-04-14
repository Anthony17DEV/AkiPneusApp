import { StyleSheet } from 'react-native'
import { fontSizes, windowHeight } from '@src/themes/appConstant'

export const sliderStyles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F5FB',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    marginLeft: '20%',
    fontSize: fontSizes.FONT21,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginHorizontal: 5,
  },
  productImage: {
    alignSelf: 'center',
    height: windowHeight(160),
    width: windowHeight(160),
    resizeMode: 'contain',
    position: 'absolute',
    top: windowHeight(50),
  },
  productImageTwo: {
    height: windowHeight(160),
    width: windowHeight(160),
    position: 'absolute',
    alignSelf: 'center',
    resizeMode: 'contain',
    bottom: -5,
    zIndex: -9999,
  },
  sliderItemContainer: {
    alignSelf: 'flex-end',
    left: windowHeight(50),
    marginHorizontal: windowHeight(8),
  },
  sliderItemSelected: {
    backgroundColor: 'white',
    height: 50,
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 28,
    borderTopLeftRadius: 28,
    elevation: 1,
    marginTop: 30,
    gap: 10,
  },
  sliderItemUnselected: {
    marginBottom: 10,
  },
  sliderImage: {
    height: 27,
    width: 27,
    resizeMode: 'contain',
  },
  sliderImageSelected: {
    opacity: 0.9,
  },
  sliderImageUnselected: {
    opacity: 0.4,
  },
  itemSeparator: {
    width: 25,
  },
  colorMap: {
    height: 20,
    width: 20,
    borderRadius: 20,
    marginVertical: 1,
    marginBottom: 25,
    top: 40,
  },
})
