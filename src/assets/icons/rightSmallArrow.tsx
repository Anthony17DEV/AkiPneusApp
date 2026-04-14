import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export function RightSmallArrow(props) {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="15"
			height="15"
			viewBox="0 0 12 12"
			fill="none"
		>
			<Path
				d="M4.4751 2.03996L7.7351 5.29996C8.1201 5.68496 8.1201 6.31496 7.7351 6.69996L4.4751 9.95996"
				stroke={iconColorStyle}
				stroke-width="1.2"
				stroke-miterlimit="10"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</Svg>
	)
}
