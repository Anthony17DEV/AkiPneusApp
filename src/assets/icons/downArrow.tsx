import Svg, { Path } from 'react-native-svg'
import React, { SVGProps } from 'react'

interface DownArrowProps extends SVGProps<SVGSVGElement> {
  color?: string
}

export function DownArrow(props: DownArrowProps): JSX.Element {
  const { color, ...rest } = props
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      fill="none"
      {...rest}
    >
      <Path
        stroke={color || '#051E47'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="m16.6 7.458-5.433 5.434a1.655 1.655 0 0 1-2.334 0L3.4 7.459"
      />
    </Svg>
  )
}
