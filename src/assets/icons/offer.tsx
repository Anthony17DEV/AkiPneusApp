import { useValues } from '@/app/login'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export function Offer() {
	const { iconColorStyle } = useValues()
	return (
		<Svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<Path
				d="M3.32408 12.2167L2.05742 10.95C1.54076 10.4334 1.54076 9.58335 2.05742 9.06668L3.32408 7.8C3.54075 7.58333 3.71575 7.15833 3.71575 6.85833V5.06664C3.71575 4.3333 4.31575 3.73333 5.04909 3.73333H6.84075C7.14075 3.73333 7.56575 3.55835 7.78242 3.34168L9.04908 2.075C9.56574 1.55833 10.4158 1.55833 10.9324 2.075L12.1991 3.34168C12.4158 3.55835 12.8407 3.73333 13.1407 3.73333H14.9324C15.6658 3.73333 16.2657 4.3333 16.2657 5.06664V6.85833C16.2657 7.15833 16.4407 7.58333 16.6574 7.8L17.9241 9.06668C18.4408 9.58335 18.4408 10.4334 17.9241 10.95L16.6574 12.2167C16.4407 12.4334 16.2657 12.8584 16.2657 13.1584V14.95C16.2657 15.6833 15.6658 16.2834 14.9324 16.2834H13.1407C12.8407 16.2834 12.4158 16.4583 12.1991 16.675L10.9324 17.9417C10.4158 18.4584 9.56574 18.4584 9.04908 17.9417L7.78242 16.675C7.56575 16.4583 7.14075 16.2834 6.84075 16.2834H5.04909C4.31575 16.2834 3.71575 15.6833 3.71575 14.95V13.1584C3.71575 12.85 3.54075 12.425 3.32408 12.2167Z"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.5 12.5L12.5 7.5"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M12.0781 12.0837H12.0856"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<Path
				d="M7.91209 7.91667H7.91957"
				stroke={iconColorStyle}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</Svg>
	)
}
