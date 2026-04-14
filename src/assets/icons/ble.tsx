import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface BleProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function Ble({ props }: BleProps) {
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
				d="M4.7 15.533 14.992 6.1c.425-.392.416-1.017-.034-1.392L11.75 2.033c-.833-.691-1.517-.375-1.517.709v14.516c0 1.084.684 1.4 1.517.709l3.209-2.675c.45-.375.458-1 .033-1.392L4.7 4.467"
			/>
		</Svg>
	)
}
