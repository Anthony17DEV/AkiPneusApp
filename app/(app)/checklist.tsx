import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAuth } from '../../contexts/AuthContext';
import { ChassiCaminhao } from '../../src/components/ChassiCaminhao';
import { apiService } from '../../src/services/apiService';

interface Veiculo { id: number; placa: string; codigo: string; marca: string; modelo: string; eixos: string; rodado: string; calibragem_padrao: string; estepe: string; }

export default function ChecklistScreen() {
	const FOTO_URL = 'https://sistemascactus.com/apicactus/akipneus/fotos/';
	const API_CADASTRO_URL = 'https://sistemascactus.com/apicactus/akipneus/api_pneu_cadastro_rapido.php';

	const params = useLocalSearchParams();
	const router = useRouter();
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(false);
	const [veiculo, setVeiculo] = useState<Veiculo | null>(null);

	const [historico, setHistorico] = useState<any[]>([]);
	const [idChecklistAtivo, setIdChecklistAtivo] = useState<number | null>(null);
	const [modalNovoChecklist, setModalNovoChecklist] = useState(false);
	const [formNovoCheck, setFormNovoCheck] = useState({ motorista: '', odometro: '' });

	const [dadosPneus, setDadosPneus] = useState<{ [key: string]: any }>({});
	const [modalPneuVisible, setModalPneuVisible] = useState(false);
	const [pneuSelecionado, setPneuSelecionado] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [fotosPneu, setFotosPneu] = useState<string[]>([]);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '', marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '' });

	const [formPneu, setFormPneu] = useState({
		referencia: '', referencia_nome: '', marca: '', modelo: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: '',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '',
		grau: '', banda: '', banda_nome: '', observacao: ''
	});

	useEffect(() => {
		if (params.placa) { buscarVeiculoDireto(params.placa as string); }
	}, [params.placa]);

	const buscarVeiculoDireto = async (placa: string) => {
		setIsLoading(true);
		const res = await apiService.buscarVeiculo(placa);
		setIsLoading(false);
		if (res && res.success && res.data && res.data.length > 0) {
			const v = res.data[0];
			setVeiculo(v);
			carregarHistorico(v.id);
		}
	};

	const carregarHistorico = async (vId: number) => {
		const res = await apiService.listarChecklists(vId);
		if (res && res.success) setHistorico(res.data);
	};

	const carregarCoresPneus = async (checkId: number) => {
		const res = await apiService.buscarPneusVeiculo(checkId);
		if (res && res.success && res.data) { setDadosPneus(res.data); } else { setDadosPneus({}); }
	};

	const iniciarNovoChecklist = async () => {
		if (!formNovoCheck.motorista || !formNovoCheck.odometro) { Alert.alert("Erro", "Preencha o Motorista e o Odômetro."); return; }
		setIsLoading(true);
		const res = await apiService.iniciarChecklist({ veiculo_id: veiculo?.id, motorista: formNovoCheck.motorista, odometro: formNovoCheck.odometro, user_id: user?.id });
		setIsLoading(false);
		if (res && res.success) {
			setModalNovoChecklist(false); setIdChecklistAtivo(res.checklist_id); carregarCoresPneus(res.checklist_id); setFormNovoCheck({ motorista: '', odometro: '' });
		} else { Alert.alert("Erro", res.message || "Erro ao iniciar."); }
	};

	const abrirChecklistAntigo = (idChecklist: number) => {
		setIdChecklistAtivo(idChecklist); carregarCoresPneus(idChecklist);
	};

	const handlePneuClick = (codigoPneu: string) => {
		setPneuSelecionado(codigoPneu);
		const pAtual = dadosPneus[codigoPneu] || {};
		const dbData = pAtual.dados_completos || {};

		if (dbData.pneu_tx_foto) {
			const nomesFotos = dbData.pneu_tx_foto.split(',');
			const urlsCompletas = nomesFotos.map((nome: string) => FOTO_URL + nome);
			setFotosPneu(urlsCompletas);
		} else {
			setFotosPneu([]);
		}

		setFormPneu({
			referencia: dbData.pneu_tx_referencia || '',
			referencia_nome: dbData.referencia_nome || (dbData.pneu_tx_referencia ? `Referência #${dbData.pneu_tx_referencia}` : ''),
			marca: dbData.pneu_tx_marca || '',
			modelo: dbData.pneu_tx_modelo || '',
			valor: dbData.pneu_tx_valor?.toString() || '',
			dot: dbData.pneu_tx_dot || '',
			serie: dbData.pneu_tx_serie || '',
			ferro: dbData.pneu_tx_ferro || '',
			tipo: dbData.pneu_tx_tipo || '',
			mm_original: dbData.pneu_tx_mmOriginal?.toString() || '',
			milimetros: dbData.pneu_tx_milimetros?.toString() || '',
			grau: dbData.pneu_tx_grau || '',
			banda: dbData.pneu_tx_banda || '',
			banda_nome: dbData.banda_nome || dbData.pneu_tx_banda || '',
			observacao: dbData.pneu_tx_observacao || '',
			pressao_padrao: dbData.pneu_tx_pressaoPadrao?.toString() || veiculo?.calibragem_padrao || '',
			pressao: dbData.pneu_tx_pressao?.toString() || ''
		});

		setModalPneuVisible(true);
	};

	const tirarFotoPneu = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à câmera."); return; }
		const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.7, base64: true });
		if (!result.canceled && result.assets[0].base64) { setFotosPneu([...fotosPneu, `data:image/jpeg;base64,${result.assets[0].base64}`]); }
	};

	const removerFoto = (index: number) => { setFotosPneu(fotosPneu.filter((_, i) => i !== index)); };

	const salvarAfericaoPneu = async () => {
		if (!formPneu.milimetros || !formPneu.pressao) { Alert.alert('Atenção', 'Sulco e Calibração são obrigatórios.'); return; }
		setIsSaving(true);
		const res = await apiService.salvarInspecaoPneu({ ...formPneu, veiculo_id: veiculo?.id, checklist_id: idChecklistAtivo, posicao: pneuSelecionado, user_id: user?.id, fotos: fotosPneu });
		setIsSaving(false);
		if (res && res.success) { Alert.alert('Sucesso', res.message); setModalPneuVisible(false); if (idChecklistAtivo) carregarCoresPneus(idChecklistAtivo); }
		else { Alert.alert('Erro', res?.message || 'Falha ao salvar pneu.'); }
	};

	const abrirBuscaDinamica = (tipo: any) => { setTipoBusca(tipo); setTermoComboBusca(''); setResultadosBusca([]); setModalBuscaVisible(true); buscarDinamicaNoBanco(tipo, ''); };

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		const extras = {
			referencia_id: formPneu.referencia,
			marca_atual: formPneu.marca
		};
		const res = await apiService.buscarDinamica(tipo, termo, extras);
		setResultadosBusca(res && res.success ? res.data : []);
		setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'referencia_pneu') {
			setFormPneu({
				...formPneu,
				referencia: item.id,
				referencia_nome: item.nome,
				marca: '',
				modelo: '',
				mm_original: ''
			});
		}
		else if (tipoBusca === 'marca_pneu') {
			setFormPneu({
				...formPneu,
				marca: item.nome,
				modelo: '',
				mm_original: ''
			});
		}
		else if (tipoBusca === 'modelo_pneu') {
			setFormPneu({
				...formPneu,
				modelo: item.nome,
				mm_original: item.mmOriginal || formPneu.mm_original
			});
		}
		else if (tipoBusca === 'banda') {
			setFormPneu({ ...formPneu, banda: item.id, banda_nome: item.nome });
		}

		setModalBuscaVisible(false);
	};

	const salvarCadastroDinamico = async () => {
		if (tipoBusca === 'referencia_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }
		if (tipoBusca === 'banda' && (!formCadastro.marca || !formCadastro.modelo || !formCadastro.sulco)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }

		setIsCadastrando(true);
		try {
			const response = await fetch(API_CADASTRO_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ tipo: tipoBusca, ...formCadastro })
			});
			const res = await response.json();
			if (res.success) {
				selecionarItemBusca({ id: res.id, nome: res.nome, mmOriginal: formCadastro.mmOriginal, marca: formCadastro.marca, modelo: formCadastro.modelo });
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

	const formatarData = (dataStr: string) => {
		if (!dataStr) return '';
		const d = new Date(dataStr.replace(' ', 'T'));
		return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			{isLoading && <ActivityIndicator size="large" color="#3276b1" style={{ marginTop: 50 }} />}

			{veiculo && (
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
					<View style={styles.veiculoCard}>
						<View style={styles.veiculoHeader}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<MaterialCommunityIcons name="truck-outline" size={28} color="#333" />
								<Text style={styles.placaText}>{veiculo.placa}</Text>
							</View>
						</View>
						<Text style={{ fontSize: 13, color: '#666', marginTop: 10 }}>Marca/Modelo: {veiculo.marca} / {veiculo.modelo}</Text>
						<Text style={{ fontSize: 13, color: '#666' }}>Eixos: {veiculo.eixos} | Calibração: {veiculo.calibragem_padrao} Lbs</Text>
					</View>

					{!idChecklistAtivo && (
						<View style={{ flexDirection: 'row', marginBottom: 20 }}>
							<TouchableOpacity style={[styles.btnVoltarBranco, { flex: 1, marginRight: 10 }]} onPress={() => router.push('/veiculos')}>
								<Feather name="arrow-left" size={18} color="#333" />
								<Text style={styles.btnVoltarBrancoText}>Voltar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={[styles.btnNovoChecklist, { flex: 1 }]} onPress={() => setModalNovoChecklist(true)}>
								<Feather name="plus-circle" size={18} color="#fff" />
								<Text style={styles.btnNovoChecklistText}>Inserir</Text>
							</TouchableOpacity>
						</View>
					)}

					{!idChecklistAtivo && (
						<View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 2 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Histórico de Inspeções</Text>
							</View>

							{historico.length === 0 ? <Text style={{ color: '#999', textAlign: 'center', marginBottom: 10 }}>Nenhuma inspeção encontrada.</Text> : (
								historico.map((h, index) => (
									<View key={index} style={styles.itemHistorico}>
										<View style={{ flex: 1, paddingRight: 10 }}>
											<Text style={{ fontWeight: 'bold', color: '#333' }}>{formatarData(h.chec_tx_dataHora)}</Text>
											<Text style={{ color: '#666', fontSize: 12 }}>Motorista: {h.chec_tx_motorista}</Text>
											<Text style={{ color: '#666', fontSize: 12 }}>Odômetro: {h.chec_tx_odometro} Km</Text>
										</View>

										<TouchableOpacity style={styles.btnModificarHistorico} onPress={() => abrirChecklistAntigo(h.chec_nb_id)}>
											<Feather name="edit-2" size={14} color="#fff" />
											<Text style={styles.btnModificarHistoricoText}>Editar</Text>
										</TouchableOpacity>
									</View>
								))
							)}
						</View>
					)}

					{idChecklistAtivo && (
						<><View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 20 }}>
							<TouchableOpacity style={[styles.btnVoltarBranco, { width: '50%' }]} onPress={() => setIdChecklistAtivo(null)}>
								<Feather name="arrow-left" size={16} color="#333" />
								<Text style={styles.btnVoltarBrancoText}>Voltar</Text>
							</TouchableOpacity>
						</View><View style={styles.chassiContainer}>
								<Text style={styles.sectionTitle}>Mapeamento de Pneus</Text>
								<ChassiCaminhao qtdEixos={parseInt(veiculo.eixos.split(' ')[0]) || 2} qtdEstepes={parseInt(veiculo.estepe) || 0} dadosPneus={dadosPneus} onPneuPress={handlePneuClick} />
							</View></>
					)}
				</ScrollView>
			)}

			<Modal visible={modalNovoChecklist} transparent={true} animationType="fade">
				<View style={styles.modalOverlay}>
					<View style={styles.modalSmall}>
						<Text style={styles.modalTitle}>Novo checklist</Text>
						<Text style={styles.label}>Nome do Motorista</Text>
						<TextInput style={styles.inputModal} value={formNovoCheck.motorista} onChangeText={t => setFormNovoCheck({ ...formNovoCheck, motorista: t })} />
						<Text style={[styles.label, { marginTop: 10 }]}>Odômetro Atual (Km)</Text>
						<TextInput style={styles.inputModal} keyboardType="numeric" value={formNovoCheck.odometro} onChangeText={t => setFormNovoCheck({ ...formNovoCheck, odometro: t })} />
						<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
							<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalNovoChecklist(false)}><Text>Cancelar</Text></TouchableOpacity>
							<TouchableOpacity style={[styles.btnIniciar, { flex: 1 }]} onPress={iniciarNovoChecklist}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Iniciar</Text></TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>

			<Modal visible={modalPneuVisible} animationType="slide">
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalPneuVisible(false)}><Feather name="arrow-left" size={24} color="#333" /></TouchableOpacity>
						<Text style={styles.modalTitle}>Checklist Pneu {pneuSelecionado}</Text>
						<View style={{ width: 24 }} />
					</View>

					<ScrollView contentContainerStyle={{ padding: 20 }}>
						<Text style={styles.groupTitle}>Identificação do Pneu</Text>
						<View style={styles.row}>
							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Referência</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}>
									<Text style={{ color: formPneu.referencia_nome ? '#000' : '#999' }}>{formPneu.referencia_nome || 'Selecionar Referência...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Marca</Text><TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca_pneu')}><Text style={{ color: formPneu.marca ? '#000' : '#999', fontSize: 13 }}>{formPneu.marca || 'Buscar...'}</Text><Feather name="search" size={14} color="#999" /></TouchableOpacity></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Modelo</Text><TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo_pneu')}><Text style={{ color: formPneu.modelo ? '#000' : '#999', fontSize: 13 }}>{formPneu.modelo || 'Buscar...'}</Text><Feather name="search" size={14} color="#999" /></TouchableOpacity></View>
						</View>
						<View style={styles.row}>
							<View style={{ width: '100%', marginBottom: 15 }}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.valor} onChangeText={t => setFormPneu({ ...formPneu, valor: t })} /></View>
						</View>

						<Text style={styles.groupTitle}>Especificações Técnicas</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>DOT</Text><TextInput style={styles.inputModal} value={formPneu.dot} onChangeText={t => setFormPneu({ ...formPneu, dot: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Série</Text><TextInput style={styles.inputModal} value={formPneu.serie} onChangeText={t => setFormPneu({ ...formPneu, serie: t })} /></View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Ferro</Text><TextInput style={styles.inputModal} value={formPneu.ferro} onChangeText={t => setFormPneu({ ...formPneu, ferro: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>Tipo</Text><RNPickerSelect placeholder={{ label: 'Selecione...', value: '' }} value={formPneu.tipo} onValueChange={v => setFormPneu({ ...formPneu, tipo: v })} items={[{ label: 'Novo', value: 'Novo' }, { label: 'Reformado', value: 'Reformado' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
						</View>

						{formPneu.tipo === 'Reformado' && (
							<View style={[styles.row, { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8 }]}>
								<View style={styles.inputGroupH}><Text style={styles.label}>Qtde Reforma (Grau)</Text><RNPickerSelect placeholder={{ label: '...', value: '' }} value={formPneu.grau} onValueChange={v => setFormPneu({ ...formPneu, grau: v })} items={[{ label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '4', value: '4' }, { label: '5', value: '5' }]} style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon} /></View>
								<View style={styles.inputGroupH}><Text style={styles.label}>Banda</Text><TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff', borderColor: '#ccc' }]} onPress={() => abrirBuscaDinamica('banda')}><Text style={{ color: formPneu.banda_nome ? '#000' : '#999', fontSize: 12 }} numberOfLines={1}>{formPneu.banda_nome || 'Buscar...'}</Text></TouchableOpacity></View>
							</View>
						)}

						<Text style={styles.groupTitle}>Aferição Atual (Desgaste/Lbs)</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Orig. (mm)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={formPneu.mm_original} onChangeText={t => setFormPneu({ ...formPneu, mm_original: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Sulco Atual (mm)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.milimetros} onChangeText={t => setFormPneu({ ...formPneu, milimetros: t })} /></View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Calib. Padrão (Lbs)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={formPneu.pressao_padrao} onChangeText={t => setFormPneu({ ...formPneu, pressao_padrao: t })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Calib. Atual (Lbs)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.pressao} onChangeText={t => setFormPneu({ ...formPneu, pressao: t })} /></View>
						</View>

						<Text style={styles.groupTitle}>Evidências / Fotos</Text>
						<TouchableOpacity style={styles.btnFoto} onPress={tirarFotoPneu}>
							<Feather name="camera" size={20} color="#666" />
							<Text style={styles.btnFotoText}>Fotografar Pneu</Text>
						</TouchableOpacity>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 15 }}>
							{fotosPneu.map((uri, index) => (
								<View key={index} style={styles.fotoContainer}>
									<Image source={{ uri }} style={styles.fotoPreview} />
									<TouchableOpacity style={styles.btnRemoveFoto} onPress={() => removerFoto(index)}>
										<Feather name="x" size={12} color="#fff" />
									</TouchableOpacity>
								</View>
							))}
						</ScrollView>

						<Text style={styles.groupTitle}>Observações</Text>
						<TextInput style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} multiline={true} value={formPneu.observacao} onChangeText={t => setFormPneu({ ...formPneu, observacao: t })} />

						<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }]} onPress={salvarAfericaoPneu} disabled={isSaving}>
							{isSaving ? <ActivityIndicator color="#fff" /> : <><Feather name="check" size={20} color="#fff" /><Text style={styles.btnSalvarText}> Gravar</Text></>}
						</TouchableOpacity>
						<View style={{ height: 40 }} />
					</ScrollView>

					{modalBuscaVisible && (
						<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 9999, elevation: 9999 }]}>
							<View style={styles.modalContentBusca}>
								<View style={styles.modalHeaderBusca}>
									<Text style={styles.modalTitleBusca}>Pesquisar</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center' }}>
										{(tipoBusca === 'referencia_pneu' || tipoBusca === 'banda') && (
											<TouchableOpacity
												style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' }}
												onPress={() => {
													setFormCadastro({ nome: '', marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '' });
													setModalBuscaVisible(false);
													setModalCadastroVisible(true);
												}}
											>
												<Feather name="plus-circle" size={14} color="#28a745" />
												<Text style={{ color: '#28a745', fontWeight: 'bold', fontSize: 13, marginLeft: 5 }}>Inserir</Text>
											</TouchableOpacity>
										)}
										<TouchableOpacity onPress={() => setModalBuscaVisible(false)}><Feather name="x" size={24} color="#333" /></TouchableOpacity>
									</View>
								</View>

								<View style={styles.inputBuscaContainer}>
									<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
									<TextInput style={styles.inputBuscaInterno} placeholder={`Buscar...`} value={termoComboBusca} onChangeText={(t) => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }} autoFocus={true} />
								</View>

								{termoComboBusca.trim().length > 0 && (tipoBusca === 'referencia_pneu' || tipoBusca === 'banda') && (
									<TouchableOpacity
										style={styles.btnInserirBuscaDinamica}
										onPress={() => {
											setFormCadastro({ nome: termoComboBusca.trim(), marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '' });
											setModalBuscaVisible(false);
											setModalCadastroVisible(true);
										}}
									>
										<Feather name="plus-circle" size={18} color="#28a745" />
										<Text style={styles.btnInserirBuscaDinamicaText}>Cadastrar Novo: "{termoComboBusca.trim()}"</Text>
									</TouchableOpacity>
								)}

								{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#ED1C24" /> : (
									<FlatList data={resultadosBusca} keyExtractor={(item, index) => String(item?.id || index)}
										renderItem={({ item }) => (
											<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
												<Text style={styles.itemBuscaNome}>{item.nome}</Text>
											</TouchableOpacity>
										)}
										ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado.</Text>}
									/>
								)}
							</View>
						</View>
					)}

					{modalCadastroVisible && (
						<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
							<View style={styles.modalSmall}>
								<Text style={styles.modalTitle}>
									Cadastrar {tipoBusca === 'banda' ? 'Banda' : 'Referência'}
								</Text>

								{tipoBusca === 'referencia_pneu' && (
									<>
										<Text style={styles.label}>* Nome da Referência</Text>
										<TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} />
										<Text style={styles.label}>* Marca</Text>
										<TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} />
										<Text style={styles.label}>* Modelo</Text>
										<TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} />
										<View style={styles.row}>
											<View style={styles.inputGroupH}><Text style={styles.label}>* MM Original</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.mmOriginal} onChangeText={t => setFormCadastro({ ...formCadastro, mmOriginal: t })} /></View>
											<View style={styles.inputGroupH}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: t })} /></View>
										</View>
									</>
								)}

								{tipoBusca === 'banda' && (
									<>
										<Text style={styles.label}>* Marca</Text>
										<TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} />
										<Text style={styles.label}>* Modelo</Text>
										<TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} />
										<Text style={styles.label}>* Sulco (MM)</Text>
										<TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.sulco} onChangeText={t => setFormCadastro({ ...formCadastro, sulco: t })} />
									</>
								)}

								<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
									<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalCadastroVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
									<TouchableOpacity style={[styles.btnIniciar, { flex: 1 }]} onPress={salvarCadastroDinamico}>
										{isCadastrando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>}
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
				</KeyboardAvoidingView>
			</Modal>
		</View>
	);
}

