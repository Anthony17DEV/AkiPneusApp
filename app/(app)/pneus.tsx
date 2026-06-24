import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/solutires.png';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

interface Pneu {
	id: number; referencia: string; marca: string; modelo: string; dot: string; serie: string; ferro: string;
	placa?: string;
	tipo: string; qtde_reforma: string | number; banda: string; placa_associada: string | null;
	reformador?: string; reformador_id?: string;
	valor?: string | number; mm_original?: string; milimetros?: string; pressao_padrao?: string; pressao?: string;
	observacao?: string; referencia_id?: string; marca_id?: string; modelo_id?: string; banda_id?: string; veiculo_id?: string;
	foto?: string; pneu_tx_foto?: string; pneu_tx_foto_antiga?: string; foto_antiga?: string;
	historico?: any[];
	motivo_recusa?: string;
}

export default function PneusScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const { user, signOut } = useAuth();
	const FOTO_URL = 'https://sistemascactus.com/apicactus/akipneus/fotos/';
	const API_PNEU_URL = 'https://sistemascactus.com/apicactus/akipneus/api_pneus.php';

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [pneus, setPneus] = useState<Pneu[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [pagina, setPagina] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const [filtroPlaca, setFiltroPlaca] = useState('');
	const [filtroFogo, setFiltroFogo] = useState('');
	const [filtroMarca, setFiltroMarca] = useState('');
	const [filtroReferencia, setFiltroReferencia] = useState('');
	const [filtroSerie, setFiltroSerie] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [modalViewVisible, setModalViewVisible] = useState(false);
	const [modalHistoricoVisible, setModalHistoricoVisible] = useState(false);
	const [historicoPneu, setHistoricoPneu] = useState<any[]>([]);

	const [viewPneuData, setViewPneuData] = useState<Pneu | null>(null);
	const [fotosPneu, setFotosPneu] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [modalRelatorioVisible, setModalRelatorioVisible] = useState(false);
	const [opcoesRelatorio, setOpcoesRelatorio] = useState({ exibirCusto: true, agruparPor: 'veiculo' });

	const [modalPreviewVisible, setModalPreviewVisible] = useState(false);
	const [previewData, setPreviewData] = useState({ url: '', nome: '', tipo: '', subtitulo: '' });
	const [htmlDoc, setHtmlDoc] = useState('');
	const [isCarregandoPreview, setIsCarregandoPreview] = useState(false);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda' | 'veiculo' | 'reformador' | 'motivo_laudo'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalScannerVisible, setModalScannerVisible] = useState(false);
	const [scannerMode, setScannerMode] = useState<'fogo' | 'serie'>('fogo');
	const [isScanning, setIsScanning] = useState(false);

	const [formPneu, setFormPneu] = useState({
		id: '', referencia: '', referencia_nome: '', marca: '', modelo: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: 'Novo',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '',
		grau: '', banda: '', banda_nome: '', reformador: '', reformador_id: '', observacao: '', motivo_recusa: '',
		veiculo_id: '', placa: '',
		ref_mm_original: '', ref_valor: ''
	});

	const formatarValorDB = (val: any) => {
		if (!val) return '';
		let str = String(val);
		if (str.includes(',')) { str = str.replace(/\./g, '').replace(',', '.'); } else {
			const lastDot = str.lastIndexOf('.');
			if (lastDot !== -1) { str = str.substring(0, lastDot).replace(/\./g, '') + '.' + str.substring(lastDot + 1); }
		}
		let num = parseFloat(str);
		if (isNaN(num)) return '';
		let formatado = num.toFixed(2).replace('.', ',');
		return formatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	};

	const getFloatDb = (val: any) => {
		if (!val) return 0;
		let str = String(val);
		if (str.includes(',')) { str = str.replace(/\./g, '').replace(',', '.'); }
		return parseFloat(str) || 0;
	};

	const formatarMoeda = (text: string) => {
		let v = text.replace(/\D/g, '');
		if (v === '') return '';
		v = (parseInt(v, 10) / 100).toFixed(2).replace('.', ',');
		v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
		return v;
	};

	const carregarPneus = async (pageToLoad = 1) => {
		if (pageToLoad === 1) setIsLoading(true); else setIsFetchingMore(true);

		try {
			const response = await fetch(API_PNEU_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					acao: 'listar',
					pagina: pageToLoad,
					limite: 20,
					busca_placa: filtroPlaca,
					busca_fogo: filtroFogo,
					busca_marca: filtroMarca,
					busca_referencia: filtroReferencia,
					busca_serie: filtroSerie,
					cliente_id: params.cliente_id || ''
				})
			});
			const res = await response.json();

			if (!isMounted.current) return;

			if (res.success) {
				const dataArray = res.data || [];
				if (pageToLoad === 1) {
					setPneus(dataArray);
				} else {
					setPneus(prev => {
						const novosPneus = dataArray.filter((novoItem: any) => !prev.some(p => p.id === novoItem.id));
						return [...prev, ...novosPneus];
					});
				}
				setHasMore(dataArray.length === 20);
				setPagina(pageToLoad);
			} else {
				if (pageToLoad === 1) setPneus([]);
				setHasMore(false);
			}
		} catch (error) {
			if (isMounted.current) console.log("Erro ao carregar pneus");
		} finally {
			if (isMounted.current) {
				setIsLoading(false);
				setIsFetchingMore(false);
			}
		}
	};

	useEffect(() => { carregarPneus(1); }, [params.cliente_id]);

	const loadMore = () => { if (!isLoading && !isFetchingMore && hasMore) carregarPneus(pagina + 1); };

	const abrirModalPreview = async (url: string, nomeDoArquivo: string, tipoDoc: string, subtituloDoc: string) => {
		setPreviewData({ url, nome: nomeDoArquivo, tipo: tipoDoc, subtitulo: subtituloDoc });
		setModalPreviewVisible(true);
		setIsCarregandoPreview(true);
		setHtmlDoc('');
		try {
			const resposta = await fetch(url);
			const txt = await resposta.text();

			if (!isMounted.current) return;
			setHtmlDoc(txt);
		} catch (e) {
			if (isMounted.current) Alert.alert('Erro', 'Não foi possível gerar o documento.');
		} finally {
			if (isMounted.current) setIsCarregandoPreview(false);
		}
	};

	const visualizarPDFNativo = async () => {
		if (!htmlDoc) { Alert.alert('Aguarde', 'O documento ainda está a carregar...'); return; }
		try { await Print.printAsync({ html: htmlDoc }); } catch (e) { console.log(e); }
	};

	const compartilharDocumentoPDF = async () => {
		if (!htmlDoc) { Alert.alert('Aguarde', 'O documento ainda está a carregar...'); return; }
		try {
			setIsCarregandoPreview(true);
			const { uri } = await Print.printToFileAsync({ html: htmlDoc });

			if (!isMounted.current) return;

			// @ts-ignore
			const diretorio = FileSystem.documentDirectory;
			const fileUriLocal = `${diretorio}${previewData.nome}.pdf`;

			await FileSystem.deleteAsync(fileUriLocal, { idempotent: true });
			await FileSystem.moveAsync({ from: uri, to: fileUriLocal });

			const isAvailable = await Sharing.isAvailableAsync();
			if (isAvailable && isMounted.current) {
				await Sharing.shareAsync(fileUriLocal, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Enviar PDF' });
			} else if (isMounted.current) {
				Alert.alert('Aviso', 'A partilha não está disponível no seu telemóvel.');
			}
		} catch (e) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao processar o PDF.');
		} finally {
			if (isMounted.current) setIsCarregandoPreview(false);
		}
	};

	const formatarDataLocal = (dataStr: string) => {
		if (!dataStr) return '';
		const dataParte = dataStr.split(' ')[0];
		const partes = dataParte.split('-');
		if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
		return dataStr;
	};

	const carregarHistorico = async (pneuId: number) => {
		setIsLoading(true);
		try {
			const response = await fetch(API_PNEU_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'historico_pneu', pneu_id: pneuId })
			});
			const res = await response.json();

			if (!isMounted.current) return;

			if (res.success) {
				setHistoricoPneu(res.data);
				setModalHistoricoVisible(true);
			} else {
				Alert.alert('Aviso', 'Nenhum histórico encontrado para este pneu.');
			}
		} catch (e) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao buscar histórico.');
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	const handleExcluir = (id: number, codigo: string) => {
		Alert.alert('Excluir Pneu', `Deseja realmente excluir o pneu Fogo/Série: ${codigo}?`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						await fetch(API_PNEU_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', id: id })
						});

						if (!isMounted.current) return;

						carregarPneus(1);
					} catch (error) {
						if (isMounted.current) Alert.alert('Erro', 'Não foi possível excluir.');
					}
				}
			}
		]);
	};

	const abrirVisualizacaoPneu = (pneu: Pneu) => {
		setViewPneuData(pneu);

		let fotosArray: string[] = [];
		if (pneu.pneu_tx_foto) { fotosArray = pneu.pneu_tx_foto.split(',').filter(f => f.trim() !== '').map(f => FOTO_URL + f.trim()); }
		else if (pneu.foto) { fotosArray = pneu.foto.split(',').filter(f => f.trim() !== '').map(f => FOTO_URL + f.trim()); }
		setFotosPneu(fotosArray);

		setModalViewVisible(true);
	};

	const renderBuscaDinamica = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<View style={styles.modalContentBusca}>
				<View style={styles.modalHeaderBusca}>
					<Text style={styles.modalTitleBusca}>Pesquisar</Text>
					<TouchableOpacity onPress={() => setModalBuscaVisible(false)}>
						<Feather name="x" size={24} color="#333" />
					</TouchableOpacity>
				</View>
				<View style={styles.inputBuscaContainer}>
					<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
					<TextInput
						style={styles.inputBuscaInterno}
						placeholder={`Buscar...`}
						value={termoComboBusca}
						onChangeText={(t) => { setTermoComboBusca(t); buscarDinamicaNoBanco(tipoBusca, t); }}
						autoFocus={true}
					/>
				</View>
				{isSearching ? <ActivityIndicator style={{ marginTop: 20 }} color="#0c6ead" /> : (
					<FlatList
						data={resultadosBusca}
						keyExtractor={(item, index) => String(item?.id || index)}
						initialNumToRender={10}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews={true}
						keyboardShouldPersistTaps="handled"
						renderItem={({ item }) => (
							<TouchableOpacity style={styles.itemBuscaDinamica} onPress={() => selecionarItemBusca(item)}>
								<Text style={styles.itemBuscaNome}>{item.nome || item.placa}</Text>
								{item.documento && <Text style={styles.itemBuscaDoc}>{item.documento}</Text>}
							</TouchableOpacity>
						)}
						ListEmptyComponent={<Text style={styles.emptyText}>Nenhum resultado.</Text>}
					/>
				)}
			</View>
		</View>
	);

	const editarPneu = (dbData: Pneu) => {
		setModalViewVisible(false);

		let fotosArray: string[] = [];
		if (dbData.pneu_tx_foto) { fotosArray = dbData.pneu_tx_foto.split(',').filter(f => f.trim() !== '').map(f => FOTO_URL + f.trim()); }
		else if (dbData.foto) { fotosArray = dbData.foto.split(',').filter(f => f.trim() !== '').map(f => FOTO_URL + f.trim()); }
		setFotosPneu(fotosArray);

		setFormPneu({
			id: String(dbData.id || ''),
			referencia: dbData.referencia_id || '',
			referencia_nome: dbData.referencia || '',
			marca: dbData.marca || '',
			modelo: dbData.modelo || '',
			valor: dbData.valor ? formatarValorDB(dbData.valor) : '',
			dot: dbData.dot || '',
			serie: dbData.serie || '',
			ferro: dbData.ferro || '',
			tipo: dbData.tipo || 'Novo',
			mm_original: dbData.mm_original?.toString() || '',
			milimetros: dbData.milimetros?.toString() || '',
			grau: dbData.qtde_reforma?.toString() || '',
			banda: dbData.banda_id || '',
			banda_nome: dbData.banda || '',
			reformador: dbData.reformador || '',
			reformador_id: dbData.reformador_id || '',
			observacao: dbData.observacao || '',
			motivo_recusa: dbData.motivo_recusa || '',
			pressao_padrao: dbData.pressao_padrao?.toString() || '',
			pressao: dbData.pressao?.toString() || '',
			ref_mm_original: dbData.mm_original?.toString() || '',
			ref_valor: dbData.valor ? formatarValorDB(dbData.valor) : '',
			veiculo_id: dbData.veiculo_id || '',
			placa: dbData.placa || ''
		});

		setModalVisible(true);
	};

	const tirarFotoPneu = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à câmara."); return; }
		const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.2, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotosPneu([...fotosPneu, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const escolherFotoGaleria = async () => {
		const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à galeria de fotos."); return; }
		const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.2, base64: true });
		if (!result.canceled && result.assets[0].base64) {
			setFotosPneu([...fotosPneu, `data:image/jpeg;base64,${result.assets[0].base64}`]);
		}
	};

	const removerFoto = (index: number) => { setFotosPneu(fotosPneu.filter((_, i) => i !== index)); };

	const salvarPneu = async () => {
		if (!formPneu.serie || !formPneu.milimetros) { Alert.alert('Atenção', 'Série e Sulco Atual são obrigatórios.'); return; }

		setIsSaving(true);
		const fotosNovas = fotosPneu.filter(f => f.startsWith('data:image'));
		const fotosAntigasLimpas = fotosPneu.filter(f => f.startsWith('http')).map(f => f.substring(f.lastIndexOf('/') + 1));

		try {
			const dadosParaSalvar = {
				...formPneu,
				valor: formPneu.valor.replace(/\./g, ''),
				user_id: user?.id,
				fotos_novas: fotosNovas,
				fotos_antigas: fotosAntigasLimpas
			};

			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_checklist_avulso.php', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					acao: formPneu.id ? 'atualizar_pneu' : 'inserir_pneu',
					...dadosParaSalvar
				})
			});
			const res = await response.json();

			if (!isMounted.current) return;

			if (res && res.success) {
				Alert.alert('Sucesso', 'Pneu gravado com sucesso!');
				setModalVisible(false);
				carregarPneus(1);
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar pneu.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na comunicação com a API.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const abrirBuscaDinamica = (tipo: any) => { setTipoBusca(tipo); setTermoComboBusca(''); setResultadosBusca([]); setModalBuscaVisible(true); buscarDinamicaNoBanco(tipo, ''); };

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		try {
			if (tipo === 'veiculo') {
				const res = await apiService.buscarVeiculo({ busca: termo });

				if (!isMounted.current) return;

				if (res && res.success) {
					const veiculosFormatados = res.data.map((v: any) => ({
						id: v.id, nome: v.placa || v.veic_tx_placa || v.nome, placa: v.placa || v.veic_tx_placa || v.nome,
						documento: `Código: ${v.codigo || '--'} | Tipo: ${v.tipo || v.veic_tx_tipo || 'N/A'}`
					}));
					setResultadosBusca(veiculosFormatados);
				} else { setResultadosBusca([]); }
			} else {
				const extras = { referencia_id: formPneu.referencia, marca_atual: formPneu.marca };
				const res = await apiService.buscarDinamica(tipo, termo, extras);

				if (!isMounted.current) return;

				setResultadosBusca(res && res.success ? res.data : []);
			}
		} catch (error) {
			if (isMounted.current) setResultadosBusca([]);
		} finally {
			if (isMounted.current) setIsSearching(false);
		}
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'motivo_laudo') { setFormPneu({ ...formPneu, motivo_recusa: item.nome }); }
		else if (tipoBusca === 'reformador') { setFormPneu({ ...formPneu, reformador: item.nome, reformador_id: item.id }); }
		else if (tipoBusca === 'veiculo') { setFormPneu({ ...formPneu, placa: item.nome, veiculo_id: item.id }); }
		else if (tipoBusca === 'referencia_pneu') {
			setFormPneu({ ...formPneu, referencia: item.id || item.refe_nb_id, referencia_nome: item.nome || item.refe_tx_nome, marca: '', modelo: '', mm_original: '', valor: '', ref_mm_original: '', ref_valor: '' });
		}
		else if (tipoBusca === 'marca_pneu') {
			setFormPneu({ ...formPneu, marca: item.nome || item.refe_tx_marca, modelo: '', mm_original: '', valor: '', ref_mm_original: '', ref_valor: '' });
		}
		else if (tipoBusca === 'modelo_pneu') {
			const refMm = item.refe_tx_mmOriginal || formPneu.mm_original;
			const refVal = formatarValorDB(item.refe_tx_valor || formPneu.valor);
			setFormPneu({ ...formPneu, modelo: item.nome || item.refe_tx_modelo, ref_mm_original: refMm, ref_valor: refVal, mm_original: (formPneu.tipo === 'Reformado' && formPneu.banda) ? formPneu.mm_original : refMm, valor: (formPneu.tipo === 'Reformado' && formPneu.banda) ? formPneu.valor : refVal });
		}
		else if (tipoBusca === 'banda') {
			setFormPneu({ ...formPneu, banda: item.id, banda_nome: item.nome || item.banda, mm_original: item.sulco ? String(item.sulco) : formPneu.mm_original, valor: formatarValorDB(item.valor || '') || formPneu.valor });
		}
		setModalBuscaVisible(false);
	};

	const confirmarSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair da aplicação?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	const gerarRelatorioFiltrado = async () => {
		setModalRelatorioVisible(false);
		const agruparParam = opcoesRelatorio.agruparPor === 'veiculo' ? '&agrupar_veiculo=1' : '&agrupar_veiculo=0';
		const url = `https://sistemascactus.com/apicactus/akipneus/imprimir_pneus_filtro.php?busca_placa=${filtroPlaca}&busca_fogo=${filtroFogo}&busca_marca=${filtroMarca}&busca_referencia=${filtroReferencia}&busca_serie=${filtroSerie}&cliente_id=${params.cliente_id || ''}${agruparParam}`;
		abrirModalPreview(url, `Relatorio_Pneus_${new Date().getTime()}`, 'Relatório de Pneus', 'Inventário Filtrado');
	};

	const scanDocument = async () => {
		Alert.alert('Aviso', 'A função de OCR na câmara não está disponível neste pacote, a preparar integração futura.');
	};

	const renderFiltros = () => (
		<View style={styles.filterSection}>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
				<Text style={styles.sectionTitle}>Consulta Geral de Pneus</Text>
				<TouchableOpacity style={styles.btnRelatorioGeral} onPress={() => setModalRelatorioVisible(true)}>
					<Feather name="printer" size={14} color="#fff" />
					<Text style={styles.btnRelatorioGeralText}>Relatório</Text>
				</TouchableOpacity>
			</View>

			{!!params?.cliente_nome && (
				<TouchableOpacity style={styles.btnVoltarCliente} onPress={() => router.push('/clientes')}>
					<Feather name="arrow-left" size={16} color="#333" />
					<Text style={styles.btnVoltarClienteText}>Voltar p/ {params.cliente_nome}</Text>
				</TouchableOpacity>
			)}

			<View style={styles.row}>
				<View style={styles.inputGroupH}><Text style={styles.label}>Placa / Veículo</Text><TextInput style={styles.input} placeholder="Ex: ABC1234" value={filtroPlaca} onChangeText={setFiltroPlaca} autoCapitalize="characters" /></View>
				<View style={styles.inputGroupH}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
						<Text style={[styles.label, { marginBottom: 0 }]}>Fogo / Ferro</Text>
						<TouchableOpacity onPress={() => { setScannerMode('fogo'); setModalScannerVisible(true); scanDocument(); }}>
							<MaterialCommunityIcons name="line-scan" size={16} color="#0c6ead" />
						</TouchableOpacity>
					</View>
					<TextInput style={styles.input} placeholder="Ex: 105" value={filtroFogo} onChangeText={setFiltroFogo} />
				</View>
			</View>

			<View style={styles.row}>
				<View style={styles.inputGroupH}><Text style={styles.label}>Marca (Pneu)</Text><TextInput style={styles.input} placeholder="Ex: Michelin" value={filtroMarca} onChangeText={setFiltroMarca} autoCapitalize="characters" /></View>
				<View style={styles.inputGroupH}><Text style={styles.label}>Referência</Text><TextInput style={styles.input} placeholder="Ex: 295/80" value={filtroReferencia} onChangeText={setFiltroReferencia} /></View>
			</View>

			<View style={styles.row}>
				<View style={styles.inputGroupH}>
					<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
						<Text style={[styles.label, { marginBottom: 0 }]}>Nº Série</Text>
						<TouchableOpacity onPress={() => { setScannerMode('serie'); setModalScannerVisible(true); scanDocument(); }}>
							<MaterialCommunityIcons name="barcode-scan" size={16} color="#0c6ead" />
						</TouchableOpacity>
					</View>
					<TextInput style={styles.input} placeholder="Série..." value={filtroSerie} onChangeText={setFiltroSerie} />
				</View>
				<View style={[styles.inputGroupH, { justifyContent: 'flex-end' }]}>
					<TouchableOpacity style={styles.btnBuscar} onPress={() => carregarPneus(1)}>
						<Feather name="search" size={16} color="#fff" />
						<Text style={styles.btnText}>Filtrar</Text>
					</TouchableOpacity>
				</View>
			</View>
			<Text style={[styles.sectionTitle, { marginTop: 15, marginBottom: -5 }]}>Resultados</Text>
		</View>
	);

	const renderPreviewContent = () => (
		<View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999999, elevation: 999999 }]}>
			<View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 10 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Exportar Documento</Text>
					<TouchableOpacity onPress={() => setModalPreviewVisible(false)}>
						<Feather name="x" size={24} color="#333" />
					</TouchableOpacity>
				</View>

				<View style={{ alignItems: 'center', marginBottom: 25, backgroundColor: '#f8f9fa', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#e9ecef' }}>
					<MaterialCommunityIcons name="file-pdf-box" size={60} color="#E53935" />
					<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' }}>{previewData.tipo}</Text>
					<Text style={{ fontSize: 13, color: '#666', marginTop: 5, textAlign: 'center' }}>{previewData.subtitulo}</Text>
				</View>

				{isCarregandoPreview ? (
					<View style={{ alignItems: 'center', paddingVertical: 20 }}>
						<ActivityIndicator size="large" color="#0c6ead" />
						<Text style={{ color: '#666', marginTop: 10, fontWeight: 'bold' }}>A gerar documento...</Text>
					</View>
				) : (
					<View style={{ gap: 12, width: '100%' }}>
						<TouchableOpacity style={{ backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8 }} onPress={visualizarPDFNativo}>
							<Feather name="eye" size={20} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Visualizar Documento</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{ backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8 }} onPress={compartilharDocumentoPDF}>
							<MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Enviar / Partilhar</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</View>
	);

	const renderOptionToggle = (key: keyof typeof opcoesRelatorio, label: string) => (
		<TouchableOpacity
			style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}
			onPress={() => setOpcoesRelatorio(prev => ({ ...prev, [key]: !prev[key as 'exibirCusto'] }))}
		>
			<Feather name={opcoesRelatorio[key as 'exibirCusto'] ? "check-square" : "square"} size={22} color={opcoesRelatorio[key as 'exibirCusto'] ? "#1967d2" : "#999"} style={{ marginRight: 10 }} />
			<Text style={{ fontSize: 15, color: '#333' }}>{label}</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>

			{/* ÁREA DE FILTROS MOVIDA PARA FORA DA FLATLIST PARA MELHORAR DESEMPENHO */}
			{renderFiltros()}

			{/* INDICADOR DE CARREGAMENTO ISOLADO */}
			{isLoading && pneus.length === 0 ? (
				<View style={{ paddingVertical: 40, alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0c6ead" />
					<Text style={{ marginTop: 10, color: '#666' }}>Buscando pneus...</Text>
				</View>
			) : (
				<FlatList
					data={pneus}
					keyExtractor={(item, index) => String(item?.id || index)}

					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}

					onEndReached={loadMore}
					onEndReachedThreshold={0.5}

					contentContainerStyle={{ paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.cardTitle} numberOfLines={1}>F: {item.ferro || '--'} / S: {item.serie || '--'}</Text>
									<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
										<MaterialCommunityIcons name="tire" size={14} color="#666" style={{ marginRight: 6 }} />
										<Text style={styles.cardSubTitle} numberOfLines={1}>{item.referencia} | {item.marca}</Text>
									</View>
								</View>
								<View style={{ alignItems: 'flex-end' }}>
									<View style={styles.statusBadge}>
										<Text style={styles.statusText}>{item.placa || item.placa_associada || 'S/ VEÍCULO'}</Text>
									</View>
									<Text style={{ fontSize: 11, color: '#666', marginTop: 5, fontWeight: 'bold' }}>S: {item.milimetros} mm</Text>
								</View>
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={[styles.btnActionSecondary, { flex: 1, backgroundColor: '#e3f2fd' }]} onPress={() => abrirVisualizacaoPneu(item)}>
										<Feather name="eye" size={13} color="#1967d2" />
										<Text style={[styles.btnActionTextSecondary, { color: '#1967d2' }]}>Ver</Text>
									</TouchableOpacity>

									<TouchableOpacity style={[styles.btnActionSecondary, { flex: 1, backgroundColor: '#f39c12' }]} onPress={() => carregarHistorico(item.id)}>
										<Feather name="clock" size={13} color="#fff" />
										<Text style={[styles.btnActionTextSecondary, { color: '#fff' }]}>Histórico</Text>
									</TouchableOpacity>

									<TouchableOpacity style={[styles.btnEditarCard, { flex: 1 }]} onPress={() => editarPneu(item)}>
										<Feather name="edit-2" size={13} color="#ffffff" />
										<Text style={styles.btnEditarCardText}>Editar</Text>
									</TouchableOpacity>

									<TouchableOpacity style={[styles.btnExcluirCard, { flex: 0.8 }]} onPress={() => handleExcluir(item.id, `${item.ferro || item.serie}`)}>
										<Feather name="trash-2" size={13} color="#ffffff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#0c6ead" style={{ marginVertical: 20 }} /> : !hasMore && pneus.length > 0 ? <Text style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Fim da lista.</Text> : null}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum pneu encontrado.</Text> : null}
				/>
			)}

			<Modal visible={modalViewVisible} animationType="slide" onRequestClose={() => setModalViewVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalViewVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>
						<Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Relatório do Pneu</Text>
						<View style={{ width: 30 }} />
					</View>

					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
						{(() => {
							const db = viewPneuData || {} as Pneu;

							const mmOrig = getFloatDb(db.mm_original);
							const mmAtual = getFloatDb(db.milimetros);
							const valor = getFloatDb(db.valor);

							const mmGastos = (mmOrig > 0 && mmAtual >= 0 && mmOrig > mmAtual) ? (mmOrig - mmAtual) : 0;
							const cpmTotal = mmOrig > 0 ? (valor / mmOrig) : 0;
							const cpmGasto = mmGastos > 0 ? (valor / mmGastos) : 0;

							const isSucata = !!db.motivo_recusa;
							const prejuizo = (mmOrig > 0 && valor > 0 && mmAtual > 0) ? (valor / mmOrig) * mmAtual : 0;

							return (
								<>
									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Identificação Principal</Text>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Ferro / Série:</Text>
											<Text style={styles.reportValue}>{db.ferro || '--'} / {db.serie || '--'}</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Marca / Modelo:</Text>
											<Text style={styles.reportValue}>{db.marca || '--'} / {db.modelo || '--'}</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Condição:</Text>
											<Text style={styles.reportValue}>{db.tipo || '--'} {db.tipo === 'Reformado' ? `(R${db.qtde_reforma || 1})` : ''}</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Veículo Vinculado:</Text>
											<Text style={styles.reportValue}>{db.placa || db.placa_associada || 'SEM VEÍCULO'}</Text>
										</View>
									</View>

									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Aferições de Desgaste</Text>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Sulco Original:</Text>
											<Text style={styles.reportValue}>{mmOrig.toFixed(1)} mm</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Sulco Atual:</Text>
											<Text style={[styles.reportValue, { color: mmAtual <= 3 && mmAtual > 0 ? '#E53935' : '#28a745' }]}>
												{mmAtual.toFixed(1)} mm
											</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Calibragem:</Text>
											<Text style={styles.reportValue}>{db.pressao || '--'} / {db.pressao_padrao || '--'} lbs</Text>
										</View>
									</View>

									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Indicadores de Performance</Text>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>Valor da Peça:</Text>
											<Text style={styles.reportValue}>R$ {valor.toFixed(2).replace('.', ',')}</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>CPM Total Estimado:</Text>
											<Text style={styles.reportValue}>R$ {cpmTotal.toFixed(2).replace('.', ',')}</Text>
										</View>
										<View style={styles.reportRow}>
											<Text style={styles.reportLabel}>CPM Realizado:</Text>
											<Text style={[styles.reportValue, { color: '#f39c12' }]}>R$ {cpmGasto.toFixed(2).replace('.', ',')}</Text>
										</View>
									</View>

									{prejuizo > 0 && (
										<View style={[styles.reportBox, { borderColor: isSucata ? '#E53935' : '#f39c12', borderWidth: 1 }]}>
											<Text style={[styles.groupTitle, { color: isSucata ? '#E53935' : '#f39c12', borderBottomWidth: 0, marginBottom: 5 }]}>
												{isSucata ? 'Prejuízo Calculado (Sucata)' : 'Valor Residual da Borracha'}
											</Text>
											<Text style={{ color: isSucata ? '#E53935' : '#f39c12', fontWeight: 'bold', fontSize: 18 }}>
												R$ {prejuizo.toFixed(2).replace('.', ',')}
											</Text>
											{isSucata && (
												<Text style={{ color: '#E53935', marginTop: 8, fontSize: 14 }}>
													<Text style={{ fontWeight: 'bold' }}>Motivo:</Text> {db.motivo_recusa}
												</Text>
											)}
										</View>
									)}

									{fotosPneu.length > 0 && (
										<View style={styles.reportBox}>
											<Text style={styles.groupTitle}>Evidências Fotográficas</Text>
											<ScrollView horizontal showsHorizontalScrollIndicator={false}>
												{fotosPneu.map((uri, index) => (
													<TouchableOpacity key={index} style={{ marginRight: 10 }} onPress={() => setFotoAmpliada(uri)}>
														<Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
													</TouchableOpacity>
												))}
											</ScrollView>
										</View>
									)}

									<View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
										<TouchableOpacity
											style={[styles.btnSalvar, { flex: 1 }]}
											onPress={() => {
												if (!viewPneuData) return;
												editarPneu(viewPneuData);
											}}
										>
											<Feather name="edit-2" size={16} color="#fff" style={{ marginRight: 8 }} />
											<Text style={styles.btnSalvarText}>Modificar</Text>
										</TouchableOpacity>

										<TouchableOpacity
											style={[styles.btnImprimir, { flex: 1, height: 50 }]}
											onPress={() => {
												if (!viewPneuData) return;

												setModalViewVisible(false);
												const url = `https://sistemascactus.com/apicactus/akipneus/imprimir_pneu.php?id=${viewPneuData.id}`;
												abrirModalPreview(url, `Laudo_Pneu_${viewPneuData.id}`, 'Laudo Técnico de Pneu', `Pneu Fogo #${viewPneuData.ferro || viewPneuData.serie}`);
											}}
										>
											<Feather name="printer" size={16} color="#fff" style={{ marginRight: 8 }} />
											<Text style={[styles.btnImprimirText, { marginLeft: 0 }]}>Imprimir PDF</Text>
										</TouchableOpacity>
									</View>
								</>
							);
						})()}
					</ScrollView>

					{fotoAmpliada && (
						<View style={styles.fullScreenOverlay}>
							<TouchableOpacity style={styles.closeFullBtn} onPress={() => setFotoAmpliada(null)}>
								<Feather name="x-circle" size={36} color="#fff" />
							</TouchableOpacity>
							<Image source={{ uri: fotoAmpliada }} style={styles.fullScreenImage} resizeMode="contain" />
						</View>
					)}
				</View>
			</Modal>

			<Modal visible={modalHistoricoVisible} animationType="slide" transparent={true} onRequestClose={() => setModalHistoricoVisible(false)}>
				<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
					<View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%', padding: 20 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 }}>
							<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Histórico de Inspeções</Text>
							<TouchableOpacity onPress={() => setModalHistoricoVisible(false)}>
								<Feather name="x-circle" size={24} color="#999" />
							</TouchableOpacity>
						</View>

						<FlatList
							data={historicoPneu}
							keyExtractor={(item, index) => String(item?.id || index)}
							renderItem={({ item }) => (
								<View style={{ borderLeftWidth: 2, borderColor: '#0c6ead', paddingLeft: 15, paddingBottom: 20, position: 'relative' }}>
									<View style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#0c6ead' }} />
									<Text style={{ fontWeight: 'bold', color: '#333', fontSize: 15 }}>{formatarDataLocal(item.data)}</Text>
									<Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}><Text style={{ fontWeight: 'bold' }}>Veículo:</Text> {item.placa || 'S/ Vínculo'}</Text>
									<Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}><Text style={{ fontWeight: 'bold' }}>Sulco Atual:</Text> <Text style={{ color: Number(item.milimetros) <= 3 ? '#E53935' : '#28a745', fontWeight: 'bold' }}>{item.milimetros} mm</Text></Text>
									<Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}><Text style={{ fontWeight: 'bold' }}>Calibragem:</Text> {item.pressao || '--'} lbs</Text>
									<Text style={{ color: '#999', fontSize: 11, marginTop: 6 }}>Resp: {item.usuario || 'Sistema'}</Text>
								</View>
							)}
							ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Sem histórico anterior.</Text>}
						/>
					</View>
				</View>
			</Modal>

			<Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
						<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
						<TouchableOpacity onPress={confirmarSignOut} style={{ padding: 5 }}><Feather name="power" size={22} color="#fff" /></TouchableOpacity>
					</View>

					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
						<Text style={styles.groupTitle}>Identificação do Pneu</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Referência</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}>
									<Text style={{ color: formPneu.referencia_nome ? '#000' : '#999' }} numberOfLines={1}>{formPneu.referencia_nome || 'Selecionar Referência...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Tipo *</Text>
								<RNPickerSelect
									placeholder={{ label: 'Selecione...', value: '', color: '#666' }}
									value={formPneu.tipo}
									onValueChange={v => {
										if (v !== 'Reformado') {
											setFormPneu({
												...formPneu, tipo: v || 'Novo', grau: '', banda: '', banda_nome: '', reformador: '', reformador_id: '',
												mm_original: formPneu.ref_mm_original || formPneu.mm_original, valor: formPneu.ref_valor || formPneu.valor
											});
										} else { setFormPneu({ ...formPneu, tipo: v }); }
									}}
									items={[{ label: 'Novo', value: 'Novo', color: '#000' }, { label: 'Reformado', value: 'Reformado', color: '#000' }]}
									style={pickerStyles}
									useNativeAndroidPickerStyle={false}
									Icon={() => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />}
								/>
							</View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Marca</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca_pneu')}>
									<Text style={{ color: formPneu.marca ? '#000' : '#000000', fontSize: 13 }} numberOfLines={1}>{formPneu.marca || 'Buscar...'}</Text>
									<Feather name="search" size={14} color="#000000" />
								</TouchableOpacity>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Modelo</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo_pneu')}>
									<Text style={{ color: formPneu.modelo ? '#000' : '#000000', fontSize: 13 }} numberOfLines={1}>{formPneu.modelo || 'Buscar...'}</Text>
									<Feather name="search" size={14} color="#000000" />
								</TouchableOpacity>
							</View>
						</View>

						{formPneu.tipo === 'Reformado' && (
							<>
								<View style={[styles.row, { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15 }]}>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Recapagem</Text>
										<RNPickerSelect placeholder={{ label: '...', value: '', color: '#666' }} value={formPneu.grau} onValueChange={v => setFormPneu({ ...formPneu, grau: v })} items={[{ label: '1', value: '1', color: '#000' }, { label: '2', value: '2', color: '#000' }, { label: '3', value: '3', color: '#000' }, { label: '4', value: '4', color: '#000' }, { label: '5', value: '5', color: '#000' }]} style={{ ...pickerStyles, inputIOS: { ...pickerStyles.inputIOS, backgroundColor: '#fff' }, inputAndroid: { ...pickerStyles.inputAndroid, backgroundColor: '#fff' } }} useNativeAndroidPickerStyle={false} Icon={() => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />} />
									</View>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Banda</Text>
										<TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff', borderColor: '#ccc' }]} onPress={() => abrirBuscaDinamica('banda')}>
											<Text style={{ color: formPneu.banda_nome ? '#000' : '#999', fontSize: 12 }} numberOfLines={1}>{formPneu.banda_nome || 'Buscar...'}</Text>
										</TouchableOpacity>
									</View>
								</View>
								<View style={{ width: '100%', marginBottom: 15 }}>
									<Text style={styles.label}>Reformador</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('reformador')}>
										<Text style={{ color: formPneu.reformador ? '#000' : '#999' }}>{formPneu.reformador || 'Selecionar Reformador...'}</Text>
										{formPneu.reformador ? (
											<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, reformador: '', reformador_id: '' })}><Feather name="x-circle" size={18} color="#E53935" /></TouchableOpacity>
										) : (<Feather name="search" size={16} color="#999" />)}
									</TouchableOpacity>
								</View>
							</>
						)}

						<Text style={styles.groupTitle}>Especificações</Text>
						<View style={{ width: '100%', marginBottom: 15 }}>
							<Text style={styles.label}>Placa ou Código do Veículo (Opcional)</Text>
							<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('veiculo')}>
								<Text style={{ color: formPneu.placa ? '#000' : '#999', fontWeight: formPneu.placa ? 'bold' : 'normal' }}>{formPneu.placa || 'Selecionar Veículo / Placa...'}</Text>
								{formPneu.placa ? (
									<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, placa: '', veiculo_id: '' })}><Feather name="x-circle" size={18} color="#E53935" /></TouchableOpacity>
								) : (<Feather name="search" size={16} color="#999" />)}
							</TouchableOpacity>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
									<Text style={[styles.label, { marginBottom: 0 }]}>* DOT</Text>
									<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, dot: formPneu.dot === 'S/A' ? '' : 'S/A' })}>
										<Text style={{ fontSize: 11, color: formPneu.dot === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>{formPneu.dot === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}</Text>
									</TouchableOpacity>
								</View>
								<TextInput style={[styles.inputModal, formPneu.dot === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]} value={formPneu.dot} onChangeText={t => setFormPneu({ ...formPneu, dot: t === 'S/A' ? 'S/A' : t.replace(/\D/g, '') })} keyboardType={formPneu.dot === 'S/A' ? 'default' : 'numeric'} maxLength={formPneu.dot === 'S/A' ? 3 : 4} placeholder="Ex: 2324" editable={formPneu.dot !== 'S/A'} />
							</View>
							<View style={styles.inputGroupH}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
									<Text style={[styles.label, { marginBottom: 0 }]}>* Série</Text>
									<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, serie: formPneu.serie === 'S/A' ? '' : 'S/A' })}>
										<Text style={{ fontSize: 11, color: formPneu.serie === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>{formPneu.serie === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}</Text>
									</TouchableOpacity>
								</View>
								<TextInput style={[styles.inputModal, formPneu.serie === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]} value={formPneu.serie} onChangeText={t => setFormPneu({ ...formPneu, serie: t })} editable={formPneu.serie !== 'S/A'} />
							</View>
						</View>

						<View style={{ width: '100%', marginBottom: 15 }}>
							<Text style={styles.label}>Fogo / Ferro</Text>
							<TextInput style={styles.inputModal} value={formPneu.ferro} onChangeText={t => setFormPneu({ ...formPneu, ferro: t })} />
						</View>

						<Text style={styles.groupTitle}>Aferições</Text>
						<View style={{ width: '100%', marginBottom: 15 }}>
							<Text style={styles.label}>Valor (R$)</Text>
							<TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.valor} onChangeText={t => setFormPneu({ ...formPneu, valor: formatarMoeda(t) })} placeholder="0,00" />
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Orig. (mm)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={formPneu.mm_original} onChangeText={t => setFormPneu({ ...formPneu, mm_original: t.replace(',', '.') })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Sulco Atual (mm)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.milimetros} onChangeText={t => setFormPneu({ ...formPneu, milimetros: t.replace(',', '.') })} /></View>
						</View>
						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Calib. Padrão (Lbs)</Text>
								<TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.pressao_padrao} onChangeText={t => setFormPneu({ ...formPneu, pressao_padrao: t })} />
							</View>
							<View style={styles.inputGroupH}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
									<Text style={[styles.label, { marginBottom: 0 }]}>Calib. Atual</Text>
									<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, pressao: formPneu.pressao === 'S/A' ? '' : 'S/A' })}>
										<Text style={{ fontSize: 11, color: formPneu.pressao === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>{formPneu.pressao === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}</Text>
									</TouchableOpacity>
								</View>
								<TextInput style={[styles.inputModal, formPneu.pressao === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]} keyboardType={formPneu.pressao === 'S/A' ? 'default' : 'numeric'} value={formPneu.pressao} onChangeText={t => setFormPneu({ ...formPneu, pressao: t })} placeholder="Lbs" editable={formPneu.pressao !== 'S/A'} />
							</View>
						</View>

						<Text style={styles.groupTitle}>Recusa (Opcional)</Text>
						<View style={{ width: '100%', marginBottom: 15 }}>
							<Text style={styles.label}>Motivo da Recusa (Se houver)</Text>
							<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('motivo_laudo')}>
								<Text style={{ color: formPneu.motivo_recusa ? '#000' : '#999' }}>{formPneu.motivo_recusa || 'Selecionar Motivo...'}</Text>
								{formPneu.motivo_recusa ? (
									<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, motivo_recusa: '' })}><Feather name="x-circle" size={18} color="#E53935" /></TouchableOpacity>
								) : (<Feather name="search" size={16} color="#999" />)}
							</TouchableOpacity>
						</View>

						<Text style={styles.label}>Observações (Opcional)</Text>
						<TextInput style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} multiline={true} value={formPneu.observacao} onChangeText={t => setFormPneu({ ...formPneu, observacao: t })} placeholder="Alguma nota sobre este pneu..." />

						<View style={{ flexDirection: 'row', gap: 10 }}>
							<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={tirarFotoPneu}>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}><Feather name="camera" size={20} color="#666" /><Text style={styles.btnFotoText}>Câmera</Text></View>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={escolherFotoGaleria}>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}><Feather name="image" size={20} color="#666" /><Text style={styles.btnFotoText}>Galeria</Text></View>
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
							<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}><Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Voltar</Text></TouchableOpacity>
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
					{modalPreviewVisible && renderPreviewContent()}

				</KeyboardAvoidingView>
			</Modal>

			<Modal visible={modalRelatorioVisible} transparent={true} animationType="fade" onRequestClose={() => setModalRelatorioVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
						<View style={styles.modalSmall}>
							<Text style={styles.modalTitle}>Gerar Relatório de Inventário</Text>
							<Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>Os pneus filtrados atrás serão exportados para PDF.</Text>

							<View>
								{renderOptionToggle('exibirCusto', 'Exibir Valor/Custo Estimado')}

								<Text style={[styles.label, { marginTop: 15 }]}>Agrupar Por:</Text>
								<View style={{ flexDirection: 'row', gap: 10 }}>
									<TouchableOpacity
										style={[styles.btnDefault, { flex: 1, backgroundColor: opcoesRelatorio.agruparPor === 'veiculo' ? '#e8f0fe' : '#eee', borderColor: opcoesRelatorio.agruparPor === 'veiculo' ? '#1967d2' : '#ddd', borderWidth: 1 }]}
										onPress={() => setOpcoesRelatorio({ ...opcoesRelatorio, agruparPor: 'veiculo' })}
									>
										<Text style={{ color: opcoesRelatorio.agruparPor === 'veiculo' ? '#1967d2' : '#666', fontWeight: 'bold' }}>Veículo</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.btnDefault, { flex: 1, backgroundColor: opcoesRelatorio.agruparPor === 'livre' ? '#e8f0fe' : '#eee', borderColor: opcoesRelatorio.agruparPor === 'livre' ? '#1967d2' : '#ddd', borderWidth: 1 }]}
										onPress={() => setOpcoesRelatorio({ ...opcoesRelatorio, agruparPor: 'livre' })}
									>
										<Text style={{ color: opcoesRelatorio.agruparPor === 'livre' ? '#1967d2' : '#666', fontWeight: 'bold' }}>Sem Agrupar</Text>
									</TouchableOpacity>
								</View>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 25, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 48 }]} onPress={() => setModalRelatorioVisible(false)}>
									<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, { flex: 1, height: 48, marginTop: 0 }]} onPress={gerarRelatorioFiltrado}>
									<Feather name="download" size={18} color="#fff" style={{ marginRight: 8 }} />
									<Text style={{ color: '#fff', fontWeight: 'bold' }}>Gerar PDF</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
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
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%' },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnRelatorioGeral: { backgroundColor: '#f39c12', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
	btnRelatorioGeralText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },
	cardSubTitle: { fontSize: 13, fontWeight: '600', color: '#666' },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#e8f0fe' },
	statusText: { fontSize: 12, fontWeight: 'bold', color: '#1967d2' },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 6 },

	btnActionSecondary: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnActionTextSecondary: { color: '#333', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnEditarCardText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },

	modalHeaderFullScreen: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		backgroundColor: '#0c6ead', paddingHorizontal: 15, paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 15,
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

	btnImprimir: { backgroundColor: '#3276b1', flexDirection: 'row', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
	btnImprimirText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

	btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 15, backgroundColor: '#f9f9f9' },
	btnFotoText: { marginLeft: 10, color: '#666', fontWeight: 'bold' },
	fotoContainer: { marginRight: 15, marginTop: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8 },
	btnRemoveFoto: { position: 'absolute', top: -10, right: -10, backgroundColor: '#E53935', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },

	modalContentBusca: { width: '90%', height: '70%', backgroundColor: '#fff', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
	modalHeaderBusca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	modalTitleBusca: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	inputBuscaContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, height: 45, marginBottom: 15 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	itemBuscaDinamica: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 15 },
	itemBuscaNome: { fontSize: 15, fontWeight: '600', color: '#333' },
	itemBuscaDoc: { fontSize: 12, color: '#888', marginTop: 2 },
	emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
	btnInserirBuscaDinamicaMini: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 15, flexDirection: 'row', alignItems: 'center' },
	btnInserirBuscaDinamicaTextMini: { color: '#28a745', fontWeight: 'bold', fontSize: 13, marginLeft: 5 },

	modalSmall: { width: '85%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },

	btnVoltarCliente: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginBottom: 15, alignSelf: 'flex-start', borderWidth: 1, borderColor: '#ccc' },
	btnVoltarClienteText: { marginLeft: 6, fontSize: 13, fontWeight: 'bold', color: '#333' },

	fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 99999, elevation: 99999 },
	closeFullBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 100000, elevation: 100000, padding: 10 },
	fullScreenImage: { width: '100%', height: '80%' },

	pilhaGraficaContainer: { alignItems: 'center', paddingTop: 10 },
	pneuStackedItem: {
		backgroundColor: '#333', borderWidth: 5, borderColor: '#2a2a2a', borderRadius: 15,
		width: '85%', minHeight: 85, marginBottom: 6, marginTop: 2, flexDirection: 'row', alignItems: 'center',
		paddingHorizontal: 15, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
	},
	modalOverlayBusca: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
	stackedPneuNumber: { color: '#aaa', fontSize: 20, fontWeight: 'bold', marginRight: 15 },
	stackedPneuInfo: { flex: 1 },
	stackedPneuSerie: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
	stackedPneuBanda: { color: '#f39c12', fontSize: 12, marginTop: 3, fontWeight: 'bold' },
	stackedPneuStatus: { color: '#b0bec5', fontSize: 12, marginTop: 3 },
	stackedPneuIcon: { opacity: 0.6, marginLeft: 10 },

	reportBox: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
	reportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f0f0f0' },
	reportLabel: { fontSize: 14, color: '#666' },
	reportValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
});