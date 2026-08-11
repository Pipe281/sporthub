import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';

import { Tables, TablesInsert } from '../types/database.types';

export type Facility = Tables<'facilities'>;
export type FacilityType = Tables<'facility_types'>;
export type FacilityInsert = TablesInsert<'facilities'>;
export type FacilityStatus = Facility['status'];

export type FacilityWithType = Facility & {
  facility_types: {
    id: string;
    name: string;
  } | null;
};
export type FacilityGroup = {
  type: string;
  facilities: FacilityWithType[];
};

@Injectable({
  providedIn: 'root',
})
export class FacilityService {
  private readonly supabaseService = inject(SupabaseService);

  private readonly supabase = this.supabaseService.getClient();

  async getFacilities(): Promise<FacilityWithType[]> {
    const { data, error } = await this.supabase
      .from('facilities')
      .select(
        `
      *,
      facility_types (
        id,
        name
      )
    `,
      )
      .eq('status', 'ACTIVE')
      .order('name');

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async getFacilityById(id: string): Promise<Facility> {
    const { data, error } = await this.supabase
      .from('facilities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getFacilityTypes(): Promise<FacilityType[]> {
    const { data, error } = await this.supabase.from('facility_types').select('*').order('name');

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  async createFacility(facility: FacilityInsert): Promise<Facility> {
    const { data, error } = await this.supabase
      .from('facilities')
      .insert(facility)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}
