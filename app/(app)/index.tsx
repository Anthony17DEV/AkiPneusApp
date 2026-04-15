import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Inspecao { id: number; placa: string; cliente: string; data: string; status: string; }
interface VeiculoBusca { id: number; placa: string; eixos: string; }

export default function DashboardScreen() {
	const { user } = useAuth();
	const router = useRouter();
	const primeiroNome = user?.nome ? user.nome.split(' ')[0] : 'Analista';

	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const [veiculosHoje, setVeiculosHoje] = useState(0);
	const [pneusHoje, setPneusHoje] = useState(0);
	const [ultimasInspecoes, setUltimasInspecoes] = useState<Inspecao[]>([]);

	const [termoBusca, setTermoBusca] = useState('');
	const [isBuscando, setIsBuscando] = useState(false);
	const [veiculoEncontrado, setVeiculoEncontrado] = useState<VeiculoBusca | null>(null);

	const carregarDashboard = async () => {
		const res = await apiService.buscarDashboard(user?.id);
		if (res && res.success && res.data) {
			setVeiculosHoje(res.data.veiculosHoje || 0);
			setPneusHoje(res.data.pneusHoje || 0);
			setUltimasInspecoes(res.data.ultimasInspecoes || []);
		}
		setIsLoading(false);
		setRefreshing(false);
	};

	useEffect(() => { carregarDashboard(); }, []);

	const onRefresh = () => {
		setRefreshing(true);
		carregarDashboard();
	};

	const handleBuscar = async () => {
		if (!termoBusca.trim()) {
			Alert.alert('Atenção', 'Digite a placa ou código da frota.');
			return;
		}
		Keyboard.dismiss();
		setIsBuscando(true);
		setVeiculoEncontrado(null);

		const res = await apiService.buscarVeiculo(termoBusca);
		setIsBuscando(false);

		if (res && res.success && res.data) {
			setVeiculoEncontrado(res.data);
		} else {
			Alert.alert('Ops!', res?.message || 'Veículo não encontrado.');
		}
	};

	const iniciarInspecao = () => {
		if (!veiculoEncontrado) return;
		router.push(`/checklist?placa=${veiculoEncontrado.placa}`);
	};

	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
				<ActivityIndicator size="large" color="#ED1C24" />
				<Text style={{ marginTop: 10, color: '#666' }}>Carregando dados da frota...</Text>
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
					<Text style={styles.greeting}>Fala, {primeiroNome}!</Text>
					<View style={styles.badgeNivel}>
						<FontAwesome5 name="tools" size={12} color="#ED1C24" />
						<Text style={styles.badgeText}>{user?.nivel || 'Aferidor'}</Text>
					</View>
				</View>
				<View style={styles.avatarPlaceholder}>
					<Feather name="user" size={24} color="#fff" />
				</View>
			</View>

			<View style={styles.sectionBusca}>
				<Text style={styles.sectionTitle}>Iniciar Nova Inspeção</Text>
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.input}
						placeholder="Placa ou Código do Caminhão"
						placeholderTextColor="#999"
						value={termoBusca}
						onChangeText={setTermoBusca}
						autoCapitalize="characters"
						onSubmitEditing={handleBuscar}
					/>
					<TouchableOpacity style={styles.btnBuscar} onPress={handleBuscar} disabled={isBuscando}>
						{isBuscando ? <ActivityIndicator color="#fff" size="small" /> : <Feather name="search" size={20} color="#fff" />}
					</TouchableOpacity>
				</View>

				{veiculoEncontrado && (
					<View style={styles.resultCard}>
						<View style={{ flex: 1 }}>
							<Text style={styles.placaText}>{veiculoEncontrado.placa}</Text>
							<Text style={styles.infoText}>{veiculoEncontrado.eixos} Eixos</Text>
						</View>
						<TouchableOpacity style={styles.btnPlay} onPress={iniciarInspecao}>
							<Feather name="play" size={18} color="#fff" />
						</TouchableOpacity>
					</View>
				)}
			</View>

			<View style={styles.rowCards}>
				<View style={[styles.statCard, { borderLeftColor: '#ED1C24', borderLeftWidth: 4 }]}>
					<Feather name="truck" size={24} color="#ED1C24" />
					<Text style={styles.statValue}>{veiculosHoje}</Text>
					<Text style={styles.statLabel}>Veículos Hoje</Text>
				</View>
				<View style={[styles.statCard, { borderLeftColor: '#333', borderLeftWidth: 4 }]}>
					<Feather name="disc" size={24} color="#333" />
					<Text style={styles.statValue}>{pneusHoje}</Text>
					<Text style={styles.statLabel}>Pneus Aferidos</Text>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Últimas Inspeções (Histórico)</Text>
				{ultimasInspecoes.length === 0 ? (
					<View style={styles.emptyBox}>
						<Text style={styles.emptyText}>Nenhuma inspeção realizada ainda.</Text>
					</View>
				) : (
					ultimasInspecoes.map((item) => (
						<View key={item.id} style={styles.listCard}>
							<View style={{ flex: 1, marginRight: 10 }}>
								<Text style={styles.clientName} numberOfLines={1}>{item.placa}</Text>
								<Text style={styles.cardDate}>Cliente: {item.cliente}</Text>
								<Text style={styles.cardType}>Data: {item.data}</Text>
							</View>
							<View style={[styles.statusBadge, item.status === 'aberto' ? { backgroundColor: '#fff3e0' } : {}]}>
								<Feather name={item.status === 'aberto' ? "clock" : "check-circle"} size={14} color={item.status === 'aberto' ? "#e65100" : "#28a745"} />
								<Text style={[styles.statusText, item.status === 'aberto' ? { color: '#e65100' } : {}]}>{item.status.toUpperCase()}</Text>
							</View>
						</View>
					))
				)}
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
	badgeText: { fontSize: 12, fontWeight: '600', color: '#ED1C24', marginLeft: 6 },
	avatarPlaceholder: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },

	sectionBusca: { backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	inputContainer: { flexDirection: 'row', alignItems: 'center' },
	input: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, height: 50, paddingHorizontal: 15, fontSize: 16, color: '#333', marginRight: 10 },
	btnBuscar: { backgroundColor: '#ED1C24', width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

	resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginTop: 15, borderWidth: 1, borderColor: '#ddd' },
	placaText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	infoText: { fontSize: 12, color: '#666', marginTop: 4 },
	btnPlay: { backgroundColor: '#28a745', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

	rowCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
	statCard: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, marginHorizontal: 5 },
	statValue: { fontSize: 24, fontWeight: 'bold', color: '#333', marginTop: 10 },
	statLabel: { fontSize: 12, color: '#888', marginTop: 5 },

	section: { marginBottom: 30 },
	emptyBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#ccc' },
	emptyText: { color: '#888', fontStyle: 'italic' },
	listCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 2 },
	clientName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
	cardDate: { fontSize: 14, color: '#555', marginBottom: 2 },
	cardType: { fontSize: 12, color: '#888' },
	statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f4ea', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
	statusText: { color: '#28a745', fontSize: 12, fontWeight: '600', marginLeft: 4 },
});