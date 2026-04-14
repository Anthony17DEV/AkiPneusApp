import Svg, { Path } from 'react-native-svg'
import React, { FC } from 'react'

interface CategoryLightProps {
  width?: number
  height?: number
  fill?: string
}

export const CategoryLight: FC<CategoryLightProps> = props => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || 28}
      height={props.height || 28}
      fill={props.fill || 'none'}
      {...props}
    >
      <Path
        stroke="#9BA6B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="M19.834 11.666h2.333c2.333 0 3.5-1.166 3.5-3.5V5.833c0-2.333-1.167-3.5-3.5-3.5h-2.334c-2.333 0-3.5 1.167-3.5 3.5v2.333c0 2.334 1.167 3.5 3.5 3.5ZM5.833 25.666h2.334c2.333 0 3.5-1.166 3.5-3.5v-2.333c0-2.333-1.167-3.5-3.5-3.5H5.834c-2.334 0-3.5 1.167-3.5 3.5v2.333c0 2.334 1.166 3.5 3.5 3.5ZM7 11.666a4.667 4.667 0 1 0 0-9.333 4.667 4.667 0 0 0 0 9.333ZM21 25.666a4.667 4.667 0 1 0 0-9.333 4.667 4.667 0 0 0 0 9.333Z"
      />
    </Svg>
  )
}
