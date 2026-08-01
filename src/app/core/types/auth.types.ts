export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
}
export interface RegisterForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