const pickerStyles = StyleSheet.create({ inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 15, paddingRight: 30, minHeight: 48 }, inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#333', marginBottom: 15, paddingRight: 30, minHeight: 48 } });

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8', paddingHorizontal: 20 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	veiculoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 2 },
	veiculoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
	placaText: { fontSize: 24, fontWeight: '900', color: '#333', marginLeft: 10, letterSpacing: 1 },
	btnVoltarBranco: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
	btnVoltarBrancoText: { color: '#333', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnNovoChecklist: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8 },
	btnNovoChecklistText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	itemHistorico: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	btnModificarHistorico: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnModificarHistoricoText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	chassiContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 3 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 99999 },
	modalSmall: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	modalHeaderFullScreen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 20, borderBottomWidth: 1, borderColor: '#eee' },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
	btnIniciar: { backgroundColor: '#63c77b', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#ED1C24', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#ffe5e6', paddingBottom: 5 },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 15, backgroundColor: '#f9f9f9' },
	btnFotoText: { marginLeft: 10, color: '#666', fontWeight: 'bold' },
	fotoContainer: { marginRight: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8 },
	btnRemoveFoto: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ED1C24', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
	modalOverlayBusca: { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
	btnInserirBuscaDinamica: { backgroundColor: '#e8f5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#63c77b', marginBottom: 15 },
	btnInserirBuscaDinamicaText: { color: '#28a745', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }
});