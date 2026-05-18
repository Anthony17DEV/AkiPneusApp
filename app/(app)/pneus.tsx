import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/solutires.png';
import { apiService } from '../../src/services/apiService';

interface Pneu {
	id: number; referencia: string; marca: string; modelo: string; dot: string; serie: string; ferro: string;
	tipo: string; qtde_reforma: string | number; banda: string; placa_associada: string | null;
	valor?: string | number; mm_original?: string; milimetros?: string; pressao_padrao?: string; pressao?: string;
	observacao?: string; referencia_id?: string; marca_id?: string; modelo_id?: string; banda_id?: string; veiculo_id?: string;
}

export default function PneusScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();

	const [pneus, setPneus] = useState<Pneu[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const [filtroSerie, setFiltroSerie] = useState('');
	const [filtroDot, setFiltroDot] = useState('');
	const [filtroPlaca, setFiltroPlaca] = useState('');
	const [filtroCliente, setFiltroCliente] = useState('');
	const [filtroClienteId, setFiltroClienteId] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda' | 'veiculo'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroRapidoVisible, setModalCadastroRapidoVisible] = useState(false);
	const [formRapido, setFormCadastroRapido] = useState({ nome: '' });
	const [isCadastrandoRapido, setIsCadastrandoRapido] = useState(false);

	const [form, setForm] = useState({
		id: '', referencia: '', referencia_id: '', marca: '', marca_id: '', modelo: '', modelo_id: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: '', grau: '', banda: '', banda_id: '',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '', observacao: '',
		placa_associada: '', veiculo_id: ''
	});

	const formatarMoeda = (text: string) => {
		let v = text.replace(/\D/g, '');
		if (v === '') return '';
		v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',');
		v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
		return v;
	};

	useEffect(() => {
		const paramId = (params.cliente_id as string) || '';
		const paramNome = (params.cliente_nome as string) || '';
		setFiltroClienteId(paramId);
		setFiltroCliente(paramNome);
		buscarPneusNaApi(filtroSerie, filtroDot, filtroPlaca, paramNome, paramId);
	}, [params.cliente_id, params.cliente_nome]);

	const buscarPneusNaApi = async (serieStr: string, dotStr: string, placaStr: string, cliNomeStr: string, cliIdStr: string) => {
		setIsLoading(true);
		const res = await apiService.buscarPneusGrid({
			serie: serieStr,
			dot: dotStr,
			placa: placaStr,
			cliente: cliNomeStr,
			cliente_id: cliIdStr
		});

		if (res && res.success) {
			setPneus(res.data);
		} else {
			setPneus([]);
		}
		setIsLoading(false);
	};

	const carregarPneus = () => {
		buscarPneusNaApi(filtroSerie, filtroDot, filtroPlaca, filtroCliente, filtroClienteId);
	};

	const resetForm = () => {
		setForm({
			id: '', referencia: '', referencia_id: '', marca: '', marca_id: '', modelo: '', modelo_id: '',
			valor: '', dot: '', serie: '', ferro: '', tipo: '', grau: '', banda: '', banda_id: '',
			mm_original: '', milimetros: '', pressao_padrao: '', pressao: '', observacao: '',
			placa_associada: '', veiculo_id: ''
		});
		setIsEditing(false);
	};

	const handleEditar = (item: any) => {
		setForm({
			id: item.id ? item.id.toString() : '',
			referencia: item.referencia || '', referencia_id: item.referencia_id || '',
			marca: item.marca || '', marca_id: item.marca_id || '',
			modelo: item.modelo || '', modelo_id: item.modelo_id || '',
			valor: item.valor ? formatarMoeda(item.valor.toString()) : '',
			dot: item.dot || '', serie: item.serie || '', ferro: item.ferro || '',
			tipo: item.tipo || '', grau: item.qtde_reforma ? item.qtde_reforma.toString() : '',
			banda: item.banda || '', banda_id: item.banda_id || '',
			mm_original: item.mm_original || '', milimetros: item.milimetros || '',
			pressao_padrao: item.pressao_padrao || '', pressao: item.pressao || '',
			observacao: item.observacao || '',
			placa_associada: item.placa_associada || '', veiculo_id: item.veiculo_id || ''
		});
		setIsEditing(true);
		setModalVisible(true);
	};

	const salvarPneu = async () => {
		setIsSaving(true);
		const res = await apiService.salvarPneuGeral(form);
		if (res && res.success) {
			Alert.alert('Sucesso', 'Pneu salvo com sucesso!');
			setModalVisible(false);
			carregarPneus();
		} else {
			Alert.alert('Erro', res?.message || 'Falha ao salvar o pneu.');
		}
		setIsSaving(false);
	};

	const abrirBuscaDinamica = (tipo: any) => {
		setTipoBusca(tipo);
		setTermoComboBusca('');
		setResultadosBusca([]);
		setModalBuscaVisible(true);
		buscarDinamicaNoBanco(tipo, '');
	};

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		if (tipo === 'veiculo') {
			const res = await apiService.buscarVeiculo({ busca: termo });
			if (res && res.success) {
				const veiculosFormatados = res.data.map((v: any) => ({
					id: v.id, nome: v.placa, placa: v.placa,
					documento: `Código: ${v.codigo || '--'} | Cliente: ${v.proprietario || 'N/A'}`
				}));
				setResultadosBusca(veiculosFormatados);
			} else { setResultadosBusca([]); }
		} else {
			const extras: any = {};
			if (tipo === 'modelo_pneu') extras.referencia_id = form.referencia_id;
			const res = await apiService.buscarDinamica(tipo, termo, extras);
			if (res && res.success) { setResultadosBusca(res.data); } else { setResultadosBusca([]); }
		}
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'referencia_pneu') setForm({ ...form, referencia: item.nome, referencia_id: item.id });
		else if (tipoBusca === 'marca_pneu') setForm({ ...form, marca: item.nome, marca_id: item.id });
		else if (tipoBusca === 'modelo_pneu') setForm({ ...form, modelo: item.nome, modelo_id: item.id });
		else if (tipoBusca === 'banda') setForm({ ...form, banda: item.nome, banda_id: item.id });
		else if (tipoBusca === 'veiculo') setForm({ ...form, placa_associada: item.placa || item.nome, veiculo_id: item.id });
		setModalBuscaVisible(false);
	};

	const salvarCadastroRapido = async () => {
		if (!formRapido.nome) return;
		setIsCadastrandoRapido(true);
		try {
			const res = { success: true, id: '999', nome: formRapido.nome };
			if (res.success) {
				selecionarItemBusca(res);
				setModalCadastroRapidoVisible(false);
			}
		} finally { setIsCadastrandoRapido(false); }
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<FlatList
				data={pneus}
				keyExtractor={(item, index) => String(item?.id || index)}
				contentContainerStyle={{ paddingBottom: 40 }}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Buscar Pneus</Text>
						<View style={styles.row}>
							<View style={{ width: '48%' }}><Text style={styles.label}>Série</Text><TextInput style={styles.input} placeholder="Série" value={filtroSerie} onChangeText={setFiltroSerie} /></View>
							<View style={{ width: '48%' }}><Text style={styles.label}>DOT</Text><TextInput style={styles.input} placeholder="DOT" value={filtroDot} onChangeText={setFiltroDot} /></View>
						</View>
						<View style={styles.row}>
							<View style={{ width: '30%' }}><Text style={styles.label}>Placa</Text><TextInput style={styles.input} placeholder="ABC-1234" value={filtroPlaca} onChangeText={setFiltroPlaca} autoCapitalize="characters" /></View>
							<View style={{ width: '67%' }}><Text style={styles.label}>Cliente</Text><TextInput style={styles.input} placeholder="Nome do Cliente..." value={filtroCliente} onChangeText={(t) => { setFiltroCliente(t); setFiltroClienteId(''); }} /></View>
						</View>
						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarPneus}><Feather name="search" size={18} color="#fff" /><Text style={styles.btnText}>Buscar</Text></TouchableOpacity>
							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}><Feather name="plus-circle" size={18} color="#ffffff" /><Text style={styles.btnInserirText}>Inserir</Text></TouchableOpacity>
						</View>
						<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({pneus.length} registros)</Text>
					</View>
				}
				renderItem={({ item }) => {
					const isAvulso = !item.placa_associada || item.placa_associada.trim() === '';
					return (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<Text style={styles.cardTitle} numberOfLines={1}>Série: {item.serie || 'N/A'}</Text>
								<View style={[styles.statusBadge, { backgroundColor: isAvulso ? '#fff3cd' : '#e8f5e9' }]}>
									<Text style={[styles.statusText, { color: isAvulso ? '#856404' : '#28a745' }]}>
										{isAvulso ? 'AVULSO' : `PLACA: ${item.placa_associada}`}
									</Text>
								</View>
							</View>

							<View style={styles.cardInfoBox}>
								<View style={styles.cardInfoRow}>
									<MaterialCommunityIcons name="tire" size={16} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Ref:</Text> {item.referencia} | {item.marca} - {item.modelo}</Text>
								</View>
								<View style={styles.cardInfoRow}>
									<Feather name="info" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>DOT:</Text> {item.dot}  •  <Text style={{ fontWeight: 'bold' }}>Ferro:</Text> {item.ferro}</Text>
								</View>
								<View style={styles.cardInfoRow}>
									<Feather name="layers" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {item.tipo}  •  <Text style={{ fontWeight: 'bold' }}>Reformas:</Text> {item.qtde_reforma}</Text>
								</View>
								<View style={styles.cardInfoRow}>
									<Feather name="tool" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Banda:</Text> {item.banda}</Text>
								</View>
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnChecklistCard} onPress={() => router.push({ pathname: '/checklist', params: { pneu_id: item.id } } as any)}>
										<Feather name="clipboard" size={14} color="#333" />
										<Text style={styles.btnChecklistCardText}>Checklist</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
										<Text style={styles.btnEditarCardText}>Editar</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					);
				}}
				ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum pneu encontrado.</Text> : null}
			/>

			<Modal visible={modalVisible} animationType="slide" transparent={false}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<View style={{ width: 24 }} />
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
							<Text style={styles.groupTitle}>1. Identificação e Veículo</Text>
							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Associar à Placa (Vazio = Avulso)</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('veiculo')}>
									<Text style={{ color: form.placa_associada ? '#000' : '#999' }}>{form.placa_associada || 'Pneu Avulso...'}</Text>
									{form.placa_associada ? (
										<TouchableOpacity onPress={() => setForm({ ...form, placa_associada: '', veiculo_id: '' })}>
											<Feather name="x-circle" size={18} color="#E53935" />
										</TouchableOpacity>
									) : (
										<Feather name="search" size={16} color="#999" />
									)}
								</TouchableOpacity>
							</View>
							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Série</Text><TextInput style={styles.input} value={form.serie} onChangeText={t => setForm({ ...form, serie: t })} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>DOT</Text><TextInput style={styles.input} value={form.dot} onChangeText={t => setForm({ ...form, dot: t })} /></View>
							</View>
							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Ferro</Text><TextInput style={styles.input} value={form.ferro} onChangeText={t => setForm({ ...form, ferro: t })} /></View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Valor (R$)</Text>
									<TextInput style={styles.input} value={form.valor} onChangeText={t => setForm({ ...form, valor: formatarMoeda(t) })} keyboardType="numeric" placeholder="0,00" />
								</View>
							</View>

							<Text style={styles.groupTitle}>2. Especificações</Text>
							<View style={styles.inputGroupFull}><Text style={styles.label}>Referência</Text><TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}><Text style={{ color: form.referencia ? '#000' : '#999' }}>{form.referencia || 'Selecionar...'}</Text><Feather name="search" size={16} color="#999" /></TouchableOpacity></View>
							<View style={styles.inputGroupFull}><Text style={styles.label}>Marca</Text><TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca_pneu')}><Text style={{ color: form.marca ? '#000' : '#999' }}>{form.marca || 'Selecionar...'}</Text><Feather name="search" size={16} color="#999" /></TouchableOpacity></View>
							<View style={styles.inputGroupFull}><Text style={styles.label}>Modelo</Text><TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo_pneu')}><Text style={{ color: form.modelo ? '#000' : '#999' }}>{form.modelo || 'Selecionar...'}</Text><Feather name="search" size={16} color="#999" /></TouchableOpacity></View>

							<Text style={styles.groupTitle}>3. Vida Útil</Text>
							<RNPickerSelect placeholder={{ label: 'Tipo...', value: '', color: '#666' }} value={form.tipo} onValueChange={v => { if (v !== 'Reformado') { setForm({ ...form, tipo: v, grau: '', banda: '', banda_id: '' }); } else { setForm({ ...form, tipo: v }); } }} items={[{ label: 'Novo', value: 'Novo', color: '#000' }, { label: 'Reformado', value: 'Reformado', color: '#000' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />

							{form.tipo === 'Reformado' && (
								<View style={styles.boxReformado}>
									<TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff' }]} onPress={() => abrirBuscaDinamica('banda')}><Text style={{ color: form.banda ? '#000' : '#999' }}>{form.banda || 'Banda Recap...'}</Text></TouchableOpacity>
									<RNPickerSelect placeholder={{ label: 'Qtde Reforma...', value: '' }} value={form.grau} onValueChange={v => setForm({ ...form, grau: v })} items={[{ label: '1', value: '1', color: '#000' }, { label: '2', value: '2', color: '#000' }, { label: '3', value: '3', color: '#000' }, { label: '4', value: '4', color: '#000' }, { label: '5', value: '5', color: '#000' }]} style={{ ...pickerStyles, inputIOS: { ...pickerStyles.inputIOS, backgroundColor: '#fff' }, inputAndroid: { ...pickerStyles.inputAndroid, backgroundColor: '#fff' } }} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
								</View>
							)}

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Original (mm)</Text><TextInput style={styles.input} value={form.mm_original} onChangeText={t => setForm({ ...form, mm_original: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Atual (mm)</Text><TextInput style={styles.input} value={form.milimetros} onChangeText={t => setForm({ ...form, milimetros: t })} keyboardType="numeric" /></View>
							</View>
							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Pressão Padrão (Lbs)</Text><TextInput style={styles.input} value={form.pressao_padrao} onChangeText={t => setForm({ ...form, pressao_padrao: t })} keyboardType="numeric" /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Pressão Atual (Lbs)</Text><TextInput style={styles.input} value={form.pressao} onChangeText={t => setForm({ ...form, pressao: t })} keyboardType="numeric" /></View>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Observações</Text>
								<TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline={true} numberOfLines={3} value={form.observacao} onChangeText={t => setForm({ ...form, observacao: t })} placeholder="Alguma nota sobre este pneu..." />
							</View>

							<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalVisible(false)}><Text style={styles.btnTextCancel}>Voltar</Text></TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={salvarPneu} disabled={isSaving}>{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}</TouchableOpacity>
							</View>
							<View style={{ height: 40 }} />
						</ScrollView>

						{modalBuscaVisible && (
							<View style={StyleSheet.absoluteFill}>
								<View style={styles.modalOverlayBusca}>
									<View style={styles.modalContentBusca}>

										<View style={styles.modalHeaderBusca}>
											<Text style={styles.modalTitleBusca}>Selecionar</Text>
											<View style={{ flexDirection: 'row', alignItems: 'center' }}>
												{['referencia_pneu', 'marca_pneu', 'modelo_pneu'].includes(tipoBusca) && (
													<TouchableOpacity
														style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
														onPress={() => setModalCadastroRapidoVisible(true)}
													>
														<Feather name="plus-circle" size={14} color="#28a745" />
														<Text style={{ color: '#28a745', fontWeight: 'bold', fontSize: 13, marginLeft: 5 }}>Inserir</Text>
													</TouchableOpacity>
												)}
												<TouchableOpacity onPress={() => setModalBuscaVisible(false)}>
													<Feather name="x" size={24} color="#333" />
												</TouchableOpacity>
											</View>
										</View>

										<TextInput style={styles.inputBuscaInterno} placeholder="Buscar..." value={termoComboBusca} onChangeText={t => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }} autoFocus />
										{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
											<FlatList data={resultadosBusca} keyExtractor={(item, index) => String(item?.id || index)} renderItem={({ item }) => (
												<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
													<Text style={styles.itemBuscaNome}>{item.nome || item.placa}</Text>
													{item.documento && <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.documento}</Text>}
												</TouchableOpacity>
											)} />
										)}
									</View>
								</View>
							</View>
						)}

						{modalCadastroRapidoVisible && (
							<View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
								<View style={styles.modalOverlayBusca}>
									<View style={styles.modalSmall}>
										<Text style={styles.modalTitle}>Cadastrar Novo</Text>
										<TextInput style={styles.input} value={formRapido.nome} onChangeText={t => setFormCadastroRapido({ nome: t })} placeholder="Nome..." autoFocus />
										<View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
											<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalCadastroRapidoVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
											<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={salvarCadastroRapido}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Gravar</Text></TouchableOpacity>
										</View>
									</View>
								</View>
							</View>
						)}
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const pickerStyles = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', marginBottom: 15, paddingRight: 30, minHeight: 48 }
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%' },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 10 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold' },
	cardInfoBox: { padding: 15, paddingBottom: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
	cardInfoText: { fontSize: 13, color: '#444', flexShrink: 1, lineHeight: 18 },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },
	btnChecklistCard: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15, marginRight: 8 },
	btnChecklistCardText: { color: '#333', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	btnEditarCard: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: { backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },

	btnSalvar: { backgroundColor: '#63c77b', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnTextCancel: { color: '#333', fontWeight: 'bold' },

	boxReformado: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 15 },

	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold' },
	inputBuscaInterno: { backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, paddingHorizontal: 15, marginBottom: 15 },
	itemBuscaDinamica: { borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15 },

	modalSmall: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 }
});