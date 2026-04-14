import appColors from '@src/themes/appColors'

export const bgFullStyle = (value: boolean): string => {
  const direction: string = value ? appColors.blackBg : appColors.lightScreenBg
  return direction
}

export const textColorStyle = (value: boolean): string => {
  const direction: string = value ? appColors.screenBg : appColors.titleText
  return direction
}

export const iconColorStyle = (value: boolean): string => {
  const direction: string = value ? appColors.screenBg : '#051E47'
  return direction
}

export const linearColorStyle = (value: boolean): string[] => {
  const direction: string[] = value
    ? ['#2B2D33', '#27282E', appColors.shadowColor]
    : [appColors.screenBg, appColors.screenBg]
  return direction
}

export const subtitleColorStyle = (value: boolean): string => {
  const direction: string = value ? appColors.screenBg : appColors.subtitle
  return direction
}

export const imageContainer = (value: boolean): string => {
  const direction: string = value ? appColors.blackBg : appColors.bgLayout
  return direction
}

export const linearColorStyleTwo = (value: boolean): string[] => {
  const direction: string[] = value
    ? ['#3D3F45', '#45474B', '#2A2C32']
    : [appColors.screenBg, appColors.screenBg]
  return direction
}
