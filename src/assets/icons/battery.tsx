import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

interface BatteryProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function Battery({ props }: BatteryProps): JSX.Element {
	const { iconColorStyle }: { iconColorStyle: string } = useValues()

	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width={24}
			height={24}
			fill="none"
			{...props}
		>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="M4.091 9.867c3.584-2.767 8.242-2.767 11.825 0M1.667 6.966c5.05-3.9 11.616-3.9 16.666 0M5.658 12.908c2.625-2.033 6.05-2.033 8.675 0M7.833 15.958c1.317-1.016 3.025-1.016 4.342 0"
			/>
			<Circle cx={10} cy={18.333} r={0.833} fill={iconColorStyle} />
		</Svg>
	)
}
