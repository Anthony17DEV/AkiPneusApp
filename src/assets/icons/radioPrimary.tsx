import Svg, { Circle } from 'react-native-svg'
import React, { FC } from 'react'

export function RadioBoxPrimary() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
    >
      <Circle cx="11" cy="11" r="10.5" fill="white" stroke="#4D66FF" />
      <Circle cx="11" cy="11" r="6" fill="#4D66FF" />
    </Svg>
  )
}
