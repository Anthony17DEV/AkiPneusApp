import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
					icon={({ size }) => <Feather name="log-out" size={size} color="#0c6ead" />}
					labelStyle={{ color: '#0c6ead', fontWeight: 'bold', marginLeft: -10 }}
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
				headerStyle: { backgroundColor: '#0c6ead' },
				headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : undefined,

				headerTintColor: '#fff',
				drawerActiveTintColor: '#0c6ead',
				drawerInactiveTintColor: '#333',
				drawerActiveBackgroundColor: '#ffe5e6',
				headerTitleAlign: 'center',
				headerLeftContainerStyle: { width: 60, alignItems: 'center', justifyContent: 'center' },
				headerRightContainerStyle: { width: 60, alignItems: 'center', justifyContent: 'center' },

				headerRight: () => (
					<TouchableOpacity onPress={signOut} style={{ padding: 10 }}>
						<Feather name="power" size={22} color="#fff" />
					</TouchableOpacity>
				),
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					drawerLabel: 'Dashboard',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <Feather name="pie-chart" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="clientes"
				options={{
					drawerLabel: 'Clientes',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="veiculos"
				options={{
					drawerLabel: 'Veículos',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="truck-outline" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="pneus"
				options={{
					drawerLabel: 'Pneus',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="tire" size={size} color={color} />,
				}}
			/>
			<Drawer.Screen
				name="checklist"
				options={{
					drawerLabel: 'Checklist',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <Feather name="check-square" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
				}}
			/>
			<Drawer.Screen
				name="perfil"
				options={{
					drawerLabel: 'Perfil',
					headerTitle: () => (
						<Image source={require('../../assets/images/solutires.png')} style={{ width: 120, height: 40 }} resizeMode="contain" />
					),
					drawerIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
				}}
			/>
		</Drawer>
	);
}

const styles = StyleSheet.create({
	drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'center', marginBottom: 10 },
	avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: '#0c6ead' },
	avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
	userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	userLevel: { fontSize: 14, color: '#666', marginTop: 4 },
	logoutContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingBottom: 20, paddingTop: 10 },
});