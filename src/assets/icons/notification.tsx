import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export function Notification() {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="22"
			height="22"
			viewBox="0 0 20 20"
			fill="none"
		>
			<Path
				d="M10.0175 2.4248C7.25914 2.4248 5.01747 4.66647 5.01747 7.4248V9.83314C5.01747 10.3415 4.80081 11.1165 4.54247 11.5498L3.58414 13.1415C2.99247 14.1248 3.40081 15.2165 4.48414 15.5831C8.07581 16.7831 11.9508 16.7831 15.5425 15.5831C16.5508 15.2498 16.9925 14.0581 16.4425 13.1415L15.4841 11.5498C15.2341 11.1165 15.0175 10.3415 15.0175 9.83314V7.4248C15.0175 4.6748 12.7675 2.4248 10.0175 2.4248Z"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				strokeLinecap="round"
			/>
			<Path
				d="M11.5579 2.66621C11.2996 2.59121 11.0329 2.53288 10.7579 2.49954C9.95794 2.39954 9.19128 2.45788 8.47461 2.66621C8.71628 2.04954 9.31628 1.61621 10.0163 1.61621C10.7163 1.61621 11.3163 2.04954 11.5579 2.66621Z"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
				stroke-Linecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M12.5176 15.8838C12.5176 17.2588 11.3926 18.3838 10.0176 18.3838C9.33424 18.3838 8.70091 18.1005 8.25091 17.6505C7.80091 17.2005 7.51758 16.5671 7.51758 15.8838"
				stroke={iconColorStyle}
				strokeWidth="1.2"
				strokeMiterlimit="10"
			/>
		</Svg>
	)
}
