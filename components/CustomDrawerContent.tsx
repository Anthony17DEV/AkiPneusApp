import { Feather } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from 'expo-router/drawer';
import PlaceholderAvatar from 'assets/images/avatar_placeholder.png';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';


export function CustomDrawerContent(props: DrawerContentComponentProps) {
	const { user, signOut } = useAuth();
	const { bottom } = useSafeAreaInsets();

	const handleSignOut = () => {
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
		<View style={{ flex: 1 }}>
			<View style={styles.header}>
				<Image
					source={user?.foto ? { uri: user.foto } : PlaceholderAvatar}
					style={styles.avatar}
				/>
				<Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
			</View>

			<DrawerContentScrollView
				{...props}
				style={{ flex: 1 }}
				contentContainerStyle={{ paddingTop: 25 }}
			>
				<DrawerItemList {...props} />
			</DrawerContentScrollView>


			<TouchableOpacity onPress={handleSignOut}>
				<View style={[styles.footer, { paddingBottom: bottom > 0 ? bottom + 10 : 20 }]}>
					<Feather name="log-out" size={20} color="#666" />
					<Text style={styles.footerText}>Sair</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	header: {
		padding: 20,
		paddingTop: 40,
		backgroundColor: '#0095DA',
		alignItems: 'center',
		marginBottom: 10,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 10,
	},
	userName: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
	},
	footer: {
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 20,
		paddingHorizontal: 20,
		flexDirection: 'row',
		alignItems: 'center',
	},
	footerText: {
		marginLeft: 15,
		fontSize: 16,
		color: '#666',
	},
});