import { Feather } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

type ActionCardData = {
	id: string;
	title: string;
	icon: React.ComponentProps<typeof Feather>['name'];
	route: Href;
};

const clienteActionsData: ActionCardData[] = [
	{ id: '1', title: 'Alterar Limite', icon: 'sliders', route: '/alterar-limite' },
	{ id: '2', title: 'Transações', icon: 'list', route: '/transacoes' },
	{ id: '3', title: 'Condutores', icon: 'users', route: '/condutores' },
	{ id: '4', title: 'Veículos', icon: 'truck', route: '/veiculos' },
	{ id: '5', title: 'Meu Perfil', icon: 'user', route: '/profile' },
];

const motoristaActionsData: ActionCardData[] = [
	{ id: '1', title: 'Transações', icon: 'list', route: '/transacoes' },
	{ id: '2', title: 'Veiculos', icon: 'truck', route: '/veiculos' },
	{ id: '3', title: 'Notificações', icon: 'bell', route: '/notifications' },
	{ id: '4', title: 'Meu Perfil', icon: 'user', route: '/profile' },
];


export function NewArrivalContainer() {
	const router = useRouter();
	const { user } = useAuth();

	const isMotorista = user?.nivel === 'Motorista';
	const data = isMotorista ? motoristaActionsData : clienteActionsData;

	const renderActionCard = ({ item }: { item: ActionCardData }) => (
		<TouchableOpacity style={styles.card} onPress={() => router.push(item.route)}>
			<Feather name={item.icon} size={32} color="#0095DA" />
			<Text style={styles.cardTitle}>{item.title}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<Text style={styles.headerTitle}>{""}</Text>
			<FlatList
				data={data}
				renderItem={renderActionCard}
				keyExtractor={(item) => item.id}
				numColumns={2}
				scrollEnabled={false}
				columnWrapperStyle={styles.row}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginTop: 25,
		paddingHorizontal: 20,
		backgroundColor: '#f5f5f5',
		paddingBottom: 20,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		marginBottom: -40,
		color: '#333',
	},
	row: {
		justifyContent: 'space-between',
	},
	card: {
		backgroundColor: 'white',
		borderRadius: 12,
		padding: 20,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 15,
		width: '48%',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 4,
		minHeight: 120,
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginTop: 12,
		textAlign: 'center',
	},
});