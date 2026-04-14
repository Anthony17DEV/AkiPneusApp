import { Feather } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
interface HeaderProps {
	title: string;
}

export function HeaderContainer({ title }: HeaderProps) {
	const navigation = useNavigation();
	const router = useRouter();
	const { signOut } = useAuth();

	const handleMenuPress = () => {
		navigation.dispatch(DrawerActions.openDrawer());
	};

	const handleNotificationsPress = () => {
		router.push('/notifications');
	};

	const handleSignOutPress = () => {
		Alert.alert(
			"Sair da Conta",
			"Tem certeza que deseja sair?",
			[
				{ text: "Cancelar", style: "cancel" },
				{ text: "Sair", style: "destructive", onPress: signOut }
			]
		);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.iconButton} onPress={handleMenuPress}>
				<Feather name="menu" size={26} color="#ffffffff" />
			</TouchableOpacity>

			<View>
				{title.startsWith('Olá') ? (
					<Image
						source={require('assets/images/logo.png')}
						style={styles.logo}
					/>
				) : (
					<Text style={styles.titleText}>{title}</Text>
				)}
			</View>

			<View style={styles.rightIconsContainer}>
				<TouchableOpacity style={styles.iconButton} onPress={handleNotificationsPress}>
					<Feather name="bell" size={26} color="#ffffffff" />
				</TouchableOpacity>

				<TouchableOpacity style={styles.iconButton} onPress={handleSignOutPress}>
					<Feather name="log-out" size={26} color="#ffffffff" />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
		paddingBottom: 15,
		backgroundColor: '#0095DA',
	},
	rightIconsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 15,
	},
	iconButton: {
		padding: 5,
	},
	titleText: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#ffffffff',
	},
	logo: {
		width: 150,
		height: 35,
		resizeMode: 'contain',
	},
});