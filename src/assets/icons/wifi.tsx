import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface WifiProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function Wifi({ props }: WifiProps): JSX.Element {
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
				strokeWidth={1.2}
				d="M17.084 7.917c1.25 0 1.25.416 1.25 1.25v1.666c0 .833 0 1.25-1.25 1.25M5.317 8.334a6.837 6.837 0 0 1 0 3.333M8.233 8.334a6.837 6.837 0 0 1 0 3.333M11.15 8.334a6.837 6.837 0 0 1 0 3.333"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="M10.833 15.833h-5c-3.333 0-4.167-.833-4.167-4.167V8.333c0-3.333.834-4.167 4.167-4.167h5C14.166 4.167 15 5 15 8.334v3.333c0 3.334-.834 4.167-4.167 4.167Z"
			/>
		</Svg>
	)
}
