import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChassiCaminhao } from '../../src/components/ChassiCaminhao';
import { apiService } from '../../src/services/apiService';

interface Veiculo {
	id: number;
	placa: string;
	codigo: string;
	marca: string;
	modelo: string;
	eixos: string;
	rodado: string;
	calibragem_padrao: string;
}

export default function ChecklistScreen() {
	const params = useLocalSearchParams();

	const [termoBusca, setTermoBusca] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const [listaVeiculos, setListaVeiculos] = useState<Veiculo[]>([]);
	const [veiculo, setVeiculo] = useState<Veiculo | null>(null);

	const [modalInspecaoVisible, setModalInspecaoVisible] = useState(false);
	const [pneuSelecionado, setPneuSelecionado] = useState('');
	const [formInspecao, setFormInspecao] = useState({ sulco: '', pressao: '' });

	useEffect(() => {
		if (params.placa) {
			setTermoBusca(params.placa as string);
			buscarVeiculosAPI(params.placa as string, true);
		} else {
			buscarVeiculosAPI('');
		}
	}, [params.placa]);

	const buscarVeiculosAPI = async (buscaTexto: string, autoSelect: boolean = false) => {
		Keyboard.dismiss();
		setIsLoading(true);

		const res = await apiService.buscarVeiculo(buscaTexto);
		setIsLoading(false);

		if (res && res.success && Array.isArray(res.data)) {
			setListaVeiculos(res.data);

			if (autoSelect && res.data.length === 1) {
				setVeiculo(res.data[0]);
			}
		} else {
			setListaVeiculos([]);
		}
	};

	const selecionarVeiculo = (v: Veiculo) => {
		setVeiculo(v);
		Keyboard.dismiss();
	};

	const handlePneuClick = (codigoPneu: string) => {
		setPneuSelecionado(codigoPneu);
		setFormInspecao({ sulco: '', pressao: veiculo?.calibragem_padrao || '' });
		setModalInspecaoVisible(true);
	};

	const salvarInspecaoPneu = () => {
		if (!formInspecao.sulco || !formInspecao.pressao) {
			Alert.alert('Atenção', 'Preencha o Sulco e a Pressão do pneu.');
			return;
		}
		Alert.alert('Sucesso', `Pneu ${pneuSelecionado} aferido!\nSulco: ${formInspecao.sulco}mm\nPressão: ${formInspecao.pressao}Lbs`);
		setModalInspecaoVisible(false);
		setFormInspecao({ sulco: '', pressao: '' });
	};

	const renderVeiculoItem = ({ item }: { item: Veiculo }) => (
		<TouchableOpacity style={styles.cardLista} onPress={() => selecionarVeiculo(item)}>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={styles.iconCircle}>
					<MaterialCommunityIcons name="truck-outline" size={20} color="#ED1C24" />
				</View>
				<View style={{ marginLeft: 12 }}>
					<Text style={styles.placaListText}>{item.placa}</Text>
					<Text style={styles.infoListText}>Frota: {item.codigo || 'S/N'} • {item.eixos}</Text>
				</View>
			</View>
			<Feather name="chevron-right" size={20} color="#ccc" />
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>

			{!veiculo && (
				<>
					<View style={styles.searchSection}>
						<Text style={styles.sectionTitle}>Localizar Veículo no Pátio</Text>
						<View style={styles.inputContainer}>
							<TextInput
								style={styles.input}
								placeholder="Placa ou Código..."
								placeholderTextColor="#999"
								value={termoBusca}
								onChangeText={(t) => {
									setTermoBusca(t);
									if (t.length > 2 || t.length === 0) buscarVeiculosAPI(t);
								}}
								autoCapitalize="characters"
								onSubmitEditing={() => buscarVeiculosAPI(termoBusca)}
							/>
							<TouchableOpacity style={styles.btnBuscar} onPress={() => buscarVeiculosAPI(termoBusca)}>
								{isLoading ? <ActivityIndicator color="#fff" /> : <Feather name="search" size={20} color="#fff" />}
							</TouchableOpacity>
						</View>
					</View>

					<Text style={styles.listTitle}>Veículos Disponíveis</Text>
					<FlatList
						data={listaVeiculos}
						keyExtractor={(item) => item.id.toString()}
						renderItem={renderVeiculoItem}
						showsVerticalScrollIndicator={false}
						contentContainerStyle={{ paddingBottom: 20 }}
						ListEmptyComponent={
							!isLoading ? <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text> : null
						}
					/>
				</>
			)}

			{veiculo && (
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
					<View style={styles.veiculoCard}>
						<View style={styles.veiculoHeader}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<MaterialCommunityIcons name="truck-outline" size={28} color="#333" />
								<Text style={styles.placaText}>{veiculo.placa}</Text>
							</View>
							<TouchableOpacity onPress={() => setVeiculo(null)} style={styles.btnTrocar}>
								<Feather name="arrow-left" size={14} color="#666" />
								<Text style={styles.btnTrocarText}>Voltar à Lista</Text>
							</TouchableOpacity>
						</View>

						<View style={styles.veiculoBody}>
							<View style={styles.infoBadge}>
								<Text style={styles.infoLabel}>Frota</Text>
								<Text style={styles.infoValue}>{veiculo.codigo || 'N/A'}</Text>
							</View>
							<View style={styles.infoBadge}>
								<Text style={styles.infoLabel}>Eixos</Text>
								<Text style={styles.infoValue}>{veiculo.eixos}</Text>
							</View>
							<View style={styles.infoBadge}>
								<Text style={styles.infoLabel}>Rodado</Text>
								<Text style={styles.infoValue}>{veiculo.rodado}</Text>
							</View>
							<View style={styles.infoBadge}>
								<Text style={styles.infoLabel}>Calibragem Padrão</Text>
								<Text style={[styles.infoValue, { color: '#ED1C24' }]}>{veiculo.calibragem_padrao} Lbs</Text>
							</View>
						</View>
					</View>

					<View style={styles.chassiContainer}>
						<Text style={styles.chassiTitle}>Mapeamento de Pneus</Text>
						<Text style={styles.chassiSub}>Toque no pneu correspondente para registrar a medição de sulco e pressão.</Text>

						<ChassiCaminhao
							qtdEixos={parseInt(veiculo.eixos.split(' ')[0]) || 2}
							onPneuPress={handlePneuClick}
						/>
					</View>
				</ScrollView>
			)}

			<Modal visible={modalInspecaoVisible} animationType="slide" transparent={true}>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>

						<View style={styles.modalHeader}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<MaterialCommunityIcons name="tire" size={24} color="#ED1C24" />
								<Text style={styles.modalTitle}> Aferir Pneu {pneuSelecionado}</Text>
							</View>
							<TouchableOpacity onPress={() => setModalInspecaoVisible(false)}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<Text style={styles.modalInfoText}>Veículo: <Text style={{ fontWeight: 'bold' }}>{veiculo?.placa}</Text></Text>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Sulco (mm)</Text>
								<TextInput
									style={styles.inputModal}
									placeholder="Ex: 15.5"
									keyboardType="numeric"
									value={formInspecao.sulco}
									onChangeText={(t) => setFormInspecao({ ...formInspecao, sulco: t })}
								/>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Pressão Atual (Lbs)</Text>
								<TextInput
									style={styles.inputModal}
									placeholder="Ex: 110"
									keyboardType="numeric"
									value={formInspecao.pressao}
									onChangeText={(t) => setFormInspecao({ ...formInspecao, pressao: t })}
								/>
							</View>
						</View>

						<TouchableOpacity style={styles.btnSalvarInspecao} onPress={salvarInspecaoPneu}>
							<Feather name="check" size={20} color="#fff" style={{ marginRight: 10 }} />
							<Text style={styles.btnSalvarText}>Salvar Medição</Text>
						</TouchableOpacity>

					</KeyboardAvoidingView>
				</View>
			</Modal>

		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8', paddingHorizontal: 20 },

	searchSection: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 3, marginTop: 20 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	inputContainer: { flexDirection: 'row', alignItems: 'center' },
	input: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#eee', borderRadius: 8, height: 50, paddingHorizontal: 15, fontSize: 16, color: '#333', marginRight: 10 },
	btnBuscar: { backgroundColor: '#ED1C24', width: 50, height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

	listTitle: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 25, marginBottom: 10, textTransform: 'uppercase' },
	cardLista: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
	iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffe5e6', justifyContent: 'center', alignItems: 'center' },
	placaListText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	infoListText: { fontSize: 12, color: '#888', marginTop: 2 },
	emptyText: { textAlign: 'center', color: '#999', marginTop: 20 },

	veiculoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#e0e0e0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
	veiculoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 15, marginBottom: 15 },
	placaText: { fontSize: 24, fontWeight: '900', color: '#333', marginLeft: 10, letterSpacing: 2 },
	btnTrocar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
	btnTrocarText: { fontSize: 12, color: '#666', marginLeft: 5, fontWeight: '600' },
	veiculoBody: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
	infoBadge: { width: '48%', backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#f0f0f0' },
	infoLabel: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 2 },
	infoValue: { fontSize: 15, color: '#333', fontWeight: 'bold' },

	chassiContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
	chassiTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start' },
	chassiSub: { fontSize: 13, color: '#666', alignSelf: 'flex-start', marginBottom: 5 },

	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
	modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, minHeight: 300, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
	modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
	modalInfoText: { fontSize: 14, color: '#666', marginBottom: 25 },
	row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
	inputGroupH: { width: '48%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#000' },
	btnSalvarInspecao: { backgroundColor: '#28a745', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});