import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg'
import React from 'react'

export function PlusRadial() {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 26 26"
      fill="none"
    >
      <Circle cx="13" cy="13" r="13" fill="url(#paint0_radial_3363_10856)" />
      <Path
        d="M17 13.6118H13.6588V17H12.3255V13.6118H9V12.4039H12.3255V9H13.6588V12.4039H17V13.6118Z"
        fill="white"
      />
      <Defs>
        <RadialGradient
          id="paint0_radial_3363_10856"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(8.66667 7.36667) rotate(70.821) scale(21.1047 21.1277)"
        >
          <Stop stopColor="#5385FC" />
          <Stop offset="1" stopColor="#355FE9" />
        </RadialGradient>
      </Defs>
    </Svg>
  )
}
