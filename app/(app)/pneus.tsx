import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/solutires.png';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Pneu {
	id: number; referencia: string; marca: string; modelo: string; dot: string; serie: string; ferro: string;
	tipo: string; qtde_reforma: string | number; banda: string; placa_associada: string | null;
	valor?: string | number; mm_original?: string; milimetros?: string; pressao_padrao?: string; pressao?: string;
	observacao?: string; referencia_id?: string; marca_id?: string; modelo_id?: string; banda_id?: string; veiculo_id?: string;
	foto?: string; pneu_tx_foto?: string; motivo_recusa?: string; laud_tx_motivo?: string;
	cliente?: string; proprietario?: string; cliente_id?: string; proprietario_id?: string;
}

export default function PneusScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { user, signOut } = useAuth();

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

	const [fotosPneu, setFotosPneu] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda' | 'veiculo' | 'entidade'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const FOTO_URL = 'https://sistemascactus.com/apicactus/akipneus/fotos/';
	const API_CADASTRO_URL = 'https://sistemascactus.com/apicactus/akipneus/api_pneu_cadastro_rapido.php';

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '', marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '' });

	const [form, setForm] = useState({
		id: '', referencia: '', referencia_id: '', marca: '', marca_id: '', modelo: '', modelo_id: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: '', grau: '', banda: '', banda_id: '',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '', observacao: '',
		placa_associada: '', veiculo_id: '', motivo_recusa: '', motivo_recusa_outro: '',
		ref_mm_original: '', ref_valor: '',
		cliente: '', cliente_id: ''
	});

	const confirmSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair do aplicativo?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	const formatarMoeda = (text: string) => {
		let v = text.replace(/\D/g, '');
		if (v === '') return '';
		v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',');
		v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
		return v;
	};

	const formatarValorDB = (val: any) => {
		if (!val) return '';
		let str = String(val).replace(',', '.');
		let num = parseFloat(str);
		if (isNaN(num)) return '';
		let formatado = num.toFixed(2).replace('.', ',');
		return formatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	};

	const limparFiltroCliente = () => {
		setFiltroCliente('');
		setFiltroClienteId('');
		router.setParams({ cliente_id: '', cliente_nome: '' });
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
		const preNome = (params.cliente_nome as string) || filtroCliente || '';
		const preId = (params.cliente_id as string) || filtroClienteId || '';

		setForm({
			id: '', referencia: '', referencia_id: '', marca: '', marca_id: '', modelo: '', modelo_id: '',
			valor: '', dot: '', serie: '', ferro: '', tipo: '', grau: '', banda: '', banda_id: '',
			mm_original: '', milimetros: '', pressao_padrao: '', pressao: '', observacao: '',
			placa_associada: '', veiculo_id: '', motivo_recusa: '', motivo_recusa_outro: '',
			ref_mm_original: '', ref_valor: '',
			cliente: preNome, cliente_id: preId
		});
		setFotosPneu([]);
		setFotoAmpliada(null);
		setIsEditing(false);
	};

	const handleEditar = (item: any) => {
		const motivoDB = item.motivo_recusa || item.laud_tx_motivo || '';
		const motivosPadrao = ['Deslocamento de talão', 'Deslocamento por manchão inadequado', 'Rodagem baixa pressão', 'Separação de cintas', 'Dano irreparável', 'Outros'];
		const isOutro = motivoDB && !motivosPadrao.includes(motivoDB);

		setForm({
			id: item.id ? item.id.toString() : '',
			referencia: item.referencia || '', referencia_id: item.referencia_id || '',
			marca: item.marca || '', marca_id: item.marca_id || '',
			modelo: item.modelo || '', modelo_id: item.modelo_id || '',
			valor: item.valor ? formatarValorDB(item.valor) : '',
			ref_valor: item.valor ? formatarValorDB(item.valor) : '',
			dot: item.dot || '', serie: item.serie || '', ferro: item.ferro || '',
			tipo: item.tipo || '', grau: item.qtde_reforma ? item.qtde_reforma.toString() : '',
			banda: item.banda || '', banda_id: item.banda_id || '',
			mm_original: item.mm_original || '', milimetros: item.milimetros || '',
			pressao_padrao: item.pressao_padrao || '', pressao: item.pressao || '',
			observacao: item.observacao || '',
			placa_associada: item.placa_associada || '', veiculo_id: item.veiculo_id || '',
			motivo_recusa: isOutro ? 'Outros' : motivoDB,
			motivo_recusa_outro: isOutro ? motivoDB : '',
			ref_mm_original: item.mm_original || '',
			cliente: item.cliente || item.proprietario || '',
			cliente_id: item.cliente_id || item.proprietario_id || ''
		});

		const stringFotos = item.foto || item.pneu_tx_foto;
		if (stringFotos && typeof stringFotos === 'string' && stringFotos.trim() !== '') {
			const fotosDoBanco = stringFotos.split(',').filter((f: string) => f.trim() !== '').map((f: string) => FOTO_URL + f.trim());
			setFotosPneu(fotosDoBanco);
		} else {
			setFotosPneu([]);
		}

		setFotoAmpliada(null);
		setIsEditing(true);
		setModalVisible(true);
	};

	const tirarFotoPneu = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à câmera."); return; }
		const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7, base64: true });
		if (!result.canceled && result.assets[0].base64) { setFotosPneu([...fotosPneu, `data:image/jpeg;base64,${result.assets[0].base64}`]); }
	};

	const escolherFotoGaleria = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à galeria de fotos."); return; }
		const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.7, base64: true });
		if (!result.canceled && result.assets[0].base64) { setFotosPneu([...fotosPneu, `data:image/jpeg;base64,${result.assets[0].base64}`]); }
	};

	const removerFoto = (index: number) => { setFotosPneu(fotosPneu.filter((_, i) => i !== index)); };

	const salvarPneu = async () => {
		if (form.dot) {
			if (form.dot.length !== 4) {
				Alert.alert('Atenção', 'O DOT deve conter exatamente 4 dígitos numéricos.');
				return;
			}
			const semana = parseInt(form.dot.substring(0, 2));
			if (semana < 1 || semana > 53) {
				Alert.alert('Atenção', 'As duas primeiras posições do DOT representam a semana de fabricação e devem estar entre 01 e 53.');
				return;
			}
		}

		if (form.motivo_recusa === 'Outros' && !form.motivo_recusa_outro.trim()) {
			Alert.alert('Atenção', 'Por favor, descreva o motivo da recusa no campo "Descreva o outro motivo".');
			return;
		}

		setIsSaving(true);

		const fotosNovas = fotosPneu.filter(f => f.startsWith('data:image'));
		const fotosAntigas = fotosPneu.filter(f => f.startsWith('http')).map(f => f.split('/').pop());

		const motivoFinal = form.motivo_recusa === 'Outros' ? form.motivo_recusa_outro : form.motivo_recusa;

		const dadosParaSalvar = {
			...form,
			motivo_recusa: motivoFinal,
			valor: form.valor.replace(/\./g, ''),
			fotos_novas: fotosNovas,
			fotos_antigas: fotosAntigas,
			user_id: user?.id,
			cliente_id: form.cliente_id || params?.cliente_id || filtroClienteId
		};

		const res = await apiService.salvarPneuGeral(dadosParaSalvar);
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
					proprietario: v.proprietario, proprietario_id: v.proprietario_id,
					documento: `Código: ${v.codigo || '--'} | Cliente: ${v.proprietario || 'N/A'}`
				}));
				setResultadosBusca(veiculosFormatados);
			} else { setResultadosBusca([]); }
		} else if (tipo === 'entidade') {
			try {
				const res = await apiService.buscarClientes(user?.id, user?.nivel, { nome: termo }, 1);
				if (res && res.success) {
					setResultadosBusca(res.data.map((c: any) => ({ id: c.id, nome: c.nome })));
				} else {
					setResultadosBusca([]);
				}
			} catch (e) {
				setResultadosBusca([]);
			}
		} else {
			const extras: any = {};
			if (tipo === 'modelo_pneu') {
				extras.referencia_id = form.referencia_id;
				extras.marca_atual = form.marca;
			}
			const res = await apiService.buscarDinamica(tipo, termo, extras);
			if (res && res.success) { setResultadosBusca(res.data); } else { setResultadosBusca([]); }
		}
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'entidade') {
			setForm({ ...form, cliente: item.nome, cliente_id: item.id });
		}
		else if (tipoBusca === 'referencia_pneu') {
			setForm({
				...form,
				referencia: item.nome || item.refe_tx_nome,
				referencia_id: item.id || item.refe_nb_id,
				marca: item.isNewModel ? (formCadastro.marca || '') : '',
				marca_id: item.isNewModel ? '' : '',
				modelo: item.isNewModel ? (formCadastro.modelo || '') : '',
				modelo_id: item.isNewModel ? '' : '',
				mm_original: item.isNewModel ? (formCadastro.mmOriginal || '') : (item.refe_tx_mmOriginal || ''),
				valor: item.isNewModel ? formatarValorDB(formCadastro.valor || '') : formatarValorDB(item.refe_tx_valor || '')
			});
		} else if (tipoBusca === 'marca_pneu') {
			setForm({
				...form,
				referencia: item.isNewModel ? (formCadastro.nome || form.referencia) : form.referencia,
				marca: item.nome || item.refe_tx_marca,
				marca_id: item.id,
				modelo: '', modelo_id: ''
			});
		} else if (tipoBusca === 'modelo_pneu') {
			const refMm = item.isNewModel ? (formCadastro.mmOriginal || form.mm_original) : (item.refe_tx_mmOriginal || form.mm_original);
			const refVal = item.isNewModel ? formatarValorDB(formCadastro.valor || form.valor) : formatarValorDB(item.refe_tx_valor || form.valor);

			setForm({
				...form,
				referencia_id: item.isNewModel ? item.id : form.referencia_id,
				referencia: item.isNewModel ? (formCadastro.nome || form.referencia) : form.referencia,
				marca: item.isNewModel ? (formCadastro.marca || form.marca) : (item.refe_tx_marca || form.marca),
				modelo: item.nome || item.refe_tx_modelo,
				modelo_id: item.id,
				ref_mm_original: refMm,
				ref_valor: refVal,
				mm_original: (form.tipo === 'Reformado' && form.banda) ? form.mm_original : refMm,
				valor: (form.tipo === 'Reformado' && form.banda) ? form.valor : refVal
			});
		} else if (tipoBusca === 'banda') {
			setForm({
				...form,
				banda: item.nome || item.banda,
				banda_id: item.id,
				mm_original: item.isNewModel ? formCadastro.sulco : (item.sulco ? String(item.sulco) : form.mm_original),
				valor: item.isNewModel ? formatarValorDB(formCadastro.valor || '') : (formatarValorDB(item.valor || '') || form.valor)
			});
		} else if (tipoBusca === 'veiculo') {
			setForm({
				...form,
				placa_associada: item.placa || item.nome,
				veiculo_id: item.id,
				cliente: item.proprietario || form.cliente,
				cliente_id: item.proprietario_id || form.cliente_id
			});
		}
		setModalBuscaVisible(false);
	};

	const abrirModalCadastro = (termoDigitado = '') => {
		setFormCadastro({
			nome: tipoBusca === 'referencia_pneu' ? termoDigitado.trim() : (tipoBusca === 'banda' ? '' : (form.referencia || '')),
			marca: tipoBusca === 'marca_pneu' ? termoDigitado.trim() : (tipoBusca === 'modelo_pneu' ? (form.marca || '') : ''),
			modelo: (tipoBusca === 'modelo_pneu' || tipoBusca === 'banda') ? termoDigitado.trim() : '',
			mmOriginal: '', valor: '', sulco: ''
		});
		setModalBuscaVisible(false);
		setModalCadastroVisible(true);
	};

	const salvarCadastroDinamico = async () => {
		if (tipoBusca === 'referencia_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }
		if (tipoBusca === 'marca_pneu' && (!formCadastro.nome || !formCadastro.marca)) { Alert.alert("Atenção", "Preencha a Referência e a Nova Marca."); return; }
		if (tipoBusca === 'modelo_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha Referência, Marca, Modelo e o MM Original."); return; }
		if (tipoBusca === 'banda' && (!formCadastro.marca || !formCadastro.modelo || !formCadastro.sulco)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }

		setIsCadastrando(true);
		try {
			const dadosCadastro = { tipo: tipoBusca, ...formCadastro, valor: formCadastro.valor ? formCadastro.valor.replace(/\./g, '') : '' };

			const response = await fetch(API_CADASTRO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCadastro)
			});
			const res = await response.json();
			if (res.success) {
				if (tipoBusca === 'referencia_pneu') {
					selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.nome, mmOriginal: formCadastro.mmOriginal, marca: formCadastro.marca, modelo: formCadastro.modelo, valor: dadosCadastro.valor, isNewModel: true });
				} else if (tipoBusca === 'marca_pneu') {
					selecionarItemBusca({ id: res.id || formCadastro.marca, nome: formCadastro.marca, isNewModel: true });
				} else if (tipoBusca === 'modelo_pneu') {
					selecionarItemBusca({ id: res.id, nome: formCadastro.modelo, mmOriginal: formCadastro.mmOriginal, valor: dadosCadastro.valor, isNewModel: true });
				} else if (tipoBusca === 'banda') {
					selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.modelo, isNewModel: true, sulco: formCadastro.sulco, valor: formCadastro.valor });
				}
				setModalCadastroVisible(false);
			} else {
				Alert.alert('Erro', res.message || 'Falha ao cadastrar no banco.');
			}
		} catch (err) {
			Alert.alert('Erro', 'Erro na conexão com o servidor de cadastro.');
		} finally {
			setIsCadastrando(false);
		}
	};

	const renderBuscaDinamica = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<View style={styles.modalContentBusca}>
				<View style={styles.modalHeaderBusca}>
					<Text style={styles.modalTitleBusca}>Pesquisar</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{['referencia_pneu', 'marca_pneu', 'modelo_pneu', 'banda'].includes(tipoBusca) && (
							<TouchableOpacity
								style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
								onPress={() => {
									setModalBuscaVisible(false);
									abrirModalCadastro(termoComboBusca);
								}}
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
				<View style={styles.inputBuscaContainer}>
					<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
					<TextInput style={styles.inputBuscaInterno} placeholder={`Buscar...`} value={termoComboBusca} onChangeText={(t) => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }} autoFocus={true} />
				</View>
				{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
					<FlatList data={resultadosBusca} keyExtractor={(item, index) => String(item?.id || index)}
						renderItem={({ item }) => (
							<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
								<Text style={styles.itemBuscaNome}>{item.nome}</Text>
								{item.documento && <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{item.documento}</Text>}
							</TouchableOpacity>
						)}
						ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado.</Text>}
					/>
				)}
			</View>
		</View>
	);

	const renderCadastroDinamico = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<View style={styles.modalSmall}>
				<Text style={styles.modalTitle}>
					Cadastrar {tipoBusca === 'banda' ? 'Banda' : tipoBusca === 'referencia_pneu' ? 'Referência' : tipoBusca === 'marca_pneu' ? 'Marca' : 'Modelo'}
				</Text>
				{tipoBusca === 'marca_pneu' && (
					<><Text style={styles.label}>* Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} placeholder="Ex: 295/80R22.5" /><Text style={styles.label}>* Nova Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} placeholder="Nome da Marca..." /></>
				)}
				{tipoBusca === 'modelo_pneu' && (
					<><Text style={styles.label}>* Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} /><Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} /><Text style={styles.label}>* Novo Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} /><View style={styles.row}><View style={styles.inputGroupH}><Text style={styles.label}>* MM Original</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.mmOriginal} onChangeText={t => setFormCadastro({ ...formCadastro, mmOriginal: t })} /></View><View style={styles.inputGroupH}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: formatarMoeda(t) })} placeholder="0,00" /></View></View></>
				)}
				{tipoBusca === 'referencia_pneu' && (
					<><Text style={styles.label}>* Nome da Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} /><Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} /><Text style={styles.label}>* Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} /><View style={styles.row}><View style={styles.inputGroupH}><Text style={styles.label}>* MM Original</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.mmOriginal} onChangeText={t => setFormCadastro({ ...formCadastro, mmOriginal: t })} /></View><View style={styles.inputGroupH}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: formatarMoeda(t) })} placeholder="0,00" /></View></View></>
				)}
				{tipoBusca === 'banda' && (
					<><Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} /><Text style={styles.label}>* Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} /><Text style={styles.label}>* Sulco (MM)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.sulco} onChangeText={t => setFormCadastro({ ...formCadastro, sulco: t })} /></>
				)}
				<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
					<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalCadastroVisible(false)}><Text style={{ fontWeight: 'bold' }}>Cancelar</Text></TouchableOpacity>
					<TouchableOpacity style={[styles.btnIniciar, { flex: 1 }]} onPress={salvarCadastroDinamico}>
						{isCadastrando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gravar</Text>}
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			<FlatList
				data={pneus}
				keyExtractor={(item, index) => String(item?.id || index)}
				contentContainerStyle={{ paddingBottom: 40 }}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Buscar Pneus</Text>

						{!!params?.cliente_id && (
							<TouchableOpacity style={styles.btnVoltarCliente} onPress={() => router.push('/clientes')}>
								<Feather name="arrow-left" size={16} color="#333" />
								<Text style={styles.btnVoltarClienteText}>Voltar para Clientes</Text>
							</TouchableOpacity>
						)}

						<View style={styles.row}>
							<View style={{ width: '31%' }}><Text style={styles.label}>Série</Text><TextInput style={styles.input} placeholder="Série" value={filtroSerie} onChangeText={setFiltroSerie} /></View>
							<View style={{ width: '31%' }}><Text style={styles.label}>DOT</Text><TextInput style={styles.input} placeholder="DOT" value={filtroDot} onChangeText={setFiltroDot} /></View>
							<View style={{ width: '31%' }}><Text style={styles.label}>Placa</Text><TextInput style={styles.input} placeholder="ABC-1234" value={filtroPlaca} onChangeText={setFiltroPlaca} autoCapitalize="characters" /></View>
						</View>

						<View style={styles.inputGroupFull}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
								<Text style={styles.label}>Cliente</Text>
								{!!params?.cliente_id && (
									<TouchableOpacity onPress={limparFiltroCliente} style={{ paddingHorizontal: 5 }}>
										<Text style={{ color: '#0c6ead', fontSize: 13, fontWeight: 'bold' }}>Limpar Filtro</Text>
									</TouchableOpacity>
								)}
							</View>
							<TextInput
								style={[styles.input, params?.cliente_id ? { backgroundColor: '#eee', color: '#666' } : {}]}
								placeholder="Nome do Cliente..."
								value={filtroCliente}
								editable={!params?.cliente_id}
								onChangeText={(text) => {
									setFiltroCliente(text);
									setFiltroClienteId('');
								}}
							/>
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
									<Feather name="user" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {item.cliente || item.proprietario || 'Não associado'}</Text>
								</View>
								<View style={styles.cardInfoRow}>
									<Feather name="info" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>DOT:</Text> {item.dot}  •  <Text style={{ fontWeight: 'bold' }}>Ferro:</Text> {item.ferro}</Text>
								</View>
								<View style={styles.cardInfoRow}>
									<Feather name="layers" size={14} color="#666" style={{ marginRight: 8 }} />
									<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Tipo:</Text> {item.tipo}  •  <Text style={{ fontWeight: 'bold' }}>Reformas:</Text> {item.qtde_reforma}</Text>
								</View>

								{item.tipo !== 'Novo' && (
									<View style={styles.cardInfoRow}>
										<Feather name="tool" size={14} color="#666" style={{ marginRight: 8 }} />
										<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Banda:</Text> {item.banda}</Text>
									</View>
								)}
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
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
						<View style={styles.modalHeaderFullScreen}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>

							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />

							<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}>
								<Feather name="power" size={22} color="#fff" />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

							<Text style={styles.groupTitle}>Veículo / Associação</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Cliente Proprietário</Text>
								<View style={styles.inputWithIcon}>
									<TextInput
										style={[styles.inputFlex, (params?.cliente_id || form.veiculo_id) ? { backgroundColor: '#eee', color: '#666' } : {}]}
										value={form.cliente}
										editable={!(params?.cliente_id || form.veiculo_id)}
										onChangeText={t => setForm({ ...form, cliente: t, cliente_id: '' })}
										placeholder="Nome do Cliente..."
									/>
									<TouchableOpacity
										style={[styles.searchIconBtn, (params?.cliente_id || form.veiculo_id) ? { backgroundColor: '#999', borderColor: '#999' } : {}]}
										onPress={() => abrirBuscaDinamica('entidade')}
										disabled={!!(params?.cliente_id || form.veiculo_id)}
									>
										<Feather name="search" size={20} color="#fff" />
									</TouchableOpacity>
								</View>
							</View>

							<View style={styles.row}>
								<View style={{ width: '100%', marginBottom: 15 }}>
									<Text style={styles.label}>Associar à Placa (Vazio = Avulso)</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('veiculo')}>
										<Text style={{ color: form.placa_associada ? '#000' : '#999' }}>{form.placa_associada || 'Pneu Avulso...'}</Text>
										{form.placa_associada ? (
											<TouchableOpacity onPress={() => setForm({ ...form, placa_associada: '', veiculo_id: '', cliente: (params?.cliente_id ? form.cliente : ''), cliente_id: (params?.cliente_id ? form.cliente_id : '') })}>
												<Feather name="x-circle" size={18} color="#E53935" />
											</TouchableOpacity>
										) : (
											<Feather name="search" size={16} color="#999" />
										)}
									</TouchableOpacity>
								</View>
							</View>

							<Text style={styles.groupTitle}>Identificação do Pneu</Text>
							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Referência</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}>
										<Text style={{ color: form.referencia ? '#000' : '#999' }}>{form.referencia || 'Selecionar Referência...'}</Text>
										<Feather name="search" size={16} color="#999" />
									</TouchableOpacity>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Tipo</Text>
									<RNPickerSelect
										placeholder={{ label: 'Selecione...', value: '', color: '#666' }}
										value={form.tipo}
										onValueChange={v => {
											if (v !== 'Reformado') {
												setForm({
													...form,
													tipo: v, grau: '', banda: '', banda_id: '',
													mm_original: form.ref_mm_original || form.mm_original,
													valor: form.ref_valor || form.valor
												});
											} else {
												setForm({ ...form, tipo: v });
											}
										}}
										items={[{ label: 'Novo', value: 'Novo', color: '#000' }, { label: 'Reformado', value: 'Reformado', color: '#000' }]}
										style={pickerStyles}
										useNativeAndroidPickerStyle={false}
										Icon={PickerIcon}
									/>
								</View>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Marca</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca_pneu')}>
										<Text style={{ color: form.marca ? '#000' : '#000000', fontSize: 13 }}>{form.marca || 'Buscar...'}</Text>
										<Feather name="search" size={14} color="#000000" />
									</TouchableOpacity>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>Modelo</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo_pneu')}>
										<Text style={{ color: form.modelo ? '#000' : '#000000', fontSize: 13 }}>{form.modelo || 'Buscar...'}</Text>
										<Feather name="search" size={14} color="#000000" />
									</TouchableOpacity>
								</View>
							</View>

							{form.tipo === 'Reformado' && (
								<View style={[styles.row, { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15 }]}>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Recapagem</Text>
										<RNPickerSelect placeholder={{ label: '...', value: '', color: '#666' }} value={form.grau} onValueChange={v => setForm({ ...form, grau: v })} items={[{ label: '1', value: '1', color: '#000' }, { label: '2', value: '2', color: '#000' }, { label: '3', value: '3', color: '#000' }, { label: '4', value: '4', color: '#000' }, { label: '5', value: '5', color: '#000' }]} style={{ ...pickerStyles, inputIOS: { ...pickerStyles.inputIOS, backgroundColor: '#fff' }, inputAndroid: { ...pickerStyles.inputAndroid, backgroundColor: '#fff' } }} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
									</View>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Banda</Text>
										<TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff', borderColor: '#ccc' }]} onPress={() => abrirBuscaDinamica('banda')}>
											<Text style={{ color: form.banda ? '#000' : '#999', fontSize: 12 }} numberOfLines={1}>{form.banda || 'Buscar...'}</Text>
										</TouchableOpacity>
									</View>
								</View>
							)}

							<Text style={styles.groupTitle}>Especificações</Text>
							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>* DOT (4 dígitos)</Text><TextInput style={styles.inputModal} value={form.dot} onChangeText={t => setForm({ ...form, dot: t.replace(/\D/g, '') })} keyboardType="numeric" maxLength={4} placeholder="Ex: 2324" /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Série</Text><TextInput style={styles.inputModal} value={form.serie} onChangeText={t => setForm({ ...form, serie: t })} /></View>
							</View>

							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Ferro</Text>
								<TextInput style={styles.inputModal} value={form.ferro} onChangeText={t => setForm({ ...form, ferro: t })} />
							</View>

							<Text style={styles.groupTitle}>Aferições</Text>

							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Valor (R$)</Text>
								<TextInput style={styles.inputModal} keyboardType="numeric" value={form.valor} onChangeText={t => setForm({ ...form, valor: formatarMoeda(t) })} placeholder="0,00" />
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Orig. (mm)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={form.mm_original} onChangeText={t => setForm({ ...form, mm_original: t })} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Atual (mm)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={form.milimetros} onChangeText={t => setForm({ ...form, milimetros: t })} /></View>
							</View>
							<View style={styles.row}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Calib. Padrão (Lbs)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={form.pressao_padrao} onChangeText={t => setForm({ ...form, pressao_padrao: t })} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Calib. Atual (Lbs)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={form.pressao} onChangeText={t => setForm({ ...form, pressao: t })} /></View>
							</View>

							<Text style={styles.groupTitle}>Recusa (Opcional)</Text>
							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Motivo da Recusa (Se houver)</Text>
								<RNPickerSelect
									placeholder={{ label: 'Pneu aprovado (Nenhum)', value: '', color: '#666' }}
									value={form.motivo_recusa}
									onValueChange={v => setForm({ ...form, motivo_recusa: v })}
									items={[
										{ label: 'Deslocamento de Talão', value: 'Deslocamento de talão', color: '#000' },
										{ label: 'Deslocamento por Manchão Inadequado', value: 'Deslocamento por manchão inadequado', color: '#000' },
										{ label: 'Rodagem em Baixa Pressão', value: 'Rodagem baixa pressão', color: '#000' },
										{ label: 'Separação de Cintas', value: 'Separação de cintas', color: '#000' },
										{ label: 'Dano Irreparável', value: 'Dano irreparável', color: '#000' },
										{ label: 'Outros', value: 'Outros', color: '#000' }
									]}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={PickerIcon}
								/>
							</View>

							{form.motivo_recusa === 'Outros' && (
								<View style={{ width: '100%', marginBottom: 15 }}>
									<Text style={styles.label}>* Descreva o outro motivo</Text>
									<TextInput
										style={styles.inputModal}
										value={form.motivo_recusa_outro}
										onChangeText={t => setForm({ ...form, motivo_recusa_outro: t })}
										placeholder="Escreva qual foi o motivo..."
									/>
								</View>
							)}

							<Text style={styles.label}>Observações (Opcional)</Text>
							<TextInput style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} multiline={true} value={form.observacao} onChangeText={t => setForm({ ...form, observacao: t })} placeholder="Alguma nota sobre este pneu..." />

							<View style={{ flexDirection: 'row', gap: 10 }}>
								<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={tirarFotoPneu}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Feather name="camera" size={20} color="#666" />
										<Text style={styles.btnFotoText}>Câmera</Text>
									</View>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={escolherFotoGaleria}>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Feather name="image" size={20} color="#666" />
										<Text style={styles.btnFotoText}>Galeria</Text>
									</View>
								</TouchableOpacity>
							</View>

							{fotosPneu.length > 0 && (
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
									{fotosPneu.map((uri, index) => (
										<View key={`foto_${index}`} style={styles.fotoContainer}>
											<TouchableOpacity onPress={() => setFotoAmpliada(uri)}><Image source={{ uri }} style={styles.fotoPreview} /></TouchableOpacity>
											<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFoto(index)}><Feather name="x" size={14} color="#fff" /></TouchableOpacity>
										</View>
									))}
								</ScrollView>
							)}

							<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Voltar</Text>
								</TouchableOpacity>

								{form.id ? (
									<TouchableOpacity style={[styles.btnImprimir, { flex: 1, height: 50 }]} onPress={() => Linking.openURL(`https://sistemascactus.com/apicactus/akipneus/imprimir_pneu.php?id=${form.id}`)}>
										<Feather name="printer" size={18} color="#fff" />
										<Text style={styles.btnImprimirText}>Imprimir</Text>
									</TouchableOpacity>
								) : null}

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.2, marginTop: 0, height: 50 }]} onPress={salvarPneu} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
							<View style={{ height: 40 }} />
						</ScrollView>

						{fotoAmpliada && (
							<View style={styles.fullScreenOverlay}>
								<TouchableOpacity style={styles.closeFullBtn} onPress={() => setFotoAmpliada(null)}><Feather name="x-circle" size={36} color="#fff" /></TouchableOpacity>
								<Image source={{ uri: fotoAmpliada }} style={styles.fullScreenImage} resizeMode="contain" />
							</View>
						)}

						{modalBuscaVisible && renderBuscaDinamica()}
						{modalCadastroVisible && renderCadastroDinamico()}

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
const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%' },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

	inputWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
	inputFlex: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000' },
	searchIconBtn: { backgroundColor: '#0c6ead', width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#0c6ead' },

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
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFullScreen: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0c6ead',
		paddingHorizontal: 15,
		paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50),
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnTextCancel: { color: '#333', fontWeight: 'bold' },
	btnLaudar: { backgroundColor: '#E53935', flexDirection: 'row', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnLaudarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnImprimirLaudo: { backgroundColor: '#63c77b', flexDirection: 'row', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

	btnImprimir: { backgroundColor: '#3276b1', flexDirection: 'row', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
	btnImprimirText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

	btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 15, backgroundColor: '#f9f9f9' },
	btnFotoText: { marginLeft: 10, color: '#666', fontWeight: 'bold' },
	fotoContainer: { marginRight: 15, marginTop: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8 },
	btnRemoveFoto: { position: 'absolute', top: -10, right: -10, backgroundColor: '#E53935', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },

	boxReformado: { backgroundColor: '#f0f0f0', padding: 15, borderRadius: 8, marginBottom: 15 },

	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	itemBuscaDoc: { fontSize: 12, color: '#888', marginTop: 2 },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
	btnInserirBuscaDinamica: { backgroundColor: '#e8f5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#63c77b', marginBottom: 15 },
	btnInserirBuscaDinamicaText: { color: '#28a745', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
	btnInserirBuscaDinamicaMini: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' },
	btnInserirBuscaDinamicaTextMini: { color: '#28a745', fontWeight: 'bold', fontSize: 13, marginLeft: 5 },

	modalSmall: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

	btnVoltarCliente: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 15, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ccc' },
	btnVoltarClienteText: { marginLeft: 6, fontSize: 13, fontWeight: 'bold', color: '#333' },
	btnIniciar: { backgroundColor: '#63c77b', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

	fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 99999, elevation: 99999 },
	closeFullBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 100000, elevation: 100000, padding: 10 },
	fullScreenImage: { width: '100%', height: '80%' },
});