import Svg, { Path } from 'react-native-svg'
import React from 'react'

interface HomeLightProps {
  width?: number
  height?: number
  fill?: string
}

export function HomeLight(props: HomeLightProps): JSX.Element {
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
        strokeWidth={1.2}
        d="m10.524 3.313-6.289 4.9c-1.05.817-1.902 2.555-1.902 3.873v8.646c0 2.706 2.205 4.923 4.912 4.923h13.51c2.707 0 4.912-2.217 4.912-4.912V12.25c0-1.412-.945-3.22-2.1-4.025l-7.21-5.052c-1.633-1.143-4.258-1.085-5.833.14ZM14 20.988v-3.5"
      />
    </Svg>
  )
}
