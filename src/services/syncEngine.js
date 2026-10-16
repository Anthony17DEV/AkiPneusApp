import { api } from './apiService';
import { getDb } from './database';

export const processSyncQueue = async () => {
	const db = getDb();
	try {
		const pendingItems = await db.getAllAsync(
			`SELECT * FROM sync_queue ORDER BY id ASC`
		);

		if (!pendingItems || pendingItems.length === 0) {
			console.log("?? [SyncEngine] Nenhum item pendente na fila offline.");
			return { success: true, count: 0 };
		}

		console.log(`?? [SyncEngine] A processar ${pendingItems.length} itens pendentes...`);

		for (const item of pendingItems) {
			try {
				const payload = JSON.parse(item.payload);

				const response = await api.post(item.endpoint, payload, {
					headers: {
						'X-Empresa-ID': item.empresa_id.toString()
					}
				});

				if (response.data && response.data.success) {
					await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
					console.log(`? [SyncEngine] Item ID ${item.id} (${item.endpoint}) sincronizado com sucesso!`);
				} else {
					console.warn(`?? [SyncEngine] O servidor rejeitou o item ID ${item.id}:`, response.data);
				}

			} catch (itemError) {
				console.warn(`?? [SyncEngine] Falha ao sincronizar item ID ${item.id}. A rede ainda pode estar instável.`, itemError.message);
				break;
			}
		}

		return { success: true, remaining: (await db.getAllAsync(`SELECT COUNT(*) as total FROM sync_queue`))[0].total };

	} catch (error) {
		console.error("? [SyncEngine] Erro crítico ao processar a fila de sincronização:", error);
		return { success: false, message: error.message };
	}
};