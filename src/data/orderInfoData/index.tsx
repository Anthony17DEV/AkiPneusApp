import {
  discount10,
  payableAmount,
  shippingCharge,
  subTotal,
  totalAmount,
} from '../../constant'

export const OrderInfoData = [
  {
    id: 0,
    title: subTotal,
    price: '3914.79',
  },
  {
    id: 1,
    title: shippingCharge,
    price: '50.00',
  },
  {
    id: 2,
    title: totalAmount,
    price: '3964.79',
  },
  {
    id: 3,
    title: discount10,
    price: '396.48',
  },
  {
    id: 4,
    title: payableAmount,
    price: '3568.31',
  },
]
