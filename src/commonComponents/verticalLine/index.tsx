import { View, DimensionValue } from 'react-native'
import React, { FC } from 'react'
import { styles } from './styles.css'

interface VerticalLineProps {
  dynamicHeight?: DimensionValue
}

export function VerticalLine({ dynamicHeight }: VerticalLineProps) {
  return (
    <View style={[styles.verticalLine, { height: dynamicHeight ?? 100 }]} />
  )
}
