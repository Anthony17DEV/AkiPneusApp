import Svg, { Path } from 'react-native-svg'
import React, { FC } from 'react'

interface ProfileTabProps {
  color?: string
}

export const ProfileTab: FC<ProfileTabProps> = props => {
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
        d="M14 2.333A5.547 5.547 0 0 0 8.46 7.875c0 2.998 2.345 5.425 5.401 5.53a.938.938 0 0 1 .257 0h.081a5.528 5.528 0 0 0 5.344-5.53A5.547 5.547 0 0 0 14 2.333ZM19.927 16.508c-3.255-2.17-8.564-2.17-11.842 0-1.482.992-2.298 2.334-2.298 3.769s.816 2.765 2.286 3.745c1.634 1.096 3.78 1.645 5.927 1.645s4.293-.549 5.927-1.645c1.47-.992 2.286-2.322 2.286-3.769-.011-1.435-.816-2.765-2.286-3.745Z"
      />
    </Svg>
  )
}
