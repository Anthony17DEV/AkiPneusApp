import { Text, View } from 'react-native'
import React, { FC } from 'react'
import { commonStyles } from '@src/style/commonStyle.css'
import styles from './styles.css'

interface ClockTimerProps {
  price?: string | number
}

export function ClockTimer({ price }: ClockTimerProps) {
  return (
    <View style={styles.timer}>
      <Text style={[commonStyles.H1Banner]}>{price}</Text>
    </View>
  )
}
