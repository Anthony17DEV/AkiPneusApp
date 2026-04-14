import React, { FC } from 'react'
import Svg, { Path } from 'react-native-svg'

interface ParcelProps {
  width?: number
  height?: number
  fill?: string
}

export const Parcel: FC<ParcelProps> = props => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || 20}
      height={props.height || 20}
      fill={props.fill || 'none'}
      {...props}
    >
      <Path
        stroke="#9BA6B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="M16.642 8.334H3.308V15c0 2.5.834 3.334 3.334 3.334h6.666c2.5 0 3.334-.834 3.334-3.334V8.334ZM17.917 5.833v.833c0 .917-.442 1.667-1.667 1.667H3.75c-1.275 0-1.667-.75-1.667-1.667v-.833c0-.917.392-1.667 1.667-1.667h12.5c1.225 0 1.667.75 1.667 1.667Z"
      />
      <Path
        stroke="#9BA6B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="M9.7 4.167H5.1a.78.78 0 0 1 .025-1.083L6.308 1.9a.8.8 0 0 1 1.125 0L9.7 4.167ZM14.892 4.167h-4.6L12.558 1.9a.8.8 0 0 1 1.125 0l1.184 1.184c.3.3.308.775.025 1.083ZM7.45 8.334v4.283a.835.835 0 0 0 1.292.7l.783-.517a.832.832 0 0 1 .917 0l.741.5a.83.83 0 0 0 1.292-.692V8.334H7.45Z"
      />
    </Svg>
  )
}
