import { useFonts } from 'expo-font'

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    LargeButtonMedium: require('../../src/assets/fonts/SofiaSans-SemiBold.ttf'),
    Regular: require('../../src/assets/fonts/Poppins Regular 400.ttf'),
    bold: require('../../src/assets/fonts/Poppins Medium 500.ttf'),
    thin: require('../../src/assets/fonts/Poppins Light 300.ttf'),
    semiBold: require('../../src/assets/fonts/Poppins SemiBold 600.ttf'),
    medium: require('../../src/assets/fonts/Poppins Medium 500.ttf'),
    sofiasansMedium: require('../../src/assets/fonts/SofiaSans-Medium.ttf'),
    italian: require('../../src/assets/fonts/Italiana-Regular.ttf'),
  })
  return fontsLoaded
}
