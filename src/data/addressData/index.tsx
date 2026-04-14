import {
  addressOne,
  addressTwo,
  defaults,
  homeAddress,
  makeasadefault,
  phoneNoOne,
  phoneNoText,
} from '../../constant'

export const addressData = [
  {
    id: 0,
    title: 'transData.homeAddress',
    subtitle: 'transData.defaults',
    address: 'transData.addressOne',
    phoneNumber: phoneNoOne,
    mo: phoneNoText,
    defaulText: 'transData.makeasadefault',
  },
  {
    id: 1,
    title: 'transData.homeAddress',
    address: 'transData.addressTwo',
    phoneNumber: phoneNoOne,
    mo: phoneNoText,
    defaulText: 'transData.makeasadefault',
  },
]
export const changeAddressData = [
  {
    id: 0,
    title: 'transData.homeAddress',
    subtitle: 'transData.defaults',
    address: addressOne,
    phoneNumber: phoneNoOne,
    mo: phoneNoText,
  },
  {
    id: 1,
    title: 'transData.homeAddress',
    address: 'transData.addressTwo',
    phoneNumber: phoneNoOne,
    mo: phoneNoText,
  },
]
