import { View } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus } from '@src/utils/icon'
import styles from './style.css'

export function PlusIcon() {
  return (
    <View>
      <LinearGradient style={styles.container} colors={['#5385FC', '#355FE9']}>
        <Plus />
      </LinearGradient>
    </View>
  )
}
