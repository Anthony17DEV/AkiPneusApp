import { useValues } from '@/app/login'
import { useNavigation } from '@react-navigation/native'
import { ErrorContainer } from '@src/commonComponents'
import images from '@src/utils/images'
import React, { useEffect } from 'react'

export function NotificationScreen() {
	const navigation = useNavigation<any>()

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			navigation.navigate('NotificationContainer')
		}, 3000)

		return () => clearTimeout(timeoutId)
	}, [navigation])
	const { t, isDark } = useValues()
	const darkImg = isDark ? images.DarkNotification : images.notification
	return (
		<ErrorContainer
			Buttontitle={t('transData.refresh')}
			img={darkImg}
			title={t('transData.noNewNotifications')}
			headerTitle={t('transData.notification')}
			Desc={t('transData.notificationDesc')}
			onPress={() => navigation.navigate('NotificationContainer')}
		/>
	)
}
