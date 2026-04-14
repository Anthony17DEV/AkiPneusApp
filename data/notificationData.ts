import { Feather } from '@expo/vector-icons';

export interface NotificationItem {
	id: string;
	icon: keyof typeof Feather.glyphMap;
	title: string;
	subtitle: string;
	time: string;
	isUnread: boolean;
}

export const notifications: NotificationItem[] = [

];