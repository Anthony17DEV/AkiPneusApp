import Svg, { Path } from 'react-native-svg'
import React, { FC } from 'react'

interface PlusProps {
  color?: string
  width?: number
  height?: number
}

export function Plus({ color, width, height }: PlusProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || 20}
      height={height || 20}
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M5 10H15"
        stroke={color || 'white'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 15V5"
        stroke={color || 'white'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
