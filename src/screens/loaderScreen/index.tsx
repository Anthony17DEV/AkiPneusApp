import { useValues } from '@/app/login'
import images from '@utils/images'
import React, { useEffect } from 'react'
import { Image, ImageBackground, ImageSourcePropType } from 'react-native'
import styles from './style.css'

interface LoaderScreenProps {
	navigation: {
		replace: (screen: string) => void
	}
}

export function LoaderScreen({ navigation }: LoaderScreenProps) {
	useEffect(() => {
		const timer: NodeJS.Timeout = setTimeout(() => {
			navigation.replace('Drawer')
		}, 1000)

		return () => clearTimeout(timer)
	}, [navigation])

	const { isDark }: { isDark: boolean } = useValues()
	const imageBg: ImageSourcePropType = isDark
		? images.loaderBgDark
		: images.loaderBg
	const loader: ImageSourcePropType = isDark ? images.loading : images.loaderGIF

	return (
		<ImageBackground style={styles.container} source={imageBg}>
			<Image
				style={isDark ? styles.imgStyleDark : styles.imgStyle}
				source={loader}
			/>
		</ImageBackground>
	)
}
