import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LogoSolutires from '../../assets/images/smart_pneus.png';

interface CampoForm {
	chave: string;
	label: string;
	placeholder?: string;
	keyboardType?: 'default' | 'numeric' | 'email-address';
}

interface ModalFormularioSimplesProps {
	visible: boolean;
	onClose: () => void;
	onSave: () => void;
	onSignOut?: () => void;
	titulo: string;
	campos: CampoForm[];
	valores: Record<string, any>;
	onChangeValor: (chave: string, valor: string) => void;
	isLoading?: boolean;
}

export function ModalFormularioSimples({
	visible,
	onClose,
	onSave,
	onSignOut,
	titulo,
	campos,
	valores,
	onChangeValor,
	isLoading = false
}: ModalFormularioSimplesProps) {
	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>
				<View style={styles.modalHeaderFullScreen}>
					<TouchableOpacity onPress={onClose} style={{ padding: 5 }}>
						<Feather name="arrow-left" size={24} color="#fff" />
					</TouchableOpacity>
					<Image source={LogoSolutires} style={{ width: 120, height: 35, resizeMode: 'contain' }} />
					<TouchableOpacity onPress={onSignOut} style={{ padding: 5 }}>
						<Feather name="power" size={22} color="#fff" />
					</TouchableOpacity>
				</View>

				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
					<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
						<Text style={styles.groupTitle}>{titulo}</Text>

						{campos.map((campo) => (
							<View key={campo.chave}>
								<Text style={styles.label}>{campo.label}</Text>
								<TextInput
									style={styles.inputModal}
									value={String(valores[campo.chave] || '')}
									onChangeText={(text) => onChangeValor(campo.chave, text)}
									placeholder={campo.placeholder || ''}
									autoCapitalize="characters"
									keyboardType={campo.keyboardType || 'default'}
								/>
							</View>
						))}

						<View style={{ flexDirection: 'row', marginTop: 30, gap: 10 }}>
							<TouchableOpacity style={[styles.btnDefault, { flex: 1, height: 50 }]} onPress={onClose}>
								<Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>Cancelar</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.btnSalvar, isLoading && { opacity: 0.7 }, { flex: 1.5, height: 50, marginTop: 0 }]} onPress={onSave} disabled={isLoading}>
								{isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSalvarText}>Gravar</Text>}
							</TouchableOpacity>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
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
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	inputModal: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 15 },
	btnSalvar: { backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
	btnSalvarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
	btnDefault: { backgroundColor: '#eee', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});