import { Dimensions, PixelRatio, Platform } from 'react-native'

export let SCREEN_HEIGHT: number = Dimensions.get('window').height
export let SCREEN_WIDTH: number = Dimensions.get('window').width

export const IsIOS: boolean = Platform.OS === 'ios'
export const IsIPAD: boolean = Platform.isPad

export const IsHaveNotch: boolean = SCREEN_HEIGHT > 750

export const Isiphone12promax: boolean =
  Platform.OS === 'ios' && SCREEN_HEIGHT > 2778

export const windowHeight = (height: number): number => {
  let tempHeight: number = SCREEN_HEIGHT * parseFloat((height / 667).toString())
  return PixelRatio.roundToNearestPixel(tempHeight)
}

export const windowWidth = (width: number): number => {
  let tempWidth: number = SCREEN_WIDTH * parseFloat((width / 480).toString())
  return PixelRatio.roundToNearestPixel(tempWidth)
}

export const fontSizes: { [key: string]: number } = {
  FONT6: windowWidth(6),
  FONT7: windowWidth(7),
  FONT8: windowWidth(8),
  FONT9: windowWidth(9),
  FONT10: windowWidth(10),
  FONT11: windowWidth(11),
  FONT12: windowWidth(12),
  FONT13: windowWidth(13),
  FONT14: windowWidth(14),
  FONT15: windowWidth(15),
  FONT16: windowWidth(16),
  FONT17: windowWidth(17),
  FONT18: windowWidth(18),
  FONT19: windowWidth(19),
  FONT20: windowWidth(20),
  FONT21: windowWidth(21),
  FONT22: windowWidth(22),
  FONT23: windowWidth(23),
  FONT24: windowWidth(24),
  FONT25: windowWidth(25),
  FONT26: windowWidth(26),
  FONT27: windowWidth(27),
  FONT28: windowWidth(28),
  FONT30: windowWidth(30),
  FONT33: windowWidth(33),
  FONT37: windowWidth(37),
  FONT45: windowWidth(45),
}
