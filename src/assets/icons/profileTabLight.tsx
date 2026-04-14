import Svg, { Path } from 'react-native-svg'
import React, { SVGProps } from 'react'

interface ProfileLightProps extends SVGProps<SVGSVGElement> {}

export function ProfileLight(props: ProfileLightProps): JSX.Element {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={28}
      height={28}
      fill="none"
      {...props}
    >
      <Path
        stroke="#9BA6B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.187 12.681a2.133 2.133 0 0 0-.385 0A5.157 5.157 0 0 1 8.82 7.513c0-2.858 2.31-5.18 5.18-5.18a5.183 5.183 0 0 1 5.18 5.18c-.012 2.8-2.217 5.075-4.993 5.168ZM8.353 16.987c-2.823 1.89-2.823 4.97 0 6.848 3.209 2.147 8.47 2.147 11.679 0 2.823-1.89 2.823-4.97 0-6.848-3.197-2.135-8.459-2.135-11.679 0Z"
      />
    </Svg>
  )
}
