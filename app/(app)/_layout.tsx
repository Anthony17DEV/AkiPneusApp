import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Drawer, DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from 'expo-router/drawer';
import { Alert, Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const HeaderLogo = () => (
	<Image
		source={require('../../assets/images/smart_pneus.png')}
		style={{ width: 120, height: 40 }}
		resizeMode="contain"
	/>
);

function CustomDrawerContent(props: DrawerContentComponentProps) {
	const { user, signOut } = useAuth();
	const router = useRouter();

	const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Usuário';
	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus/fotos/';

	const confirmSignOut = () => {
		Alert.alert(
			'Sair da Conta',
			'Tem certeza que deseja sair do aplicativo?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Sair', style: 'destructive', onPress: signOut },
			]
		);
	};

	return (
		<View style={{ flex: 1 }}>
			<DrawerContentScrollView {...props}>
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

				<View style={{ paddingTop: 10, paddingBottom: 20 }}>
					{props.state.routes.map((route, index) => {
						const { options } = props.descriptors[route.key];
						const label = options.drawerLabel !== undefined ? options.drawerLabel : options.title !== undefined ? options.title : route.name;
						const isFocused = props.state.index === index;

						if (route.name === 'danos' && user?.nivel?.toUpperCase() !== 'ADMINISTRADOR') {
							return null;
						}

						if ((options.drawerItemStyle as any)?.display === 'none' || route.name === 'checklist') {
							return null;
						}

						return (
							<DrawerItem
								key={route.key}
								label={label as string}
								icon={options.drawerIcon}
								focused={isFocused}
								activeTintColor={options.drawerActiveTintColor}
								inactiveTintColor={options.drawerInactiveTintColor}
								activeBackgroundColor={options.drawerActiveBackgroundColor}
								onPress={() => {
									const routePath = route.name === 'index' ? '/' : `/${route.name}`;
									router.replace(routePath as any);
								}}
							/>
						);
					})}
				</View>
			</DrawerContentScrollView>

			<View style={styles.logoutContainer}>
				<DrawerItem
					label="SAIR"
					icon={({ size }) => <Feather name="log-out" size={size} color="#E53935" />}
					labelStyle={{ color: '#E53935', fontWeight: 'bold', marginLeft: -10 }}
					onPress={confirmSignOut}
				/>
			</View>
		</View>
	);
}

export default function AppLayout() {
	const { signOut } = useAuth();

	const confirmSignOut = () => {
		Alert.alert(
			'Sair da Conta',
			'Tem certeza que deseja sair do aplicativo?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{ text: 'Sair', style: 'destructive', onPress: signOut },
			]
		);
	};

	return (
		<Drawer
			drawerContent={(props) => <CustomDrawerContent {...props} />}
			screenOptions={{
				//@ts-ignore
				unmountOnBlur: true,
				headerStyle: { backgroundColor: '#0c6ead' },
				headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : undefined,

				headerTintColor: '#fff',
				drawerActiveTintColor: '#0c6ead',
				drawerInactiveTintColor: '#333',
				drawerActiveBackgroundColor: '#ffe5e6',
				headerTitleAlign: 'center',
				headerLeftContainerStyle: { paddingLeft: 5 },
				headerRightContainerStyle: { paddingRight: 5 },

				headerRight: () => (
					<TouchableOpacity onPress={confirmSignOut} style={{ padding: 10 }}>
						<Feather name="power" size={22} color="#fff" />
					</TouchableOpacity>
				),
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					drawerLabel: 'Inicial',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="pie-chart" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="clientes"
				options={{
					drawerLabel: 'Checklist',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => (
						<Feather name="check-square" size={size} color={color} />
					),
				}}
			/>

			<Drawer.Screen
				name="veiculos"
				options={{
					drawerLabel: 'Check-List Ve�culos',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons
							name="truck-outline"
							size={size}
							color={color}
						/>
					),
					drawerItemStyle: { display: 'none' },
				}}
			/>

			<Drawer.Screen
				name="pneus"
				options={{
					drawerLabel: 'Buscar Pneus',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="tire" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="checklist_avulso"
				options={{
					drawerLabel: 'Análise Sucata',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-list-outline" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="referencias"
				options={{
					drawerLabel: 'Referencias Pneus',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="tag" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="bandas"
				options={{
					drawerLabel: 'Bandas Rodagem',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="disc" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="reformadores"
				options={{
					drawerLabel: 'Reformadores',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="briefcase" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="marcas_veiculos"
				options={{
					drawerLabel: 'Marcas Veículos',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <MaterialCommunityIcons name="car" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="danos"
				options={{
					drawerLabel: 'Registro de Danos',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="car-wrench" size={size} color={color} />
					),
				}}
			/>

			<Drawer.Screen
				name="usuarios"
				options={{
					drawerLabel: 'Gerenciar Usuário',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="user-plus" size={size} color={color} />,
				}}
			/>

			<Drawer.Screen
				name="marcas"
				options={{
					drawerLabel: 'Marcas',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="bookmark" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
				}}
			/>

			<Drawer.Screen
				name="modelos"
				options={{
					drawerLabel: 'Modelos',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="box" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
				}}
			/>

			<Drawer.Screen
				name="checklist"
				options={{
					drawerLabel: 'Checklist',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="check-square" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
				}}
			/>

			<Drawer.Screen
				name="perfil"
				options={{
					drawerLabel: 'Perfil',
					headerTitle: HeaderLogo,
					drawerIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
					drawerItemStyle: { display: 'none' },
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
	logoutContainer: { borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 10, backgroundColor: '#fff' },
});