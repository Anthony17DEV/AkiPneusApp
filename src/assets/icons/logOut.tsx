import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

interface LogOutProps extends SvgProps {
	iconColorStyle?: string
}
export function LogOut(props: LogOutProps): JSX.Element {
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
				strokeMiterlimit={10}
				strokeWidth={1.2}
				d="M19.44 14.62 22 12.06 19.44 9.5M11.76 12.06h10.17M13.76 20c-4.42 0-8-3-8-8s3.58-8 8-8"
			/>
		</Svg>
	)
}
