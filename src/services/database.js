import * as SQLite from 'expo-sqlite';

let dbInstance = null;

export const getDb = () => {
	if (!dbInstance) {
		dbInstance = SQLite.openDatabaseSync('smartpneus_local.db');
	}
	return dbInstance;
};

export const initLocalDatabase = async () => {
	try {
		const db = getDb();
		await db.execAsync(`
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT NOT NULL,
                payload TEXT NOT NULL,
                empresa_id INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
        `);

		await db.execAsync(`
            CREATE TABLE IF NOT EXISTS cache_veiculos (
                id INTEGER PRIMARY KEY,
                placa TEXT,
                codigo TEXT,
                cliente_id INTEGER,
                empresa_id INTEGER,
                dados_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cache_referencias (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                marca TEXT,
                modelo TEXT,
                mm_original TEXT,
                valor TEXT,
                empresa_id INTEGER
            );

            CREATE TABLE IF NOT EXISTS cache_clientes (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                cnpj TEXT,
                empresa_id INTEGER,
                dados_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cache_danos (
                id INTEGER PRIMARY KEY,
                descricao TEXT,
                empresa_id INTEGER,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_bandas (
                id INTEGER PRIMARY KEY,
                referencia TEXT,
                marca TEXT,
                modelo TEXT,
                sulco TEXT,
                valor TEXT,
                empresa_id INTEGER,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_checklists (
                id INTEGER PRIMARY KEY,
                veiculo_id INTEGER,
                dados_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cache_pneus_checklist (
                checklist_id INTEGER,
                posicao TEXT,
                dados_json TEXT,
                PRIMARY KEY (checklist_id, posicao)
            );

			CREATE TABLE IF NOT EXISTS cache_checklist_avulso (
                id INTEGER PRIMARY KEY,
                cliente_id INTEGER,
                dados_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cache_pneus_avulso (
                checklist_id INTEGER,
                pneu_id INTEGER,
                dados_json TEXT,
                PRIMARY KEY (checklist_id, pneu_id)
            );

			CREATE TABLE IF NOT EXISTS cache_marcas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                referencia TEXT,
                marca TEXT,
                qtd_modelos INTEGER,
                empresa_id INTEGER,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_marcas_veiculos (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                total_modelos INTEGER,
                dados_json TEXT
            );

            CREATE TABLE IF NOT EXISTS cache_modelos_veiculos (
                id INTEGER PRIMARY KEY,
                marca_id INTEGER,
                nome TEXT,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_modelos_pneus (
                id INTEGER PRIMARY KEY,
                referencia TEXT,
                marca TEXT,
                modelo TEXT,
                mm_original TEXT,
                valor TEXT,
                empresa_id INTEGER,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_pneus_geral (
                id INTEGER PRIMARY KEY,
                serie TEXT,
                dot TEXT,
                placa TEXT,
                cliente TEXT,
                cliente_id INTEGER,
                ferro TEXT,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_referencias_pneus (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                qtd_marcas INTEGER,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_usuarios (
                id INTEGER PRIMARY KEY,
                nome TEXT,
                usuario TEXT,
                email TEXT,
                perfil TEXT,
                dados_json TEXT
            );

			CREATE TABLE IF NOT EXISTS cache_veiculos_geral (
                id INTEGER PRIMARY KEY,
                placa TEXT,
                codigo TEXT,
                tipo TEXT,
                proprietario TEXT,
                proprietario_id INTEGER,
                dados_json TEXT
            );
        `);

		console.log("Banco de dados local e tabelas de cache inicializados com sucesso!");
	} catch (error) {
		console.error("Erro ao inicializar o banco local:", error);
	}
};

export const enqueueOfflineAction = async (endpoint, payload, empresaId) => {
	try {
		const db = getDb();
		const createdAt = new Date().toISOString();
		const payloadString = JSON.stringify(payload);

		await db.runAsync(
			`INSERT INTO sync_queue (endpoint, payload, empresa_id, created_at) VALUES (?, ?, ?, ?)`,
			[endpoint, payloadString, empresaId, createdAt]
		);
		console.log("Ação guardada na fila offline com sucesso.");
	} catch (error) {
		console.error("Erro ao enfileirar ação offline:", error);
	}
};