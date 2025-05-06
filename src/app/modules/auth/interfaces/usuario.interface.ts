export interface Usuario {
  token: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Login {
  access_token: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}
