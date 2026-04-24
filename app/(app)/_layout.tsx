import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';


function CustomDrawerContent(props: DrawerContentComponentProps) {
	const { user, signOut } = useAuth();

	const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Usuário';

	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';

	return (
		<DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
			<View style={styles.drawerHeader}>
				{user?.foto ? (
					<Image source={{ uri: `${URL_FOTOS}${user.foto}` }} style={styles.avatar} />
				) : (
					<View style={styles.avatarPlaceholder}>
						<Feather name="user" size={32} color="#fff" />
					</View>
				)}
				<Text style={styles.userName}>{primeiroNome}</Text>
				<Text style={styles.userLevel}>{user?.nivel || 'Assessor'}</Text>
			</View>

			<View style={{ flex: 1, paddingTop: 10 }}>
				<DrawerItemList {...props} />
			</View>

			<View style={styles.logoutContainer}>
				<DrawerItem
					label="Sair da Conta"
					icon={({ size }) => <Feather name="log-out" size={size} color="#ED1C24" />}
					labelStyle={{ color: '#ED1C24', fontWeight: 'bold', marginLeft: -10 }}
					onPress={signOut}
				/>
			</View>
		</DrawerContentScrollView>
	);
}

export default function AppLayout() {
	const { signOut } = useAuth();

	return (
		<Drawer
			drawerContent={(props) => <CustomDrawerContent {...props} />}
			screenOptions={{
				headerStyle: { backgroundColor: '#ED1C24' },
				headerTintColor: '#fff',
				drawerActiveTintColor: '#ED1C24',
				drawerInactiveTintColor: '#333',
				drawerActiveBackgroundColor: '#ffe5e6',
				headerRight: () => (
					<TouchableOpacity onPress={signOut} style={{ marginRight: 15, padding: 5 }}>
						<Feather name="power" size={22} color="#fff" />
					</TouchableOpacity>
				),
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					drawerLabel: 'Dashboard',
					title: 'Dashboard',
					drawerIcon: ({ color, size }) => <Feather name="pie-chart" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="clientes"
				options={{
					drawerLabel: 'Clientes',
					title: 'Clientes',
					drawerIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="veiculos"
				options={{
					drawerLabel: 'Veículos',
					title: 'Veículos',
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="truck-outline" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="checklist"
				options={{
					drawerLabel: 'Checklist',
					title: 'Checklist',
					drawerIcon: ({ color, size }) => <Feather name="check-square" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name="perfil"
				options={{
					drawerLabel: 'Perfil',
					title: 'Perfil',
					drawerIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
				}}
			/>
		</Drawer>
	);
}

const styles = StyleSheet.create({
	drawerHeader: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
		alignItems: 'center',
		marginBottom: 10,
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 10,
		borderWidth: 2,
		borderColor: '#ED1C24',
	},
	avatarPlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	userName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	userLevel: {
		fontSize: 14,
		color: '#666',
		marginTop: 4,
	},
	logoutContainer: {
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
		paddingBottom: 20,
		paddingTop: 10,
	},
});