import Svg, { Path } from 'react-native-svg'
import React, { FC } from 'react'

interface HomeIconProps {
  color?: string
}

export const HomeIcon: FC<HomeIconProps> = props => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      fill="none"
      {...props}
    >
      <Path
        fill={props.color || '#4D66FF'}
        d="m23.38 7.957-6.72-4.702c-1.832-1.283-4.643-1.213-6.405.152L4.41 7.968c-1.167.91-2.088 2.777-2.088 4.247v8.05c0 2.975 2.415 5.402 5.39 5.402h12.576a5.392 5.392 0 0 0 5.39-5.39v-7.91c0-1.575-1.015-3.512-2.298-4.41ZM14.875 21a.881.881 0 0 1-.875.875.881.881 0 0 1-.875-.875v-3.5c0-.478.397-.875.875-.875s.875.397.875.875V21Z"
      />
    </Svg>
  )
}
