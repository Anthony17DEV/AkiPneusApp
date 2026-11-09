import { Feather } from '@expo/vector-icons';
import { apiService } from '@src/services/apiService';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CabecalhoListagem } from '../../src/components/CabecalhoListagem';
import { ModalFormularioSimples } from '../../src/components/ModalFormularioSimples';

interface Referencia {
	id: number;
	nome: string;
	qtd_marcas: number;
}

export default function ReferenciasScreen() {
	const router = useRouter();
	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [referencias, setReferencias] = useState<Referencia[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [filtroBusca, setFiltroBusca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState({ nomeAntigo: '', nomeNovo: '' });

	const carregarReferencias = async () => {
		setIsLoading(true);
		try {
			const res = await apiService.listarReferencias(filtroBusca);
			if (!isMounted.current) return;
			if (res && res.success) {
				setReferencias(res.data || []);
			} else {
				setReferencias([]);
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao buscar as referências.');
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		carregarReferencias();
	}, []);

	const resetForm = () => {
		setForm({ nomeAntigo: '', nomeNovo: '' });
		setModalVisible(true);
	};

	const editarReferencia = (item: Referencia) => {
		setForm({ nomeAntigo: item.nome, nomeNovo: item.nome });
		setModalVisible(true);
	};

	const salvarReferencia = async () => {
		if (!form.nomeNovo.trim()) {
			Alert.alert('Atenção', 'O nome da referência é obrigatório.');
			return;
		}

		const nomeUpper = form.nomeNovo.trim().toUpperCase();
		const duplicado = referencias.find(r => r.nome.toUpperCase() === nomeUpper && r.nome.toUpperCase() !== form.nomeAntigo.toUpperCase());

		if (duplicado) {
			Alert.alert('Atenção', 'Esta referência já está cadastrada no sistema!');
			return;
		}

		setIsSaving(true);
		const acao = form.nomeAntigo ? 'atualizar' : 'inserir';

		try {
			const response = await apiService.salvarReferencia({ acao, nomeAntigo: form.nomeAntigo, nome: form.nomeNovo });
			let res = response;

			if (typeof res === 'string') {
				try { res = JSON.parse(res); } catch (e) { res = { success: true }; }
			}

			if (!isMounted.current) return;

			if (res && (res.success === true || res.success === 1 || res.success === 'true')) {
				Alert.alert('Sucesso', res.message || 'Salvo com sucesso!');
				setModalVisible(false);
				carregarReferencias();
			} else {
				Alert.alert('Atenção', res?.message || 'Falha ao salvar referência.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const excluirReferencia = (nome: string) => {
		Alert.alert('Excluir Referência', `Tem certeza que deseja excluir a referência "${nome}"?\nTodos os modelos associados a ela poderão ficar inacessíveis.`, [
			{ text: 'Cancelar', style: 'cancel' },
			{
				text: 'Excluir', style: 'destructive', onPress: async () => {
					try {
						const response = await apiService.excluirReferencia(nome);
						let res = response;

						if (typeof res === 'string') {
							try { res = JSON.parse(res); } catch (e) { res = { success: true }; }
						}

						if (!isMounted.current) return;
						if (res && (res.success === true || res.success === 1 || res.success === 'true')) {
							Alert.alert('Sucesso', 'Referência excluída com sucesso.');
							carregarReferencias();
						} else {
							Alert.alert('Erro', res?.message || 'Falha ao excluir.');
						}
					} catch (error) {
						if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
					}
				}
			}
		]);
	};
	return (
		<View style={styles.container}>

			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Gerenciar Referências</Text>

				{/* Cabeçalho de Listagem Reutilizável */}
				<CabecalhoListagem
					busca={filtroBusca}
					setBusca={setFiltroBusca}
					onBuscar={carregarReferencias}
					onInserir={resetForm}
					labelPesquisa="Buscar Referência"
					placeholderPesquisa="Buscar referência..."
					textoBotaoNovo="Inserir Referência"
				/>

				<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>Resultados ({referencias.length})</Text>
			</View>

			{isLoading && referencias.length === 0 ? (
				<View style={{ paddingVertical: 40, alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0c6ead" />
					<Text style={{ marginTop: 10, color: '#666' }}>Buscando...</Text>
				</View>
			) : (
				<FlatList
					data={referencias}
					keyExtractor={(item, index) => String(item?.id || index)}

					initialNumToRender={12}
					maxToRenderPerBatch={12}
					windowSize={5}
					removeClippedSubviews={true}

					contentContainerStyle={{ paddingBottom: 40 }}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={{ flex: 1, paddingRight: 10 }}>
									<Text style={styles.cardTitle} numberOfLines={2}>{item.nome}</Text>
								</View>
								<View style={styles.statusBadge}>
									<Text style={styles.statusText}>{item.qtd_marcas} Marcas</Text>
								</View>
							</View>

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnActionSecondary} onPress={() => router.push({ pathname: '/marcas', params: { referencia_nome: item.nome } })}>
										<Feather name="list" size={14} color="#333" />
										<Text style={styles.btnActionTextSecondary}>Ver Marcas</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarReferencia(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
									</TouchableOpacity>

									<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirReferencia(item.nome)}>
										<Feather name="trash-2" size={14} color="#ffffff" />
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhuma referência encontrada.</Text> : undefined}
				/>
			)}

			{/* Modal de Formulário Simples Reutilizável */}
			<ModalFormularioSimples
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				onSave={salvarReferencia}
				titulo={form.nomeAntigo ? 'Editar Referência' : 'Nova Referência'}
				campos={[{ chave: 'nomeNovo', label: '* Nome da Referência', placeholder: 'Ex: 295/80R22.5' }]}
				valores={{ nomeNovo: form.nomeNovo }}
				onChangeValor={(chave, valor) => setForm({ ...form, nomeNovo: valor })}
				isLoading={isSaving}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
	statusBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
	statusText: { color: '#28a745', fontSize: 11, fontWeight: 'bold' },

	cardActions: { padding: 10, backgroundColor: '#fafafa', alignItems: 'flex-end' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },

	btnActionSecondary: { backgroundColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 8 },
	btnActionTextSecondary: { color: '#333', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	btnEditarCard: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15, marginLeft: 8 },
});