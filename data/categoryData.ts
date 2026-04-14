import { ImageSourcePropType } from "react-native";

export interface Category {
	image: ImageSourcePropType | undefined;
	id: string;
	name: string;
	imagePath: any;
}

export const categories: Category[] = [
	{
		id: '1', name: 'Roupas', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
	{
		id: '2', name: 'Eletrónicos', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
	{
		id: '3', name: 'Móveis', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
	{
		id: '4', name: 'Sapatos', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
	{
		id: '5', name: 'Acessórios', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
	{
		id: '6', name: 'Livros', imagePath: '../../assets/images/brake.png',
		image: undefined
	},
];