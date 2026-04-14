export const textRTLStyle = (value: boolean): string => {
  const direction: string = value ? 'right' : 'left'
  return direction
}

export const viewRTLStyle = (value: boolean): string => {
  const direction: string = value ? 'row-reverse' : 'row'
  return direction
}

export const imageRTLStyle = (value: boolean): number => {
  const direction: number = value ? -1 : 1
  return direction
}

export const viewSelfRTLStyle = (value: boolean): string => {
  const direction: string = value ? 'flex-start' : 'flex-end'
  return direction
}
