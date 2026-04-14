import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface LeftSideArrowProps {
  color?: string
}

export function LeftSideArrow({ color }: LeftSideArrowProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 18 18"
      fill="none"
    >
      <Path
        d="M10.8225 4.44727L15.375 8.99977L10.8225 13.5523"
        stroke={color || '#051E47'}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M2.625 9H15.2475"
        stroke={color || '#051E47'}
        strokeWidth="1.2"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
