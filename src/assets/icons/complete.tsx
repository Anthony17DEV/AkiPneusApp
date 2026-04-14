import { useValues } from '@/app/login'
import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface CompleteProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function Complete({ props }: CompleteProps): JSX.Element {
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
				d="M10 18.333c4.583 0 8.333-3.75 8.333-8.333S14.583 1.667 10 1.667 1.667 5.417 1.667 10s3.75 8.333 8.333 8.333Z"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="m6.458 10 2.359 2.358 4.725-4.716"
			/>
		</Svg>
	)
}
