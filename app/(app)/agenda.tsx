import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
	ActivityIndicator, Alert, FlatList, KeyboardAvoidingView,
	Modal, Platform, ScrollView, StyleSheet, Text, TextInput,
	TouchableOpacity, View
} from 'react-native';
import { AutocompleteDropdown, AutocompleteDropdownContextProvider } from 'react-native-autocomplete-dropdown';
import { MaskedTextInput } from 'react-native-mask-text';
import RNPickerSelect from 'react-native-picker-select';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Agendamento {
	id: number;
	titulo: string;
	data: string;
	hora: string;
	situacao: string;
	observacao: string;
	cliente: string;
}

export default function AgendaScreen() {
	const { user } = useAuth();

	const [agenda, setAgenda] = useState<Agendamento[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const [filtroDataIni, setFiltroDataIni] = useState('');
	const [filtroDataFim, setFiltroDataFim] = useState('');
	const [filtroCliente, setFiltroCliente] = useState('');
	const [filtroSituacao, setFiltroSituacao] = useState('');

	const [modalInserirVisible, setModalInserirVisible] = useState(false);
	const [modalEncerrarVisible, setModalEncerrarVisible] = useState(false);

	const [formNovo, setFormNovo] = useState({ cliente_id: '', data: '', hora: '', assunto: '', descricao: '' });

	const [sugestoesClientes, setSugestoesClientes] = useState<{ id: string, title: string }[]>([]);
	const [isBuscandoClientes, setIsBuscandoClientes] = useState(false);

	const [itemSelecionado, setItemSelecionado] = useState<Agendamento | null>(null);
	const [obsEncerramento, setObsEncerramento] = useState('');

	useEffect(() => {
		carregarAgenda();
	}, []);

	const carregarAgenda = async () => {
		setIsLoading(true);
		const payload = {
			user_id: user?.id,
			data_inicial: filtroDataIni,
			data_final: filtroDataFim,
			cliente: filtroCliente,
			situacao: filtroSituacao
		};
		const res = await apiService.listarAgenda(payload);
		if (res && res.success) {
			setAgenda(res.data);
		} else {
			Alert.alert('Erro', res?.message || 'Falha ao carregar a agenda.');
		}
		setIsLoading(false);
	};

	const buscarClientesSugestao = async (texto: string) => {
		if (!texto || texto.length < 3) {
			setSugestoesClientes([]);
			return;
		}

		setIsBuscandoClientes(true);

		try {
			const res = await apiService.buscarClientes(user?.id, user?.nivel, { nome: texto }, 1);

			if (res && res.success && res.data && res.data.length > 0) {
				const drop = res.data.map((c: any) => ({
					id: String(c.id),
					title: String(c.nome || c.identificacao || 'Sem nome')
				}));

				setSugestoesClientes(drop);
			} else {
				setSugestoesClientes([]);
			}
		} catch (error) {
			setSugestoesClientes([]);
		} finally {
			setIsBuscandoClientes(false);
		}
	};

	const handleSalvarNovo = async () => {
		if (!formNovo.cliente_id || !formNovo.data || !formNovo.assunto) {
			Alert.alert('Atenção', 'Preencha Cliente, Data e Assunto.');
			return;
		}

		setIsSalvando(true);

		let lat = null;
		let lng = null;

		try {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status === 'granted') {
				let location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced
				});
				lat = location.coords.latitude;
				lng = location.coords.longitude;
			}
		} catch (error) {
			console.log("Erro ao buscar GPS:", error);
		}

		const payload = {
			...formNovo,
			user_id: user?.id,
			latitude: lat,
			longitude: lng
		};

		const res = await apiService.cadastrarAgenda(payload);

		setIsSalvando(false);

		if (res && res.success) {
			Alert.alert('Sucesso', 'Agendamento inserido!');
			setModalInserirVisible(false);
			setFormNovo({ cliente_id: '', data: '', hora: '', assunto: '', descricao: '' });
			setSugestoesClientes([]);
			carregarAgenda();
		} else {
			Alert.alert('Erro', res?.message);
		}
	};

	const abrirModalEncerrar = (item: Agendamento) => {
		setItemSelecionado(item);
		setObsEncerramento(item.observacao ? item.observacao + '\n\nConclusão: ' : '');
		setModalEncerrarVisible(true);
	};

	const handleEncerrar = async () => {
		if (!obsEncerramento) {
			Alert.alert('Atenção', 'Escreva uma observação sobre a visita antes de encerrar.');
			return;
		}
		const payload = { agenda_id: itemSelecionado?.id, observacao: obsEncerramento };
		const res = await apiService.encerrarAgenda(payload);

		if (res && res.success) {
			Alert.alert('Sucesso', 'Visita encerrada com sucesso!');
			setModalEncerrarVisible(false);
			carregarAgenda();
		} else {
			Alert.alert('Erro', res?.message);
		}
	};

	const renderItem = ({ item }: { item: Agendamento }) => {
		const isEncerrado = item.situacao === 'FINALIZADO';

		return (
			<TouchableOpacity
				style={styles.card}
				onPress={() => !isEncerrado && abrirModalEncerrar(item)}
				activeOpacity={isEncerrado ? 1 : 0.7}
			>
				<View style={styles.cardHeader}>
					<Text style={styles.cardClient} numberOfLines={1}>{item.cliente}</Text>
					<View style={[styles.statusBadge, { backgroundColor: isEncerrado ? '#e8f5e9' : '#fff3e0' }]}>
						<Text style={[styles.statusText, { color: isEncerrado ? '#2e7d32' : '#e65100' }]}>
							{isEncerrado ? 'ATENDIDA' : 'AGENDADA'}
						</Text>
					</View>
				</View>

				<View style={styles.cardBody}>
					<View style={{ flexDirection: 'row', marginBottom: 6 }}>
						<Feather name="calendar" size={14} color="#ED1C24" style={{ marginTop: 2, marginRight: 6 }} />
						<Text style={styles.infoText}>{item.data} às {item.hora || '--:--'}</Text>
					</View>
					<View style={{ flexDirection: 'row', marginBottom: 6 }}>
						<Feather name="tag" size={14} color="#666" style={{ marginTop: 2, marginRight: 6 }} />
						<Text style={styles.infoText}>{item.titulo}</Text>
					</View>
					{isEncerrado && item.observacao ? (
						<View style={styles.obsBox}>
							<Text style={styles.obsTextTitle}>Observação:</Text>
							<Text style={styles.obsText}>{item.observacao}</Text>
						</View>
					) : null}
				</View>

				{!isEncerrado && (
					<View style={styles.cardFooter}>
						<Text style={{ color: '#0277bd', fontSize: 12, fontWeight: 'bold' }}>Toque para encerrar visita</Text>
						<Feather name="chevron-right" size={16} color="#0277bd" />
					</View>
				)}
			</TouchableOpacity>
		);
	};

	const [isSalvando, setIsSalvando] = useState(false);

	return (
		<View style={styles.container}>
			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Filtros da Agenda</Text>

				<View style={styles.row}>
					<View style={{ width: '48%' }}>
						<Text style={styles.label}>Data Inicial</Text>
						<MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/YYYY" keyboardType="numeric" value={filtroDataIni} onChangeText={(t, raw) => setFiltroDataIni(t)} />
					</View>
					<View style={{ width: '48%' }}>
						<Text style={styles.label}>Data Final</Text>
						<MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/YYYY" keyboardType="numeric" value={filtroDataFim} onChangeText={(t, raw) => setFiltroDataFim(t)} />
					</View>
				</View>

				<View style={styles.row}>
					<View style={{ width: '48%' }}>
						<Text style={styles.label}>Cliente</Text>
						<TextInput style={styles.input} placeholder="Nome do cliente..." value={filtroCliente} onChangeText={setFiltroCliente} />
					</View>
					<View style={{ width: '48%' }}>
						<Text style={styles.label}>Situação</Text>
						<RNPickerSelect
							placeholder={{ label: 'Todas...', value: '', color: '#999' }}
							onValueChange={(value) => setFiltroSituacao(value)}
							value={filtroSituacao}
							items={[
								{ label: 'AGENDADA', value: 'PREVISTO' },
								{ label: 'ATENDIDA', value: 'FINALIZADO' }
							]}
							style={pickerSelectMiniStyles}
							useNativeAndroidPickerStyle={false}
							fixAndroidTouchableBug={true}
							Icon={() => <Feather name="chevron-down" size={16} color="#000" style={{ marginTop: 12, marginRight: 10 }} />}
						/>
					</View>
				</View>

				<View style={styles.actionRow}>
					<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarAgenda()}>
						<Feather name="search" size={18} color="#fff" />
						<Text style={styles.btnText}>Buscar</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnInserir} onPress={() => setModalInserirVisible(true)}>
						<Feather name="plus" size={18} color="#ED1C24" />
						<Text style={styles.btnInserirText}>Inserir</Text>
					</TouchableOpacity>
				</View>
			</View>

			{isLoading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#ED1C24" />
				</View>
			) : (
				<FlatList
					data={agenda}
					keyExtractor={(item) => item.id.toString()}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
					ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 30 }}>Nenhum agendamento encontrado.</Text>}
				/>
			)}

			<Modal visible={modalInserirVisible} animationType="slide" transparent={false}>
				<AutocompleteDropdownContextProvider>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalInserirVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#333" />
							</TouchableOpacity>
							<Text style={styles.modalTitle}>Novo Agendamento</Text>
							<View style={{ width: 24 }} />
						</View>

						<ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">

							<View style={[styles.inputGroup, { zIndex: 9999, elevation: 9999 }]}>
								<Text style={styles.label}>Cliente *</Text>
								<AutocompleteDropdown
									clearOnFocus={false}
									closeOnBlur={true}
									closeOnSubmit={false}
									useFilter={false}
									loading={isBuscandoClientes}
									dataSet={sugestoesClientes}
									onChangeText={buscarClientesSugestao}
									onSelectItem={(item) => {
										if (item) setFormNovo(prev => ({ ...prev, cliente_id: item.id }));
									}}
									textInputProps={{
										placeholder: 'Digite 3 letras do nome...',
										autoCorrect: false,
										autoCapitalize: 'none',
										style: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, color: '#000', fontSize: 14 },
									}}
									rightButtonsContainerStyle={{ right: 8, height: 30, alignSelf: 'center' }}
									inputContainerStyle={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, minHeight: 48 }}
									suggestionsListContainerStyle={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2 }}
									ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
									emptyResultText="Nenhum cliente encontrado"
								/>
							</View>

							<View style={[styles.row, { marginTop: 15, zIndex: -1, elevation: -1 }]}>
								<View style={{ width: '48%' }}>
									<Text style={styles.label}>Data *</Text>
									<MaskedTextInput mask="99/99/9999" style={styles.input} placeholder="DD/MM/YYYY" keyboardType="numeric" value={formNovo.data} onChangeText={(t, raw) => setFormNovo({ ...formNovo, data: t })} />
								</View>
								<View style={{ width: '48%' }}>
									<Text style={styles.label}>Hora</Text>
									<MaskedTextInput mask="99:99" style={styles.input} placeholder="HH:MM" keyboardType="numeric" value={formNovo.hora} onChangeText={(t, raw) => setFormNovo({ ...formNovo, hora: t })} />
								</View>
							</View>

							<View style={[styles.inputGroup, { zIndex: -1, elevation: -1 }]}>
								<Text style={styles.label}>Assunto *</Text>
								<TextInput style={styles.input} placeholder="Ex: Visita de prospecção" value={formNovo.assunto} onChangeText={(t) => setFormNovo({ ...formNovo, assunto: t })} />
							</View>

							<View style={[styles.inputGroup, { zIndex: -1, elevation: -1 }]}>
								<Text style={styles.label}>Descrição / Detalhes</Text>
								<TextInput
									style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
									placeholder="Detalhes do agendamento..." multiline numberOfLines={4}
									value={formNovo.descricao} onChangeText={(t) => setFormNovo({ ...formNovo, descricao: t })}
								/>
							</View>

							<TouchableOpacity
								style={[styles.btnBuscar, { marginTop: 20, zIndex: -1, elevation: -1 }, isSalvando && { opacity: 0.7 }]}
								onPress={handleSalvarNovo}
								disabled={isSalvando}
							>
								{isSalvando ? (
									<ActivityIndicator color="#fff" size="small" />
								) : (
									<>
										<Feather name="save" size={20} color="#fff" />
										<Text style={styles.btnText}>Salvar Agendamento</Text>
									</>
								)}
							</TouchableOpacity>
						</ScrollView>
					</KeyboardAvoidingView>
				</AutocompleteDropdownContextProvider>
			</Modal>

			<Modal visible={modalEncerrarVisible} animationType="fade" transparent={true}>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ backgroundColor: '#fff', width: '90%', borderRadius: 12, padding: 20 }}>

						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
							<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Encerrar Visita</Text>
							<TouchableOpacity onPress={() => setModalEncerrarVisible(false)}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<Text style={{ color: '#555', marginBottom: 5 }}>Cliente: <Text style={{ fontWeight: 'bold' }}>{itemSelecionado?.cliente}</Text></Text>
						<Text style={{ color: '#555', marginBottom: 15 }}>Assunto: {itemSelecionado?.titulo}</Text>

						<Text style={styles.label}>Observação da Visita *</Text>
						<TextInput
							style={[styles.input, { height: 120, textAlignVertical: 'top', backgroundColor: '#f9f9f9' }]}
							placeholder="Descreva o que foi conversado e concluído..."
							multiline numberOfLines={5}
							value={obsEncerramento} onChangeText={setObsEncerramento}
						/>

						<TouchableOpacity
							style={{
								backgroundColor: '#28a745',
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								paddingVertical: 14,
								borderRadius: 8,
								marginTop: 15,
								marginBottom: 10
							}}
							onPress={handleEncerrar}
						>
							<Feather name="check-circle" size={20} color="#fff" />
							<Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>Confirmar e Encerrar</Text>
						</TouchableOpacity>
					</KeyboardAvoidingView>
				</View>
			</Modal>

		</View>
	);
}

const pickerSelectMiniStyles = StyleSheet.create({
	inputIOS: { fontSize: 13, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000', backgroundColor: '#fff', minHeight: 46 },
	inputAndroid: { fontSize: 13, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, color: '#000', backgroundColor: '#fff', minHeight: 46 },
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', elevation: 2 },
	sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 14, color: '#000', marginBottom: 10, minHeight: 46 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroup: { width: '100%', marginBottom: 10 },

	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
	btnBuscar: { flex: 1, backgroundColor: '#333', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginRight: 10 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	btnInserir: { flex: 1, backgroundColor: '#ffe5e6', borderWidth: 1, borderColor: '#ED1C24', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 8, marginLeft: 10 },
	btnInserirText: { color: '#ED1C24', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 3 },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardClient: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 10, fontWeight: 'bold' },
	cardBody: { padding: 15 },
	infoText: { fontSize: 14, color: '#555' },
	obsBox: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#eee' },
	obsTextTitle: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 4 },
	obsText: { fontSize: 13, color: '#444' },
	cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#e1f5fe', borderBottomLeftRadius: 10, borderBottomRightRadius: 10 },

	modalHeaderFull: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#ffe5e6', paddingBottom: 5 },
});