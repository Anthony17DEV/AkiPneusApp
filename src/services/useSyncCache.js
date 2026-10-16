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
						d.moti_tx_descricao || d.descricao || '',
						d.moti_nb_empresa || userData.empresa_id || 1,
						JSON.stringify(d)
					]
				);
			}
		}

		console.log("? [Universal Sync] Todo o cache local foi atualizado com sucesso!");
	} catch (error) {
		console.log("?? [Universal Sync] Sem rede. O app continuará a usar o cache local existente.");
	}
};