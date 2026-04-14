import React, { FC, memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { external } from '@src/style/external.css'
import { RadioBox, RadioBoxPrimary } from '@src/utils/icon'

interface RadioButtonProps {
  onPress: () => void
  checked: boolean
}

export function RadioButton({ onPress, checked }: RadioButtonProps) {
  return (
    <View>
      <TouchableOpacity style={[external.fd_row]} onPress={onPress}>
        {checked ? <RadioBoxPrimary /> : <RadioBox />}
      </TouchableOpacity>
    </View>
  )
}
