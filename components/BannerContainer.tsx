import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function BannerContainer() {
	const router = useRouter();

	const handleVerifyPress = () => {
		router.push('/notifications');
	};
	return (
		<View style={styles.container}>
			<LinearGradient
				colors={['#0095DA', '#0077C2']}
				style={styles.gradientBackground}
			>
				<View style={styles.content}>
					<View style={styles.leftSection}>
						<View style={styles.iconCircle}>
							<Feather name="bell" size={24} color="#0077C2" />
						</View>
						<View>
							<Text style={styles.title}>Avisos Importantes</Text>
							<Text style={styles.subtitle}>Você não tem nenhuma no momento</Text>
						</View>
					</View>
					<TouchableOpacity onPress={handleVerifyPress}>
						<Text style={styles.buttonText}>Verificar</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 20,
		marginHorizontal: 20,
		borderRadius: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 0,
	},
	gradientBackground: {
		borderRadius: 15,
		padding: 15,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	leftSection: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'white',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 10,
	},
	title: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
	subtitle: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 12,
	},
	buttonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '500',
	},
});
