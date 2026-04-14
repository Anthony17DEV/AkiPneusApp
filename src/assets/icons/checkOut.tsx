import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface CheckOutIconProps {
  width?: number
  height?: number
  fill?: string
}

export function CheckOutIcon({
  width = 24,
  height = 24,
  fill = 'none',
}: CheckOutIconProps): JSX.Element {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill={fill}
    >
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="M2 8.505h20M6 16.505h2M10.5 16.505h4"
      />
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M6.44 3.505h11.11c3.56 0 4.45.88 4.45 4.39v8.21c0 3.51-.89 4.39-4.44 4.39H6.44c-3.55.01-4.44-.87-4.44-4.38v-8.22c0-3.51.89-4.39 4.44-4.39Z"
      />
    </Svg>
  )
}
