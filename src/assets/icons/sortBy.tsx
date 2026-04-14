import { useValues } from '@/app/login'
import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface SortByProps {
	props?: React.SVGProps<SVGSVGElement>
}

export function SortBy({ props }: SortByProps): JSX.Element {
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
				d="M18.333 14.584H12.5M4.167 14.584h-2.5M18.334 5.417h-2.5M7.5 5.417H1.667M5.833 12.084h5c.917 0 1.667.416 1.667 1.666v1.667c0 1.25-.75 1.667-1.667 1.667h-5c-.917 0-1.667-.417-1.667-1.667V13.75c0-1.25.75-1.666 1.667-1.666ZM9.167 2.917h5c.916 0 1.666.416 1.666 1.666V6.25c0 1.25-.75 1.667-1.666 1.667h-5C8.25 7.917 7.5 7.5 7.5 6.25V4.583c0-1.25.75-1.667 1.667-1.667Z"
			/>
		</Svg>
	)
}
