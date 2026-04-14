import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

interface BusProps extends SvgProps {
	iconColorStyle?: string
}

export function Bus({ props }: any) {
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
				d="M13 15.167h1.083A2.173 2.173 0 0 0 16.25 13V2.167H6.5c-1.625 0-3.044.9-3.78 2.22"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="M2.167 18.417a3.246 3.246 0 0 0 3.25 3.25H6.5c0-1.192.975-2.167 2.166-2.167 1.192 0 2.167.975 2.167 2.167h4.333c0-1.192.976-2.167 2.167-2.167 1.192 0 2.167.975 2.167 2.167h1.083a3.246 3.246 0 0 0 3.25-3.25v-3.25h-3.25a1.087 1.087 0 0 1-1.083-1.083v-3.25c0-.596.487-1.084 1.083-1.084h1.398l-1.853-3.239a2.184 2.184 0 0 0-1.885-1.094H16.25V13a2.173 2.173 0 0 1-2.167 2.167H13"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="M8.667 23.833a2.167 2.167 0 1 0 0-4.333 2.167 2.167 0 0 0 0 4.333ZM17.333 23.833a2.167 2.167 0 1 0 0-4.333 2.167 2.167 0 0 0 0 4.333ZM23.833 13v2.167h-3.25a1.087 1.087 0 0 1-1.083-1.084v-3.25c0-.595.488-1.083 1.083-1.083h1.398L23.833 13ZM2.167 8.667h6.5M2.167 11.917H6.5M2.167 15.167h2.166"
			/>
		</Svg>
	)
}
