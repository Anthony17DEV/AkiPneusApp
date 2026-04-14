import Svg, { Path } from 'react-native-svg'
import React, { FC, SVGProps } from 'react'

interface MyBegDisProps extends SVGProps<SVGSVGElement> {}

export const MyBegDis: FC<MyBegDisProps> = props => {
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
        strokeMiterlimit={10}
        strokeWidth={1.2}
        d="M8.75 8.948V7.816c0-2.625 2.112-5.203 4.737-5.448 3.126-.303 5.763 2.158 5.763 5.227v1.61M10.5 25.666h7c4.69 0 5.53-1.878 5.775-4.165l.875-7c.315-2.846-.502-5.168-5.483-5.168H9.332c-4.982 0-5.798 2.322-5.483 5.168l.875 7c.245 2.287 1.085 4.165 5.775 4.165Z"
      />
      <Path
        stroke="#9BA6B8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.078 14h.01M9.91 14h.01"
      />
    </Svg>
  )
}
