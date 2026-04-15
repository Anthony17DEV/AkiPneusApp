import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Image,
	KeyboardAvoidingView,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../src/services/apiService';

export default function PerfilScreen() {
	const { user, signOut, updateUser } = useAuth();
	const URL_FOTOS = 'https://sistemascactus.com/apicactus/akipneus_api/fotos/';

	const [isUploading, setIsUploading] = useState(false);

	const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
	const [novaSenha, setNovaSenha] = useState('');
	const [isSalvandoSenha, setIsSalvandoSenha] = useState(false);

	const handleLogout = () => {
		Alert.alert(
			"Sair da Conta",
			"Tem certeza que deseja sair do aplicativo?",
			[
				{ text: "Cancelar", style: "cancel" },
				{ text: "Sim, Sair", onPress: signOut, style: 'destructive' }
			]
		);
	};

	const handlePickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== 'granted') {
			Alert.alert('Atenção', 'Precisamos da permissão para acessar suas fotos.');
			return;
		}

		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.5,
			base64: true
		});

		if (!result.canceled && result.assets[0].base64) {
			enviarFotoParaServidor(result.assets[0].base64);
		}
	};

	const enviarFotoParaServidor = async (base64Image: string) => {
		setIsUploading(true);
		try {
			const res = await apiService.atualizarFoto(user?.id, base64Image);

			if (res && res.success) {
				if (updateUser) {
					updateUser({ foto: res.foto_nome });
				}
				Alert.alert('Sucesso', 'Foto atualizada com sucesso!');
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao salvar a foto.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Erro de conexão ao enviar a foto.');
		} finally {
			setIsUploading(false);
		}
	};

	const handleSalvarSenha = async () => {
		if (!novaSenha || novaSenha.length < 4) {
			Alert.alert('Atenção', 'A nova senha deve ter pelo menos 4 caracteres.');
			return;
		}

		setIsSalvandoSenha(true);
		try {
			const res = await apiService.alterarSenha(user?.id, novaSenha);

			if (res && res.success) {
				Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!');
				setModalSenhaVisible(false);
				setNovaSenha('');
			} else {
				Alert.alert('Erro', res?.message || 'Falha ao alterar a senha.');
			}
		} catch (error) {
			Alert.alert('Erro', 'Erro de conexão ao alterar a senha.');
		} finally {
			setIsSalvandoSenha(false);
		}
	};

	return (
		<ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

			<View style={styles.header}>
				<View style={styles.avatarContainer}>
					{isUploading ? (
						<View style={styles.avatarPlaceholder}>
							<ActivityIndicator size="large" color="#ED1C24" />
						</View>
					) : user?.foto ? (
						<Image source={{ uri: `${URL_FOTOS}${user.foto}` }} style={styles.avatar} />
					) : (
						<View style={styles.avatarPlaceholder}>
							<Feather name="user" size={40} color="#fff" />
						</View>
					)}

					<TouchableOpacity style={styles.editPhotoBtn} onPress={handlePickImage} disabled={isUploading}>
						<Feather name="camera" size={14} color="#fff" />
					</TouchableOpacity>
				</View>

				<Text style={styles.userName}>{user?.nome || 'Nome do Usuário'}</Text>

				<View style={styles.badgeNivel}>
					<Feather name="shield" size={14} color="#ED1C24" />
					<Text style={styles.badgeText}>{user?.nivel || 'Assessor'}</Text>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Dados Pessoais</Text>
				<View style={styles.card}>
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="hash" size={18} color="#666" />
						</View>
						<View style={styles.infoTexts}>
							<Text style={styles.infoLabel}>CPF</Text>
							<Text style={styles.infoValue}>{user?.cpf || 'Não informado'}</Text>
						</View>
					</View>

					<View style={styles.divider} />

					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="user-check" size={18} color="#666" />
						</View>
						<View style={styles.infoTexts}>
							<Text style={styles.infoLabel}>Status no Sistema</Text>
							<Text style={[styles.infoValue, { color: '#28a745', fontWeight: 'bold' }]}>
								{user?.status ? user.status.toUpperCase() : 'ATIVO'}
							</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Contato</Text>
				<View style={styles.card}>
					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="mail" size={18} color="#666" />
						</View>
						<View style={styles.infoTexts}>
							<Text style={styles.infoLabel}>E-mail Institucional</Text>
							<Text style={styles.infoValue}>{user?.email || 'email@grupofan.com'}</Text>
						</View>
					</View>

					<View style={styles.divider} />

					<View style={styles.infoRow}>
						<View style={styles.iconBox}>
							<Feather name="phone" size={18} color="#666" />
						</View>
						<View style={styles.infoTexts}>
							<Text style={styles.infoLabel}>Telefone / WhatsApp</Text>
							<Text style={styles.infoValue}>{user?.telefone || '(00) 00000-0000'}</Text>
						</View>
					</View>
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Segurança</Text>

				<TouchableOpacity style={styles.actionButton} onPress={() => setModalSenhaVisible(true)}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Feather name="lock" size={20} color="#333" />
						<Text style={styles.actionButtonText}>Alterar Senha</Text>
					</View>
					<Feather name="chevron-right" size={20} color="#ccc" />
				</TouchableOpacity>

				<TouchableOpacity style={[styles.actionButton, { marginTop: 15 }]} onPress={handleLogout}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Feather name="log-out" size={20} color="#ED1C24" />
						<Text style={[styles.actionButtonText, { color: '#ED1C24' }]}>Sair da Conta</Text>
					</View>
				</TouchableOpacity>
			</View>

			<View style={{ height: 40 }} />

			<Modal visible={modalSenhaVisible} animationType="fade" transparent={true}>
				<View style={styles.modalOverlay}>
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>Alterar Senha</Text>
							<TouchableOpacity onPress={() => setModalSenhaVisible(false)}>
								<Feather name="x" size={24} color="#333" />
							</TouchableOpacity>
						</View>

						<Text style={styles.modalLabel}>Nova Senha</Text>
						<TextInput
							style={styles.modalInput}
							placeholder="Digite a nova senha"
							secureTextEntry
							value={novaSenha}
							onChangeText={setNovaSenha}
						/>

						<TouchableOpacity
							style={[styles.btnSalvar, isSalvandoSenha && { opacity: 0.7 }]}
							onPress={handleSalvarSenha}
							disabled={isSalvandoSenha}
						>
							{isSalvandoSenha ? (
								<ActivityIndicator color="#fff" size="small" />
							) : (
								<>
									<Feather name="check-circle" size={20} color="#fff" />
									<Text style={styles.btnSalvarText}>Confirmar</Text>
								</>
							)}
						</TouchableOpacity>
					</KeyboardAvoidingView>
				</View>
			</Modal>

		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#f4f6f8' },
	header: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 20 },
	avatarContainer: { position: 'relative', marginBottom: 15 },
	avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#ED1C24' },
	avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#ED1C24' },
	editPhotoBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ED1C24', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
	userName: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', paddingHorizontal: 20 },
	badgeNivel: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffe5e6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, marginTop: 10 },
	badgeText: { fontSize: 13, fontWeight: 'bold', color: '#ED1C24', marginLeft: 6 },
	section: { paddingHorizontal: 20, marginBottom: 25 },
	sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginLeft: 5 },
	card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2.22, elevation: 2 },
	infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
	iconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f4f6f8', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
	infoTexts: { flex: 1 },
	infoLabel: { fontSize: 12, color: '#888', marginBottom: 2 },
	infoValue: { fontSize: 15, fontWeight: '500', color: '#333' },
	divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12, marginLeft: 55 },
	actionButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2.22, elevation: 2 },
	actionButtonText: { fontSize: 16, fontWeight: '600', color: '#333', marginLeft: 15 },

	modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
	modalContent: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 20 },
	modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
	modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
	modalLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
	modalInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: '#333', marginBottom: 20 },
	btnSalvar: {
		backgroundColor: '#28a745',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 14,
		borderRadius: 8,
		marginTop: 5,
		marginBottom: 10
	},
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});