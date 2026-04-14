import React, { FC, memo } from 'react'
import { View, ViewStyle } from 'react-native'
import SwitchToggle from 'react-native-switch-toggle'
import { styles } from './style.css'

interface SwitchComponentProps {
  Enable?: boolean
  onPress?: () => void
  switchOn?: any
}

export function SwitchComponent({
  Enable,
  onPress,
  switchOn,
}: SwitchComponentProps) {
  return (
    <View style={{} as ViewStyle}>
      <SwitchToggle
        circleColorOff={'#76777A'}
        circleColorOn={'#4D66FF'}
        backgroundColorOn={'#292D41'}
        backgroundColorOff={'#2F3137'}
        switchOn={Enable}
        onPress={onPress}
        circleStyle={styles.circle}
        containerStyle={styles.container}
      />
    </View>
  )
}
