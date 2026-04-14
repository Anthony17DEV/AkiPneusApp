import { useValues } from '@/app/login'
import React from 'react'
import { Modal, View } from 'react-native'
import { styles } from './style.css'

interface CommonModalProps {
	isVisible?: boolean
	value?: string | any
	animationType?: 'slide' | 'fade' | 'none'
	closeModal?: () => void | boolean
	title?: string
	subtitle?: string
}

export function CommonModal({
	isVisible,
	value,
	animationType,
	closeModal,
	title,
	subtitle,
}: CommonModalProps) {
	const { bgFullStyle } = useValues()
	return (
		<Modal
			visible={isVisible}
			transparent={true}
			animationType={animationType || 'slide'}
		>
			<View style={styles.container}>
				<View style={[styles.valueBar, { backgroundColor: bgFullStyle }]}>
					<View>{value}</View>
				</View>
			</View>
		</Modal>
	)
}
