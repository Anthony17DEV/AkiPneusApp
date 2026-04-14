import React, { FC } from 'react'
import { View, ViewStyle } from 'react-native'
import { external } from '@src/style/external.css'
import appColors from '@src/themes/appColors'

interface SolidLineProps {
  width?: number | string
  height?: number
  color?: string
  marginVertical?: number
}

export function SolidLine({
  width,
  height,
  color,
  marginVertical,
}: SolidLineProps) {
  return (
    <View
      style={
        {
          width: width || external.width_100,
          height: height || 1,
          backgroundColor: color || appColors.bgLayout,
          marginVertical: marginVertical || 5,
        } as ViewStyle
      }
    />
  )
}
