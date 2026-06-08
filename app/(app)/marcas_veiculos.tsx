import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import LogoSolutires from '../../assets/images/solutires.png';
import { useAuth } from '../../contexts/AuthContext';

interface MarcaVeiculo {
	id: number;
	nome: string;
	total_modelos?: number;
}

export default function MarcasVeiculosScreen() {
	const router = useRouter();
	const { user, signOut } = useAuth();

	const [marcas, setMarcas] = useState<MarcaVeiculo[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroMarca, setFiltroMarca] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [form, setForm] = useState({ id: '', nome: '' });

	const [modalModelosVisible, setModalModelosVisible] = useState(false);
	const [marcaSelecionada, setMarcaSelecionada] = useState<MarcaVeiculo | null>(null);
	const [modelos, setModelos] = useState<any[]>([]);
	const [isLoadingModelos, setIsLoadingModelos] = useState(false);
	const [formModelo, setFormModelo] = useState({ id: '', nome: '' });

	const confirmSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem certeza que deseja sair do aplicativo?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	useEffect(() => {
		carregarMarcas();
	}, []);

	const carregarMarcas = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar_marcas', busca: filtroMarca })
			});
			const res = await response.json();

			if (res && res.success) {
				setMarcas(res.data);
			} else {
				setMarcas([]);
			}
		} catch (error) {
			setMarcas([]);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setForm({ id: '', nome: '' });
		setIsEditing(false);
	};

	const handleEditar = (item: MarcaVeiculo) => {
		setForm({ id: item.id.toString(), nome: item.nome });
		setIsEditing(true);
		setModalVisible(true);
	};

	const handleSalvar = async () => {
		if (!form.nome.trim()) {
			Alert.alert('Atenção', 'O nome da marca é obrigatório.');
			return;
		}
		setIsSaving(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					acao: form.id ? 'editar_marca' : 'inserir_marca',
					id: form.id,
					nome: form.nome.trim().toUpperCase()
				})
			});
			const res = await response.json();
			if (res && res.success) {
				Alert.alert('Sucesso', `Marca ${isEditing ? 'atualizada' : 'salva'} com sucesso!`);
				setModalVisible(false);
				carregarMarcas();
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar a marca.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleExcluir = (item: MarcaVeiculo) => {
		Alert.alert(
			'Excluir Marca',
			`Tem certeza que deseja excluir a marca "${item.nome}"?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						try {
							const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ acao: 'excluir_marca', id: item.id })
							});
							const res = await response.json();

							if (res && res.success) {
								Alert.alert('Sucesso', 'Marca excluída com sucesso.');
								carregarMarcas();
							} else {
								Alert.alert('Erro', res.message || 'Falha ao excluir a marca.');
							}
						} catch (error) {
							Alert.alert('Erro', 'Falha na conexão com o servidor.');
						}
					}
				}
			]
		);
	};

	const abrirModelos = (marca: MarcaVeiculo) => {
		setMarcaSelecionada(marca);
		setFormModelo({ id: '', nome: '' });
		setModalModelosVisible(true);
		carregarModelos(marca.id);
	};

	const carregarModelos = async (marca_id: number) => {
		setIsLoadingModelos(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ acao: 'listar_modelos', marca_id: marca_id })
			});
			const res = await response.json();
			if (res && res.success) {
				setModelos(res.data);
			} else {
				setModelos([]);
			}
		} catch (error) {
			setModelos([]);
		} finally {
			setIsLoadingModelos(false);
		}
	};

	const salvarModelo = async () => {
		if (!formModelo.nome.trim()) {
			Alert.alert('Atenção', 'O nome do modelo é obrigatório.');
			return;
		}
		setIsSaving(true);
		try {
			const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					acao: formModelo.id ? 'editar_modelo' : 'inserir_modelo',
					id: formModelo.id,
					marca_id: marcaSelecionada?.id,
					nome: formModelo.nome.trim().toUpperCase()
				})
			});
			const res = await response.json();
			if (res && res.success) {
				setFormModelo({ id: '', nome: '' });
				carregarModelos(marcaSelecionada!.id);
				carregarMarcas();
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar o modelo.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			setIsSaving(false);
		}
	};

	const excluirModelo = (modelo: any) => {
		Alert.alert(
			'Excluir Modelo',
			`Tem certeza que deseja excluir o modelo "${modelo.nome}"?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						try {
							const response = await fetch('https://sistemascactus.com/apicactus/akipneus/api_marcas_modelos_veiculos.php', {
								method: 'POST',
								headers: { 'Content-Type': 'application/json' },
								body: JSON.stringify({ acao: 'excluir_modelo', id: modelo.id })
							});
							const res = await response.json();

							if (res && res.success) {
								carregarModelos(marcaSelecionada!.id);
								carregarMarcas();
							} else {
								Alert.alert('Erro', res.message || 'Falha ao excluir o modelo.');
							}
						} catch (error) {
							Alert.alert('Erro', 'Falha na conexão.');
						}
					}
				}
			]
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={marcas}
				keyExtractor={(item, index) => String(item?.id || index)}
				contentContainerStyle={{ paddingBottom: 40 }}
				ListHeaderComponent={
					<View style={styles.filterSection}>
						<Text style={styles.sectionTitle}>Filtrar Marcas de Veículos</Text>

						<View style={styles.inputGroupFull}>
							<Text style={styles.label}>Nome da Marca</Text>
							<TextInput
								style={styles.input}
								placeholder="Ex: VOLVO, SCANIA..."
								value={filtroMarca}
								onChangeText={setFiltroMarca}
								autoCapitalize="characters"
							/>
						</View>

						<View style={styles.actionRow}>
							<TouchableOpacity style={styles.btnBuscar} onPress={carregarMarcas}>
								<Feather name="search" size={18} color="#fff" />
								<Text style={styles.btnText}>Buscar</Text>
							</TouchableOpacity>

							<TouchableOpacity style={styles.btnInserir} onPress={() => { resetForm(); setModalVisible(true); }}>
								<Feather name="plus-circle" size={18} color="#ffffff" />
								<Text style={styles.btnInserirText}>Inserir</Text>
							</TouchableOpacity>
						</View>

						<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>
							Marcas Cadastradas ({marcas.length})
						</Text>
					</View>
				}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
								<Feather name="tag" size={20} color="#0c6ead" style={{ marginRight: 10 }} />
								<Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
							</View>
							{item.total_modelos !== undefined && (
								<View style={styles.statusBadge}>
									<Text style={styles.statusText}>{item.total_modelos} modelos</Text>
								</View>
							)}
						</View>

						<View style={styles.cardActions}>
							<View style={styles.actionButtonsRow}>
								{/* AQUI FOI ALTERADO PARA ABRIR O GERENCIADOR DE MODELOS */}
								<TouchableOpacity style={styles.btnModelosCard} onPress={() => abrirModelos(item)}>
									<Feather name="list" size={14} color="#ffffff" />
									<Text style={styles.btnModelosCardText}>Modelos</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnEditarCard} onPress={() => handleEditar(item)}>
									<Feather name="edit-2" size={14} color="#ffffff" />
									<Text style={styles.btnEditarCardText}>Editar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={styles.btnExcluirCard} onPress={() => handleExcluir(item)}>
									<Feather name="trash-2" size={14} color="#ffffff" />
									<Text style={styles.btnExcluirCardText}>Excluir</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				ListEmptyComponent={
					!isLoading ? (
						<Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>
							Nenhuma marca encontrada.
						</Text>
					) : null
				}
			/>

			{isLoading && (
				<ActivityIndicator size="large" color="#0c6ead" style={{ position: 'absolute', top: '50%', alignSelf: 'center' }} />
			)}

			{/* MODAL DE MARCAS */}
			<Modal visible={modalVisible} animationType="slide" transparent={false}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFullScreen}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<TouchableOpacity onPress={confirmSignOut} style={{ padding: 5 }}>
								<Feather name="power" size={22} color="#fff" />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 150 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{isEditing ? 'Alterar Marca de Veículo' : 'Nova Marca de Veículo'}</Text>
							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>Nome da Marca *</Text>
								<TextInput
									style={styles.inputModal}
									value={form.nome}
									onChangeText={t => setForm({ ...form, nome: t })}
									placeholder="Ex: MERCEDES-BENZ, SCANIA, VOLVO..."
									autoCapitalize="characters"
									autoFocus={true}
								/>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 20, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1 }]} onPress={() => setModalVisible(false)}>
									<Text style={styles.btnTextCancel}>Voltar</Text>
								</TouchableOpacity>
								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5 }]} onPress={handleSalvar} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>

			{/* MODAL DE MODELOS */}
			<Modal visible={modalModelosVisible} animationType="slide" transparent={false}>
				<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
					<View style={styles.modalHeaderFullScreen}>
						<TouchableOpacity onPress={() => setModalModelosVisible(false)} style={{ padding: 5 }}>
							<Feather name="arrow-left" size={24} color="#fff" />
						</TouchableOpacity>
						<Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
							Modelos: {marcaSelecionada?.nome}
						</Text>
						<View style={{ width: 30 }} />
					</View>

					<View style={{ padding: 20, flex: 1 }}>
						{/* Barra de Inserção de Modelos */}
						<View style={{ flexDirection: 'row', marginBottom: 20 }}>
							<TextInput
								style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: '#fff', height: 50 }]}
								placeholder="Nome do Modelo..."
								value={formModelo.nome}
								onChangeText={t => setFormModelo({ ...formModelo, nome: t })}
								autoCapitalize="characters"
							/>
							<TouchableOpacity
								style={{ backgroundColor: formModelo.id ? '#0c6ead' : '#63c77b', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, borderRadius: 8, marginLeft: 10 }}
								onPress={salvarModelo}
								disabled={isSaving}
							>
								{isSaving ? <ActivityIndicator color="#fff" /> : <Feather name={formModelo.id ? "check" : "plus"} size={22} color="#fff" />}
							</TouchableOpacity>
							{formModelo.id ? (
								<TouchableOpacity
									style={{ backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15, borderRadius: 8, marginLeft: 10 }}
									onPress={() => setFormModelo({ id: '', nome: '' })}
								>
									<Feather name="x" size={22} color="#fff" />
								</TouchableOpacity>
							) : null}
						</View>

						{/* Listagem de Modelos */}
						{isLoadingModelos ? (
							<ActivityIndicator size="large" color="#0c6ead" style={{ marginTop: 20 }} />
						) : (
							<FlatList
								data={modelos}
								keyExtractor={item => String(item.id)}
								contentContainerStyle={{ paddingBottom: 40 }}
								renderItem={({ item }) => (
									<View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, alignItems: 'center', elevation: 1 }}>
										<Text style={{ flex: 1, fontSize: 15, fontWeight: 'bold', color: '#333' }}>{item.nome}</Text>
										<TouchableOpacity style={{ padding: 8, marginRight: 10 }} onPress={() => setFormModelo({ id: item.id.toString(), nome: item.nome })}>
											<Feather name="edit-2" size={18} color="#0c6ead" />
										</TouchableOpacity>
										<TouchableOpacity style={{ padding: 8 }} onPress={() => excluirModelo(item)}>
											<Feather name="trash-2" size={18} color="#E53935" />
										</TouchableOpacity>
									</View>
								)}
								ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>Nenhum modelo cadastrado para esta marca.</Text>}
							/>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	inputGroupFull: { width: '100%' },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },

	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 10 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333', flex: 1 },
	statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#e8f5e9' },
	statusText: { fontSize: 12, fontWeight: 'bold', color: '#28a745' },

	cardActions: { padding: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fafafa' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%', gap: 6 },

	btnModelosCard: { backgroundColor: '#f39c12', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnModelosCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	btnEditarCard: { backgroundColor: '#0c6ead', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 12 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

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
	btnTextCancel: { color: '#333', fontWeight: 'bold', fontSize: 15 },
});