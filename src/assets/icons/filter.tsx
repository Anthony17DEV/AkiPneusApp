import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export function Filter() {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 20 20"
			fill="none"
		>
			<Path
				d="M15.834 18.3337V9.16699"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M15.834 5.83366V1.66699"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 18.3337V14.167"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M10 10.8337V1.66699"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M4.16602 18.3337V9.16699"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M4.16602 5.83366V1.66699"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M2.5 9.16699H5.83333"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M14.166 9.16699H17.4993"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M8.33398 10.833H11.6673"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	)
}
