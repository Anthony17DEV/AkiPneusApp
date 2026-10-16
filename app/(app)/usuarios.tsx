import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import { apiService } from '@src/services/apiService';
import LogoSolutires from '../../assets/images/smart_pneus.png';
import { useAuth } from '../../contexts/AuthContext';

interface Usuario {
	id: number;
	nome: string;
	usuario: string;
	email: string;
	perfil: string;
}

export default function UsuariosScreen() {
	const router = useRouter();
	const { signOut } = useAuth();

	const API_URL = 'https://sistemascactus.com/apicactus/akipneus/api_usuarios.php';

	const isMounted = useRef(true);

	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const [usuarios, setUsuarios] = useState<Usuario[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const [filtroBusca, setFiltroBusca] = useState('');
	const [filtroPerfil, setFiltroPerfil] = useState('');

	const [modalVisible, setModalVisible] = useState(false);
	const [mostrarSenha, setMostrarSenha] = useState(false);

	const [form, setForm] = useState({
		id: '',
		nome: '',
		usuario: '',
		email: '',
		senha: '',
		perfil: 'ASSESSOR'
	});

	const carregarUsuarios = async () => {
		setIsLoading(true);
		try {
			const res = await apiService.listarUsuarios(filtroBusca, filtroPerfil);
			if (!isMounted.current) return;

			if (res && res.success) {
				setUsuarios(res.data || []);
			} else {
				setUsuarios([]);
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha ao buscar os utilizadores.');
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	};

	useEffect(() => {
		carregarUsuarios();
	}, []);

	const resetForm = () => {
		setForm({ id: '', nome: '', usuario: '', email: '', senha: '', perfil: 'ASSESSOR' });
		setMostrarSenha(false);
		setModalVisible(true);
	};

	const editarUsuario = (item: Usuario) => {
		setForm({
			id: String(item.id),
			nome: item.nome,
			usuario: item.usuario,
			email: item.email || '',
			senha: '',
			perfil: item.perfil || 'ASSESSOR'
		});
		setMostrarSenha(false);
		setModalVisible(true);
	};

	const salvarUsuario = async () => {
		if (!form.nome.trim() || !form.usuario.trim()) {
			Alert.alert('Atenção', 'Nome e Login são obrigatórios.');
			return;
		}

		if (!form.id && !form.senha.trim()) {
			Alert.alert('Atenção', 'A senha é obrigatória para novos utilizadores.');
			return;
		}

		setIsSaving(true);
		try {
			const payload = {
				acao: form.id ? 'atualizar' : 'inserir',
				...form
			};

			const res = await apiService.salvarUsuario(payload);
			if (!isMounted.current) return;

			if (res && res.success) {
				Alert.alert('Sucesso', form.id ? 'Utilizador atualizado com sucesso!' : 'Utilizador cadastrado com sucesso!');
				setModalVisible(false);
				carregarUsuarios();
			} else {
				Alert.alert('Atenção', res?.message || 'Falha ao salvar utilizador.');
			}
		} catch (error) {
			if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
		} finally {
			if (isMounted.current) setIsSaving(false);
		}
	};

	const excluirUsuario = (id: number, nome: string) => {
		Alert.alert(
			'Excluir Utilizador',
			`Tem certeza que deseja excluir o utilizador "${nome}"?`,
			[
				{ text: 'Cancelar', style: 'cancel' },
				{
					text: 'Excluir', style: 'destructive', onPress: async () => {
						try {
							const res = await apiService.excluirUsuario(id);
							if (!isMounted.current) return;

							if (res && res.success) {
								Alert.alert('Sucesso', 'Utilizador excluído com sucesso.');
								carregarUsuarios();
							} else {
								Alert.alert('Erro', res?.message || 'Falha ao excluir.');
							}
						} catch (error) {
							if (isMounted.current) Alert.alert('Erro', 'Falha na conexão com o servidor.');
						}
					}
				}
			]
		);
	};

	const confirmarSignOut = () => {
		Alert.alert('Sair da Conta', 'Tem a certeza que deseja sair da aplicação?', [
			{ text: 'Cancelar', style: 'cancel' },
			{ text: 'Sair', style: 'destructive', onPress: signOut },
		]);
	};

	return (
		<View style={styles.container}>

			<View style={styles.filterSection}>
				<Text style={styles.sectionTitle}>Gerenciar Utilizadores</Text>

				<View style={styles.inputContainer}>
					<Feather name="search" size={20} color="#999" style={{ marginLeft: 10 }} />
					<TextInput
						style={styles.inputBuscaInterno}
						placeholder="Buscar por nome ou login..."
						value={filtroBusca}
						onChangeText={setFiltroBusca}
						onSubmitEditing={carregarUsuarios}
					/>
				</View>

				<View style={{ marginBottom: 15 }}>
					<RNPickerSelect
						placeholder={{ label: 'Todos os Perfis', value: '', color: '#999' }}
						value={filtroPerfil}
						onValueChange={(v) => setFiltroPerfil(v)}
						items={[
							{ label: 'DIRETORIA', value: 'DIRETORIA' },
							{ label: 'ADMINISTRADOR', value: 'ADMINISTRADOR' },
							{ label: 'ASSESSOR', value: 'ASSESSOR' },
							{ label: 'AFERIDOR', value: 'AFERIDOR' }
						]}
						style={pickerStylesBusca}
						useNativeAndroidPickerStyle={false}
						Icon={() => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />}
					/>
				</View>

				<View style={styles.actionRow}>
					<TouchableOpacity style={styles.btnBuscar} onPress={carregarUsuarios}>
						<Feather name="search" size={18} color="#fff" />
						<Text style={styles.btnText}>Buscar</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnInserir} onPress={resetForm}>
						<Feather name="plus-circle" size={18} color="#ffffff" />
						<Text style={styles.btnInserirText}>Inserir</Text>
					</TouchableOpacity>
				</View>
				<Text style={[styles.sectionTitle, { marginTop: 25, marginBottom: -5 }]}>Resultados ({usuarios.length})</Text>
			</View>

			{isLoading && usuarios.length === 0 ? (
				<View style={{ paddingVertical: 40, alignItems: 'center' }}>
					<ActivityIndicator size="large" color="#0c6ead" />
					<Text style={{ marginTop: 10, color: '#666' }}>Buscando utilizadores...</Text>
				</View>
			) : (
				<FlatList
					data={usuarios}
					keyExtractor={(item, index) => String(item?.id || index)}

					initialNumToRender={10}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}

					contentContainerStyle={{ paddingBottom: 40 }}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={{ flex: 1 }}>
									<Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
									<Text style={styles.cardSubTitle}>Login: {item.usuario}</Text>
								</View>
								<View style={[styles.statusBadge, item.perfil === 'DIRETORIA' || item.perfil === 'ADMINISTRADOR' ? { backgroundColor: '#ffebee' } : {}]}>
									<Text style={[styles.statusText, item.perfil === 'DIRETORIA' || item.perfil === 'ADMINISTRADOR' ? { color: '#E53935' } : {}]}>
										{item.perfil}
									</Text>
								</View>
							</View>
							{item.email ? (
								<View style={styles.cardBody}>
									<Text style={styles.cardText}><Feather name="mail" size={12} /> {item.email}</Text>
								</View>
							) : null}

							<View style={styles.cardActions}>
								<View style={styles.actionButtonsRow}>
									<TouchableOpacity style={styles.btnEditarCard} onPress={() => editarUsuario(item)}>
										<Feather name="edit-2" size={14} color="#ffffff" />
										<Text style={styles.btnEditarCardText}>Editar</Text>
									</TouchableOpacity>

									<TouchableOpacity style={styles.btnExcluirCard} onPress={() => excluirUsuario(item.id, item.nome)}>
										<Feather name="trash-2" size={14} color="#ffffff" />
										<Text style={styles.btnExcluirCardText}>Excluir</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					)}
					ListEmptyComponent={!isLoading ? <Text style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>Nenhum utilizador encontrado.</Text> : null}
				/>
			)}

			<Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
				<View style={{ flex: 1, backgroundColor: '#fff' }}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
						<View style={styles.modalHeaderFull}>
							<TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 5 }}>
								<Feather name="arrow-left" size={24} color="#fff" />
							</TouchableOpacity>
							<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
							<TouchableOpacity onPress={confirmarSignOut} style={{ padding: 5 }}>
								<Feather name="power" size={22} color="#fff" />
							</TouchableOpacity>
						</View>

						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
							<Text style={styles.groupTitle}>{form.id ? 'Editar Utilizador' : 'Novo Utilizador'}</Text>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nome Completo</Text>
								<TextInput
									style={styles.input}
									value={form.nome}
									onChangeText={t => setForm({ ...form, nome: t })}
									placeholder="Ex: João da Silva"
									autoCapitalize="words"
								/>
							</View>

							<View style={styles.row}>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>* Login de Acesso</Text>
									<TextInput
										style={styles.input}
										value={form.usuario}
										onChangeText={t => setForm({ ...form, usuario: t.toLowerCase() })}
										placeholder="Ex: joao.silva"
										autoCapitalize="none"
									/>
								</View>
								<View style={styles.inputGroupH}>
									<Text style={styles.label}>{form.id ? 'Nova Senha (Opcional)' : '* Senha de Acesso'}</Text>
									<View style={styles.passwordContainer}>
										<TextInput
											style={styles.inputPassword}
											value={form.senha}
											onChangeText={t => setForm({ ...form, senha: t })}
											placeholder="******"
											secureTextEntry={!mostrarSenha}
											autoCapitalize="none"
										/>
										<TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeIcon}>
											<Feather name={mostrarSenha ? "eye" : "eye-off"} size={20} color="#999" />
										</TouchableOpacity>
									</View>
								</View>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>E-mail</Text>
								<TextInput
									style={styles.input}
									value={form.email}
									onChangeText={t => setForm({ ...form, email: t })}
									placeholder="joao@empresa.com"
									keyboardType="email-address"
									autoCapitalize="none"
								/>
							</View>

							<View style={styles.inputGroupFull}>
								<Text style={styles.label}>* Nível de Permissão</Text>
								<RNPickerSelect
									placeholder={{}}
									value={form.perfil}
									onValueChange={(v) => setForm({ ...form, perfil: v })}
									items={[
										{ label: 'DIRETORIA', value: 'DIRETORIA' },
										{ label: 'ADMINISTRADOR', value: 'ADMINISTRADOR' },
										{ label: 'ASSESSOR', value: 'ASSESSOR' },
										{ label: 'AFERIDOR', value: 'AFERIDOR' }
									]}
									style={pickerStylesModal}
									useNativeAndroidPickerStyle={false}
									Icon={() => <Feather name="chevron-down" size={20} color="#666" style={{ marginTop: 14, marginRight: 12 }} />}
								/>
							</View>

							<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
								<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={() => setModalVisible(false)}>
									<Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
								</TouchableOpacity>

								<TouchableOpacity style={[styles.btnSalvar, isSaving && { opacity: 0.7 }, { flex: 1.5, marginTop: 0, height: 50 }]} onPress={salvarUsuario} disabled={isSaving}>
									{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
								</TouchableOpacity>
							</View>
						</ScrollView>
					</KeyboardAvoidingView>
				</View>
			</Modal>
		</View>
	);
}

