import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChassiProps {
	qtdEixos: number;
	onPneuPress: (codigoPneu: string) => void;
}

export function ChassiCaminhao({ qtdEixos, onPneuPress }: ChassiProps) {
	const gerarEixos = () => {
		let eixos = [];

		for (let i = 1; i <= qtdEixos; i++) {
			const isEixoDianteiro = i === 1;

			const isCavaloAcabando = i === 4 && qtdEixos > 3;

			if (isCavaloAcabando) {
				eixos.push(
					<View key="engate" style={styles.engateContainer}>
						<View style={styles.pinoEngate} />
						<View style={styles.caboConexao} />
					</View>
				);
			}

			eixos.push(
				<View key={`eixo-${i}`} style={styles.eixoHorizontalWrapper}>
					<View style={styles.barraEixoHorizontal} />

					<View style={styles.grupoPneusEsquerda}>
						<TouchableOpacity style={styles.pneu} onPress={() => onPneuPress(`${i}EE`)}>
							<Text style={styles.pneuText}>{i}EE</Text>
						</TouchableOpacity>

						{!isEixoDianteiro && (
							<TouchableOpacity style={styles.pneuInterno} onPress={() => onPneuPress(`${i}EI`)}>
								<Text style={styles.pneuText}>{i}EI</Text>
							</TouchableOpacity>
						)}
					</View>

					<View style={styles.grupoPneusDireita}>
						{!isEixoDianteiro && (
							<TouchableOpacity style={styles.pneuInterno} onPress={() => onPneuPress(`${i}DI`)}>
								<Text style={styles.pneuText}>{i}DI</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity style={styles.pneu} onPress={() => onPneuPress(`${i}ED`)}>
							<Text style={styles.pneuText}>{i}ED</Text>
						</TouchableOpacity>
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

			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	containerGeral: { alignItems: 'center', marginVertical: 10, width: '100%' },

	cabine: { width: 130, height: 80, alignItems: 'center', justifyContent: 'flex-end', zIndex: 10 },
	tetoCabine: { width: 110, height: 75, backgroundColor: '#ED1C24', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6, position: 'relative' },
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

	pneu: { width: 42, height: 85, backgroundColor: '#1a1a1a', borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 5 },
	pneuInterno: { width: 42, height: 85, backgroundColor: '#1a1a1a', borderRadius: 6, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.5, shadowRadius: 3, elevation: 5 },
	pneuText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

	engateContainer: { width: '100%', alignItems: 'center', height: 50, justifyContent: 'center', zIndex: 4 },
	pinoEngate: { width: 35, height: 35, borderRadius: 20, backgroundColor: '#444', borderWidth: 4, borderColor: '#222' },
	caboConexao: { position: 'absolute', right: 70, width: 20, height: 50, borderRightWidth: 3, borderRightColor: '#ED1C24', borderStyle: 'dotted' } // Simula a mangueira de ar
});