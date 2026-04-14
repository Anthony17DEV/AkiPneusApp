import Svg, { Circle, Path } from 'react-native-svg'
import React, { FC } from 'react'

interface RightProps {
  props?: React.SVGProps<SVGSVGElement>
}

export function Right({ props }: RightProps) {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={26}
      height={26}
      fill="none"
      {...props}
    >
      <Path
        stroke="#4D66FF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="M13.25 7.75c-.5 2.5-2.385 4.854-5.03 5.38A6.25 6.25 0 0 1 2.373 2.798C4.187.8 7.25.25 9.75 1.25"
      />
      <Path
        stroke="#4D66FF"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
        d="m4.75 6.75 2.5 2.5 6-6.5"
      />
    </Svg>
  )
}
