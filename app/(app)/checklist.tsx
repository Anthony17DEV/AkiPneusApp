import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import LogoSolutires from '../../assets/images/smart_pneus.png';
import { useAuth } from '../../contexts/AuthContext';
import { ChassiCaminhao } from '../../src/components/ChassiCaminhao';
import { ModalBuscaDinamica } from '../../src/components/ModalBuscaDinamica';
import { ModalFormularioSimples } from '../../src/components/ModalFormularioSimples';
import { apiService } from '../../src/services/apiService';

interface Veiculo {
	id: number;
	placa: string;
	veic_tx_placa?: string;
	codigo: string;
	marca: string;
	modelo: string;
	eixos: string;
	veic_tx_eixos?: string;
	rodado: string;
	veic_tx_tipoRodado?: string;
	calibragem_padrao: string;
	estepe: string;
	tipo: string;
	veic_tx_tipo?: string;
	cor?: string;
	veic_tx_cor?: string;
	proprietario?: string;
	proprietario_id?: string | number;
}

export default function ChecklistScreen() {
	const FOTO_URL = 'https://sistemascactus.com.br/apicactus/akipneus/fotos/';
	const API_CADASTRO_URL = 'https://sistemascactus.com.br/apicactus/akipneus/api_pneu_cadastro_rapido.php';
	const API_RELATORIO_LINK_URL = 'https://sistemascactus.com.br/apicactus/akipneus/api_gerar_link_relatorio.php';

	const gerarLinkRelatorio = async (arquivo: string, paramsRelatorio: Record<string, any>) => {
		const response = await fetch(API_RELATORIO_LINK_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ arquivo, params: paramsRelatorio })
		});

		const res = await response.json();
		if (!response.ok || !res?.success || !res?.url) {
			throw new Error(res?.message || 'Não foi possível gerar o link temporário do relatório.');
		}
		return String(res.url);
	};

	const params = useLocalSearchParams();
	const router = useRouter();
	const { user, signOut } = useAuth();
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => { isMounted.current = false; };
	}, []);

	const [isLoading, setIsLoading] = useState(false);
	const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
	const [implementos, setImplementos] = useState<Veiculo[]>([]);
	const [historico, setHistorico] = useState<any[]>([]);
	const [idChecklistAtivo, setIdChecklistAtivo] = useState<number | null>(null);
	const [modalNovoChecklist, setModalNovoChecklist] = useState(false);
	const [formNovoCheck, setFormNovoCheck] = useState({ motorista: '', odometro: '' });

	const [dadosPneus, setDadosPneus] = useState<{ [key: string]: any }>({});
	const [pneusPendentes, setPneusPendentes] = useState<string[]>([]);
	const [posicoesRetiradas, setPosicoesRetiradas] = useState<string[]>([]);
	const [pneusRecusados, setPneusRecusados] = useState<any[]>([]);

	const [avisosVinculo, setAvisosVinculo] = useState<{ msg: string, checklist_id?: number, cavalo_id?: number, cavalo_placa?: string }[]>([]);
	const [isModoIsolado, setIsModoIsolado] = useState(false);
	const [offsetEixos, setOffsetEixos] = useState(0);
	const [offsetEstepes, setOffsetEstepes] = useState(0);

	const [modalPneuVisible, setModalPneuVisible] = useState(false);
	const [pneuSelecionado, setPneuSelecionado] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [fotosPneu, setFotosPneu] = useState<string[]>([]);
	const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

	const [modalViewPneuVisible, setModalViewPneuVisible] = useState(false);
	const [viewData, setViewData] = useState<any>({});

	const [modalPreviewVisible, setModalPreviewVisible] = useState(false);
	const [previewData, setPreviewData] = useState({ url: '', nome: '', tipo: '', subtitulo: '' });
	const [htmlDoc, setHtmlDoc] = useState('');
	const [isCarregandoPreview, setIsCarregandoPreview] = useState(false);
	const [exibirCPK, setExibirCPK] = useState(false);
	const [exibirKPM, setExibirKPM] = useState(false);

	const [modalBuscaVisible, setModalBuscaVisible] = useState(false);
	const [tipoBusca, setTipoBusca] = useState<'referencia_pneu' | 'marca_pneu' | 'modelo_pneu' | 'banda' | 'implemento' | 'veiculo' | 'motivo_laudo' | 'reformador'>('referencia_pneu');
	const [resultadosBusca, setResultadosBusca] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const [modalCadastroVisible, setModalCadastroVisible] = useState(false);
	const [isCadastrando, setIsCadastrando] = useState(false);
	const [formCadastro, setFormCadastro] = useState({ nome: '', marca: '', modelo: '', mmOriginal: '', valor: '', sulco: '' });

	const [isSomenteLeitura, setIsSomenteLeitura] = useState(false);
	const [valorPodeEditar, setValorPodeEditar] = useState(true);
	const [pneuPodeSerRetirado, setPneuPodeSerRetirado] = useState(false);
	const [isRetirandoPneu, setIsRetirandoPneu] = useState(false);

	const [formPneu, setFormPneu] = useState({
		id: '', referencia: '', referencia_nome: '', marca: '', modelo: '',
		valor: '', dot: '', serie: '', ferro: '', tipo: 'Novo',
		mm_original: '', milimetros: '', pressao_padrao: '', pressao: '',
		grau: '', banda: '', banda_nome: '', reformador: '', reformador_id: '', observacao: '', motivo_recusa: '',
		ref_mm_original: '', ref_valor: '', sulco_anterior: ''
	});

	const abrirModalPreview = async (url: string, nomeDoArquivo: string, tipoDoc: string, subtituloDoc: string) => {
		setPreviewData({ url, nome: nomeDoArquivo, tipo: tipoDoc, subtitulo: subtituloDoc });
		setExibirCPK(false);
		setExibirKPM(false);
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
		const finalUrl = `${previewData.url}&cpk=${exibirCPK ? 1 : 0}&kpm=${exibirKPM ? 1 : 0}`;
		try {
			const supported = await Linking.canOpenURL(finalUrl);
			if (supported) {
				await Linking.openURL(finalUrl);
			} else {
				Alert.alert('Erro', 'Não foi possível abrir o navegador no telefone.');
			}
		} catch (e) {
			console.log(e);
		}
	};

	const compartilharDocumentoPDF = async () => {
		if (!previewData.url) return;
		try {
			setIsCarregandoPreview(true);
			const finalUrl = `${previewData.url}&cpk=${exibirCPK ? 1 : 0}&kpm=${exibirKPM ? 1 : 0}`;
			const resposta = await fetch(finalUrl);
			const htmlAtualizado = await resposta.text();

			if (!isMounted.current) return;

			const { uri } = await Print.printToFileAsync({ html: htmlAtualizado });
			const diretorio = FileSystem.documentDirectory;
			const fileUriLocal = `${diretorio}${previewData.nome}.pdf`;

			await FileSystem.deleteAsync(fileUriLocal, { idempotent: true });
			await FileSystem.moveAsync({ from: uri, to: fileUriLocal });

			const isAvailable = await Sharing.isAvailableAsync();
			if (isAvailable && isMounted.current) {
				await Sharing.shareAsync(fileUriLocal, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Enviar PDF' });
			} else if (isMounted.current) {
				Alert.alert('Aviso', 'A partilha não está disponível no seu telefone.');
			}
		} catch (e) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao processar o PDF.');
		} finally {
			if (isMounted.current) setIsCarregandoPreview(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			if (params.veiculo_id || params.placa) {
				setImplementos([]);
				setHistorico([]);
				setIdChecklistAtivo(null);
				setDadosPneus({});
				setPneusPendentes([]);
				setPosicoesRetiradas([]);
				setPneusRecusados([]);
				setIsModoIsolado(false);
				setOffsetEixos(0);
				setOffsetEstepes(0);
				buscarVeiculoDireto(params.veiculo_id as string, params.placa as string);
			}
		}, [params.veiculo_id, params.placa])
	);

	const entrarModoIsolado = async (checklistId: number, cavaloId: number, somenteLeitura = false) => {
		setIsSomenteLeitura(somenteLeitura);
		setIsLoading(true);
		try {
			const resCavalo = await apiService.buscarVeiculo({ id: String(cavaloId) });
			let eixosCav = 2;
			let estepesCav = 0;

			if (resCavalo.success && resCavalo.data && resCavalo.data.length > 0) {
				const cav = resCavalo.data[0];
				const rodado = String(cav.rodado || cav.veic_tx_tipoRodado || '').toUpperCase();
				if (['3/4', 'TOCO', '2 EIXOS'].includes(rodado)) eixosCav = 2;
				else if (['TRUCK', '3 EIXOS'].includes(rodado)) eixosCav = 3;
				else if (['BI-TRUCK', 'BITRUCK', '4 EIXOS'].includes(rodado)) eixosCav = 4;
				else eixosCav = parseInt(cav.eixos || cav.veic_tx_eixos || '2', 10) || 2;
				estepesCav = parseInt(cav.estepe || '0', 10) || 0;
			}

			const resComp = await fetch(`https://sistemascactus.com.br/apicactus/akipneus/api_checklist_buscar_composicao.php?checklist_id=${checklistId}`);
			const comp = await resComp.json();

			let eixosAnteriores = eixosCav;
			let estepesAnteriores = estepesCav;

			if (comp.success && comp.data) {
				for (const v of comp.data) {
					const vId = v.veic_nb_id || v.id;
					if (Number(vId) === Number(veiculo?.id)) break;

					const rodado = String(v.rodado || v.veic_tx_tipoRodado || '').toUpperCase();
					let vEixos = 2;
					if (['3/4', 'TOCO', '2 EIXOS'].includes(rodado)) vEixos = 2;
					else if (['TRUCK', '3 EIXOS'].includes(rodado)) vEixos = 3;
					else if (['BI-TRUCK', 'BITRUCK', '4 EIXOS'].includes(rodado)) vEixos = 4;
					else vEixos = parseInt(v.eixos || v.veic_tx_eixos || '2', 10) || 2;

					const vEstepes = parseInt(v.estepe || '0', 10) || 0;
					eixosAnteriores += vEixos;
					estepesAnteriores += vEstepes;
				}
			}

			setOffsetEixos(eixosAnteriores);
			setOffsetEstepes(estepesAnteriores);
			setIsModoIsolado(true);
			setIdChecklistAtivo(checklistId);
			carregarCoresPneus(checklistId);
			setImplementos([]);

		} catch (e) {
			console.log(e);
		}
		setIsLoading(false);
	};

	const buscarVeiculoDireto = async (idVeiculo: string, placaStr: string) => {
		setIsLoading(true);
		const res = await apiService.buscarVeiculo({ id: idVeiculo, busca: placaStr });
		if (!isMounted.current) return;
		setIsLoading(false);

		if (res && res.success && res.data && res.data.length > 0) {
			const v = res.data[0];
			const veiculoFormatado = {
				...v,
				placa: v.placa || v.veic_tx_placa || 'S/ PLACA',
				codigo: v.codigo || v.veic_tx_codigo || '',
				cor: v.cor || v.veic_tx_cor
			};
			setVeiculo(veiculoFormatado);
			carregarHistorico(veiculoFormatado.id);
		} else {
			Alert.alert('Atenção', 'Não foi possível carregar os dados deste equipamento.');
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

	const getFloatDb = (val: any) => {
		if (!val) return 0;
		let str = String(val);
		if (str.includes(',')) { str = str.replace(/\./g, '').replace(',', '.'); }
		return parseFloat(str) || 0;
	};

	const carregarHistorico = async (idVeiculo: number) => {
		const res = await apiService.listarChecklists(idVeiculo);
		if (!isMounted.current) return;
		if (!res || !res.success || !Array.isArray(res.data)) {
			setHistorico([]);
			return;
		}
		const historicoNormalizado = res.data.map((checklist: any) => ({
			...checklist,
			implementos_placas: Array.isArray(checklist.implementos_placas) ? checklist.implementos_placas.filter(Boolean) : []
		}));
		setHistorico(historicoNormalizado);
	};

	const formatarDataLocal = (dataStr: string) => {
		if (!dataStr) return '';
		const partes = dataStr.split(' ');
		const dPartes = partes[0].split('-');
		if (dPartes.length === 3) return `${dPartes[2]}/${dPartes[1]}/${dPartes[0]}`;
		return dataStr;
	};

	const carregarCoresPneus = async (idDoChecklist: number, posicoesBloqueadasExtras: string[] = []) => {
		const resAtual = await apiService.buscarPneusVeiculo(idDoChecklist);
		let pneusAtuais: any = {};
		let retiradasServidor: string[] = [];
		let recusadosServidor: any[] = [];

		if (resAtual && resAtual.success) {
			pneusAtuais = resAtual.data || {};
			retiradasServidor = Array.isArray(resAtual.posicoes_retiradas) ? resAtual.posicoes_retiradas.map((p: any) => String(p)) : [];
			recusadosServidor = Array.isArray(resAtual.pneus_recusados) ? resAtual.pneus_recusados : [];
		}

		const posicoesBloqueadas = Array.from(new Set([...posicoesRetiradas, ...retiradasServidor, ...posicoesBloqueadasExtras]));

		let pneusMesclados = { ...pneusAtuais };
		let pendentesTemporarios: string[] = [];

		const indexAtual = historico.findIndex(h => Number(h.chec_nb_id) === Number(idDoChecklist));
		const eOMaisRecente = indexAtual === 0 || indexAtual === -1;

		if (eOMaisRecente && historico.length > 0) {
			let startIdx = indexAtual === -1 ? 0 : 1;
			let promises = [];
			let posicoesVarridas = new Set([...Object.keys(pneusAtuais), ...posicoesBloqueadas]);

			for (let i = startIdx; i < Math.min(historico.length, startIdx + 5); i++) {
				promises.push(apiService.buscarPneusVeiculo(historico[i].chec_nb_id));
			}

			try {
				const resultadosAntigos = await Promise.all(promises);
				resultadosAntigos.forEach(resAntigo => {
					if (resAntigo && resAntigo.success && resAntigo.data) {
						const pneusAntigos = resAntigo.data;
						Object.keys(pneusAntigos).forEach(posicao => {
							if (!posicoesVarridas.has(posicao)) {
								const pneuClone = JSON.parse(JSON.stringify(pneusAntigos[posicao]));
								if (pneuClone.dados_completos) {
									pneuClone.dados_completos.pneu_id_origem = pneuClone.dados_completos.pneu_nb_id || pneuClone.dados_completos.id || '';
									pneuClone.dados_completos.checklist_id_origem = pneuClone.dados_completos.pneu_nb_checklist || '';
									pneuClone.dados_completos.pneu_nb_id = '';
									pneuClone.dados_completos.id = '';
									pneuClone.dados_completos.tem_checklist_anterior = true;
									pneuClone.dados_completos.valor_editavel = false;
								}
								pneuClone.pneu_nb_id = '';
								pneuClone.id = '';
								pneuClone.tem_checklist_anterior = true;
								pneuClone.valor_editavel = false;

								pneusMesclados[posicao] = pneuClone;
								pendentesTemporarios.push(posicao);
								posicoesVarridas.add(posicao);
							}
						});
					}
				});
			} catch (e) {
				console.log('Erro ao buscar histórico profundo', e);
			}
		}

		if (!isMounted.current) return;

		setPosicoesRetiradas(prev => Array.from(new Set([...prev, ...retiradasServidor, ...posicoesBloqueadasExtras])));
		setDadosPneus(pneusMesclados);
		setPneusPendentes(pendentesTemporarios);
		setPneusRecusados(recusadosServidor);
	};

	const removerImplemento = (id: number) => {
		setImplementos(implementos.filter(i => i.id !== id));
	};

	const iniciarNovoChecklist = async () => {
		if (!formNovoCheck.motorista || !formNovoCheck.odometro) { Alert.alert("Erro", "Preencha o Motorista e o Odômetro."); return; }
		setIsLoading(true);

		let implementosParaEnviar = [...implementos];

		if (implementosParaEnviar.length === 0 && historico.length > 0) {
			const idUltimoChecklist = historico[0].chec_nb_id;
			try {
				const response = await fetch(`https://sistemascactus.com.br/apicactus/akipneus/api_checklist_buscar_composicao.php?checklist_id=${idUltimoChecklist}`);
				const resComp = await response.json();
				if (resComp.success && resComp.data && resComp.data.length > 0) {
					const veiculosFormatados = resComp.data.map((v: any) => ({
						...v, id: v.veic_nb_id || v.id, placa: v.veic_tx_placa || v.placa, codigo: v.veic_tx_codigo || v.codigo, tipo: v.veic_tx_tipo || v.tipo, eixos: v.veic_tx_eixos || v.eixos, cor: v.veic_tx_cor || v.cor, rodado: v.veic_tx_tipoRodado || v.rodado
					}));
					implementosParaEnviar = veiculosFormatados;
					if (isMounted.current) setImplementos(veiculosFormatados);
				}
			} catch (e) {
				console.log('Erro ao clonar composição', e);
			}
		}

		const res = await apiService.iniciarChecklist({
			veiculo_id: veiculo?.id,
			motorista: formNovoCheck.motorista,
			odometro: formNovoCheck.odometro,
			user_id: user?.id,
			implementos: implementosParaEnviar.map(i => i.id)
		});

		if (!isMounted.current) return;

		setIsLoading(false);
		if (res && res.success) {
			setModalNovoChecklist(false);
			setIdChecklistAtivo(res.checklist_id);
			setFormNovoCheck({ motorista: '', odometro: '' });
			setPosicoesRetiradas([]);
			setPneusRecusados([]);
			carregarCoresPneus(res.checklist_id);
		} else {
			Alert.alert("Erro", res.message || "Erro ao iniciar.");
		}
	};

	const abrirChecklistAntigo = async (idDoChecklist: number, somenteLeitura = false) => {
		const idBase = veiculo?.id || 0;
		setIsSomenteLeitura(somenteLeitura);
		setIsModoIsolado(false);
		setOffsetEixos(0);
		setOffsetEstepes(0);
		setPosicoesRetiradas([]);
		setPneusRecusados([]);
		setIdChecklistAtivo(idDoChecklist);
		carregarCoresPneus(idDoChecklist);

		try {
			const response = await fetch(`https://sistemascactus.com.br/apicactus/akipneus/api_checklist_buscar_composicao.php?checklist_id=${idDoChecklist}`);
			const res = await response.json();
			if (!isMounted.current) return;

			if (res.success && res.data) {
				const veiculosFormatados = res.data.map((v: any) => ({
					...v, id: v.veic_nb_id || v.id, placa: v.veic_tx_placa || v.placa, codigo: v.veic_tx_codigo || v.codigo, tipo: v.veic_tx_tipo || v.tipo, eixos: v.veic_tx_eixos || v.eixos, cor: v.veic_tx_cor || v.cor, rodado: v.veic_tx_tipoRodado || v.rodado
				}));
				setImplementos(veiculosFormatados.filter((v: any) => v.id !== idBase));
			} else {
				setImplementos([]);
			}
		} catch (e) {
			if (isMounted.current) setImplementos([]);
		}
	};

	const fecharChecklistAtivo = async () => {
		if (idChecklistAtivo) {
			setIsLoading(true);
			if (!isModoIsolado) {
				try {
					const payload = { checklist_id: idChecklistAtivo, implementos: implementos.map(i => i.id) };
					await fetch('https://sistemascactus.com.br/apicactus/akipneus/api_checklist_salvar_composicao.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
				} catch (err) {
					console.log('Erro ao salvar composição', err);
				}
			}
			if (!isMounted.current) return;
			setIsLoading(false);
		}

		setIdChecklistAtivo(null);
		setImplementos([]);
		setPosicoesRetiradas([]);
		setPneusRecusados([]);
		setIsModoIsolado(false);
		setOffsetEixos(0);
		setOffsetEstepes(0);

		if (veiculo?.id) {
			carregarHistorico(veiculo.id);
		}
	};

	const imprimirChecklist = async (idDoChecklist: number) => {
		try {
			const url = await gerarLinkRelatorio('imprimir_checklist.php', { id: idDoChecklist, _ts: Date.now() });
			abrirModalPreview(url, `Historico_Veiculo_${idDoChecklist}`, 'Laudo de Inspeção da Frota', `Checklist Veicular #${idDoChecklist}`);
		} catch (e: any) {
			if (isMounted.current) Alert.alert('Erro', e?.message || 'Não foi possível gerar o link temporário do relatório.');
		}
	};

	const excluirChecklistAntigo = (idDoChecklist: number) => {
		Alert.alert(
			'Excluir Checklist',
			'Tem a certeza que deseja excluir permanentemente esta inspeção?',
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						setIsLoading(true);
						try {
							const response = await fetch('https://sistemascactus.com.br/apicactus/akipneus/api_checklist_excluir.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: idDoChecklist }) });
							const textRes = await response.text();
							let res;
							try { res = JSON.parse(textRes); } catch (e) { res = { success: true, message: textRes }; }

							if (!isMounted.current) return;
							if (res.success || res.status === 'success' || (res.message && res.message.toLowerCase().includes('sucesso'))) {
								Alert.alert('Sucesso', 'Checklist excluído com sucesso.');
								if (veiculo?.id) carregarHistorico(veiculo.id);
							} else {
								Alert.alert('Aviso', res.message || 'Comando enviado. Verifique se o checklist foi removido.');
								if (veiculo?.id) carregarHistorico(veiculo.id);
							}
						} catch (error) {
							if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
						} finally {
							if (isMounted.current) setIsLoading(false);
						}
					}
				}
			]
		);
	};

	const abrirEdicaoPneu = (codigoPneu: string, dbData: any, bloquearValorPorHistorico = false) => {
		setPneuSelecionado(codigoPneu);
		const jaExistePneuNaPosicao = Boolean(bloquearValorPorHistorico || dbData?.pneu_nb_id || dbData?.id || dbData?.pneu_id_origem || dbData?.pneu_tx_serie || dbData?.pneu_tx_modelo);
		setPneuPodeSerRetirado(jaExistePneuNaPosicao);

		const flagHistorico = dbData?.tem_checklist_anterior;
		const flagEditavel = dbData?.valor_editavel;

		const temHistorico = bloquearValorPorHistorico || flagHistorico === true || flagHistorico === 1 || flagHistorico === '1';
		const apiBloqueouEdicao = flagEditavel === false || flagEditavel === 0 || flagEditavel === '0';
		const podeEditarValor = !temHistorico && !apiBloqueouEdicao;
		setValorPodeEditar(podeEditarValor);

		const valorCarregadoRaw = dbData?.valor_carregado ?? dbData?.pneu_tx_valor ?? '';
		const valorCarregadoFormatado = valorCarregadoRaw !== '' && valorCarregadoRaw !== null && valorCarregadoRaw !== undefined ? formatarValorDB(valorCarregadoRaw) : '';

		if (dbData.pneu_tx_foto) {
			const nomesFotos = dbData.pneu_tx_foto.split(',');
			const urlsCompletas = nomesFotos.map((nome: string) => FOTO_URL + nome);
			setFotosPneu(urlsCompletas);
		} else { setFotosPneu([]); }

		setFormPneu({
			id: dbData.pneu_nb_id || dbData.id || '',
			referencia: dbData.pneu_tx_referencia || '',
			referencia_nome: dbData.referencia_nome || (dbData.pneu_tx_referencia ? `Referência #${dbData.pneu_tx_referencia}` : ''),
			marca: dbData.pneu_tx_marca || '',
			modelo: dbData.pneu_tx_modelo || '',
			valor: valorCarregadoFormatado,
			dot: dbData.pneu_tx_dot || '',
			serie: dbData.pneu_tx_serie || '',
			ferro: dbData.pneu_tx_ferro || '',
			tipo: dbData.pneu_tx_tipo || 'Novo',
			mm_original: dbData.pneu_tx_mmOriginal?.toString() || '',
			milimetros: dbData.pneu_tx_milimetros?.toString() || '',
			grau: dbData.pneu_tx_grau || '',
			banda: dbData.pneu_tx_banda || '',
			banda_nome: dbData.banda_nome || dbData.pneu_tx_banda || '',
			reformador: dbData.reformador || dbData.pneu_tx_reformador || '',
			reformador_id: dbData.reformador_id || dbData.pneu_nb_reformador || '',
			observacao: dbData.pneu_tx_observacao || '',
			motivo_recusa: dbData.motivo_recusa || dbData.laud_tx_motivo || '',
			pressao_padrao: dbData.pneu_tx_pressaoPadrao?.toString() || veiculo?.calibragem_padrao || '',
			pressao: dbData.pneu_tx_pressao?.toString() || '',
			ref_mm_original: dbData.pneu_tx_mmOriginal?.toString() || '',
			ref_valor: valorCarregadoFormatado,
			sulco_anterior: dbData.pneu_tx_milimetros?.toString() || ''
		});
		setModalPneuVisible(true);
	};

	const abrirVisualizacaoPneu = (codigoPneu: string, dbData: any) => {
		setViewData({ codigoPneu, dbData });
		setModalViewPneuVisible(true);
	};

	const handlePneuClick = (codigoPneu: string) => {
		const pAtual = dadosPneus[codigoPneu] || {};
		const dbData = pAtual.dados_completos ? { ...pAtual.dados_completos } : {};
		const isPendente = pneusPendentes.includes(codigoPneu);

		if (dbData && (dbData.pneu_nb_id || dbData.id) && !isPendente) {
			abrirVisualizacaoPneu(codigoPneu, dbData);
		} else {
			if (isSomenteLeitura) { Alert.alert('Modo Leitura', 'Checklists antigos não podem sofrer adição ou alteração de pneus.'); return; }
			if (isPendente) {
				dbData.pneu_nb_id = ''; dbData.id = ''; dbData.pneu_tx_foto = ''; dbData.tem_checklist_anterior = true; dbData.valor_editavel = false;
			}
			abrirEdicaoPneu(codigoPneu, dbData, isPendente);
		}
	};

	const retirarPneu = (codigoPneu: string, dbData: any) => {
		if (isSomenteLeitura) { Alert.alert('Modo Leitura', 'Este checklist não permite retirada de pneus.'); return; }

		const indiceChecklist = historico.findIndex(h => Number(h.chec_nb_id) === Number(idChecklistAtivo));
		const checklistMaisRecente = indiceChecklist === -1 || indiceChecklist === 0;

		if (!checklistMaisRecente) { Alert.alert('Atenção', 'A retirada de pneus só pode ser feita no checklist mais recente.'); return; }

		const dados = dbData || {};
		const pneuId = Number(dados.pneu_nb_id || dados.id || 0);
		const ehPneuPendente = pneusPendentes.includes(codigoPneu) || pneuId <= 0;

		Alert.alert(
			'Retirar Pneu',
			`Deseja realmente retirar o pneu da posição ${codigoPneu}?\nA posição ficará livre para cadastrar um novo pneu.`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Retirar',
					style: 'destructive',
					onPress: async () => {
						if (ehPneuPendente) {
							setPosicoesRetiradas(prev => Array.from(new Set([...prev, codigoPneu])));
							setDadosPneus(prev => { const novo = { ...prev }; delete novo[codigoPneu]; return novo; });
							setPneusPendentes(prev => prev.filter(p => p !== codigoPneu));
							setModalPneuVisible(false);
							setModalViewPneuVisible(false);
							Alert.alert('Posição Liberada', 'O pneu anterior foi retirado desta posição. Toque na posição novamente para cadastrar o novo pneu.');
							return;
						}

						setIsRetirandoPneu(true);
						try {
							const response = await fetch('https://sistemascactus.com.br/apicactus/akipneus/api_pneu_retirar.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pneu_id: pneuId, checklist_id: dados.pneu_nb_checklist || idChecklistAtivo, veiculo_id: dados.pneu_nb_veiculo || veiculo?.id }) });
							const res = await response.json();
							if (!isMounted.current) return;

							if (!res?.success) { Alert.alert('Erro', res?.message || 'Não foi possível retirar o pneu.'); return; }

							setPosicoesRetiradas(prev => Array.from(new Set([...prev, codigoPneu])));
							setDadosPneus(prev => { const novo = { ...prev }; delete novo[codigoPneu]; return novo; });
							setPneusPendentes(prev => prev.filter(p => p !== codigoPneu));
							setModalPneuVisible(false);
							setModalViewPneuVisible(false);

							if (idChecklistAtivo) { await carregarCoresPneus(idChecklistAtivo, [codigoPneu]); }
							Alert.alert('Sucesso', res.message || 'Pneu retirado do veículo com sucesso.');
						} catch (error) {
							if (isMounted.current) { Alert.alert('Erro', 'Falha na conexão ao retirar o pneu.'); }
						} finally {
							if (isMounted.current) setIsRetirandoPneu(false);
						}
					}
				}
			]
		);
	};

	const tirarFotoPneu = async () => {
		const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
		if (permissionResult.granted === false) { Alert.alert("Erro", "Permita o acesso à câmera."); return; }
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

	const salvarAfericaoPneu = async () => {
		if (!formPneu.milimetros || !formPneu.pressao) { Alert.alert('Atenção', 'Sulco e Calibração são obrigatórios.'); return; }
		if (!formPneu.referencia) { Alert.alert('Atenção', 'A Referência do pneu é obrigatória.'); return; }
		if (!formPneu.marca || !formPneu.modelo) { Alert.alert('Atenção', 'A Marca e o Modelo são obrigatórios.'); return; }

		if (formPneu.dot && formPneu.dot !== 'S/A') {
			if (formPneu.dot.length !== 4) { Alert.alert('Atenção', 'O DOT deve conter exatamente 4 dígitos numéricos.'); return; }
			const semana = parseInt(formPneu.dot.substring(0, 2));
			if (semana < 1 || semana > 53) { Alert.alert('Atenção', 'As duas primeiras posições do DOT representam a semana de fabricação e devem estar entre 01 e 53.'); return; }
		}
		if (!formPneu.tipo) { Alert.alert('Atenção', 'O campo Tipo é obrigatório.'); return; }

		const sulcoAtualNum = parseFloat(formPneu.milimetros ? formPneu.milimetros.toString().replace(',', '.') : '0');
		const sulcoAnteriorNum = parseFloat(formPneu.sulco_anterior ? formPneu.sulco_anterior.toString().replace(',', '.') : '0');

		if (!isNaN(sulcoAnteriorNum) && sulcoAnteriorNum > 0) {
			if (sulcoAtualNum > sulcoAnteriorNum) { Alert.alert('Aferição Inválida', `O sulco atual não pode ser maior que o anterior!\nA última aferição registrou ${formPneu.sulco_anterior}mm.`); return; }
		}

		setIsSaving(true);

		const fotosNovas = fotosPneu.filter(f => f.startsWith('data:image'));
		const fotosAntigasLimpas = fotosPneu.filter(f => f.startsWith('http')).map(f => f.substring(f.lastIndexOf('/') + 1));
		const stringFotosAntigas = fotosAntigasLimpas.join(',');

		const valorLimpo = formPneu.valor ? formPneu.valor.toString().replace(/\./g, '').replace(',', '.') : '0';

		const dadosParaSalvar = {
			...formPneu,
			referencia: formPneu.referencia,
			referencia_id: formPneu.referencia,
			marca: formPneu.marca,
			modelo: formPneu.modelo,
			mm_original: formPneu.mm_original || formPneu.ref_mm_original,
			motivo_recusa: formPneu.motivo_recusa,
			laud_tx_motivo: formPneu.motivo_recusa,
			reformador_id: formPneu.reformador_id,
			reformador_nome: formPneu.reformador,
			pneu_tx_reformador: formPneu.reformador,
			valor: valorLimpo,
			veiculo_id: veiculo?.id,
			checklist_id: idChecklistAtivo,
			posicao: pneuSelecionado,
			user_id: user?.id,
			fotos_novas: fotosNovas,
			fotos: fotosNovas,
			fotos_antigas: fotosAntigasLimpas,
			fotosAntigas: fotosAntigasLimpas,
			fotosAntigas_mantidas: fotosAntigasLimpas,
			pneu_tx_foto_antiga: stringFotosAntigas,
			foto_antiga: stringFotosAntigas
		};

		const res = await apiService.salvarInspecaoPneu(dadosParaSalvar);
		if (!isMounted.current) return;

		setIsSaving(false);
		if (res && res.success) {
			setModalPneuVisible(false);
			setPneusPendentes(prev => prev.filter(p => p !== pneuSelecionado));

			const pneuFoiRetirado = res.pneu_retirado === true || res.pneu_retirado === 1 || res.pneu_retirado === '1';

			if (pneuFoiRetirado) {
				setPosicoesRetiradas(prev => Array.from(new Set([...prev, pneuSelecionado])));
				setDadosPneus(prev => { const novo = { ...prev }; delete novo[pneuSelecionado]; return novo; });
				if (idChecklistAtivo) { await carregarCoresPneus(idChecklistAtivo, [pneuSelecionado]); }

				const pneuIdLaudo = res.pneu_id || formPneu.id;
				const gerouLaudo = res.gerou_laudo === true || res.gerou_laudo === 1 || res.gerou_laudo === '1';

				const botoes: any[] = [{ text: 'OK' }];
				if (gerouLaudo && pneuIdLaudo) {
					botoes.push({
						text: 'Visualizar Laudo',
						onPress: async () => {
							try {
								const url = await gerarLinkRelatorio('imprimir_pneu.php', { id: pneuIdLaudo, _ts: Date.now() });
								abrirModalPreview(url, `Laudo_Pneu_${pneuIdLaudo}`, 'Laudo Técnico de Pneu', `Pneu Referência #${pneuIdLaudo}`);
							} catch (e: any) {
								if (isMounted.current) Alert.alert('Erro', e?.message || 'Não foi possível gerar o link temporário do relatório.');
							}
						}
					});
				}
				Alert.alert('Pneu Recusado', res.message || 'Laudo gerado e pneu retirado do veículo. A posição está livre para um novo pneu.', botoes);
			} else {
				setPosicoesRetiradas(prev => prev.filter(p => p !== pneuSelecionado));
				if (idChecklistAtivo) await carregarCoresPneus(idChecklistAtivo);
				Alert.alert('Sucesso', res.message);
			}
		}
		else { Alert.alert('Erro', res?.message || 'Falha ao salvar pneu.'); }
	};

	const abrirBuscaDinamica = (tipo: any) => { setTipoBusca(tipo); setResultadosBusca([]); setModalBuscaVisible(true); buscarDinamicaNoBanco(tipo, ''); };

	const buscarDinamicaNoBanco = async (tipo: string, termo: string) => {
		setIsSearching(true);
		try {
			if (tipo === 'veiculo' || tipo === 'implemento') {
				const clienteIdSelecionado = String(params.cliente_id || veiculo?.proprietario_id || '');
				const filtros: any = { busca: termo };
				if (tipo === 'implemento' && clienteIdSelecionado) { filtros.cliente_id = clienteIdSelecionado; }

				const res = await apiService.buscarVeiculo(filtros);
				if (res && res.success) {
					let listaVeiculos = res.data;
					if (tipo === 'implemento') {
						const tiposPermitidos = ['CARRETA', 'DOLLY', 'OUTROS'];
						listaVeiculos = listaVeiculos.filter((v: any) => tiposPermitidos.includes(String(v.tipo || v.veic_tx_tipo || '').trim().toUpperCase()));
					}
					const veiculosFormatados = listaVeiculos.map((v: any) => ({
						...v, id: v.id, nome: v.placa || v.veic_tx_placa || v.nome, placa: v.placa || v.veic_tx_placa || v.nome, codigo: v.codigo || v.veic_tx_codigo || '', cor: v.cor || v.veic_tx_cor, documento: `Código: ${v.codigo || '--'} | Tipo: ${v.tipo || v.veic_tx_tipo || 'N/A'} | Eixos: ${v.eixos || v.veic_tx_eixos || 2}`
					}));
					setResultadosBusca(veiculosFormatados);
				} else { setResultadosBusca([]); }
			} else {
				// Garante o envio exato dos parâmetros que a api_busca_dinamica.php espera
				const extras: any = {};

				if (tipo === 'marca_pneu' || tipo === 'modelo_pneu' || tipo === 'banda') {
					if (formPneu.referencia) {
						extras.referencia_id = formPneu.referencia;
					}
				}

				if (tipo === 'modelo_pneu') {
					if (formPneu.marca) {
						extras.marca_atual = formPneu.marca;
					}
				}

				const res = await apiService.buscarDinamica(tipo, termo, extras);
				setResultadosBusca(res && res.success ? res.data : []);
			}
		} catch (e) {
			setResultadosBusca([]);
		} finally {
			if (isMounted.current) setIsSearching(false);
		}
	};

	const selecionarItemBusca = (item: any) => {
		if (tipoBusca === 'implemento') {
			if (!implementos.find(i => i.id === item.id) && item.id !== veiculo?.id) { setImplementos([...implementos, item]); }
		}
		else if (tipoBusca === 'motivo_laudo') { setFormPneu({ ...formPneu, motivo_recusa: item.nome }); }
		else if (tipoBusca === 'reformador') { setFormPneu({ ...formPneu, reformador: item.nome, reformador_id: item.id }); }
		else if (tipoBusca === 'referencia_pneu') {
			setFormPneu({
				...formPneu,
				referencia: item.id || item.refe_nb_id,
				referencia_nome: item.nome || item.refe_tx_nome,
				marca: item.isNewModel ? (formCadastro.marca || '') : '',
				modelo: item.isNewModel ? (formCadastro.modelo || '') : '',
				mm_original: '', ref_mm_original: '',
				valor: valorPodeEditar ? '' : formPneu.valor,
				ref_valor: valorPodeEditar ? '' : (formPneu.ref_valor || formPneu.valor),
			});
			setModalBuscaVisible(false);
		}
		else if (tipoBusca === 'marca_pneu') {
			setFormPneu({
				...formPneu,
				referencia_nome: item.isNewModel ? (formCadastro.nome || formPneu.referencia_nome) : formPneu.referencia_nome,
				marca: item.nome || item.refe_tx_marca,
				modelo: '',
				mm_original: '', ref_mm_original: '',
				valor: valorPodeEditar ? '' : formPneu.valor,
				ref_valor: valorPodeEditar ? '' : (formPneu.ref_valor || formPneu.valor),
			});
			setModalBuscaVisible(false);
		}
		else if (tipoBusca === 'modelo_pneu') {
			const rawMm = item.mmOriginal ?? item.refe_tx_mmOriginal ?? item.mm_original ?? item.pneu_tx_mmOriginal ?? '';
			const rawValor = item.valor ?? item.refe_tx_valor ?? item.ref_valor ?? '';
			const refMm = item.isNewModel ? (formCadastro.mmOriginal || '') : String(rawMm).replace(',', '.');
			const refVal = item.isNewModel ? formatarValorDB(formCadastro.valor || '') : formatarValorDB(rawValor);
			setFormPneu({
				...formPneu,
				referencia: item.isNewModel ? item.id : formPneu.referencia,
				referencia_nome: item.isNewModel ? (formCadastro.nome || formPneu.referencia_nome) : formPneu.referencia_nome,
				marca: item.isNewModel ? (formCadastro.marca || formPneu.marca) : (item.refe_tx_marca || item.marca || formPneu.marca),
				modelo: item.nome || item.refe_tx_modelo || item.modelo || '',
				ref_mm_original: refMm,
				ref_valor: valorPodeEditar ? refVal : (formPneu.ref_valor || formPneu.valor),
				mm_original: formPneu.tipo === 'Reformado' && formPneu.banda ? formPneu.mm_original : refMm,
				valor: !valorPodeEditar ? formPneu.valor : (formPneu.tipo === 'Reformado' && formPneu.banda ? formPneu.valor : refVal)
			});
			setModalBuscaVisible(false);
		}
		else if (tipoBusca === 'banda') {
			const rawSulco = item.sulco ?? item.band_tx_sulco ?? '';
			const rawValor = item.valor ?? item.band_tx_valor ?? '';
			setFormPneu({
				...formPneu,
				banda: item.id,
				banda_nome: item.nome || item.banda || '',
				mm_original: item.isNewModel ? formCadastro.sulco : (rawSulco ? String(rawSulco).replace(',', '.') : formPneu.mm_original),
				valor: !valorPodeEditar ? formPneu.valor : (item.isNewModel ? formatarValorDB(formCadastro.valor || '') : (formatarValorDB(rawValor) || formPneu.valor))
			});
			setModalBuscaVisible(false);
		}
	};

	const abrirModalCadastro = (termoDigitado = '') => {
		setFormCadastro({
			nome: tipoBusca === 'referencia_pneu' ? termoDigitado.trim() : (tipoBusca === 'banda' ? '' : (tipoBusca === 'motivo_laudo' || tipoBusca === 'reformador' ? termoDigitado.trim() : (formPneu.referencia_nome || ''))),
			marca: tipoBusca === 'marca_pneu' ? termoDigitado.trim() : (tipoBusca === 'modelo_pneu' ? (formPneu.marca || '') : ''),
			modelo: (tipoBusca === 'modelo_pneu' || tipoBusca === 'banda') ? termoDigitado.trim() : '',
			mmOriginal: '', valor: '', sulco: ''
		});
		setModalBuscaVisible(false);
		setModalCadastroVisible(true);
	};

	const getCamposCadastroDinamico = () => {
		if (tipoBusca === 'motivo_laudo') return [{ chave: 'nome', label: '* Nome do Motivo', placeholder: 'Ex: Furo na lateral...' }];
		if (tipoBusca === 'reformador') return [{ chave: 'nome', label: '* Nome do Reformador', placeholder: 'Ex: Reformadora Silva...' }];
		if (tipoBusca === 'marca_pneu') return [{ chave: 'nome', label: '* Referência', placeholder: 'Ex: 295/80R22.5' }, { chave: 'marca', label: '* Nova Marca', placeholder: 'Nome da Marca...' }];
		if (tipoBusca === 'modelo_pneu' || tipoBusca === 'referencia_pneu') return [
			{ chave: 'nome', label: '* Referência', placeholder: 'Ex: 295/80R22.5' },
			{ chave: 'marca', label: '* Marca', placeholder: 'Nome da Marca...' },
			{ chave: 'modelo', label: '* Modelo', placeholder: 'Nome do Modelo...' },
			{ chave: 'mmOriginal', label: '* MM Original', keyboardType: 'numeric' as const },
			{ chave: 'valor', label: 'Valor (R$)', keyboardType: 'numeric' as const }
		];
		if (tipoBusca === 'banda') return [
			{ chave: 'marca', label: '* Marca' },
			{ chave: 'modelo', label: '* Modelo' },
			{ chave: 'sulco', label: '* Sulco (MM)', keyboardType: 'numeric' as const },
			{ chave: 'valor', label: 'Valor (R$)', keyboardType: 'numeric' as const }
		];
		return [];
	};

	const salvarCadastroDinamico = async () => {
		if (tipoBusca === 'motivo_laudo' && !formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome do motivo."); return; }
		if (tipoBusca === 'reformador' && !formCadastro.nome) { Alert.alert("Atenção", "Preencha o nome do reformador."); return; }
		if (tipoBusca === 'referencia_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }
		if (tipoBusca === 'marca_pneu' && (!formCadastro.nome || !formCadastro.marca)) { Alert.alert("Atenção", "Preencha a Referência e a Nova Marca."); return; }
		if (tipoBusca === 'modelo_pneu' && (!formCadastro.nome || !formCadastro.marca || !formCadastro.modelo || !formCadastro.mmOriginal)) { Alert.alert("Atenção", "Preencha Referência, Marca, Modelo e o MM Original."); return; }
		if (tipoBusca === 'banda' && (!formCadastro.marca || !formCadastro.modelo || !formCadastro.sulco)) { Alert.alert("Atenção", "Preencha todos os campos com asterisco."); return; }

		setIsCadastrando(true);
		try {
			const dadosCadastro = {
				tipo: tipoBusca,
				...formCadastro,
				nome: formCadastro.nome.toUpperCase(),
				marca: formCadastro.marca.toUpperCase(),
				modelo: formCadastro.modelo.toUpperCase(),
				valor: formCadastro.valor ? formCadastro.valor.replace(/\./g, '') : ''
			};

			const response = await fetch(API_CADASTRO_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCadastro) });
			const res = await response.json();

			if (!isMounted.current) return;

			if (res.success) {
				if (tipoBusca === 'motivo_laudo' || tipoBusca === 'reformador') {
					selecionarItemBusca({ id: res.id, nome: res.nome || formCadastro.nome, isNewModel: true });
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

	const imprimirLaudoPneuRecusado = async (pneu: any) => {
		const pneuId = pneu?.pneu_nb_id || pneu?.id;
		if (!pneuId) { Alert.alert('Atenção', 'Não foi possível identificar o pneu recusado para gerar o laudo.'); return; }
		const posicao = pneu?.laud_tx_posicao || pneu?.pneu_tx_posicao || '';
		const serie = pneu?.pneu_tx_serie || 'S/A';
		try {
			const url = await gerarLinkRelatorio('imprimir_pneu.php', { id: pneuId, _ts: Date.now() });
			abrirModalPreview(url, `Laudo_Pneu_Recusado_${pneuId}`, 'Laudo de Pneu Recusado', `${posicao ? `Posição ${posicao} • ` : ''}Série ${serie}`);
		} catch (e: any) {
			if (isMounted.current) Alert.alert('Erro', e?.message || 'Não foi possível gerar o link temporário do relatório.');
		}
	};

	const renderPreviewContent = () => (
		<View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999999, elevation: 999999 }]}>
			<View style={{ width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 10 }}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
					<Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>Exportar Documento</Text>
					<TouchableOpacity onPress={() => setModalPreviewVisible(false)}>
						<Feather name="x" size={24} color="#333" />
					</TouchableOpacity>
				</View>

				<View style={{ alignItems: 'center', marginBottom: 15, backgroundColor: '#f8f9fa', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#e9ecef' }}>
					<MaterialCommunityIcons name="file-pdf-box" size={60} color="#E53935" />
					<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' }}>{previewData.tipo}</Text>
					<Text style={{ fontSize: 13, color: '#666', marginTop: 5, textAlign: 'center' }}>{previewData.subtitulo}</Text>
					<Text style={{ fontSize: 11, color: '#999', marginTop: 15, textAlign: 'center', backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 }}>
						{previewData.nome}.pdf
					</Text>
				</View>

				<View style={{ marginBottom: 20, backgroundColor: '#f4f6f8', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
					<Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 12 }}>Opções do Relatório:</Text>
					<TouchableOpacity onPress={() => setExibirCPK(!exibirCPK)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
						<Feather name={exibirCPK ? "check-square" : "square"} size={22} color={exibirCPK ? "#1967d2" : "#999"} style={{ marginRight: 10 }} />
						<Text style={{ fontSize: 14, color: '#333', fontWeight: 'bold' }}>Exibir CPK (Custo por KM)</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setExibirKPM(!exibirKPM)} style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Feather name={exibirKPM ? "check-square" : "square"} size={22} color={exibirKPM ? "#1967d2" : "#999"} style={{ marginRight: 10 }} />
						<Text style={{ fontSize: 14, color: '#333', fontWeight: 'bold' }}>Exibir KPM (Km por mm)</Text>
					</TouchableOpacity>
				</View>

				{isCarregandoPreview ? (
					<View style={{ alignItems: 'center', paddingVertical: 20 }}>
						<ActivityIndicator size="large" color="#0c6ead" />
						<Text style={{ color: '#666', marginTop: 10, fontWeight: 'bold' }}>A processar documento...</Text>
					</View>
				) : (
					<View style={{ gap: 12, width: '100%' }}>
						<TouchableOpacity style={{ backgroundColor: '#0c6ead', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8, width: '100%' }} onPress={visualizarPDFNativo}>
							<Feather name="eye" size={20} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Visualizar Documento</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{ backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 8, width: '100%' }} onPress={compartilharDocumentoPDF}>
							<MaterialCommunityIcons name="whatsapp" size={22} color="#fff" />
							<Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15, marginLeft: 10 }}>Enviar</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		</View>
	);

	const PickerIcon = () => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />;

	const dadosPneusComPendencia: { [key: string]: any } = { ...dadosPneus };
	pneusPendentes.forEach(posicao => {
		if (dadosPneusComPendencia[posicao]) {
			dadosPneusComPendencia[posicao] = { ...dadosPneusComPendencia[posicao], pendente: true };
		}
	});

	return (
		<View style={styles.container}>
			{isLoading && <ActivityIndicator size="large" color="#3276b1" style={{ marginTop: 50 }} />}

			{veiculo && (
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, paddingTop: 20 }}>
					<View style={styles.veiculoCard}>
						<View style={[styles.veiculoHeader, { flexDirection: 'column', alignItems: 'flex-start' }]}>
							<View style={{ flexDirection: 'row', alignItems: 'center' }}>
								<MaterialCommunityIcons name="truck-outline" size={28} color="#333" />
								<Text style={styles.placaText}>{veiculo.placa || veiculo.veic_tx_placa}</Text>
							</View>
							{implementos.length > 0 && (
								<View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, width: '100%' }}>
									{implementos.map(imp => (
										<View key={imp.id} style={styles.chipImplemento}>
											<Feather name="link" size={12} color="#666" />
											<Text style={[styles.placaText, { fontSize: 14, marginLeft: 4 }]}>{imp.placa}</Text>
											{idChecklistAtivo && !isModoIsolado && (
												<TouchableOpacity onPress={() => removerImplemento(imp.id)} style={{ marginLeft: 8 }}>
													<Feather name="x-circle" size={16} color="#e74c3c" />
												</TouchableOpacity>
											)}
										</View>
									))}
								</View>
							)}
						</View>
						<Text style={{ fontSize: 13, color: '#666', marginTop: 10 }}>Marca/Modelo: {veiculo.marca} / {veiculo.modelo}</Text>
					</View>

					{avisosVinculo.length > 0 && (
						<View style={{ backgroundColor: '#fff3cd', borderColor: '#ffeeba', borderWidth: 1, padding: 15, borderRadius: 8, marginBottom: 20 }}>
							<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
								<Feather name="alert-triangle" size={18} color="#856404" />
								<Text style={{ color: '#856404', fontWeight: 'bold', fontSize: 15, marginLeft: 8 }}>
									Veículo em Outro Checklist
								</Text>
							</View>
							{avisosVinculo.map((aviso, idx) => (
								<View key={idx} style={{ marginBottom: 12 }}>
									<Text style={{ color: '#856404', fontSize: 13, marginBottom: 6 }}>• {aviso.msg}</Text>
									{aviso.checklist_id && aviso.cavalo_id && (
										<TouchableOpacity style={{ backgroundColor: '#f39c12', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, alignSelf: 'flex-start' }} onPress={() => entrarModoIsolado(aviso.checklist_id!, aviso.cavalo_id!)}>
											<Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Editar {veiculo.placa} Isolado</Text>
										</TouchableOpacity>
									)}
								</View>
							))}
						</View>
					)}

					{!idChecklistAtivo && (
						<View style={{ flexDirection: 'row', marginBottom: 20 }}>
							<TouchableOpacity style={[styles.btnVoltarBranco, { flex: 1, marginRight: 10 }]} onPress={() => router.push({ pathname: '/veiculos', params: { cliente_id: params.cliente_id || '', cliente_nome: params.cliente_nome || '' } })}>
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
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0, alignItems: 'center', marginBottom: 20 }}>
								<Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Histórico de Inspeções</Text>
							</View>
							{historico.map((h, index) => {
								const isUltimoChecklist = index === 0;
								const isAdmin = user?.nivel === 'ADMINISTRADOR' || user?.nivel === 'DIRETORIA';
								const podeEditar = isUltimoChecklist || isAdmin;

								return (
									<View key={`historico_${index}`} style={[styles.itemHistorico, { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 15 }]}>
										<View style={{ width: '100%', marginBottom: 12 }}>
											<Text style={{ fontWeight: 'bold', color: '#333', fontSize: 15 }}>{formatarDataLocal(h.chec_tx_dataHora)}</Text>
											<Text style={{ color: '#666', fontSize: 13, marginTop: 4 }}>Motorista: {h.chec_tx_motorista}</Text>
											<Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>Odômetro: {h.chec_tx_odometro} Km</Text>
											{h.is_implemento == 1 && h.cavalo_placa && (
												<Text style={{ color: '#E53935', fontSize: 12, marginTop: 6, fontWeight: 'bold' }}>* Inspecionado no veículo: {h.cavalo_placa}</Text>
											)}
											{h.implementos_placas?.length > 0 && (
												<View style={{ marginTop: 6 }}>
													<Text style={{ color: '#666', fontSize: 13, fontWeight: '600' }}>Implementos:</Text>
													<Text style={{ color: '#0c6ead', fontSize: 13, fontWeight: 'bold', marginTop: 2 }}>{h.implementos_placas.join(' • ')}</Text>
												</View>
											)}
										</View>

										<View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
											<TouchableOpacity style={[styles.btnImprimirHistorico, { flex: 1, paddingVertical: 10 }]} onPress={() => imprimirChecklist(h.chec_nb_id)}>
												<Feather name="printer" size={14} color="#333" />
												<Text style={styles.btnImprimirHistoricoText} numberOfLines={1}>Exportar</Text>
											</TouchableOpacity>
											<TouchableOpacity style={[styles.btnModificarHistorico, { flex: 1, paddingVertical: 10, backgroundColor: podeEditar ? '#3276b1' : '#f39c12' }]} onPress={() => { if (h.is_implemento == 1 && h.cavalo_id) { entrarModoIsolado(h.chec_nb_id, h.cavalo_id, !podeEditar); } else { abrirChecklistAntigo(h.chec_nb_id, !podeEditar); } }}>
												<Feather name={podeEditar ? "edit-2" : "eye"} size={14} color="#fff" />
												<Text style={styles.btnModificarHistoricoText} numberOfLines={1}>{podeEditar ? 'Editar' : 'Visualizar'}</Text>
											</TouchableOpacity>
											{isAdmin && (
												<TouchableOpacity style={[styles.btnExcluirHistorico, { flex: 1, paddingVertical: 10 }]} onPress={() => excluirChecklistAntigo(h.chec_nb_id)}>
													<Feather name="trash-2" size={14} color="#fff" />
													<Text style={styles.btnExcluirHistoricoText} numberOfLines={1}>Excluir</Text>
												</TouchableOpacity>
											)}
										</View>
									</View>
								);
							})}
						</View>
					)}

					{idChecklistAtivo && (
						<>
							<View style={{ flexDirection: 'row', marginBottom: 20 }}>
								<TouchableOpacity style={[styles.btnVoltarBranco, { flex: 1, marginRight: (veiculo?.tipo?.trim().toLowerCase() === 'cavalo' || veiculo?.veic_tx_tipo?.trim().toLowerCase() === 'cavalo') ? 10 : 0 }]} onPress={fecharChecklistAtivo}>
									<Feather name="arrow-left" size={16} color="#333" />
									<Text style={styles.btnVoltarBrancoText}>Voltar</Text>
								</TouchableOpacity>

								{(veiculo?.tipo?.trim().toLowerCase() === 'cavalo' || veiculo?.veic_tx_tipo?.trim().toLowerCase() === 'cavalo') && !isModoIsolado && (
									<TouchableOpacity style={[styles.btnImplemento, { flex: 1 }]} onPress={() => abrirBuscaDinamica('implemento')}>
										<Feather name="link" size={18} color="#fff" />
										<Text style={styles.btnImplementoText}>Implemento</Text>
									</TouchableOpacity>
								)}
							</View>

							<View style={styles.chassiContainer}>
								<Text style={styles.sectionTitle}>Mapeamento de Pneus</Text>
								<ChassiCaminhao veiculos={[veiculo, ...implementos]} dadosPneus={dadosPneusComPendencia} onPneuPress={handlePneuClick} startingAxleOffset={offsetEixos} startingEstepeOffset={offsetEstepes} />
							</View>

							{pneusRecusados.length > 0 && (
								<View style={styles.recusadosContainer}>
									<View style={styles.recusadosHeader}>
										<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
											<Feather name="alert-triangle" size={20} color="#C62828" />
											<Text style={styles.recusadosTitle}>Pneus Recusados</Text>
										</View>
										<View style={styles.recusadosBadge}>
											<Text style={styles.recusadosBadgeText}>{pneusRecusados.length}</Text>
										</View>
									</View>

									<Text style={styles.recusadosDescricao}>
										Pneus retirados deste checklist por motivo de recusa. O histórico permanece salvo e o laudo pode ser emitido a qualquer momento.
									</Text>

									{pneusRecusados.map((pneu: any, index: number) => {
										const posicao = pneu.laud_tx_posicao || pneu.pneu_tx_posicao || '--';
										const serie = pneu.pneu_tx_serie || 'S/A';
										const marcaModelo = [pneu.pneu_tx_marca, pneu.pneu_tx_modelo].filter(Boolean).join(' / ');

										return (
											<View key={`recusado_${pneu.laud_nb_id || pneu.pneu_nb_id || index}`} style={styles.recusadoCard}>
												<View style={{ flex: 1, paddingRight: 10 }}>
													<Text style={styles.recusadoPosicao}>Posição {posicao}</Text>
													<Text style={styles.recusadoInfo}>Série: {serie}</Text>
													{!!marcaModelo && <Text style={styles.recusadoInfo}>{marcaModelo}</Text>}
													<Text style={styles.recusadoMotivo} numberOfLines={3}>
														Motivo: {pneu.laud_tx_motivo || pneu.pneu_tx_situacao || 'Não informado'}
													</Text>
												</View>

												<TouchableOpacity style={styles.btnLaudoRecusado} onPress={() => imprimirLaudoPneuRecusado(pneu)}>
													<Feather name="printer" size={16} color="#fff" />
													<Text style={styles.btnLaudoRecusadoText}>Laudo</Text>
												</TouchableOpacity>
											</View>
										);
									})}
								</View>
							)}
							<View style={{ height: 40 }} />
						</>
					)}
				</ScrollView>
			)}

			<Modal visible={modalNovoChecklist} transparent={true} animationType="fade" onRequestClose={() => setModalNovoChecklist(false)}>
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

			<Modal visible={modalPneuVisible} animationType="slide" onRequestClose={() => setModalPneuVisible(false)}>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: '#fff' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalPneuVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
						<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
						<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}><Feather name="power" size={22} color="#fff" /></TouchableOpacity>
					</View>

					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
						<Text style={styles.groupTitle}>Identificação do Pneu</Text>
						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Referência</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('referencia_pneu')}>
									<Text style={{ color: formPneu.referencia_nome ? '#000' : '#999' }}>{formPneu.referencia_nome || 'Selecionar...'}</Text>
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
											setFormPneu({ ...formPneu, tipo: v || 'Novo', grau: '', banda: '', banda_nome: '', reformador: '', reformador_id: '', mm_original: (formPneu.modelo || formPneu.banda) ? (formPneu.ref_mm_original || formPneu.mm_original) : '', valor: valorPodeEditar ? ((formPneu.modelo || formPneu.banda) ? (formPneu.ref_valor || formPneu.valor) : '') : formPneu.valor });
										} else {
											setFormPneu({ ...formPneu, tipo: v });
										}
									}}
									items={[{ label: 'Novo', value: 'Novo', color: '#000' }, { label: 'Reformado', value: 'Reformado', color: '#000' }]}
									style={pickerStyles} useNativeAndroidPickerStyle={false} Icon={PickerIcon}
								/>
							</View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Marca</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('marca_pneu')}>
									<Text style={{ color: formPneu.marca ? '#000' : '#000', fontSize: 13 }}>{formPneu.marca || 'Buscar...'}</Text>
									<Feather name="search" size={14} color="#000" />
								</TouchableOpacity>
							</View>
							<View style={styles.inputGroupH}>
								<Text style={styles.label}>Modelo</Text>
								<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('modelo_pneu')}>
									<Text style={{ color: formPneu.modelo ? '#000' : '#000', fontSize: 13 }}>{formPneu.modelo || 'Buscar...'}</Text>
									<Feather name="search" size={14} color="#000" />
								</TouchableOpacity>
							</View>
						</View>

						{formPneu.tipo === 'Reformado' && (
							<>
								<View style={[styles.row, { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 15 }]}>
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
								</View>
								<View style={{ width: '100%', marginBottom: 15 }}>
									<Text style={styles.label}>Reformador</Text>
									<TouchableOpacity style={styles.fakeInput} onPress={() => abrirBuscaDinamica('reformador')}>
										<Text style={{ color: formPneu.reformador ? '#000' : '#999' }}>{formPneu.reformador || 'Selecionar...'}</Text>
										{formPneu.reformador ? (<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, reformador: '', reformador_id: '' })}><Feather name="x-circle" size={18} color="#E53935" /></TouchableOpacity>) : (<Feather name="search" size={16} color="#999" />)}
									</TouchableOpacity>
								</View>
							</>
						)}

						<Text style={styles.groupTitle}>Especificações</Text>
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
							<Text style={styles.label}>Ferro</Text>
							<TextInput style={styles.inputModal} value={formPneu.ferro} onChangeText={t => setFormPneu({ ...formPneu, ferro: t })} />
						</View>

						<Text style={styles.groupTitle}>Aferições</Text>
						<View style={{ width: '100%', marginBottom: 15 }}>
							<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
								<Text style={[styles.label, { marginBottom: 0 }]}>Valor (R$)</Text>
								{!valorPodeEditar && (<View style={{ flexDirection: 'row', alignItems: 'center' }}><Feather name="lock" size={12} color="#777" /><Text style={{ fontSize: 11, color: '#777', marginLeft: 4 }}>Já registrado</Text></View>)}
							</View>
							<TextInput style={[styles.inputModal, !valorPodeEditar && { backgroundColor: '#eee', color: '#666' }]} keyboardType="numeric" value={formPneu.valor} onChangeText={t => { if (valorPodeEditar) setFormPneu({ ...formPneu, valor: formatarMoeda(t) }); }} placeholder="0,00" editable={valorPodeEditar} />
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Sulco Orig. (mm)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={formPneu.mm_original} onChangeText={t => setFormPneu({ ...formPneu, mm_original: t.replace(',', '.') })} /></View>
							<View style={styles.inputGroupH}><Text style={styles.label}>* Sulco Atual (mm)</Text><TextInput style={styles.inputModal} keyboardType="numeric" value={formPneu.milimetros} onChangeText={t => setFormPneu({ ...formPneu, milimetros: t.replace(',', '.') })} /></View>
						</View>

						<View style={styles.row}>
							<View style={styles.inputGroupH}><Text style={styles.label}>Calib. Padrão (Lbs)</Text><TextInput style={[styles.inputModal, { backgroundColor: '#eee' }]} editable={false} keyboardType="numeric" value={formPneu.pressao_padrao} onChangeText={t => setFormPneu({ ...formPneu, pressao_padrao: t })} /></View>
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
								<Text style={{ color: formPneu.motivo_recusa ? '#000' : '#999' }}>{formPneu.motivo_recusa || 'Selecionar...'}</Text>
								{formPneu.motivo_recusa ? (<TouchableOpacity onPress={() => setFormPneu({ ...formPneu, motivo_recusa: '' })}><Feather name="x-circle" size={18} color="#E53935" /></TouchableOpacity>) : (<Feather name="search" size={16} color="#999" />)}
							</TouchableOpacity>
						</View>

						<Text style={styles.label}>Observações (Opcional)</Text>
						<TextInput style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} multiline={true} value={formPneu.observacao} onChangeText={t => setFormPneu({ ...formPneu, observacao: t })} placeholder="Alguma nota sobre este pneu..." />

						<View style={{ flexDirection: 'row', gap: 10 }}>
							<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={tirarFotoPneu}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Feather name="camera" size={20} color="#666" /><Text style={styles.btnFotoText}>Câmera</Text></View></TouchableOpacity>
							<TouchableOpacity style={[styles.btnFoto, { flex: 1 }]} onPress={escolherFotoGaleria}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Feather name="image" size={20} color="#666" /><Text style={styles.btnFotoText}>Galeria</Text></View></TouchableOpacity>
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

						{pneuPodeSerRetirado && !isSomenteLeitura && !formPneu.motivo_recusa && (historico.findIndex(h => Number(h.chec_nb_id) === Number(idChecklistAtivo)) <= 0) && (
							<TouchableOpacity style={[styles.btnRetirarPneu, { marginTop: 20 }]} disabled={isRetirandoPneu} onPress={() => retirarPneu(pneuSelecionado, dadosPneus[pneuSelecionado]?.dados_completos || formPneu)}>
								{isRetirandoPneu ? <ActivityIndicator color="#fff" /> : <><Feather name="log-out" size={18} color="#fff" /><Text style={styles.btnRetirarPneuText}>Retirar Pneu</Text></>}
							</TouchableOpacity>
						)}

						<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
							<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalPneuVisible(false)}><Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Voltar</Text></TouchableOpacity>
							{formPneu.id ? (
								<TouchableOpacity style={[styles.btnImprimir, { flex: 1.2, height: 50, paddingHorizontal: 2 }]} onPress={async () => {
									try {
										const url = await gerarLinkRelatorio('imprimir_pneu.php', { id: formPneu.id, _ts: Date.now() });
										abrirModalPreview(url, `Laudo_Pneu_${formPneu.id}`, 'Laudo Técnico de Pneu', `Pneu Referência #${formPneu.id}`);
									} catch (e: any) { Alert.alert('Erro', 'Não foi possível gerar o link.'); }
								}}><Feather name="download" size={16} color="#fff" /><Text style={[styles.btnImprimirText, { fontSize: 13, marginLeft: 5 }]}>Exportar</Text></TouchableOpacity>
							) : null}
							<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.2, marginTop: 0, height: 50 }]} onPress={salvarAfericaoPneu} disabled={isSaving}>
								{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
							</TouchableOpacity>
						</View>
					</ScrollView>

					{fotoAmpliada && (
						<View style={styles.fullScreenOverlay}>
							<TouchableOpacity style={styles.closeFullBtn} onPress={() => setFotoAmpliada(null)}><Feather name="x-circle" size={36} color="#fff" /></TouchableOpacity>
							<Image source={{ uri: fotoAmpliada }} style={styles.fullScreenImage} resizeMode="contain" />
						</View>
					)}

					<ModalBuscaDinamica
						visible={modalBuscaVisible}
						onClose={() => setModalBuscaVisible(false)}
						titulo="Pesquisar..."
						dados={resultadosBusca}
						onSelect={selecionarItemBusca}
						isLoading={isSearching}
						onSearchChange={(t) => buscarDinamicaNoBanco(tipoBusca, t)}
					/>

					<ModalFormularioSimples
						visible={modalCadastroVisible}
						onClose={() => setModalCadastroVisible(false)}
						onSave={salvarCadastroDinamico}
						titulo={`Cadastrar ${tipoBusca === 'banda' ? 'Banda' : tipoBusca === 'referencia_pneu' ? 'Referência' : tipoBusca === 'marca_pneu' ? 'Marca' : tipoBusca === 'motivo_laudo' ? 'Motivo' : tipoBusca === 'reformador' ? 'Reformador' : 'Modelo'}`}
						campos={getCamposCadastroDinamico()}
						valores={formCadastro}
						onChangeValor={(chave, valor) => setFormCadastro({ ...formCadastro, [chave]: valor })}
						isLoading={isCadastrando}
					/>

				</KeyboardAvoidingView>
			</Modal>

			<Modal visible={modalViewPneuVisible} animationType="slide" onRequestClose={() => setModalViewPneuVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalViewPneuVisible(false)} style={{ padding: 5 }}><Feather name="arrow-left" size={24} color="#fff" /></TouchableOpacity>
						<Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Relatório do Pneu</Text>
						<View style={{ width: 30 }} />
					</View>

					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
						{(() => {
							const db = viewData.dbData || {};
							const mmOrig = getFloatDb(db.pneu_tx_mmOriginal);
							const mmAtual = getFloatDb(db.pneu_tx_milimetros);
							const valor = getFloatDb(db.valor_carregado ?? db.pneu_tx_valor);
							const mmGastos = (mmOrig > 0 && mmAtual >= 0 && mmOrig > mmAtual) ? (mmOrig - mmAtual) : 0;
							const kmRodado = getFloatDb(db.km_rodado || db.pneu_tx_kmRodado || db.pneu_tx_km);
							const cpm = mmOrig > 0 ? (valor / mmOrig) : 0;
							const cpk = kmRodado > 0 ? (valor / kmRodado) * 1000 : 0;
							const kpm = mmGastos > 0 ? (kmRodado / mmGastos) : 0;
							const valorResidual = mmAtual * cpm;
							const isSucata = !!db.laud_tx_motivo || !!db.motivo_recusa;

							return (
								<>
									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Identificação Principal</Text>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>Posição:</Text><Text style={styles.reportValue}>{viewData.codigoPneu}</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>Série / Fogo:</Text><Text style={styles.reportValue}>{db.pneu_tx_serie || 'N/A'} {db.pneu_tx_ferro ? `(F: ${db.pneu_tx_ferro})` : ''}</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>Marca / Modelo:</Text><Text style={styles.reportValue}>{db.pneu_tx_marca || '--'} / {db.pneu_tx_modelo || '--'}</Text></View>
									</View>

									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Aferições de Desgaste</Text>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>mm Original:</Text><Text style={styles.reportValue}>{mmOrig.toFixed(1)} mm</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>mm Atual:</Text><Text style={[styles.reportValue, { color: mmAtual <= 2 && mmAtual > 0 ? '#E53935' : '#28a745' }]}>{mmAtual.toFixed(1)} mm</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>mm Gastos:</Text><Text style={styles.reportValue}>{mmGastos.toFixed(1)} mm</Text></View>
									</View>

									<View style={styles.reportBox}>
										<Text style={styles.groupTitle}>Indicadores de Performance</Text>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>Valor:</Text><Text style={styles.reportValue}>R$ {valor.toFixed(2).replace('.', ',')}</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>CPM (Custo/mm):</Text><Text style={styles.reportValue}>R$ {cpm.toFixed(2).replace('.', ',')}</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>CPK (Custo/Km):</Text><Text style={[styles.reportValue, { color: '#E53935' }]}>{kmRodado > 0 ? `R$ ${cpk.toFixed(4).replace('.', ',')} / 1000Km` : 'N/D'}</Text></View>
										<View style={styles.reportRow}><Text style={styles.reportLabel}>KPM (Km/mm):</Text><Text style={[styles.reportValue, { color: '#0c6ead' }]}>{kmRodado > 0 ? `${kpm.toFixed(0)} Km/mm` : 'N/D'}</Text></View>
									</View>

									{valorResidual > 0 && (
										<View style={[styles.reportBox, { borderColor: isSucata ? '#E53935' : '#f39c12', borderWidth: 1 }]}>
											<Text style={[styles.groupTitle, { color: isSucata ? '#E53935' : '#f39c12', borderBottomWidth: 0, marginBottom: 5 }]}>{isSucata ? 'Prejuízo Calculado (Sucata)' : 'Valor Residual da Borracha'}</Text>
											<Text style={{ color: isSucata ? '#E53935' : '#f39c12', fontWeight: 'bold', fontSize: 18 }}>R$ {valorResidual.toFixed(2).replace('.', ',')}</Text>
										</View>
									)}

									{!isSomenteLeitura && (historico.findIndex(h => Number(h.chec_nb_id) === Number(idChecklistAtivo)) <= 0) && (
										<View style={{ marginTop: 20, gap: 10 }}>
											<TouchableOpacity style={styles.btnSalvar} onPress={() => { setModalViewPneuVisible(false); abrirEdicaoPneu(viewData.codigoPneu, viewData.dbData); }}>
												<Feather name="edit-2" size={18} color="#fff" style={{ marginRight: 8 }} />
												<Text style={styles.btnSalvarText}>Editar</Text>
											</TouchableOpacity>
											{!isSucata && (
												<TouchableOpacity style={styles.btnRetirarPneu} disabled={isRetirandoPneu} onPress={() => retirarPneu(viewData.codigoPneu, viewData.dbData)}>
													{isRetirandoPneu ? <ActivityIndicator color="#fff" /> : <><Feather name="log-out" size={18} color="#fff" /><Text style={styles.btnRetirarPneuText}>Retirar Pneu</Text></>}
												</TouchableOpacity>
											)}
										</View>
									)}
								</>
							);
						})()}
					</ScrollView>
				</View>
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
	container: { flex: 1, backgroundColor: '#f4f6f8', paddingHorizontal: 20 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
	veiculoCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 2 },
	veiculoHeader: { borderBottomWidth: 1, borderColor: '#eee', paddingBottom: 10 },
	placaText: { fontSize: 24, fontWeight: '900', color: '#333', marginLeft: 10, letterSpacing: 1 },
	chipImplemento: { flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 5, backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
	btnVoltarBranco: { backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
	btnVoltarBrancoText: { color: '#333', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnImplemento: { backgroundColor: '#f39c12', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8 },
	btnImplementoText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnNovoChecklist: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 8 },
	btnNovoChecklistText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	itemHistorico: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	btnModificarHistorico: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnModificarHistoricoText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	btnImprimirHistorico: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnImprimirHistoricoText: { color: '#333', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	chassiContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 20, alignItems: 'center', elevation: 3 },
	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 99999 },
	modalSmall: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
	modalHeaderFullScreen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0c6ead', paddingHorizontal: 15, paddingBottom: 15, paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50), elevation: 4 },
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },
	btnRemoveFoto: { position: 'absolute', top: -10, right: -10, backgroundColor: '#E53935', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, elevation: 5 },
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	fakeInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
	btnIniciar: { backgroundColor: '#63c77b', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
	btnSalvarText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
	btnRetirarPneu: { backgroundColor: '#E53935', flexDirection: 'row', padding: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
	btnRetirarPneuText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnImprimir: { backgroundColor: '#3276b1', flexDirection: 'row', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 0 },
	btnImprimirText: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },
	btnFoto: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, paddingVertical: 15, backgroundColor: '#f9f9f9' },
	btnFotoText: { marginLeft: 10, color: '#666', fontWeight: 'bold' },
	fotoContainer: { marginRight: 15, marginTop: 10, position: 'relative' },
	fotoPreview: { width: 100, height: 100, borderRadius: 8 },
	recusadosContainer: { backgroundColor: '#fff', borderRadius: 12, marginTop: 15, padding: 15, elevation: 2, borderWidth: 1, borderColor: '#ffcdd2' },
	recusadosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
	recusadosTitle: { color: '#C62828', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
	recusadosBadge: { minWidth: 28, height: 28, paddingHorizontal: 8, borderRadius: 14, backgroundColor: '#ffebee', alignItems: 'center', justifyContent: 'center' },
	recusadosBadgeText: { color: '#C62828', fontSize: 13, fontWeight: 'bold' },
	recusadosDescricao: { color: '#666', fontSize: 12, lineHeight: 17, marginBottom: 12 },
	recusadoCard: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f5d7d9', paddingVertical: 12 },
	recusadoPosicao: { color: '#333', fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
	recusadoInfo: { color: '#666', fontSize: 12, marginTop: 2 },
	recusadoMotivo: { color: '#C62828', fontSize: 12, fontWeight: '600', marginTop: 5, lineHeight: 16 },
	btnLaudoRecusado: { backgroundColor: '#C62828', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, height: 40, borderRadius: 8 },
	btnLaudoRecusadoText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	fullScreenOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 99999, elevation: 99999 },
	closeFullBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 100000, elevation: 100000, padding: 10 },
	fullScreenImage: { width: '100%', height: '80%' },
	btnExcluirHistorico: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
	btnExcluirHistoricoText: { color: '#fff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	reportBox: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 15, elevation: 2 },
	reportRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#f0f0f0' },
	reportLabel: { fontSize: 14, color: '#666' },
	reportValue: { fontSize: 15, fontWeight: 'bold', color: '#333' },
});