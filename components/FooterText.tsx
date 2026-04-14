import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function FooterText() {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Powered by CACTUS Tecnologia</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		bottom: 160,
		left: 0,
		right: 0,
		alignItems: 'center',
	},
	text: {
		color: 'rgba(255, 255, 255, 0.8)',
		fontSize: 18,
		fontWeight: '600',
	},
});