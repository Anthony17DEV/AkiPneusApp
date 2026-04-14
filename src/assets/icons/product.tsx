import { useValues } from '@/app/login'
import React, { FC } from 'react'
import Svg, { Path, SvgProps } from 'react-native-svg'

interface ProductsProps extends SvgProps {
	iconColorStyle?: string
}

export const Products: FC<ProductsProps> = props => {
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
				d="M2.642 6.2 10 10.46l7.308-4.234M10 18.009V10.45"
			/>
			<Path
				stroke={iconColorStyle}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.2}
				d="m8.275 2.067-4.45 2.466c-1.008.559-1.833 1.959-1.833 3.109v4.708c0 1.15.825 2.55 1.833 3.108l4.45 2.475c.95.525 2.508.525 3.458 0l4.45-2.475c1.009-.558 1.834-1.958 1.834-3.108V7.642c0-1.15-.825-2.55-1.834-3.109l-4.45-2.475c-.958-.525-2.508-.525-3.458.009Z"
			/>
		</Svg>
	)
}
