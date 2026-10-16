import { apiService } from './apiService';
import { getDb } from './database';

export const syncAllOfflineData = async (userData) => {
	const db = getDb();
	const userId = userData?.user_id || userData?.id;
	const userNivel = userData?.user_nivel || userData?.nivel;
	if (!userData || !userId) return;

	console.log("?? [Universal Sync] A verificar e atualizar todo o cache local...");

	try {
		const resVeiculos = await apiService.buscarVeiculo('');
		if (resVeiculos && resVeiculos.success && Array.isArray(resVeiculos.data)) {
			for (const v of resVeiculos.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_veiculos (id, placa, codigo, cliente_id, empresa_id, dados_json) 
           VALUES (?, ?, ?, ?, ?, ?)`,
					[
						v.veic_nb_id || v.id,
						v.veic_tx_placa || v.placa || '',
						v.veic_tx_codigo || v.codigo || '',
						v.veic_nb_entidade || 0,
						v.veic_nb_empresa || userData.empresa_id || 1,
						JSON.stringify(v)
					]
				);
			}
		}

		const resRef = await apiService.buscarDinamica('referencia_pneu', '');
		if (resRef && resRef.success && Array.isArray(resRef.data)) {
			for (const r of resRef.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_referencias (id, nome, marca, modelo, mm_original, valor, empresa_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						r.refe_nb_id || r.id,
						r.refe_tx_nome || '',
						r.refe_tx_marca || '',
						r.refe_tx_modelo || '',
						r.refe_tx_mmOriginal || '',
						r.refe_tx_valor || '',
						r.refe_nb_empresa || userData.empresa_id || 1
					]
				);
			}
		}

		const resClientes = await apiService.buscarClientes(userId, userNivel);

		let paginaAtual = 1;
		let temMaisClientes = true;

		while (temMaisClientes) {
			const resClientes = await apiService.buscarClientes(userId, userNivel, {}, paginaAtual);
			if (resClientes && resClientes.success && Array.isArray(resClientes.data) && resClientes.data.length > 0) {
				for (const c of resClientes.data) {
					await db.runAsync(
						`INSERT OR REPLACE INTO cache_clientes (id, nome, cnpj, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
						[
							c.enti_nb_id || c.id,
							c.enti_tx_nome || c.nome || '',
							c.enti_tx_cnpj || c.cnpj || '',
							c.enti_nb_empresa || userData.empresa_id || 1,
							JSON.stringify(c)
						]
					);
				}
				if (resClientes.data.length === 20) {
					paginaAtual++;
				} else {
					temMaisClientes = false;
				}
			} else {
				temMaisClientes = false;
			}
		}

		if (resClientes && resClientes.success && Array.isArray(resClientes.data)) {
			for (const c of resClientes.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_clientes (id, nome, cnpj, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
					[
						c.enti_nb_id || c.id,
						c.enti_tx_nome || c.nome || '',
						c.enti_tx_cnpj || c.cnpj || '',
						c.enti_nb_empresa || userData.empresa_id || 1,
						JSON.stringify(c)
					]
				);
			}
		}

		const resDanos = await apiService.listarDanos('');
		if (resDanos && resDanos.success && Array.isArray(resDanos.data)) {
			for (const d of resDanos.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_danos (id, descricao, empresa_id, dados_json) VALUES (?, ?, ?, ?)`,
					[
						d.moti_nb_id || d.id,
						d.moti_tx_descricao || d.descricao || d.nome || '',
						d.moti_nb_empresa || userData.empresa_id || 1,
						JSON.stringify(d)
					]
				);
			}
		}

		const resBandas = await apiService.listarBandas('', '');
		if (resBandas && resBandas.success && Array.isArray(resBandas.data)) {
			for (const b of resBandas.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_bandas (id, referencia, marca, modelo, sulco, valor, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						b.id,
						b.referencia || '',
						b.marca || '',
						b.modelo || '',
						String(b.sulco || ''),
						String(b.valor ?? ''),
						userData.empresa_id || 1,
						JSON.stringify(b)
					]
				);
			}
		}

		const veiculosCache = await db.getAllAsync(`SELECT id FROM cache_veiculos LIMIT 10`);
		for (const v of veiculosCache) {
			const resChecklists = await apiService.listarChecklists(v.id);
			if (resChecklists && resChecklists.success && Array.isArray(resChecklists.data)) {
				for (const ch of resChecklists.data) {
					const chId = ch.chec_nb_id || ch.id;
					await db.runAsync(
						`INSERT OR REPLACE INTO cache_checklists (id, veiculo_id, dados_json) VALUES (?, ?, ?)`,
						[chId, v.id, JSON.stringify(ch)]
					);

					const resPneus = await apiService.buscarPneusVeiculo(chId);
					if (resPneus && resPneus.success && resPneus.data) {
						for (const [pos, pData] of Object.entries(resPneus.data)) {
							await db.runAsync(
								`INSERT OR REPLACE INTO cache_pneus_checklist (checklist_id, posicao, dados_json) VALUES (?, ?, ?)`,
								[chId, pos, JSON.stringify(pData)]
							);
						}
					}
				}
			}
		}

		const resAvulsos = await apiService.listarChecklistsAvulsos();
		if (resAvulsos && resAvulsos.success && Array.isArray(resAvulsos.data)) {
			for (const ch of resAvulsos.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_checklist_avulso (id, cliente_id, dados_json) VALUES (?, ?, ?)`,
					[ch.id, ch.cliente_id || 0, JSON.stringify(ch)]
				);

				const resPneusAv = await apiService.listarPneusAvulsos(ch.id);
				if (resPneusAv && resPneusAv.success && Array.isArray(resPneusAv.data)) {
					for (const p of resPneusAv.data) {
						await db.runAsync(
							`INSERT OR REPLACE INTO cache_pneus_avulso (checklist_id, pneu_id, dados_json) VALUES (?, ?, ?)`,
							[ch.id, p.id, JSON.stringify(p)]
						);
					}
				}
			}
		}

		const resMarcas = await apiService.listarMarcas('');
		if (resMarcas && resMarcas.success && Array.isArray(resMarcas.data)) {
			for (const m of resMarcas.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_marcas (referencia, marca, qtd_modelos, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?)`,
					[
						m.referencia || '',
						m.marca || '',
						m.qtd_modelos || 0,
						userData.empresa_id || 1,
						JSON.stringify(m)
					]
				);
			}
		}

		const resMarcasVeic = await apiService.listarMarcasVeiculos('');
		if (resMarcasVeic && resMarcasVeic.success && Array.isArray(resMarcasVeic.data)) {
			for (const mv of resMarcasVeic.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_marcas_veiculos (id, nome, total_modelos, dados_json) VALUES (?, ?, ?, ?)`,
					[mv.id, mv.nome, mv.total_modelos || 0, JSON.stringify(mv)]
				);

				const resModelos = await apiService.listarModelosVeiculos(mv.id);
				if (resModelos && resModelos.success && Array.isArray(resModelos.data)) {
					for (const mod of resModelos.data) {
						await db.runAsync(
							`INSERT OR REPLACE INTO cache_modelos_veiculos (id, marca_id, nome, dados_json) VALUES (?, ?, ?, ?)`,
							[mod.id, mv.id, mod.nome, JSON.stringify(mod)]
						);
					}
				}
			}
		}

		const resModelosPneus = await apiService.listarModelosPneus('', '');
		if (resModelosPneus && resModelosPneus.success && Array.isArray(resModelosPneus.data)) {
			for (const mod of resModelosPneus.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_modelos_pneus (id, referencia, marca, modelo, mm_original, valor, empresa_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						mod.id,
						mod.referencia || '',
						mod.marca || '',
						mod.modelo || '',
						String(mod.mmOriginal || ''),
						String(mod.valor ?? ''),
						userData.empresa_id || 1,
						JSON.stringify(mod)
					]
				);
			}
		}

		const resPneusGeral = await apiService.buscarPneusGrid({});
		if (resPneusGeral && resPneusGeral.success && Array.isArray(resPneusGeral.data)) {
			for (const p of resPneusGeral.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_pneus_geral (id, serie, dot, placa, cliente, cliente_id, ferro, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						p.id,
						p.serie || '',
						p.dot || '',
						p.placa_associada || p.placa || '',
						p.cliente || p.proprietario || '',
						p.cliente_id || p.proprietario_id || 0,
						p.ferro || '',
						JSON.stringify(p)
					]
				);
			}
		}

		const resRefs = await apiService.listarReferencias('');
		if (resRefs && resRefs.success && Array.isArray(resRefs.data)) {
			for (const ref of resRefs.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_referencias_pneus (id, nome, qtd_marcas, dados_json) VALUES (?, ?, ?, ?)`,
					[
						ref.id,
						ref.nome || '',
						ref.qtd_marcas || 0,
						JSON.stringify(ref)
					]
				);
			}
		}

		const resReformadores = await apiService.listarReformadores('');
		if (resReformadores && resReformadores.success && Array.isArray(resReformadores.data)) {
			for (const ref of resReformadores.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_reformadores (id, nome, documento, telefone, cidade_id, cidade_nome, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						ref.id,
						ref.nome || '',
						ref.documento || '',
						ref.telefone || '',
						ref.cidade_id || 0,
						ref.cidade_nome || '',
						JSON.stringify(ref)
					]
				);
			}
		}

		const resUsuarios = await apiService.listarUsuarios('', '');
		if (resUsuarios && resUsuarios.success && Array.isArray(resUsuarios.data)) {
			for (const u of resUsuarios.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_usuarios (id, nome, usuario, email, perfil, dados_json) VALUES (?, ?, ?, ?, ?, ?)`,
					[
						u.id,
						u.nome || '',
						u.usuario || '',
						u.email || '',
						u.perfil || 'ASSESSOR',
						JSON.stringify(u)
					]
				);
			}
		}

		const resVeicGeral = await apiService.buscarVeiculo({});
		if (resVeicGeral && resVeicGeral.success && Array.isArray(resVeicGeral.data)) {
			for (const v of resVeicGeral.data) {
				await db.runAsync(
					`INSERT OR REPLACE INTO cache_veiculos_geral (id, placa, codigo, tipo, proprietario, proprietario_id, dados_json) VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[
						v.id,
						v.placa || v.veic_tx_placa || '',
						v.codigo || v.veic_tx_codigo || '',
						v.tipo || v.veic_tx_tipo || '',
						v.proprietario || '',
						v.proprietario_id || 0,
						JSON.stringify(v)
					]
				);
			}
		}

		console.log("? [Universal Sync] Todo o cache local foi atualizado com sucesso!");
	} catch (error) {
		console.log("?? [Universal Sync] Sem rede. O app continuará a usar o cache local existente.");
	}
};