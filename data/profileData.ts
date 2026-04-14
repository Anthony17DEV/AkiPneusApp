import { Feather } from '@expo/vector-icons';

export interface ProfileMenuItem {
	id: number;
	title: string;
	icon: keyof typeof Feather.glyphMap;
	route: string;
}

export const profileMenuItems: ProfileMenuItem[] = [
	{
		id: 1,
		title: 'Editar Perfil',
		icon: 'user',
		route: '/edit-profile',
	},
	{
		id: 2,
		title: 'Notificações',
		icon: 'bell',
		route: '/notifications',
	},
	{
		id: 3,
		title: 'Sair',
		icon: 'log-out',
		route: '/login',
	},
];