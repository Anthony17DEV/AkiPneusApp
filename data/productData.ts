import { ImageSourcePropType } from "react-native";

export interface Product {
	image: ImageSourcePropType | undefined;
	id: string;
	categoryId: string;
	name: string;
	price: number;
	imagePath: any;
	rating: number;
}

export const allProducts: Product[] = [
	// Roupas (categoryId: '1')
	{
		id: '101', categoryId: '1', name: 'Camiseta Básica', price: 79.90, imagePath: '../../assets/images/brake.png', rating: 4.5,
		image: undefined
	},
	{
		id: '102', categoryId: '1', name: 'Calça Jeans', price: 189.90, imagePath: '../../assets/images/brake.png', rating: 4.8,
		image: undefined
	},
	// Eletr�nicos (categoryId: '2')
	{
		id: '201', categoryId: '2', name: 'Fone de Ouvido BT', price: 299.00, imagePath: '../../assets/images/brake.png', rating: 4.9,
		image: undefined
	},
	{
		id: '202', categoryId: '2', name: 'Smartwatch', price: 549.90, imagePath: '../../assets/images/brake.png', rating: 4.7,
		image: undefined
	},
];