const pickerStylesBusca = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', paddingRight: 30, minHeight: 48 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', paddingRight: 30, minHeight: 48 }
});

const pickerStylesModal = StyleSheet.create({
	inputIOS: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', paddingRight: 30, minHeight: 48, marginBottom: 15 },
	inputAndroid: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 14, color: '#000', paddingRight: 30, minHeight: 48, marginBottom: 15 }
});

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	filterSection: { backgroundColor: '#fff', padding: 20, elevation: 3, marginBottom: 15 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },

	inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 8, height: 48, borderWidth: 1, borderColor: '#ddd', marginBottom: 10 },
	inputBuscaInterno: { flex: 1, paddingHorizontal: 10, fontSize: 15, color: '#333' },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },

	passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, height: 48, marginBottom: 15 },
	inputPassword: { flex: 1, paddingHorizontal: 15, fontSize: 14, color: '#000' },
	eyeIcon: { paddingHorizontal: 15, height: '100%', justifyContent: 'center' },

	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupH: { width: '48%' },
	inputGroupFull: { width: '100%' },

	actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

	card: { backgroundColor: '#fff', borderRadius: 10, marginHorizontal: 20, marginBottom: 15, elevation: 3, overflow: 'hidden' },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
	cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#333' },
	cardSubTitle: { fontSize: 13, color: '#666', marginTop: 4 },
	statusBadge: { backgroundColor: '#e8f0fe', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
	statusText: { fontSize: 11, fontWeight: 'bold', color: '#1967d2' },
	cardBody: { paddingHorizontal: 15, paddingVertical: 10 },
	cardText: { fontSize: 13, color: '#666' },

	cardActions: { padding: 10, backgroundColor: '#fafafa', alignItems: 'flex-end', borderTopWidth: 1, borderColor: '#eee' },
	actionButtonsRow: { flexDirection: 'row', justifyContent: 'flex-end', width: '100%' },

	btnEditarCard: { backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15 },
	btnEditarCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
	btnExcluirCard: { backgroundColor: '#E53935', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 8, borderRadius: 8, paddingHorizontal: 15, marginLeft: 8 },
	btnExcluirCardText: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },

	modalHeaderFull: {
		flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
		backgroundColor: '#0c6ead', paddingHorizontal: 15, paddingBottom: 15,
		paddingTop: Platform.OS === 'ios' ? 65 : (StatusBar.currentHeight ? StatusBar.currentHeight + 15 : 50),
		elevation: 4,
	},
	groupTitle: { fontSize: 16, fontWeight: 'bold', color: '#0c6ead', marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingBottom: 5 },

	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});