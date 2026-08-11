export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const CUSTOMER_ROUTES = {
  DASHBOARD: '/dashboard',
  FACILITIES: '/facilities',
  RESERVATIONS: '/reservations',
  PROFILE: '/profile',
} as const;

export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  FACILITIES: '/admin/facilities',
  CREATE_FACILITY: '/admin/facilities/create',
  FACILITY_TYPES: '/admin/facility-types',
  SCHEDULES: '/admin/schedules',
  CLIENTS: '/admin/clients',
  PROFILE: '/profile',
} as const;

export const APP_ROUTES = {
  ...AUTH_ROUTES,
  ...CUSTOMER_ROUTES,
  ...ADMIN_ROUTES,
} as const;

export const PUBLIC_AUTH_ROUTES = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
] as const;
