import { useValues } from '@/app/login'
import appColors from '@src/themes/appColors'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface TruckProps {
	color?: string
	colorWhite?: string
}

export function Truck({ color, colorWhite }: TruckProps) {
	const { isDark } = useValues()
	const colorText: string = isDark
		? color || appColors.screenBg
		: colorWhite || appColors.primary

	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 22 22"
			fill="none"
		>
			<Path
				d="M10.9999 12.8333H11.9166C12.9249 12.8333 13.7499 12.0083 13.7499 11V1.83334H5.49994C4.12494 1.83334 2.92411 2.59416 2.30078 3.71249"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M1.8335 15.5833C1.8335 17.105 3.06183 18.3333 4.5835 18.3333H5.50016C5.50016 17.325 6.32516 16.5 7.3335 16.5C8.34183 16.5 9.16683 17.325 9.16683 18.3333H12.8335C12.8335 17.325 13.6585 16.5 14.6668 16.5C15.6752 16.5 16.5002 17.325 16.5002 18.3333H17.4168C18.9385 18.3333 20.1668 17.105 20.1668 15.5833V12.8333H17.4168C16.9127 12.8333 16.5002 12.4208 16.5002 11.9167V9.16667C16.5002 8.6625 16.9127 8.25 17.4168 8.25H18.5993L17.0318 5.50918C16.7018 4.94084 16.0969 4.58334 15.4369 4.58334H13.7502V11C13.7502 12.0083 12.9252 12.8333 11.9168 12.8333H11.0002"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.33333 20.1667C8.34585 20.1667 9.16667 19.3459 9.16667 18.3333C9.16667 17.3208 8.34585 16.5 7.33333 16.5C6.32081 16.5 5.5 17.3208 5.5 18.3333C5.5 19.3459 6.32081 20.1667 7.33333 20.1667Z"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M14.6668 20.1667C15.6794 20.1667 16.5002 19.3459 16.5002 18.3333C16.5002 17.3208 15.6794 16.5 14.6668 16.5C13.6543 16.5 12.8335 17.3208 12.8335 18.3333C12.8335 19.3459 13.6543 20.1667 14.6668 20.1667Z"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M20.1667 11V12.8333H17.4167C16.9125 12.8333 16.5 12.4208 16.5 11.9167V9.16667C16.5 8.6625 16.9125 8.25 17.4167 8.25H18.5991L20.1667 11Z"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M1.8335 7.33334H7.3335"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M1.8335 10.0833H5.50016"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M1.8335 12.8333H3.66683"
				stroke={colorText}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	)
}
