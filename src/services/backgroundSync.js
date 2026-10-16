import * as SecureStore from 'expo-secure-store';
import { initLocalDatabase } from './database';
import { processSyncQueue } from './syncEngine';
import { syncAllOfflineData } from './useSyncCache';

export const runBackgroundSync = async () => {
	try {
		await initLocalDatabase();

		const storedUserData = await SecureStore.getItemAsync('userData');
		if (!storedUserData) return;

		const userData = JSON.parse(storedUserData);

		console.log("?? [BackgroundSync] A iniciar rotina de sincronização...");

		await processSyncQueue();
		await syncAllOfflineData(userData);

		console.log("? [BackgroundSync] Rotina concluída com sucesso!");
	} catch (error) {
		console.log("?? [BackgroundSync] Dispositivo offline. A manter dados locais.");
	}
};