import Svg, { Circle } from 'react-native-svg'
import React, { FC } from 'react'

interface RadioBoxProps {
  width?: number
  height?: number
  fill?: string
}

export const RadioBox: FC<RadioBoxProps> = props => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || 22}
      height={props.height || 22}
      fill={props.fill || 'none'}
      {...props}
    >
      <Circle cx={11} cy={11} r={10.5} fill="#fff" stroke="#9BA6B8" />
    </Svg>
  )
}
