import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';

import { Tables } from '../types/database.types';

export type Customer = Tables<'customer_profiles'>;
export type Reservation = Tables<'reservations'> & {
  facilities: {
    id: string;
    name: string;
  } | null;
};

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly supabaseService = inject(SupabaseService);

  private readonly supabase = this.supabaseService.getClient();

  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await this.supabase
      .from('customer_profiles')
      .select('*')
      .eq('role', 'CUSTOMER')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }
  async getCustomerById(id: string): Promise<Customer> {
    const { data, error } = await this.supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
  async getCustomerReservations(customerId: string): Promise<Reservation[]> {
    const { data, error } = await this.supabase
      .from('reservations')
      .select(
        `
      *,
      facilities (
        id,
        name
      )
    `,
      )
      .eq('customer_id', customerId)
      .order('start_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}
