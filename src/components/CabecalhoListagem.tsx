// src/components/CabecalhoListagem.tsx
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface CabecalhoListagemProps {
	busca: string;
	setBusca: (texto: string) => void;
	onBuscar: () => void;
	onInserir: () => void;
	labelPesquisa?: string;
	placeholderPesquisa?: string;
	textoBotaoNovo?: string; // Adicionado aqui como opcional
}

export function CabecalhoListagem({
	busca,
	setBusca,
	onBuscar,
	onInserir,
	labelPesquisa = "Buscar...",
	placeholderPesquisa = "Buscar...",
	textoBotaoNovo = "Inserir" // Valor padrão caso não seja passado
}: CabecalhoListagemProps) {
	return (
		<View>
			<View style={styles.row}>
				<View style={styles.inputGroupFull}>
					<Text style={styles.label}>{labelPesquisa}</Text>
					<TextInput
						style={styles.input}
						placeholder={placeholderPesquisa}
						value={busca}
						onChangeText={setBusca}
					/>
				</View>
			</View>

			<View style={styles.actionRow}>
				<TouchableOpacity style={styles.btnBuscar} onPress={onBuscar}>
					<Feather name="search" size={18} color="#fff" />
					<Text style={styles.btnText}>Buscar</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.btnInserir} onPress={onInserir}>
					<Feather name="plus-circle" size={18} color="#ffffff" />
					<Text style={styles.btnInserirText}>{textoBotaoNovo}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: 'row', justifyContent: 'space-between' },
	inputGroupFull: { width: '100%' },
	label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
	input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 15, height: 48, fontSize: 14, color: '#000', marginBottom: 10, justifyContent: 'center' },
	actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
	btnBuscar: { flex: 1, backgroundColor: '#3276b1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8, marginRight: 8 },
	btnInserir: { flex: 1, backgroundColor: '#63c77b', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 48, borderRadius: 8 },
	btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
	btnInserirText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
});