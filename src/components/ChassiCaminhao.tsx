import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PneuData {
	cor?: string;
	mm?: string | number;
	pressao?: string | number;
}

interface ChassiProps {
	qtdEixos: number;
	qtdEstepes?: number;
	dadosPneus?: { [posicao: string]: PneuData };
	onPneuPress: (codigoPneu: string) => void;
}

export function ChassiCaminhao({ qtdEixos, qtdEstepes = 0, dadosPneus = {}, onPneuPress }: ChassiProps) {

	const renderPneu = (posicao: string, stylePneu: any, customText?: string) => {
		const pneu = dadosPneus[posicao] || {};
		const corFundo = pneu.cor || '#333';
		const isVazio = !pneu.cor;

		return (
			<TouchableOpacity
				style={[stylePneu, { backgroundColor: corFundo, borderColor: isVazio ? '#666' : '#fff', borderStyle: isVazio ? 'dashed' : 'solid' }]}
				onPress={() => onPneuPress(posicao)}
			>
				<Text style={styles.pneuText}>{customText || posicao}</Text>
				{pneu.mm && <Text style={styles.pneuMmText}>{pneu.mm}mm</Text>}
			</TouchableOpacity>
		);
	};

	const gerarEixos = () => {
		let eixos = [];
		for (let i = 1; i <= qtdEixos; i++) {
			const isEixoDianteiro = i === 1;
			eixos.push(
				<View key={`eixo-${i}`} style={styles.eixoHorizontalWrapper}>
					<View style={styles.barraEixoHorizontal} />
					<View style={styles.grupoPneusEsquerda}>
						{renderPneu(`${i}EE`, styles.pneu)}
						{!isEixoDianteiro && renderPneu(`${i}EI`, styles.pneuInterno)}
					</View>
					<View style={styles.grupoPneusDireita}>
						{!isEixoDianteiro && renderPneu(`${i}DI`, styles.pneuInterno)}
						{renderPneu(`${i}ED`, styles.pneu)}
					</View>
				</View>
			);
		}
		return eixos;
	};

	return (
		<View style={styles.containerGeral}>
			<View style={styles.cabine}>
				<View style={styles.tetoCabine}>
					<View style={styles.parabrisa} />
					<View style={styles.retrovisorEsquerdo} />
					<View style={styles.retrovisorDireito} />
				</View>
			</View>

			<View style={styles.chassiBase}>
				<View style={styles.longarinasContainer}>
					<View style={styles.longarina} />
					<View style={styles.longarina} />
				</View>

				<View style={styles.eixosContainer}>
					{gerarEixos()}
				</View>

				{qtdEstepes > 0 && (
					<View style={styles.estepesWrapper}>
						<View style={styles.estepesContainer}>
							{qtdEstepes === 1 ? (
								renderPneu('ESTEPE 1', styles.pneuEstepe, 'STE 1')
							) : (
								<>
									{renderPneu('ESTEPE 1', styles.pneuEstepe, 'STE 1')}
									{renderPneu('ESTEPE 2', styles.pneuEstepe, 'STE 2')}
								</>
							)}
						</View>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	containerGeral: { alignItems: 'center', marginVertical: 10, width: '100%' },
	cabine: { width: 130, height: 80, alignItems: 'center', justifyContent: 'flex-end', zIndex: 10 },
	tetoCabine: { width: 110, height: 75, backgroundColor: '#ED1C24', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, alignItems: 'center', elevation: 6 },
	parabrisa: { width: 95, height: 20, backgroundColor: '#111', borderTopLeftRadius: 15, borderTopRightRadius: 15, marginTop: 5, opacity: 0.85 },
	retrovisorEsquerdo: { position: 'absolute', left: -10, top: 15, width: 8, height: 20, backgroundColor: '#333', borderTopLeftRadius: 5, borderBottomLeftRadius: 5 },
	retrovisorDireito: { position: 'absolute', right: -10, top: 15, width: 8, height: 20, backgroundColor: '#333', borderTopRightRadius: 5, borderBottomRightRadius: 5 },

	chassiBase: { position: 'relative', width: 240, alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
	longarinasContainer: { position: 'absolute', top: -15, bottom: 0, width: 50, flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 },
	longarina: { width: 12, height: '100%', backgroundColor: '#555', borderLeftWidth: 2, borderRightWidth: 2, borderColor: '#333' },

	eixosContainer: { width: '100%', zIndex: 2, alignItems: 'center' },
	eixoHorizontalWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 70, marginBottom: 25, position: 'relative' },
	barraEixoHorizontal: { position: 'absolute', width: 190, height: 16, backgroundColor: '#444', borderWidth: 1, borderColor: '#222', borderRadius: 2, zIndex: 1 },

	grupoPneusEsquerda: { position: 'absolute', left: 0, flexDirection: 'row', gap: 4, zIndex: 3 },
	grupoPneusDireita: { position: 'absolute', right: 0, flexDirection: 'row', gap: 4, zIndex: 3 },

	pneu: { width: 42, height: 85, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, elevation: 5 },
	pneuInterno: { width: 42, height: 85, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, elevation: 5 },

	estepesWrapper: { marginTop: 20, alignItems: 'center', zIndex: 3, borderTopWidth: 2, borderTopColor: '#ccc', borderStyle: 'dashed', paddingTop: 20, width: '100%' },
	estepeTitle: { fontSize: 12, fontWeight: 'bold', color: '#666', letterSpacing: 2, marginBottom: 10 },
	estepesContainer: { flexDirection: 'row', gap: 10 },
	pneuEstepe: { width: 70, height: 42, borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, elevation: 5 },

	pneuText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
	pneuMmText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 }
});