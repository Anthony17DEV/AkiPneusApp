import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	Keyboard,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';
import { runBackgroundSync } from '../../src/services/backgroundSync';

interface VeiculoBusca {
	id: number;
	placa: string;
	eixos: string;
}

export default function DashboardScreen() {
	const { user } = useAuth();
	const router = useRouter();

	const nomeEmpresa = user?.empresa_nome || 'Smart Pneus';
	const primeiroNome = user?.nome ? user.nome.trim().split(' ')[0] : 'Analista';
	const cargoUsuario = user?.nivel || 'Aferidor';
	const fotoEmpresa = user?.empresa_foto || '';

	const [termoBusca, setTermoBusca] = useState('');
	const [isBuscando, setIsBuscando] = useState(false);
	const [veiculoEncontrado, setVeiculoEncontrado] = useState<VeiculoBusca | null>(null);

	const URL_FOTOS = 'https://sistemascactus.com.br/apicactus/akipneus/fotos/';

	useEffect(() => {
		runBackgroundSync();
	}, []);

	const handleBuscar = async () => {
		if (!termoBusca.trim()) {
			Alert.alert('Atenção', 'Digite a placa ou código da frota.');
			return;
		}

		Keyboard.dismiss();
		setIsBuscando(true);
		setVeiculoEncontrado(null);

		try {
			const res = await apiService.buscarVeiculo(termoBusca);

			if (res && res.success && res.data) {
				if (Array.isArray(res.data)) {
					const termo = termoBusca.trim().toUpperCase();
					const encontrado = res.data.find(
						(v: any) =>
							String(v.placa || v.veic_tx_placa || '').toUpperCase().includes(termo) ||
							String(v.codigo || v.veic_tx_codigo || '').toUpperCase().includes(termo)
					);

					if (encontrado) {
						const dadosExtras = encontrado.dados_json ? JSON.parse(encontrado.dados_json) : encontrado;
						setVeiculoEncontrado({
							id: encontrado.id || dadosExtras.id || dadosExtras.veic_nb_id,
							placa: encontrado.placa || dadosExtras.placa || dadosExtras.veic_tx_placa,
							eixos: dadosExtras.eixos || dadosExtras.veic_tx_eixos || '0',
						});
					} else {
						Alert.alert('Ops!', 'Veículo não encontrado no cache offline.');
					}
				} else {
					setVeiculoEncontrado(res.data);
				}
			} else {
				Alert.alert('Ops!', res?.message || 'Veículo não encontrado.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha ao buscar veículo.');
		} finally {
			setIsBuscando(false);
		}
	};

	const iniciarInspecao = () => {
		if (!veiculoEncontrado) return;
		router.push(`/checklist?placa=${veiculoEncontrado.placa}`);
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
			<View style={styles.header}>
				<View style={{ flex: 1, marginRight: 12 }}>
					<Text style={styles.greeting} numberOfLines={1}>
						{nomeEmpresa}
					</Text>
					<View style={styles.subHeaderRow}>
						<Text style={styles.subGreeting}>{primeiroNome}</Text>
						<View style={styles.badgeNivel}>
							<FontAwesome5 name="tools" size={11} color="#0c6ead" />
							<Text style={styles.badgeText}>{cargoUsuario}</Text>
						</View>
					</View>
				</View>

				{fotoEmpresa ? (
					<Image
						source={{ uri: `${URL_FOTOS}${fotoEmpresa}` }}
						style={styles.avatar}
					/>
				) : (
					<View style={[styles.avatar, styles.avatarPlaceholder]}>
						<Feather name="briefcase" size={24} color="#999" />
					</View>
				)}
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

					<TouchableOpacity
						style={styles.btnBuscar}
						onPress={handleBuscar}
						disabled={isBuscando}
					>
						{isBuscando ? (
							<ActivityIndicator color="#fff" size="small" />
						) : (
							<Feather name="search" size={20} color="#fff" />
						)}
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

			<View style={styles.actionContainer}>
				<TouchableOpacity
					style={styles.actionCard}
					onPress={() => router.push('/clientes')}
					activeOpacity={0.8}
				>
					<View style={styles.actionIconContainer}>
						<Image
							source={require('../../assets/images/icon_checklist_dashboard.png')}
							style={styles.actionImage}
							resizeMode="contain"
						/>
					</View>

					<View style={styles.actionContent}>
						<Text style={styles.actionTitle}>Diagnóstico 360º</Text>
						<Text style={styles.actionDesc}>
							Inspeção dos veículos da frota
						</Text>
					</View>

					<Feather
						name="chevron-right"
						size={26}
						color="#0c6ead"
					/>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.actionCard}
					onPress={() => router.push('/checklist_avulso')}
					activeOpacity={0.8}
				>
					<View style={styles.actionIconContainer}>
						<Image
							source={require('../../assets/images/icon_sucata_dashboard.png')}
							style={styles.actionImage}
							resizeMode="contain"
						/>
					</View>

					<View style={styles.actionContent}>
						<Text style={styles.actionTitle}>Gestão de Descarte</Text>
						<Text style={styles.actionDesc}>
							Gestão e avaliação de pneus
						</Text>
					</View>

					<Feather
						name="chevron-right"
						size={26}
						color="#0c6ead"
					/>
				</TouchableOpacity>
			</View>

			<View style={{ height: 30 }} />
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f4f6f8',
		paddingHorizontal: 20,
	},
	header: {
		marginTop: 20,
		marginBottom: 25,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingTop: 20,
	},
	greeting: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#333',
	},
	subHeaderRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 6,
	},
	subGreeting: {
		fontSize: 15,
		fontWeight: '600',
		color: '#555',
		marginRight: 8,
	},
	badgeNivel: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E2E8F0',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 12,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#0c6ead',
		marginLeft: 6,
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	avatarPlaceholder: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
	},
	sectionBusca: {
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 12,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 10,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		flex: 1,
		backgroundColor: '#f9f9f9',
		borderWidth: 1,
		borderColor: '#eee',
		borderRadius: 8,
		height: 50,
		paddingHorizontal: 15,
		fontSize: 16,
		color: '#333',
		marginRight: 10,
	},
	btnBuscar: {
		backgroundColor: '#0c6ead',
		width: 50,
		height: 50,
		borderRadius: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	resultCard: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f9f9f9',
		padding: 15,
		borderRadius: 8,
		marginTop: 15,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	placaText: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	infoText: {
		fontSize: 12,
		color: '#666',
		marginTop: 4,
	},
	btnPlay: {
		backgroundColor: '#28a745',
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	actionContainer: {
		marginBottom: 25,
	},
	actionIconContainer: {
		width: 95,
		height: 95,
		borderRadius: 16,
		backgroundColor: '#f4f6f8',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 18,
	},
	actionCard: {
		width: '100%',
		minHeight: 135,
		backgroundColor: '#fff',
		borderRadius: 14,
		paddingHorizontal: 18,
		paddingVertical: 16,
		marginBottom: 15,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 3,
		borderWidth: 1,
		borderColor: '#edf0f2',
	},
	actionImage: {
		width: 78,
		height: 78,
	},
	actionContent: {
		flex: 1,
	},
	actionTitle: {
		fontSize: 19,
		fontWeight: '700',
		color: '#333',
		marginBottom: 5,
	},
	actionDesc: {
		fontSize: 13,
		color: '#777',
		lineHeight: 18,
	},
});