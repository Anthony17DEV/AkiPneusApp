import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import LogoSolutires from '../../assets/images/solutires.png';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

export default function ChecklistAvulsoScreen() {
	const FOTO_URL = 'https://sistemascactus.com/apicactus/akipneus/fotos/';
	const API_CADASTRO_URL = 'https://sistemascactus.com/apicactus/akipneus/api_pneu_cadastro_rapido.php';
	const API_AVULSO_URL = 'https://sistemascactus.com/apicactus/akipneus/api_checklist_avulso.php';

	const router = useRouter();
	const { user, signOut } = useAuth();

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [checklists, setChecklists] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroDataIni, setFiltroDataIni] = useState('');
	const [filtroDataFim, setFiltroDataFim] = useState('');
	const [filtroCliente, setFiltroCliente] = useState('');
	const [filtroUsuario, setFiltroUsuario] = useState('');

	const [modalNovoVisible, setModalNovoVisible] = useState(false);
	const [showReformadosInput, setShowReformadosInput] = useState(false);
	const [formNovo, setFormNovo] = useState({ data: '', cliente: '', cliente_id: '', usuario: user?.nome || '', qtdReformados: '' });

	const [checklistAtivo, setChecklistAtivo] = useState<any>(null);
	const [pneusPilha, setPneusPilha] = useState<any[]>([]);

	const [modalConsolidarVisible, setModalConsolidarVisible] = useState(false);
	const [selectedChecklists, setSelectedChecklists] = useState<number[]>([]);

	const [modalRelatorioVisible, setModalRelatorioVisible] = useState(false);
	const [relatorioTarget, setRelatorioTarget] = useState<'single' | 'consolidado' | null>(null);
	const [relatorioTargetId, setRelatorioTargetId] = useState<number | null>(null);
	const [opcoesRelatorio, setOpcoesRelatorio] = useState({
		geral: true,
		prejuizo: true,
		motivo: true,
		fotos: true,
		recapabilidade: true,
		tempo: true,
		ordenacao: 'medida'
	});

	const [modalPreviewVisible, setModalPreviewVisible] = useState(false);
	const [previewData, setPreviewData] = useState({ url: '', nome: '', tipo: '', subtitulo: '' });
	const [htmlDoc, setHtmlDoc] = useState('');
	const [isCarregandoPreview, setIsCarregandoPreview] = useState(false);

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
		}
		if (isMounted.current) setIsCarregandoPreview(false);
	};

	const visualizarPDFNativo = async () => {
		if (!previewData.url) return;
		try {
			const supported = await Linking.canOpenURL(previewData.url);
			if (supported) {
				await Linking.openURL(previewData.url);
			} else {
				Alert.alert('Erro', 'Não foi possível abrir o navegador no telemóvel.');
			}
		} catch (e) {
			console.log(e);
		}
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

	const abrirModalConsolidar = () => {
		setSelectedChecklists([]);
		setModalConsolidarVisible(true);
	};

	const toggleChecklistSelection = (id: number) => {
		if (selectedChecklists.includes(id)) {
			setSelectedChecklists(selectedChecklists.filter(item => item !== id));
		} else {
			setSelectedChecklists([...selectedChecklists, id]);
		}
	};

	const abrirOpcoesRelatorioConsolidado = () => {
		if (selectedChecklists.length < 2) {
			Alert.alert('Atenção', 'Selecione pelo menos duas análises para consolidar.');
			return;
		}
		setModalConsolidarVisible(false);
		setTimeout(() => {
			setRelatorioTarget('consolidado');
			setModalRelatorioVisible(true);
		}, 400);
	};

	const abrirOpcoesRelatorioSingle = (id: number) => {
		setRelatorioTarget('single');
		setRelatorioTargetId(id);
		setModalRelatorioVisible(true);
	};

	const confirmarGeracaoRelatorio = () => {
		const qp = `p_geral=${opcoesRelatorio.geral ? 1 : 0}&p_prejuizo=${opcoesRelatorio.prejuizo ? 1 : 0}&p_motivo=${opcoesRelatorio.motivo ? 1 : 0}&p_fotos=${opcoesRelatorio.fotos ? 1 : 0}&p_recap=${opcoesRelatorio.recapabilidade ? 1 : 0}&p_tempo=${opcoesRelatorio.tempo ? 1 : 0}&ordenacao=${opcoesRelatorio.ordenacao}`;

		let urlApi = '';
		let nomeArq = '';
		let tp = '';

		if (relatorioTarget === 'single' && relatorioTargetId) {
			urlApi = `https://sistemascactus.com/apicactus/akipneus/imprimir_checklist_avulso.php?id=${relatorioTargetId}&${qp}`;
			nomeArq = `Analise_Sucata_${relatorioTargetId}`;
			tp = 'Análise Avulsa de Sucata';
		} else if (relatorioTarget === 'consolidado') {
			const idsStr = selectedChecklists.join(',');
			urlApi = `https://sistemascactus.com/apicactus/akipneus/imprimir_checklist_consolidado.php?ids=${idsStr}&${qp}`;
			nomeArq = `Relatorio_Consolidado_${new Date().getTime()}`;
			tp = `Relatório Consolidado (${selectedChecklists.length} Análises)`;

			setSelectedChecklists([]);
			setTimeout(() => { carregarChecklists(); }, 1500);
		}

		setModalRelatorioVisible(false);
		if (urlApi) {
			setTimeout(() => {
				abrirModalPreview(urlApi, nomeArq, tp, 'Controle de Pneus e Sucatas');
			}, 500);
		}
	};

	const renderOptionToggle = (key: keyof typeof opcoesRelatorio, label: string) => {
		if (key === 'ordenacao') return null;
		return (
			<TouchableOpacity
				style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' }}
				onPress={() => setOpcoesRelatorio(prev => ({ ...prev, [key]: !prev[key] }))}
			>
				<Feather name={opcoesRelatorio[key] ? "check-square" : "square"} size={22} color={opcoesRelatorio[key] ? "#1967d2" : "#999"} style={{ marginRight: 10 }} />
				<Text style={{ fontSize: 15, color: '#333' }}>{label}</Text>
			</TouchableOpacity>
		);
	};

	const [modalPneuVisible, setModalPneuVisible] = useState(false);
	const [fotosPneu, setFotosPneu] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [formPneu, setFormPneu] = useState({
		id: '', referencia: '', referencia_nome: '', marca: '', modelo: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: '',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '',
		grau: '', banda: '', banda_nome: '', observacao: '', motivo_recusa: '',
		veiculo_id: '', placa: '', reformador_id: '', reformador_nome: '',
		ref_mm_original: '', ref_valor: ''
	});

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda' | 'entidade' | 'motivo_laudo' | 'veiculo' | 'reformador'>('referencia_pneu');
	const [termoComboBusca, setTermoComboBusca] = useState('');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '', marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '', cidade: '', cidade_id: '' });
	const [cidadesResultados, setCidadesResultados] = useState<any[]>([]);

	const buscarCidadeDinamica = async (termo: string) => {
		setFormCadastro({ ...formCadastro, cidade: termo });

		if (termo.trim().length < 2) {
			setCidadesResultados([]);
			return;
		}

		const res = await apiService.buscarDinamica('cidade', termo);
		if (!isMounted.current) return;
		if (res && res.success) {
			setCidadesResultados(res.data);
		} else {
			setCidadesResultados([]);
		}
	};

	const confirmSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair da aplicação?', [
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
		let str = String(val);
		if (str.includes(',')) {
			str = str.replace(/\./g, '').replace(',', '.');
		} else {
			const lastDot = str.lastIndexOf('.');
			if (lastDot !== -1) {
				str = str.substring(0, lastDot).replace(/\./g, '') + '.' + str.substring(lastDot + 1);
			}
		}
		let num = parseFloat(str);
		if (isNaN(num)) return '';
		let formatado = num.toFixed(2).replace('.', ',');
		return formatado.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	};

	const handleDataChange = (text: string, setter: (val: string) => void) => {
		let v = text.replace(/\D/g, '');
		if (v.length > 8) v = v.substring(0, 8);
		if (v.length > 4) {
			v = v.replace(/^(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
		} else if (v.length > 2) {
			v = v.replace(/^(\d{2})(\d{1,2})/, '$1/$2');
		}
		setter(v);
	};

	const formatarDataLocal = (dataStr: string) => {
		if (!dataStr) return '';
		const partes = dataStr.split('-');
		if (partes.length === 3) return `${partes[2]}/${partes[1]}/${partes[0]}`;
		return dataStr;
	};

	const getDataHojeFormatada = () => {
		const hoje = new Date();
		return `${hoje.getDate().toString().padStart(2, '0')}/${(hoje.getMonth() + 1).toString().padStart(2, '0')}/${hoje.getFullYear()}`;
	};

	const getIsoHoje = () => {
		const hoje = new Date();
		return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
	};

	const carregarChecklists = async () => {
		setIsLoading(true);
		setChecklists([]);
		setChecklistAtivo(null);
		setSelectedChecklists([]);

		try {
			const response = await fetch(API_AVULSO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar', dataIni: filtroDataIni, dataFim: filtroDataFim, cliente: filtroCliente, usuario: filtroUsuario })
			});
			const res = await response.json();
			if (!isMounted.current) return;

			if (res.success) { setChecklists(res.data); } else { setChecklists([]); }
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao buscar as análises.');
		}
		if (isMounted.current) setIsLoading(false);
	};

	useEffect(() => { carregarChecklists(); }, []);

	const iniciarNovoChecklist = async () => {
		if (!formNovo.cliente_id) { Alert.alert('Atenção', 'Selecione um cliente primeiro.'); return; }
		if (formNovo.data.length < 10) { Alert.alert('Atenção', 'Data inválida.'); return; }

		setIsLoading(true);
		try {
			const response = await fetch(API_AVULSO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'inserir', cliente_id: formNovo.cliente_id, data: formNovo.data, user_id: user?.id, qtd_reformados: 0 })
			});
			const res = await response.json();
			if (!isMounted.current) return;

			if (res.success) {
				const mockChecklist = { id: res.id, data: formNovo.data, cliente: formNovo.cliente, usuario: formNovo.usuario, pneus_qtd: 0 };
				setChecklistAtivo(mockChecklist);
				setPneusPilha([]);
				setModalNovoVisible(false);
			} else {
				Alert.alert('Erro', res.message || 'Falha ao iniciar análise.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		if (isMounted.current) setIsLoading(false);
	};

	const inserirLoteReformados = async () => {
		if (!formNovo.cliente_id) { Alert.alert('Atenção', 'Selecione um cliente primeiro.'); return; }
		if (formNovo.data.length < 10) { Alert.alert('Atenção', 'Data inválida.'); return; }
		if (!formNovo.qtdReformados || parseInt(formNovo.qtdReformados) <= 0) { Alert.alert('Atenção', 'Informe uma quantidade válida de pneus reformados.'); return; }

		setIsLoading(true);
		try {
			const response = await fetch(API_AVULSO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'inserir', cliente_id: formNovo.cliente_id, data: formNovo.data, user_id: user?.id, qtd_reformados: parseInt(formNovo.qtdReformados) })
			});
			const res = await response.json();

			if (!isMounted.current) return;

			if (res.success) {
				Alert.alert('Sucesso', 'Lote de pneus reformados gravado com sucesso!');
				setModalNovoVisible(false);
				carregarChecklists();
			} else {
				Alert.alert('Erro', res.message || 'Falha ao gravar lote.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		}
		if (isMounted.current) setIsLoading(false);
	};

	const excluirChecklist = (id: number) => {
		Alert.alert('Atenção', 'Deseja realmente excluir esta Análise e todos os seus pneus?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						await fetch(API_AVULSO_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir', id: id })
						});
						if (isMounted.current) {
							Alert.alert('Sucesso', 'Análise excluída.');
							carregarChecklists();
						}
					} catch (error) {
						if (isMounted.current) carregarChecklists();
					}
				}
			}
		]);
	};

	const excluirPneuItem = (id: number) => {
		Alert.alert('Excluir Pneu', 'Tem certeza que deseja remover este pneu da análise?', [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						await fetch(API_AVULSO_URL, {
							method: 'POST', headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ acao: 'excluir_pneu', id: id })
						});
						if (isMounted.current) carregarPneusDoChecklist(checklistAtivo.id);
					} catch (error) {
						if (isMounted.current) Alert.alert('Erro', 'Falha ao excluir o pneu.');
					}
				}
			}
		]);
	};

	const abrirChecklist = (check: any) => {
		setChecklistAtivo(check);
		carregarPneusDoChecklist(check.id);
	};

	const carregarPneusDoChecklist = async (id: number) => {
		setIsLoading(true);
		try {
			const response = await fetch(API_AVULSO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar_pneus', checklist_id: id })
			});
			const res = await response.json();
			if (!isMounted.current) return;

			if (res.success) {
				setPneusPilha(res.data || []);
			} else {
				setPneusPilha([]);
			}
		} catch (e) {
			if (isMounted.current) setPneusPilha([]);
		}
		if (isMounted.current) setIsLoading(false);
	};

	const resetFormPneu = () => {
		setFormPneu({
			id: '', referencia: '', referencia_nome: '', marca: '', modelo: '', valor: '', dot: '', serie: '', ferro: '', tipo: '',
			mm_original: '', milimetros: '', pressao_padrao: '', pressao: '', grau: '', banda: '', banda_nome: '', observacao: '', motivo_recusa: '',
			veiculo_id: '', placa: '', reformador_id: '', reformador_nome: '', ref_mm_original: '', ref_valor: ''
		});
		setFotosPneu([]);
		setFotoAmpliada(null);
	};

	const abrirModalNovoPneu = () => { resetFormPneu(); setModalPneuVisible(true); };

	const editarPneu = (pneuMock: any) => {
		resetFormPneu();
		setFormPneu({
			...formPneu,
			...pneuMock,
			motivo_recusa: pneuMock.motivo_recusa || '',
			ref_mm_original: pneuMock.mm_original || '',
			veiculo_id: pneuMock.veiculo_id || '',
			placa: pneuMock.placa || '',
			reformador_id: pneuMock.reformador_id || '',
			reformador_nome: pneuMock.reformador_nome || '',
			ref_valor: pneuMock.valor ? formatarValorDB(pneuMock.valor) : '',
			valor: pneuMock.valor ? formatarValorDB(pneuMock.valor) : ''
		});

		const stringFotos = pneuMock.foto || pneuMock.pneu_tx_foto;
		if (stringFotos && typeof stringFotos === 'string' && stringFotos.trim() !== '') {
			const fotosDoBanco = stringFotos.split(',').filter((f: string) => f.trim() !== '').map((f: string) => FOTO_URL + f.trim());
			setFotosPneu(fotosDoBanco);
		} else {
			setFotosPneu([]);
		}

		setModalPneuVisible(true);
	};

	const salvarPneu = async () => {
		if (!formPneu.serie || !formPneu.milimetros) { Alert.alert('Atenção', 'Série e Sulco são obrigatórios.'); return; }

		if (formPneu.dot && formPneu.dot !== 'S/A') {
			if (formPneu.dot.length !== 4) {
				Alert.alert('Atenção', 'O DOT deve conter exatamente 4 dígitos numéricos.');
				return;
			}
			const semana = parseInt(formPneu.dot.substring(0, 2));
			if (semana < 1 || semana > 53) {
				Alert.alert('Atenção', 'As duas primeiras posições do DOT representam a semana de fabricação e devem estar entre 01 e 53.');
				return;
			}
		}

		setIsSaving(true);
		const acaoDoBanco = formPneu.id ? 'atualizar_pneu' : 'inserir_pneu';

		const fotosNovas = fotosPneu.filter(f => f.startsWith('data:image'));
		const fotosAntigas = fotosPneu.filter(f => f.startsWith('http')).map(f => f.split('/').pop());

		try {
			const payload = {
				acao: acaoDoBanco,
				checklist_id: checklistAtivo.id,
				user_id: user?.id,
				...formPneu,
				valor: formPneu.valor.replace(/\./g, ''),
				fotos_novas: fotosNovas,
				fotos_antigas: fotosAntigas
			};

			const response = await fetch(API_AVULSO_URL, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
			});

			const textoRetorno = await response.text();

			if (!isMounted.current) return;

			const startIndex = textoRetorno.indexOf('{');
			const endIndex = textoRetorno.lastIndexOf('}');

			if (startIndex !== -1 && endIndex !== -1) {
				const res = JSON.parse(textoRetorno.substring(startIndex, endIndex + 1));
				if (res.success) {
					Alert.alert('Sucesso', `Pneu ${formPneu.id ? 'atualizado' : 'adicionado'} com sucesso!`);
					carregarPneusDoChecklist(checklistAtivo.id);
					setModalPneuVisible(false);
				} else {
					Alert.alert('Erro', res.message || 'Falha ao salvar pneu.');
				}
			} else {
				if (textoRetorno.toLowerCase().includes('true') || textoRetorno.toLowerCase().includes('sucesso') || textoRetorno.trim() === '') {
					Alert.alert('Sucesso', `Pneu ${formPneu.id ? 'atualizado' : 'adicionado'} com sucesso!`);
					carregarPneusDoChecklist(checklistAtivo.id);
					setModalPneuVisible(false);
				} else {
					Alert.alert('Erro', 'O servidor retornou uma resposta inválida.');
				}
			}
		} catch (e) {
			if (isMounted.current) {
				Alert.alert('Aviso', 'A API não respondeu. Teste local salvo!');
				carregarPneusDoChecklist(checklistAtivo.id);
				setModalPneuVisible(false);
			}
		}
		if (isMounted.current) setIsSaving(false);
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

	const abrirBuscaDinamica = (tipo: any) => { setTipoBusca(tipo); setTermoComboBusca(''); setResultadosBusca([]); setModalBuscaVisible(true); buscarDinamicaNoBanco(tipo, ''); };

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		if (tipo === 'entidade') {
			try {
				const res = await apiService.buscarClientes(user?.id, user?.nivel, { nome: termo }, 1);
				if (!isMounted.current) return;
				if (res && res.success) {
					setResultadosBusca(res.data.map((c: any) => ({ id: c.id, nome: c.nome })));
				} else {
					setResultadosBusca([]);
				}
			} catch (e) {
				if (isMounted.current) setResultadosBusca([]);
			}
		} else {
			const extras = { referencia_id: formPneu.referencia, marca_atual: formPneu.marca };
			const res = await apiService.buscarDinamica(tipo, termo, extras);
			if (!isMounted.current) return;
			setResultadosBusca(res && res.success ? res.data : []);
		}
		if (isMounted.current) setIsSearching(false);
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'entidade') { setFormNovo({ ...formNovo, cliente: item.nome, cliente_id: item.id }); }
		else if (tipoBusca === 'motivo_laudo') {
			setFormPneu({ ...formPneu, motivo_recusa: item.nome });
		}
		else if (tipoBusca === 'reformador') {
			setFormPneu({ ...formPneu, reformador_nome: item.nome, reformador_id: item.id });
		}
		else if (tipoBusca === 'veiculo') {
			setFormPneu({ ...formPneu, placa: item.nome, veiculo_id: item.id });
		}
		else if (tipoBusca === 'referencia_pneu') {
			setFormPneu({
				...formPneu,
				referencia: item.id || item.refe_nb_id,
				referencia_nome: item.nome || item.refe_tx_nome,
				marca: '', modelo: '', mm_original: '', valor: '', ref_mm_original: '', ref_valor: ''
			});
		}
		else if (tipoBusca === 'marca_pneu') {
			setFormPneu({
				...formPneu,
				marca: item.nome || item.refe_tx_marca,
				modelo: '', mm_original: '', valor: '', ref_mm_original: '', ref_valor: ''
			});
		}
		else if (tipoBusca === 'modelo_pneu') {
			const refMm = item.isNewModel ? (formCadastro.mmOriginal || '') : (item.refe_tx_mmOriginal || '');
			const refVal = item.isNewModel ? (formCadastro.valor || '') : formatarValorDB(item.refe_tx_valor || '');

			setFormPneu({
				...formPneu,
				modelo: item.nome || item.refe_tx_modelo,
				ref_mm_original: refMm,
				ref_valor: refVal,
				mm_original: (formPneu.tipo === 'Reformado' && formPneu.banda) ? formPneu.mm_original : refMm,
				valor: (formPneu.tipo === 'Reformado' && formPneu.banda) ? formPneu.valor : refVal
			});
		}
		else if (tipoBusca === 'banda') {
			const valFormatado = item.isNewModel ? (formCadastro.valor || '') : formatarValorDB(item.valor || '');
			setFormPneu({
				...formPneu,
				banda: item.id,
				banda_nome: item.nome || item.banda,
				mm_original: item.isNewModel ? formCadastro.sulco : (item.sulco ? String(item.sulco) : formPneu.mm_original),
				valor: valFormatado || formPneu.valor
			});
		}
		setModalBuscaVisible(false);
	};

	const abrirModalCadastro = (termoDigitado = '') => {
		setFormCadastro({
			nome: tipoBusca === 'referencia_pneu' ? termoDigitado.trim() : (tipoBusca === 'banda' || tipoBusca === 'veiculo' ? '' : (tipoBusca === 'motivo_laudo' || tipoBusca === 'reformador' ? termoDigitado.trim() : (formPneu.referencia_nome || ''))),
			marca: tipoBusca === 'marca_pneu' ? termoDigitado.trim() : (tipoBusca === 'modelo_pneu' ? (formPneu.marca || '') : ''),
			modelo: (tipoBusca === 'modelo_pneu' || tipoBusca === 'banda') ? termoDigitado.trim() : '',
			mmOriginal: '', valor: '', sulco: '', cidade: '', cidade_id: ''
		});
		setModalBuscaVisible(false);
		setModalCadastroVisible(true);
	};

	const salvarCadastroDinamico = async () => {
		if (tipoBusca === 'motivo_laudo' && !formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome do motivo."); return; }
		if (tipoBusca === 'reformador' && !formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome da empresa reformadora."); return; }
		if (tipoBusca === 'veiculo' && !formCadastro.nome) { Alert.alert("Atenção", "Preencha a Placa ou Código."); return; }
		if (tipoBusca === 'referencia_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }
		if (tipoBusca === 'marca_pneu' && (!formCadastro.nome || !formCadastro.marca)) { Alert.alert("Atenção", "Preencha a Referência e a Nova Marca."); return; }
		if (tipoBusca === 'modelo_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha Referência, Marca, Modelo e o MM Original."); return; }
		if (tipoBusca === 'banda' && (!formCadastro.marca || !formCadastro.modelo || !formCadastro.sulco)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }

		setIsCadastrando(true);
		try {
			let url = API_CADASTRO_URL;
			let dadosCadastro: any = { tipo: tipoBusca, ...formCadastro, valor: formCadastro.valor ? formCadastro.valor.replace(/\./g, '') : '' };

			if (tipoBusca === 'veiculo') {
				url = 'https://sistemascactus.com/apicactus/akipneus/api_veiculo_cadastro_rapido.php';
				dadosCadastro = { tipo: 'veiculo_incompleto', nome: formCadastro.nome };
			}

			const response = await fetch(url, {
				method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCadastro)
			});
			const res = await response.json();

			if (!isMounted.current) return;

			if (res.success) {
				if (tipoBusca === 'motivo_laudo' || tipoBusca === 'reformador') {
					selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.nome, isNewModel: true });
				} else if (tipoBusca === 'veiculo') {
					selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.nome, placa: res.nome || formCadastro.nome, isNewModel: true });
				} else if (tipoBusca === 'referencia_pneu') {
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
			if (isMounted.current) Alert.alert('Erro', 'Erro na conexão com o servidor de cadastro.');
		} finally {
			if (isMounted.current) setIsCadastrando(false);
		}
	};

	const renderBuscaDinamica = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<View style={styles.modalContentBusca}>
				<View style={styles.modalHeaderBusca}>
					<Text style={styles.modalTitleBusca}>Pesquisar</Text>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{['referencia_pneu', 'marca_pneu', 'modelo_pneu', 'banda', 'motivo_laudo', 'reformador', 'veiculo'].includes(tipoBusca) && (
							<TouchableOpacity
								style={styles.btnInserirBuscaDinamicaMini}
								onPress={() => {
									setModalBuscaVisible(false);
									abrirModalCadastro(termoComboBusca);
								}}
							>
								<Feather name="plus-circle" size={14} color="#28a745" />
								<Text style={styles.btnInserirBuscaDinamicaTextMini}>Inserir</Text>
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

	const renderCadastroDinamico = () => (
		<View style={[StyleSheet.absoluteFill, styles.modalOverlayBusca, { zIndex: 99999, elevation: 99999 }]}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, width: '100%' }}>
				<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
					<View style={styles.modalSmall}>
						<Text style={styles.modalTitle}>
							Cadastrar {tipoBusca === 'banda' ? 'Banda' : tipoBusca === 'referencia_pneu' ? 'Referência' : tipoBusca === 'marca_pneu' ? 'Marca' : tipoBusca === 'motivo_laudo' ? 'Motivo' : tipoBusca === 'reformador' ? 'Reformador' : tipoBusca === 'veiculo' ? 'Veículo' : 'Modelo'}
						</Text>

						{(tipoBusca === 'motivo_laudo' || tipoBusca === 'reformador' || tipoBusca === 'veiculo') && (
							<>
								<Text style={styles.label}>* {tipoBusca === 'veiculo' ? 'Placa ou Código' : 'Nome'}</Text>
								<TextInput
									style={styles.inputModal}
									value={formCadastro.nome}
									onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })}
									placeholder={tipoBusca === 'motivo_laudo' ? "Ex: Furo na lateral..." : tipoBusca === 'veiculo' ? "Ex: ABC-1234 ou 102030" : "Ex: Reformadora Silva..."}
								/>
							</>
						)}

						{tipoBusca === 'marca_pneu' && (
							<><Text style={styles.label}>* Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} placeholder="Ex: 295/80R22.5" /><Text style={styles.label}>* Nova Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} placeholder="Nome da Marca..." /></>
						)}

						{tipoBusca === 'modelo_pneu' && (
							<><Text style={styles.label}>* Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} /><Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} /><Text style={styles.label}>* Novo Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} /><View style={styles.row}><View style={styles.inputGroupH}><Text style={styles.label}>* MM Original</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.mmOriginal} onChangeText={t => setFormCadastro({ ...formCadastro, mmOriginal: t.replace(',', '.') })} /></View><View style={styles.inputGroupH}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: formatarMoeda(t) })} placeholder="0,00" /></View></View></>
						)}

						{tipoBusca === 'referencia_pneu' && (
							<><Text style={styles.label}>* Nome da Referência</Text><TextInput style={styles.inputModal} value={formCadastro.nome} onChangeText={t => setFormCadastro({ ...formCadastro, nome: t })} /><Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} /><Text style={styles.label}>* Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} /><View style={styles.row}><View style={styles.inputGroupH}><Text style={styles.label}>* MM Original</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.mmOriginal} onChangeText={t => setFormCadastro({ ...formCadastro, mmOriginal: t.replace(',', '.') })} /></View><View style={styles.inputGroupH}><Text style={styles.label}>Valor (R$)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: formatarMoeda(t) })} placeholder="0,00" /></View></View></>
						)}

						{tipoBusca === 'banda' && (
							<View>
								<Text style={styles.label}>* Marca</Text><TextInput style={styles.inputModal} value={formCadastro.marca} onChangeText={t => setFormCadastro({ ...formCadastro, marca: t })} />
								<Text style={styles.label}>* Modelo</Text><TextInput style={styles.inputModal} value={formCadastro.modelo} onChangeText={t => setFormCadastro({ ...formCadastro, modelo: t })} />
								<View style={styles.row}>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>* Sulco (MM)</Text>
										<TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.sulco} onChangeText={t => setFormCadastro({ ...formCadastro, sulco: t.replace(',', '.') })} />
									</View>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Valor (R$)</Text>
										<TextInput style={styles.inputModal} keyboardType="numeric" value={formCadastro.valor} onChangeText={t => setFormCadastro({ ...formCadastro, valor: formatarMoeda(t) })} placeholder="0,00" />
									</View>
								</View>
							</View>
						)}

						<View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
							<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalCadastroVisible(false)}><Text style={{ fontWeight: 'bold' }}>Cancelar</Text></TouchableOpacity>
							<TouchableOpacity style={[styles.btnIniciar, { flex: 1 }]} onPress={salvarCadastroDinamico}>
								{isCadastrando ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gravar</Text>}
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);

	const renderPreviewContent = () => (
		<View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999999, elevation: 999999 }]}>
			<View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 }}>
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
					<Text style={{ fontSize: 11, color: '#999', marginTop: 15, textAlign: 'center', backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
						{previewData.nome}.pdf
					</Text>
				</View>

				{isCarregandoPreview ? (
					<View style={{ alignItems: 'center', paddingVertical: 20 }}>
						<ActivityIndicator size="large" color="#0c6ead" />
						<Text style={{ color: '#666', marginTop: 10, fontWeight: 'bold' }}>A gerar documento em alta qualidade...</Text>
					</View>
				) : (
					<View style={{ gap: 12, width: '100%' }}>
						<TouchableOpacity
							style={{ backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8, width: '100%' }}
							onPress={visualizarPDFNativo}
						>
							<Feather name="eye" size={20} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Visualizar Documento</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={{ backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8, width: '100%' }}
							onPress={compartilharDocumentoPDF}
						>
							<MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Enviar</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</View>
	);

	const renderPilhaGrafica = () => {
		if (isLoading) return <ActivityIndicator size="large" color="#3276b1" style={{ marginTop: 40 }} />;

		if (pneusPilha.length === 0) {
			return <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Nenhum pneu inserido nesta pilha ainda.</Text>;
		}

		const pneusOrdenados = [...pneusPilha].sort((a, b) => Number(a.id) - Number(b.id));

		return (
			<View style={styles.pilhaGraficaContainer}>
				{pneusOrdenados.map((pneu, index) => (
					<View key={`pilha_${pneu.id || index}`} style={{ width: '85%', position: 'relative' }}>
						<TouchableOpacity
							style={[styles.pneuStackedItem, { width: '100%' }]}
							onPress={() => editarPneu(pneu)}
						>
							<Text style={styles.stackedPneuNumber}>{index + 1}.</Text>
							<View style={styles.stackedPneuInfo}>
								<Text style={styles.stackedPneuSerie} numberOfLines={1}>
									{pneu.referencia_nome || pneu.referencia} | {pneu.marca} - {pneu.modelo}
								</Text>
								{pneu.tipo === 'Reformado' && (
									<Text style={styles.stackedPneuBanda} numberOfLines={1}>
										Banda: {pneu.banda_nome || pneu.banda} (Recap: {pneu.grau || pneu.qtde_reforma || 1})
									</Text>
								)}
								<Text style={styles.stackedPneuStatus}>
									Série: {pneu.serie || 'S/N'} | S: {pneu.milimetros}mm
								</Text>
							</View>
							<MaterialCommunityIcons name="tire" size={28} color="#aaa" style={styles.stackedPneuIcon} />
						</TouchableOpacity>

						<TouchableOpacity
							style={{ position: 'absolute', top: 10, right: -15, zIndex: 10, padding: 10, backgroundColor: '#ffffff', borderRadius: 20, elevation: 5 }}
							onPress={() => excluirPneuItem(pneu.id)}
						>
							<Feather name="trash-2" size={16} color="#E53935" />
						</TouchableOpacity>
					</View>
				))}
			</View>
		);
	};

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	return (
		<View style={styles.container}>
			{isLoading && !checklistAtivo?.id && <ActivityIndicator size="large" color="#3276b1" style={{ marginTop: 20 }} />}

			{(!checklistAtivo || !checklistAtivo.id) && (
				<FlatList
					data={checklists}
					keyExtractor={(item) => String(item.id)}
					extraData={[modalConsolidarVisible, selectedChecklists, modalRelatorioVisible, opcoesRelatorio]}

					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}

					contentContainerStyle={{ paddingBottom: 100 }}
					ListHeaderComponent={
						<View style={styles.filterSection}>
							<Text style={styles.sectionTitle}>Análise de Sucata de Pneus</Text>
							<View style={styles.row}>
								<View style={{ width: '48%' }}><Text style={styles.label}>Data Inicial</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={filtroDataIni} onChangeText={t => handleDataChange(t, setFiltroDataIni)} keyboardType="numeric" maxLength={10} /></View>
								<View style={{ width: '48%' }}><Text style={styles.label}>Data Final</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={filtroDataFim} onChangeText={t => handleDataChange(t, setFiltroDataFim)} keyboardType="numeric" maxLength={10} /></View>
							</View>
							<View style={styles.row}>
								<View style={{ width: '48%' }}><Text style={styles.label}>Cliente</Text><TextInput style={styles.input} placeholder="Buscar..." value={filtroCliente} onChangeText={setFiltroCliente} /></View>
								<View style={{ width: '48%' }}><Text style={styles.label}>Usuário</Text><TextInput style={styles.input} placeholder="Nome do utilizador" value={filtroUsuario} onChangeText={setFiltroUsuario} /></View>
							</View>

							<View style={styles.actionRow}>
								<TouchableOpacity style={styles.btnBuscar} onPress={carregarChecklists}>
									<Feather name="search" size={18} color="#fff" />
									<Text style={styles.btnText}>Buscar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={styles.btnInserir} onPress={() => {
									setFormNovo({ data: getDataHojeFormatada(), cliente: '', cliente_id: '', usuario: user?.nome || '', qtdReformados: '' });
									setShowReformadosInput(false);
									setModalNovoVisible(true);
								}}>
									<Feather name="plus-circle" size={18} color="#ffffff" />
									<Text style={styles.btnInserirText}>Inserir</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnConsolidar} onPress={abrirModalConsolidar}>
									<Feather name="layers" size={18} color="#ffffff" />
									<Text style={styles.btnInserirText}>Consolidar</Text>
								</TouchableOpacity>
							</View>
							<Text style={[styles.sectionTitle, { marginTop: 25 }]}>Resultados ({checklists.length})</Text>
						</View>
					}
					renderItem={({ item }) => (
						<View style={{ paddingHorizontal: 20, paddingBottom: 15 }}>
							<TouchableOpacity
								style={[styles.card, { marginHorizontal: 0, marginBottom: 0 }]}
								onPress={() => abrirChecklist(item)}
								activeOpacity={0.7}
							>
								<View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
									<View style={{ flex: 1 }}>
										<View style={styles.cardHeader}>
											<Text style={styles.cardTitle} numberOfLines={1}>Análise #{item.id}</Text>
											<View style={[styles.statusBadge, { backgroundColor: '#e8f0fe' }]}><Text style={[styles.statusText, { color: '#1967d2' }]}>{formatarDataLocal(item.data)}</Text></View>
										</View>
										<View style={styles.cardInfoBox}>
											<View style={styles.cardInfoRow}>
												<Feather name="user" size={14} color="#666" style={{ marginRight: 8 }} />
												<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Cliente:</Text> {item.cliente}</Text>
											</View>
											<View style={styles.cardInfoRow}>
												<MaterialCommunityIcons name="tire" size={16} color="#666" style={{ marginRight: 8 }} />
												<Text style={styles.cardInfoText}>
													<Text style={{ fontWeight: 'bold' }}>Sucata:</Text> {item.pneus_qtd} pneus | <Text style={{ fontWeight: 'bold' }}>Reformados:</Text> {item.pneus_reformados_qtd || 0}
												</Text>
											</View>
											<View style={styles.cardInfoRow}>
												<Feather name="shield" size={14} color="#666" style={{ marginRight: 8 }} />
												<Text style={styles.cardInfoText}><Text style={{ fontWeight: 'bold' }}>Usuário:</Text> {item.usuario}</Text>
											</View>
										</View>

										<View style={styles.cardActions}>
											<View style={styles.actionButtonsRow}>
												<TouchableOpacity style={styles.btnImprimirHistorico} onPress={() => abrirOpcoesRelatorioSingle(item.id)}>
													<View style={{ flexDirection: 'row', alignItems: 'center' }}>
														<Feather name="printer" size={14} color="#333" />
														<Text style={styles.btnImprimirHistoricoText}>Exportar</Text>
													</View>
												</TouchableOpacity>
												<TouchableOpacity style={styles.btnEditarCard} onPress={() => abrirChecklist(item)}>
													<View style={{ flexDirection: 'row', alignItems: 'center' }}>
														<Feather name="edit-2" size={14} color="#ffffff" />
														<Text style={styles.btnEditarCardText}>Modificar</Text>
													</View>
												</TouchableOpacity>
												<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirChecklist(item.id)}>
													<Feather name="trash-2" size={14} color="#ffffff" />
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma análise de sucata encontrada.</Text> : null}
				/>
			)}

			{(checklistAtivo && checklistAtivo.id) && (
				<View style={{ flex: 1 }}>
					<View style={styles.headerAtivo}>
						<Text style={styles.headerAtivoTitle}>Análise de Sucata #{checklistAtivo.id}</Text>

						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
							<Feather name="calendar" size={14} color="#e0e0e0" />
							<Text style={styles.headerAtivoSubText}> {formatarDataLocal(checklistAtivo.data)}   |   </Text>
							<Feather name="user" size={14} color="#e0e0e0" />
							<Text style={styles.headerAtivoSubText}> {checklistAtivo.usuario}</Text>
						</View>

						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Feather name="truck" size={14} color="#e0e0e0" />
							<Text style={styles.headerAtivoSubText}> Cliente: {checklistAtivo.cliente}</Text>
						</View>
					</View>

					<View style={styles.actionRowAtivo}>
						<TouchableOpacity style={styles.btnVoltarBranco} onPress={() => { setChecklistAtivo(null); carregarChecklists(); }}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<Feather name="arrow-left" size={18} color="#333" />
								<Text style={styles.btnVoltarBrancoText}>Voltar</Text>
							</View>
						</TouchableOpacity>

						{checklistAtivo.data === getIsoHoje() && (
							<TouchableOpacity style={styles.btnNovoChecklist} onPress={abrirModalNovoPneu}>
								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Feather name="plus-circle" size={18} color="#fff" />
									<Text style={styles.btnNovoChecklistText}>Inserir Pneu</Text>
								</View>
							</TouchableOpacity>
						)}
					</View>

					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
						<Text style={styles.sectionTitle}>Pilha de Pneus ({pneusPilha.length} Inspecionados)</Text>
						{renderPilhaGrafica()}
					</ScrollView>
				</View>
			)}

			<Modal visible={modalNovoVisible} transparent={true} animationType="fade" onRequestClose={() => setModalNovoVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
						<View style={styles.modalSmall}>
							<Text style={styles.modalTitle}>Nova Análise / Lote</Text>
							<Text style={styles.label}>* Data</Text>
							<TextInput style={styles.inputModal} value={formNovo.data} onChangeText={t => handleDataChange(t, (val) => setFormNovo({ ...formNovo, data: val }))} placeholder="DD/MM/AAAA" keyboardType="numeric" maxLength={10} />

							<Text style={styles.label}>* Cliente</Text>
							<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('entidade')}>
								<Text style={{ color: formNovo.cliente ? '#000' : '#999' }}>{formNovo.cliente || 'Selecionar Cliente...'}</Text>
								<Feather name="search" size={16} color="#999" />
							</TouchableOpacity>

							<Text style={styles.label}>Usuário Atual</Text>
							<TextInput style={[styles.inputModal, { backgroundColor: '#eee', color: '#666' }]} value={formNovo.usuario} editable={false} />

							<View style={{ flexDirection: 'row', marginTop: 15, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalNovoVisible(false)}>
									<Text style={{ fontWeight: 'bold' }}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnIniciar, { flex: 1 }]} onPress={iniciarNovoChecklist}>
									{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Iniciar Sucata</Text>}
								</TouchableOpacity>
							</View>

							<View style={{ marginTop: 25, paddingTop: 20, borderTopWidth: 1, borderColor: '#eee', width: '100%' }}>
								{!showReformadosInput ? (
									<TouchableOpacity
										style={[styles.btnDefault, { backgroundColor: '#e8f4fd', borderColor: '#1967d2', borderWidth: 1 }]}
										onPress={() => setShowReformadosInput(true)}
									>
										<Text style={{ color: '#1967d2', fontWeight: 'bold' }}>+ Inserir Lote de Pneus Reformados</Text>
									</TouchableOpacity>
								) : (
									<View>
										<Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0c6ead', marginBottom: 10 }}>Pneus Reformados Entregues</Text>

										<Text style={styles.label}>Quantidade de Pneus</Text>
										<TextInput
											style={styles.inputModal}
											value={formNovo.qtdReformados}
											onChangeText={t => setFormNovo({ ...formNovo, qtdReformados: t.replace(/\D/g, '') })}
											placeholder="Ex: 25"
											keyboardType="numeric"
										/>

										<View style={{ flexDirection: 'row', gap: 10 }}>
											<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => {
												setShowReformadosInput(false);
												setFormNovo({ ...formNovo, qtdReformados: '' });
											}}>
												<Text style={{ fontWeight: 'bold' }}>Cancelar Lote</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.btnSalvar, { flex: 1, marginTop: 0 }]} onPress={inserirLoteReformados}>
												{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Gravar Lote</Text>}
											</TouchableOpacity>
										</View>
									</View>
								)}
							</View>

						</View>
					</ScrollView>
				</KeyboardAvoidingView>
				{modalBuscaVisible && renderBuscaDinamica()}
			</Modal>

			<Modal visible={modalPneuVisible} animationType="slide" onRequestClose={() => setModalPneuVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFullScreen}>
							<TouchableOpacity onPress={() => setModalPneuVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}><Feather name="power" size={22} color="#fff" /></TouchableOpacity>
						</View>

						<ScrollView contentContainerStyle={{ padding: 20 }}>
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
									<Text style={styles.label}>Tipo</Text>
									<RNPickerSelect
										placeholder={{ label: 'Selecione...', value: '', color: '#666' }}
										value={formPneu.tipo}
										onValueChange={v => {
											if (v !== 'Reformado') {
												setFormPneu({
													...formPneu,
													tipo: v, grau: '', banda: '', banda_nome: '', reformador_id: '', reformador_nome: '',
													mm_original: formPneu.ref_mm_original || formPneu.mm_original,
													valor: formPneu.ref_valor || formPneu.valor
												});
											} else {
												setFormPneu({ ...formPneu, tipo: v });
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
								<View style={[styles.row, { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15, flexWrap: 'wrap' }]}>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Recapagem</Text>
										<RNPickerSelect placeholder={{ label: '...', value: '', color: '#666' }} value={formPneu.grau} onValueChange={v => setFormPneu({ ...formPneu, grau: v })} items={[{ label: '1', value: '1', color: '#000' }, { label: '2', value: '2', color: '#000' }, { label: '3', value: '3', color: '#000' }, { label: '4', value: '4', color: '#000' }, { label: '5', value: '5', color: '#000' }]} style={{ ...pickerStyles, inputIOS: { ...pickerStyles.inputIOS, backgroundColor: '#fff' }, inputAndroid: { ...pickerStyles.inputAndroid, backgroundColor: '#fff' } }} useNativeAndroidPickerStyle={false} Icon={PickerIcon} />
									</View>
									<View style={styles.inputGroupH}>
										<Text style={styles.label}>Banda</Text>
										<TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff', borderColor: '#ccc' }]} onPress={() => abrirBuscaDinamica('banda')}>
											<Text style={{ color: formPneu.banda_nome ? '#000' : '#999', fontSize: 12 }} numberOfLines={1}>{formPneu.banda_nome || 'Buscar...'}</Text>
										</TouchableOpacity>
									</View>

									<View style={{ width: '100%', marginTop: 5 }}>
										<Text style={styles.label}>Reformador</Text>
										<TouchableOpacity style={[styles.fakeInput, { backgroundColor: '#fff', borderColor: '#ccc', marginBottom: 5 }]} onPress={() => abrirBuscaDinamica('reformador')}>
											<Text style={{ color: formPneu.reformador_nome ? '#000' : '#999', fontSize: 13 }} numberOfLines={1}>{formPneu.reformador_nome || 'Selecionar Reformador...'}</Text>
											<Feather name="search" size={14} color="#999" />
										</TouchableOpacity>
									</View>
								</View>
							)}

							<Text style={styles.groupTitle}>Especificações</Text>

							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Placa ou Código do Veículo (Opcional)</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('veiculo')}>
									<Text style={{ color: formPneu.placa ? '#000' : '#999', fontWeight: formPneu.placa ? 'bold' : 'normal' }}>{formPneu.placa || 'Selecionar Veículo / Placa...'}</Text>
									<Feather name="search" size={16} color="#999" />
								</TouchableOpacity>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
										<Text style={[styles.label, { marginBottom: 0 }]}>* DOT</Text>
										<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, dot: formPneu.dot === 'S/A' ? '' : 'S/A' })}>
											<Text style={{ fontSize: 11, color: formPneu.dot === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>
												{formPneu.dot === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}
											</Text>
										</TouchableOpacity>
									</View>
									<TextInput
										style={[styles.inputModal, formPneu.dot === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]}
										value={formPneu.dot}
										onChangeText={t => setFormPneu({ ...formPneu, dot: t === 'S/A' ? 'S/A' : t.replace(/\D/g, '') })}
										keyboardType={formPneu.dot === 'S/A' ? 'default' : 'numeric'}
										maxLength={formPneu.dot === 'S/A' ? 3 : 4}
										placeholder="Ex: 2324"
										editable={formPneu.dot !== 'S/A'}
									/>
								</View>
								<View style={styles.inputGroupH}>
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
										<Text style={[styles.label, { marginBottom: 0 }]}>* Série</Text>
										<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, serie: formPneu.serie === 'S/A' ? '' : 'S/A' })}>
											<Text style={{ fontSize: 11, color: formPneu.serie === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>
												{formPneu.serie === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}
											</Text>
										</TouchableOpacity>
									</View>
									<TextInput
										style={[styles.inputModal, formPneu.serie === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]}
										value={formPneu.serie}
										onChangeText={t => setFormPneu({ ...formPneu, serie: t })}
										editable={formPneu.serie !== 'S/A'}
									/>
								</View>
							</View>

							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Ferro</Text>
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
											<Text style={{ fontSize: 11, color: formPneu.pressao === 'S/A' ? '#E53935' : '#0c6ead', fontWeight: 'bold' }}>
												{formPneu.pressao === 'S/A' ? 'LIMPAR' : 'SEM ACESSO'}
											</Text>
										</TouchableOpacity>
									</View>
									<TextInput
										style={[styles.inputModal, formPneu.pressao === 'S/A' ? { backgroundColor: '#ffebee', color: '#E53935', fontWeight: 'bold' } : {}]}
										keyboardType={formPneu.pressao === 'S/A' ? 'default' : 'numeric'}
										value={formPneu.pressao}
										onChangeText={t => setFormPneu({ ...formPneu, pressao: t })}
										placeholder="Lbs"
										editable={formPneu.pressao !== 'S/A'}
									/>
								</View>
							</View>

							<Text style={styles.groupTitle}>Recusa (Opcional)</Text>
							<View style={{ width: '100%', marginBottom: 15 }}>
								<Text style={styles.label}>Motivo da Recusa (Se houver)</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('motivo_laudo')}>
									<Text style={{ color: formPneu.motivo_recusa ? '#000' : '#999' }}>{formPneu.motivo_recusa || 'Selecionar Motivo...'}</Text>
									{formPneu.motivo_recusa ? (
										<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, motivo_recusa: '' })}>
											<Feather name="x-circle" size={18} color="#E53935" />
										</TouchableOpacity>
									) : (
										<Feather name="search" size={16} color="#999" />
									)}
								</TouchableOpacity>
							</View>

							<Text style={styles.label}>Observações (Opcional)</Text>
							<TextInput style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} multiline={true} value={formPneu.observacao} onChangeText={t => setFormPneu({ ...formPneu, observacao: t })} placeholder="Alguma nota sobre este pneu..." />

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
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalPneuVisible(false)}>
									<Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Voltar</Text>
								</TouchableOpacity>

								{formPneu.id ? (
									<TouchableOpacity
										style={[styles.btnImprimir, { flex: 1.2, height: 50, paddingHorizontal: 2 }]}
										onPress={() => {
											const url = `https://sistemascactus.com/apicactus/akipneus/imprimir_pneu.php?id=${formPneu.id}`;
											abrirModalPreview(url, `Laudo_Pneu_${formPneu.id}`, 'Laudo Técnico de Pneu', `Pneu Referência #${formPneu.id}`);
										}}
									>
										<Feather name="download" size={16} color="#fff" />
										<Text style={[styles.btnImprimirText, { fontSize: 13, marginLeft: 5 }]} numberOfLines={1} adjustsFontSizeToFit>Exportar</Text>
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
								<TouchableOpacity style={styles.closeFullBtn} onPress={() => setFotoAmpliada(null)}>
									<Feather name="x-circle" size={36} color="#fff" />
								</TouchableOpacity>
								<Image source={{ uri: fotoAmpliada }} style={styles.fullScreenImage} resizeMode="contain" />
							</View>
						)}

						{modalBuscaVisible && renderBuscaDinamica()}
						{modalCadastroVisible && renderCadastroDinamico()}
						{modalPreviewVisible && renderPreviewContent()}

					</KeyboardAvoidingView>
				</View>
			</Modal>

			<Modal visible={modalConsolidarVisible} animationType="slide" onRequestClose={() => setModalConsolidarVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>

					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalConsolidarVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>
						<Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Consolidar Análises</Text>
						<View style={{ width: 30 }} />
					</View>

					<View style={{ padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' }}>
						<Text style={{ fontSize: 15, color: '#666' }}>Selecione as análises que deseja unir num único relatório PDF.</Text>
					</View>

					<FlatList
						data={checklists}
						keyExtractor={(item) => String(item.id)}

						initialNumToRender={10}
						maxToRenderPerBatch={10}
						windowSize={5}
						removeClippedSubviews={true}

						contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
						renderItem={({ item }) => {
							const isSelected = selectedChecklists.includes(item.id);
							return (
								<TouchableOpacity
									style={[
										styles.card,
										{ marginHorizontal: 0, flexDirection: 'row', alignItems: 'center', padding: 15 },
										isSelected && styles.cardSelected
									]}
									onPress={() => toggleChecklistSelection(item.id)}
									activeOpacity={0.7}
								>
									<Feather
										name={isSelected ? "check-square" : "square"}
										size={24}
										color={isSelected ? "#1967d2" : "#ccc"}
										style={{ marginRight: 15 }}
									/>
									<View style={{ flex: 1 }}>
										<Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>Análise #{item.id}</Text>
										<Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Cliente: {item.cliente}</Text>
										<Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Data: {formatarDataLocal(item.data)}</Text>
									</View>
								</TouchableOpacity>
							);
						}}
						ListEmptyComponent={
							<Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma análise disponível para consolidar.</Text>
						}
					/>

					<View style={{ padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', gap: 10 }}>
						<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalConsolidarVisible(false)}>
							<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[
								styles.btnSalvar,
								{ flex: 2, opacity: selectedChecklists.length > 1 ? 1 : 0.5 }
							]}
							onPress={abrirOpcoesRelatorioConsolidado}
							disabled={selectedChecklists.length < 2}
						>
							<Feather name="printer" size={18} color="#fff" style={{ marginRight: 8 }} />
							<Text style={{ color: '#fff', fontWeight: 'bold' }}>Gerar Relatório ({selectedChecklists.length})</Text>
						</TouchableOpacity>
					</View>

				</View>
			</Modal>

			<Modal visible={modalRelatorioVisible} transparent={true} animationType="fade" onRequestClose={() => setModalRelatorioVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
					<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
						<View style={styles.modalSmall}>
							<Text style={styles.modalTitle}>Opções do Relatório</Text>
							<Text style={{ fontSize: 14, color: '#666', marginBottom: 15 }}>Selecione os indicadores que deseja incluir no PDF:</Text>

							<View>
								{renderOptionToggle('geral', 'Resumo (Aprovados x Recusados)')}
								{renderOptionToggle('prejuizo', 'Prejuízo Potencial')}
								{renderOptionToggle('motivo', 'Motivos da Recusa')}
								{renderOptionToggle('fotos', 'Listagem com Fotos (Evidências)')}
								{renderOptionToggle('recapabilidade', 'Índice de Recapabilidade')}
								{renderOptionToggle('tempo', 'Tempo Médio da Carcaça')}
							</View>

							<Text style={[styles.label, { marginTop: 15, marginBottom: 5 }]}>Ordenar Listagem por:</Text>
							<RNPickerSelect
								placeholder={{}}
								value={opcoesRelatorio.ordenacao}
								onValueChange={(val) => setOpcoesRelatorio(prev => ({ ...prev, ordenacao: val }))}
								items={[
									{ label: 'Medida', value: 'medida', color: '#000' },
									{ label: 'Marca', value: 'marca', color: '#000' },
									{ label: 'Modelo', value: 'modelo', color: '#000' },
									{ label: 'Motivo / Dano', value: 'motivo', color: '#000' },
									{ label: 'Veículo (Placa/Código)', value: 'veiculo', color: '#000' }
								]}
								style={pickerStyles}
								useNativeAndroidPickerStyle={false}
								Icon={PickerIcon}
							/>

							<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 48 }]} onPress={() => setModalRelatorioVisible(false)}>
									<Text style={{ fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, { flex: 1, height: 48, marginTop: 0 }]} onPress={confirmarGeracaoRelatorio}>
									<Feather name="download" size={18} color="#fff" style={{ marginRight: 8 }} />
									<Text style={{ color: '#fff', fontWeight: 'bold' }}>Gerar PDF</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</Modal>

			{!modalPneuVisible && modalPreviewVisible && (
				<Modal visible={true} animationType="fade" transparent={true} onRequestClose={() => setModalPreviewVisible(false)}>
					{renderPreviewContent()}
				</Modal>
			)}

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

	inputWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
	inputFlex: { flex: 1, backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000' },
	searchIconBtn: { backgroundColor: '#0c6ead', width: 48, height: 48, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#0c6ead' },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnConsolidar: { flex: 1.3, backgroundColor: '#f39c12', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardSelected: { borderColor: '#1967d2', borderWidth: 2, backgroundColor: '#f0f4ff' },
	checkboxContainer: { paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee', backgroundColor: '#f9f9f9' },

	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#333', flex: 1, marginRight: 10 },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold' },
	cardInfoBox: { padding: 15, paddingBottom: 10 },
	cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
	cardInfoText: { fontSize: 13, color: '#444', flexShrink: 1 },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 8 },
	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnEditarCardText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
	btnImprimirHistorico: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnImprimirHistoricoText: { color: '#333', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	headerAtivo: { backgroundColor: '#0c6ead', padding: 20, paddingTop: Platform.OS === 'ios' ? 50 : 30 },
	headerAtivoTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 5 },
	headerAtivoSubText: { color: '#e0e0e0', fontSize: 14, marginLeft: 5 },
	actionRowAtivo: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
	btnVoltarBranco: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', flex: 1, marginRight: 10 },
	btnVoltarBrancoText: { color: '#333', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnNovoChecklist: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8, flex: 1 },
	btnNovoChecklistText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

	modalHeaderFullScreen: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: '#0c6ead',
		paddingHorizontal: 15,
		paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 24) + 15,
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnIniciar: { backgroundColor: '#63c77b', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

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
	btnInserirBuscaDinamica: { backgroundColor: '#e8f5e9', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#63c77b', marginBottom: 15 },
	btnInserirBuscaDinamicaText: { color: '#28a745', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
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
});