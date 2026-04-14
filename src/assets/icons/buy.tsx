import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg'
import React from 'react'

interface BuyProps {
  width?: string
  height?: string
  color?: string
}

export function Buy({ color, width, height }: BuyProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      fill="none"
      {...props}
    >
      <Path
        fill="#9BA6B8"
        d="M20.25 3.75H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5Zm-8.25 9a4.5 4.5 0 0 1-4.5-4.5.75.75 0 0 1 1.5 0 3 3 0 1 0 6 0 .75.75 0 1 1 1.5 0 4.5 4.5 0 0 1-4.5 4.5Z"
        opacity={0.3}
      />
    </Svg>
  )
}
