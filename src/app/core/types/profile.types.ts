export type UserRole = 'CUSTOMER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  first_name: string;
  last_name: string;
  phone: string | null;
}
