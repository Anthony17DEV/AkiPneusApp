import { useValues } from '@/app/login'
import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface EditProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function Edit({ props }: EditProps): JSX.Element {
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
				d="m11.05 3-6.842 7.242c-.258.275-.508.816-.558 1.191l-.308 2.7c-.109.975.591 1.642 1.558 1.475l2.683-.458c.375-.067.9-.342 1.159-.625l6.841-7.242c1.184-1.25 1.717-2.675-.125-4.416C13.625 1.142 12.233 1.75 11.05 3Z"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeMiterlimit={10}
				d="M9.908 4.208A5.105 5.105 0 0 0 14.45 8.5M2.5 18.333h15"
			/>
		</Svg>
	)
}
