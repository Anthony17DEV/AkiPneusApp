import Svg, { Path } from 'react-native-svg'
import React, { FC } from 'react'

interface CategoryProps {
  color?: string
}

export const Category: FC<CategoryProps> = props => {
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
        d="M21.782 2.333h-2.217c-2.543 0-3.885 1.342-3.885 3.885v2.217c0 2.543 1.342 3.885 3.885 3.885h2.217c2.543 0 3.885-1.342 3.885-3.885V6.218c0-2.543-1.342-3.885-3.885-3.885ZM8.447 15.668H6.23c-2.555 0-3.897 1.342-3.897 3.885v2.217c0 2.555 1.342 3.896 3.885 3.896h2.217c2.543 0 3.885-1.341 3.885-3.885v-2.216c.012-2.555-1.33-3.897-3.873-3.897ZM7.338 12.343a5.005 5.005 0 1 0 0-10.01 5.005 5.005 0 0 0 0 10.01ZM20.662 25.666a5.005 5.005 0 1 0 0-10.01 5.005 5.005 0 0 0 0 10.01Z"
      />
    </Svg>
  )
}
