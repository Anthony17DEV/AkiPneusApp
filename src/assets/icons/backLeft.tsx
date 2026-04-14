import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface BackLeftProps {
	width?: string
	height?: string
	color?: string
}

export function BackLeft({ color, width, height }: BackLeftProps) {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
		>
			<Path
				d="M9.57 5.92969L3.5 11.9997L9.57 18.0697"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M20.4999 12H3.66992"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	)
}
