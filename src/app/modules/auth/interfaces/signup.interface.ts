import { Address } from './address.interface';

export interface SignUp {
  id?: string;
  full_name: string;
  email: string;
  id_type?: string;
  identification: string;
  phone: string;
  username: string;
  password: string;
  address?: Address;
}
