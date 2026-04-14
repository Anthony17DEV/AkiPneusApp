import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export function Oneplus() {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="21"
			height="21"
			viewBox="0 0 21 21"
			fill="none"
		>
			<Path
				d="M0 3.2725V21H17.7275V10.8745H15.7535V19.0269H1.97225V5.24563H10.1255V3.27425L0 3.2725ZM15.7535 0V3.2725H12.4653V5.2465H15.7535V8.53475H17.7266V5.2465H21V3.2725H17.7118V0H15.7535ZM10.1097 16.4115V7.75425H8.36675C8.36675 8.351 8.16725 8.79463 7.86187 9.07025C7.54075 9.33012 7.06562 9.45263 6.50037 9.45263H6.286V10.8745H8.15238V16.3958H10.1097V16.4115Z"
				fill={iconColorStyle}
			/>
		</Svg>
	)
}
