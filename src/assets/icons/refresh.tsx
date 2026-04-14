import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

interface RefreshProps extends SvgProps {
	iconColorStyle?: string
}
export function Refresh(props: RefreshProps): JSX.Element {
	const { iconColorStyle }: { iconColorStyle: string } = useValues()

	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width={28}
			height={28}
			fill="none"
			{...props}
		>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="M15.762 23.476c4.648-1.224 8.071-5.449 8.071-10.476A10.81 10.81 0 0 0 13 2.167C5.774 2.167 2.166 8.19 2.166 8.19m0 0V3.25m0 4.94H6.977"
			/>
			<Path
				stroke={iconColorStyle}
				strokeDasharray="3 3"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M2.167 13c0 5.98 4.853 10.833 10.833 10.833"
			/>
		</Svg>
	)
}
