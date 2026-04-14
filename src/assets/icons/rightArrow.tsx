import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

interface RightArrowProps extends SvgProps {
	iconColorStyle?: string
}

export function RightArrow(props: RightArrowProps): JSX.Element {
	const { iconColorStyle }: { iconColorStyle: string } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width={20}
			height={20}
			fill="none"
			{...props}
		>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				strokeWidth={1.2}
				d="m7.458 3.4 5.434 5.433a1.655 1.655 0 0 1 0 2.333L7.459 16.6"
			/>
		</Svg>
	)
}
