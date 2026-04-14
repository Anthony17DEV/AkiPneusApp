import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Agendamento { id: number; cliente: string; data: string; hora: string; tipo: string; }
interface Atendimento { id: number; cliente: string; data: string; status: string; }
interface LeadMapa { id: number; nome: string; latitude: number; longitude: number; }

export default function DashboardScreen() {
	const { user } = useAuth();
	const router = useRouter();
	const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Usuário';

	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
	const [ultimosAtendimentos, setUltimosAtendimentos] = useState<Atendimento[]>([]);
	const [leadsMapa, setLeadsMapa] = useState<LeadMapa[]>([]);

	const carregarDashboard = async () => {
		const res = await apiService.buscarDashboard(user?.id);

		if (res && res.success && res.data) {
			setAgendamentos(res.data.proximosAgendamentos || []);
			setUltimosAtendimentos(res.data.ultimosAtendimentos || []);
			setLeadsMapa(res.data.leadsMapa || []);
		} else {
			console.log("⚠️ API retornou sucesso false ou sem dados.");
		}

		setIsLoading(false);
		setRefreshing(false);
	};

	useEffect(() => {
		carregarDashboard();
	}, []);

	const onRefresh = () => {
		setRefreshing(true);
		carregarDashboard();
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
				<ActivityIndicator size="large" color="#ED1C24" />
				<Text style={{ marginTop: 10, color: '#666' }}>Sincronizando Dashboard...</Text>
			</View>
		);
	}

	return (
		<ScrollView
			style={styles.container}
			showsVerticalScrollIndicator={false}
			refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ED1C24']} />}
		>
			<View style={styles.header}>
				<View>
					<Text style={styles.greeting}>Olá, {primeiroNome}!</Text>
					<View style={styles.badgeNivel}>
						<Feather name="shield" size={14} color="#ED1C24" />
						<Text style={styles.badgeText}>{user?.nivel || 'Assessor'}</Text>
					</View>
				</View>
				<View style={styles.avatarPlaceholder}>
					<Feather name="user" size={24} color="#fff" />
				</View>
			</View>

			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
					<TouchableOpacity onPress={() => router.push('/agenda')}>
						<Text style={styles.linkText}>Ver todos</Text>
					</TouchableOpacity>
				</View>

				{agendamentos.length === 0 ? (
					<View style={styles.emptyBox}>
						<Text style={styles.emptyText}>Nenhum agendamento previsto.</Text>
					</View>
				) : (
					<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
						{agendamentos.map((item) => (
							<View key={item.id} style={styles.card}>
								<View style={styles.cardHeader}>
									<Feather name="calendar" size={18} color="#ED1C24" />
									<Text style={styles.cardDate}>{item.data} às {item.hora}</Text>
								</View>
								<Text style={styles.clientName} numberOfLines={1}>{item.cliente}</Text>
								<Text style={styles.cardType} numberOfLines={1}>{item.tipo}</Text>
							</View>
						))}
					</ScrollView>
				)}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Últimos Atendimentos</Text>
				{ultimosAtendimentos.length === 0 ? (
					<View style={styles.emptyBox}>
						<Text style={styles.emptyText}>Nenhum atendimento finalizado.</Text>
					</View>
				) : (
					ultimosAtendimentos.map((item) => (
						<View key={item.id} style={styles.listCard}>
							<View style={{ flex: 1, marginRight: 10 }}>
								<Text style={styles.clientName} numberOfLines={1}>{item.cliente}</Text>
								<Text style={styles.cardDate}>Realizado em: {item.data}</Text>
							</View>
							<View style={styles.statusBadge}>
								<Feather name="check-circle" size={14} color="#28a745" />
								<Text style={styles.statusText}>{item.status}</Text>
							</View>
						</View>
					))
				)}
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Leads Atendidos (Mês Atual)</Text>
				<View style={styles.mapContainer}>
					<MapView
						style={styles.map}
						initialRegion={{
							latitude: leadsMapa.length > 0 ? leadsMapa[0].latitude : -5.8045,
							longitude: leadsMapa.length > 0 ? leadsMapa[0].longitude : -35.2094,
							latitudeDelta: 0.09,
							longitudeDelta: 0.09,
						}}
					>
						{leadsMapa.map((lead) => (
							<Marker
								key={lead.id}
								coordinate={{ latitude: lead.latitude, longitude: lead.longitude }}
								title={lead.nome}
								description="Atendimento realizado este mês"
								pinColor="#ED1C24"
							/>
						))}
					</MapView>
				</View>
			</View>

			<View style={{ height: 30 }} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8', paddingHorizontal: 20 },
	header: { marginTop: 20, marginBottom: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20 },
	greeting: { fontSize: 24, fontWeight: 'bold', color: '#333' },
	badgeNivel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffe5e6', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginTop: 6, alignSelf: 'flex-start' },
	badgeText: { fontSize: 12, fontWeight: '600', color: '#ED1C24', marginLeft: 4 },
	avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
	section: { marginBottom: 30 },
	sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
	linkText: { color: '#0277bd', fontSize: 14, fontWeight: 'bold' },
	emptyBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
	emptyText: { color: '#888', fontStyle: 'italic' },
	horizontalScroll: { paddingRight: 20, paddingBottom: 10 },
	card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginRight: 15, width: 240, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 },
	cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
	cardDate: { marginLeft: 8, fontSize: 14, color: '#666', fontWeight: '500' },
	clientName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
	cardType: { fontSize: 14, color: '#888' },
	listCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 2 },
	statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f4ea', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
	statusText: { color: '#28a745', fontSize: 12, fontWeight: '600', marginLeft: 4 },
	mapContainer: { height: 250, borderRadius: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 },
	map: { flex: 1 },
});