import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PneuData {
	cor?: string;
	mm?: string | number;
	pressao?: string | number;
	pendente?: boolean;
}

interface VeiculoComposicao {
	placa?: string;
	veic_tx_placa?: string;
	codigo?: string;
	veic_tx_codigo?: string;
	tipo?: string;
	veic_tx_tipo?: string;
	eixos?: string | number;
	veic_tx_eixos?: string | number;
	rodado?: string;
	veic_tx_tipoRodado?: string;
	estepe?: string | number;
	cor?: string;
	veic_tx_cor?: string;
}

interface ChassiProps {
	veiculos?: VeiculoComposicao[];
	qtdEixos?: number;
	qtdEstepes?: number;
	dadosPneus?: { [posicao: string]: PneuData };
	onPneuPress: (codigoPneu: string) => void;
}

export function ChassiCaminhao({ veiculos, qtdEixos, qtdEstepes = 0, dadosPneus = {}, onPneuPress }: ChassiProps) {

	const getColorHex = (corNome?: string) => {
		if (!corNome) return '#dcdcdc';
		const c = String(corNome).toLowerCase().trim();
		if (c.includes('branc')) return '#f8f9fa';
		if (c.includes('pret')) return '#222222';
		if (c.includes('vermelh')) return '#e53935';
		if (c.includes('prat') || c.includes('cinz')) return '#9e9e9e';
		if (c.includes('azul')) return '#1976d2';
		if (c.includes('verd')) return '#388e3c';
		if (c.includes('amarel')) return '#fbc02d';
		if (c.includes('laranj')) return '#f57c00';
		if (c.includes('marrom')) return '#795548';
		return '#dcdcdc';
	};

	const getTextColor = (hex: string) => {
		const escuros = ['#222222', '#e53935', '#1976d2', '#388e3c', '#795548', '#f57c00'];
		return escuros.includes(hex) ? '#ffffff' : '#111111';
	};

	const renderPneu = (posicao: string, estiloPneu: any, textoCustomizado?: string) => {
		const pneu = dadosPneus[posicao] || {};
		const estaVazio = !pneu.cor;
		const estaPendente = pneu.pendente;

		let corDeFundo = '#333';
		let corDaBorda = '#666';
		let estiloDaBorda = 'dashed';

		if (!estaVazio) {
			if (estaPendente) {
				corDeFundo = '#dcdcdc';
				corDaBorda = pneu.cor || '#666';
				estiloDaBorda = 'solid';
			} else {
				corDeFundo = pneu.cor || '#333';
				corDaBorda = '#fff';
				estiloDaBorda = 'solid';
			}
		}

		const corDoTexto = (estaPendente && !estaVazio) ? '#333' : '#fff';

		return (
			<TouchableOpacity
				key={posicao}
				style={[estiloPneu, { backgroundColor: corDeFundo, borderColor: corDaBorda, borderStyle: estiloDaBorda as any, borderWidth: estaPendente ? 3 : 2 }]}
				onPress={() => onPneuPress(posicao)}
			>
				<Text style={[styles.pneuText, { color: corDoTexto }]}>{textoCustomizado || posicao}</Text>
				{pneu.mm ? <Text style={styles.pneuMmText}>{pneu.mm}mm</Text> : null}
				{pneu.pressao ? <Text style={styles.pneuMmText}>{pneu.pressao}Lbs</Text> : null}
			</TouchableOpacity>
		);
	};

	const renderAxle = (numeroDoEixo: number, eixoSimples: boolean, eDolly: boolean = false, eCarreta: boolean = false, ePrimeiroEixoCarreta: boolean = false) => {
		const margemAbaixo = eDolly ? 15 : 35;
		const margemAcima = ePrimeiroEixoCarreta ? 70 : 0;

		if (eixoSimples) {
			const ee = `${numeroDoEixo}EE`;
			const ed = `${numeroDoEixo}ED`;
			return (
				<View key={`eixo_${numeroDoEixo}`} style={[styles.eixoHorizontalWrapper, { marginBottom: margemAbaixo, marginTop: margemAcima }]}>
					<View style={styles.barraEixoHorizontal} />
					<View style={styles.grupoPneusEsquerda}>
						{renderPneu(ee, styles.pneu, `${numeroDoEixo}E`)}
					</View>
					<View style={styles.grupoPneusDireita}>
						{renderPneu(ed, styles.pneu, `${numeroDoEixo}D`)}
					</View>
				</View>
			);
		} else {
			const ee = `${numeroDoEixo}EE`;
			const ei = `${numeroDoEixo}EI`;
			const di = `${numeroDoEixo}DI`;
			const de = `${numeroDoEixo}DE`;
			return (
				<View key={`eixo_${numeroDoEixo}`} style={[styles.eixoHorizontalWrapper, { marginBottom: margemAbaixo, marginTop: margemAcima }]}>
					<View style={styles.barraEixoHorizontal} />
					<View style={styles.grupoPneusEsquerda}>
						{renderPneu(ee, styles.pneu)}
						{renderPneu(ei, styles.pneuInterno)}
					</View>
					<View style={styles.grupoPneusDireita}>
						{renderPneu(di, styles.pneuInterno)}
						{renderPneu(de, styles.pneu)}
					</View>
				</View>
			);
		}
	};

	let indiceGlobalEixo = 1;
	let indiceGlobalEstepe = 1;

	return (
		<View style={styles.chassiMaster}>
			{veiculos && veiculos.length > 0 ? (
				veiculos.map((v, vIndex) => {
					const tipoTratado = String(v.tipo || v.veic_tx_tipo || '').toUpperCase().trim();
					const rodadoTratado = String(v.rodado || v.veic_tx_tipoRodado || '').toUpperCase().trim();

					let numeroEixos = parseInt(v.eixos as string) || parseInt(qtdEixos as any) || 2;

					if (['3/4', 'TOCO', '2 EIXOS'].includes(rodadoTratado)) {
						numeroEixos = 2;
					} else if (['TRUCK', '3 EIXOS'].includes(rodadoTratado)) {
						numeroEixos = 3;
					} else if (['BI-TRUCK', 'BITRUCK', '4 EIXOS'].includes(rodadoTratado)) {
						numeroEixos = 4;
					}

					const numeroEstepes = parseInt(v.estepe as string) || 0;

					const eCarreta = tipoTratado.includes('CARRETA') || tipoTratado.includes('IMPLEMENTO') || tipoTratado.includes('EQUIPAMENTO') || tipoTratado.includes('OUTROS') || tipoTratado.includes('REBOQUE');
					const eDolly = tipoTratado.includes('DOLLY');
					const eBitruck = rodadoTratado.includes('BI-TRUCK') || rodadoTratado.includes('BITRUCK');

					const placaCorreta = v.placa || v.veic_tx_placa || 'N/A';
					const codigoCorreto = v.codigo || v.veic_tx_codigo || '';
					const corCorreta = v.cor || v.veic_tx_cor;

					const eixosDoVeiculo = [];
					for (let i = 0; i < numeroEixos; i++) {
						const numeroDoEixo = indiceGlobalEixo++;
						let eixoSimples = false;
						if (!eCarreta && !eDolly) { eixoSimples = (i === 0 || (i === 1 && eBitruck)); }

						const ePrimeiroEixoCarreta = (eCarreta && !eDolly && i === 0);

						eixosDoVeiculo.push(renderAxle(numeroDoEixo, eixoSimples, eDolly, eCarreta, ePrimeiroEixoCarreta));
					}

					const estepesDesteVeiculo = [];
					for (let i = 0; i < numeroEstepes; i++) { estepesDesteVeiculo.push(indiceGlobalEstepe++); }

					const corFundoCabine = getColorHex(corCorreta);
					const corTextoCabine = getTextColor(corFundoCabine);

					return (
						<View key={`veiculo_${vIndex}`} style={styles.veiculoContainer}>

							{vIndex > 0 && (
								<View style={styles.engateContainer}>
									<View style={styles.barraEngate} />
									<View style={styles.pinoEngate} />
								</View>
							)}

							{(!eCarreta && !eDolly) ? (
								<View style={[styles.cabineShape, { backgroundColor: corFundoCabine }]}>
									<View style={styles.paraChoque} />
									<View style={styles.paraBrisa} />
									<View style={styles.tetoCabine}>
										<Text style={[styles.cabineText, { color: corTextoCabine }]}>FRENTE</Text>
										<Text style={styles.cabinePlaca}>{placaCorreta}</Text>
										{!!codigoCorreto && (
											<Text style={{ fontSize: 11, fontWeight: 'bold', color: corTextoCabine, marginTop: 4, letterSpacing: 1 }}>
												{codigoCorreto}
											</Text>
										)}
									</View>
								</View>
							) : (
								<View style={{ alignItems: 'center', marginBottom: 5, marginTop: 10, zIndex: 10 }}>
									<Text style={{ fontSize: 13, fontWeight: 'bold', color: '#666', letterSpacing: 1 }}>
										[ {tipoTratado || 'IMPLEMENTO'} ]
									</Text>
									<Text style={{ fontSize: 16, fontWeight: '900', color: '#111', marginTop: 4 }}>
										{placaCorreta} {codigoCorreto ? `(${codigoCorreto})` : ''}
									</Text>
								</View>
							)}

							<View style={styles.eixosContainer}>
								<View style={styles.longarinaEsquerda} />
								<View style={styles.longarinaDireita} />
								{eixosDoVeiculo}
							</View>

							{estepesDesteVeiculo.length > 0 && (
								<View style={styles.estepesWrapperLocal}>
									<Text style={styles.estepeTitleLocal}>
										[ ESTEPES {(vIndex === 0 && !eCarreta && !eDolly) ? 'DO CAVALO' : `DA ${tipoTratado || 'CARRETA'}`} ]
									</Text>
									<View style={styles.estepesContainer}>
										{estepesDesteVeiculo.map(num => {
											const posicaoEstepe = `ESTEPE ${num}`;
											return <React.Fragment key={`estepe_${num}`}>{renderPneu(posicaoEstepe, styles.pneuEstepe, `STE ${num}`)}</React.Fragment>;
										})}
									</View>
								</View>
							)}
						</View>
					);
				})
			) : (
				<View style={styles.veiculoContainer}>
					<View style={[styles.cabineShape, { backgroundColor: '#dcdcdc' }]}>
						<View style={styles.paraChoque} />
						<View style={styles.paraBrisa} />
						<View style={styles.tetoCabine}>
							<Text style={styles.cabineText}>FRENTE</Text>
						</View>
					</View>
					<View style={styles.eixosContainer}>
						<View style={styles.longarinaEsquerda} />
						<View style={styles.longarinaDireita} />
						{Array.from({ length: qtdEixos || 2 }).map((_, i) => {
							const numeroDoEixo = i + 1;
							let eixoSimples = false;
							if (numeroDoEixo === 1) eixoSimples = true;
							return <React.Fragment key={`eixo_base_${numeroDoEixo}`}>{renderAxle(numeroDoEixo, eixoSimples)}</React.Fragment>;
						})}
					</View>
					{qtdEstepes > 0 && (
						<View style={styles.estepesWrapperLocal}>
							<Text style={styles.estepeTitleLocal}>[ ESTEPES ]</Text>
							<View style={styles.estepesContainer}>
								{Array.from({ length: qtdEstepes }).map((_, i) => {
									const posicaoEstepe = `ESTEPE ${i + 1}`;
									return <React.Fragment key={`estepe_${i}`}>{renderPneu(posicaoEstepe, styles.pneuEstepe, `STE ${i + 1}`)}</React.Fragment>;
								})}
							</View>
						</View>
					)}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	chassiMaster: { width: '100%', alignItems: 'center', marginVertical: 10 },
	veiculoContainer: { width: '100%', alignItems: 'center', marginBottom: 15 },

	cabineShape: { width: 120, height: 90, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 2, borderColor: '#222', alignItems: 'center', marginBottom: 10, zIndex: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 5, overflow: 'hidden' },
	paraChoque: { width: '90%', height: 6, backgroundColor: '#333', marginTop: 2, borderRadius: 4 },
	paraBrisa: { width: '85%', height: 22, backgroundColor: '#1a1a1a', marginTop: 6, borderTopLeftRadius: 15, borderTopRightRadius: 15, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, borderWidth: 1, borderColor: '#000' },

	tetoCabine: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
	cabineText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
	cabinePlaca: { fontSize: 13, fontWeight: '900', color: '#111', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#aaa' },

	engateContainer: { alignItems: 'center', justifyContent: 'center', height: 35, width: '100%', zIndex: 0, marginBottom: 5 },
	barraEngate: { width: 8, height: 40, backgroundColor: '#2d2d2d' },
	pinoEngate: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#555', position: 'absolute', top: 10, borderWidth: 2, borderColor: '#111' },

	eixosContainer: { width: '100%', zIndex: 2, alignItems: 'center', position: 'relative', paddingVertical: 10 },

	longarinaEsquerda: { position: 'absolute', top: 0, bottom: 0, left: '50%', marginLeft: -14, width: 8, backgroundColor: '#2d2d2d', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#111', zIndex: 0 },
	longarinaDireita: { position: 'absolute', top: 0, bottom: 0, left: '50%', marginLeft: 6, width: 8, backgroundColor: '#2d2d2d', borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#111', zIndex: 0 },

	eixoHorizontalWrapper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: 300, height: 70, position: 'relative' },
	barraEixoHorizontal: { position: 'absolute', left: 20, right: 20, height: 16, backgroundColor: '#444', borderWidth: 1, borderColor: '#222', borderRadius: 2, zIndex: 1 },

	grupoPneusEsquerda: { position: 'absolute', left: 0, flexDirection: 'row', gap: 4, zIndex: 3 },
	grupoPneusDireita: { position: 'absolute', right: 0, flexDirection: 'row', gap: 4, zIndex: 3 },

	pneu: { width: 55, height: 95, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5 },
	pneuInterno: { width: 55, height: 95, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5 },
	pneuEstepe: { width: 95, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 5 },

	pneuText: { fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
	pneuMmText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 3, borderRadius: 4, overflow: 'hidden' },

	estepesWrapperLocal: { marginTop: 10, alignItems: 'center', zIndex: 3, width: '100%', paddingBottom: 15 },
	estepeTitleLocal: { fontSize: 11, fontWeight: 'bold', color: '#666', marginBottom: 10, letterSpacing: 1 },
	estepesContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }
});