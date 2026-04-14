import React, { FC, memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { external } from '@src/style/external.css'
import { CheckMark, UncheckMark } from '@src/utils/icon'

interface CheckBoxProps {
  onPress?: () => void
  checked?: boolean
}

export function CheckBox({ onPress, checked }: CheckBoxProps) {
  return (
    <View>
      <TouchableOpacity style={[external.fd_row]} onPress={onPress}>
        {checked ? <UncheckMark /> : <CheckMark />}
      </TouchableOpacity>
    </View>
  )
}
