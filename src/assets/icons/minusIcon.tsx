import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

export function MinusIcon() {
	const { isDark } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="30"
			height="30"
			viewBox="0 0 26 26"
			fill="none"
		>
			<Circle cx="13" cy="13" r="13" fill={isDark ? '#27292F' : 'white'} />
			<Path d="M16 12V13.5H10V12H16Z" fill="#9BA6B8" />
		</Svg>
	)
}
