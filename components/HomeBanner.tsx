import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const productImage = { uri: 'https://placehold.co/100x100/ffffff/000000?text=Produto' };

export function HomeBanner() {
	return (
		<View style={styles.wrapper}>
			<LinearGradient
				colors={['#2A2D34', '#22252A']}
				style={styles.container}
			>
				<View style={styles.textContainer}>
					<View style={styles.logoRow}>
						<FontAwesome5 name="gas-pump" size={20} color="#00B4DB" />
						<Text style={styles.logoText}>FAN Plus</Text>
					</View>
					<Text style={styles.mainTitle}>Controle Total da sua Frota</Text>
					<Text style={styles.subtitle}>Relatórios, gastos e muito mais.</Text>
				</View>
				<View style={styles.imageContainer}>
					<Image source={productImage} style={styles.productImage} />
				</View>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 20,
		marginTop: 20,
	},
	container: {
		flexDirection: 'row',
		borderRadius: 20,
		padding: 20,
		alignItems: 'center',
		overflow: 'hidden',
	},
	textContainer: {
		flex: 1,
	},
	logoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	logoText: {
		color: '#00B4DB',
		fontSize: 16,
		fontWeight: 'bold',
		marginLeft: 8,
	},
	mainTitle: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	subtitle: {
		color: 'rgba(255, 255, 255, 0.7)',
		fontSize: 14,
	},
	imageContainer: {
		marginLeft: 10,
	},
	productImage: {
		width: 100,
		height: 100,
	},
});
