import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase.service';

import { Tables, TablesInsert, TablesUpdate } from '../types/database.types';

export type Facility = Tables<'facilities'>;
export type FacilityInsert = TablesInsert<'facilities'>;
export type FacilityUpdate = TablesUpdate<'facilities'>;
export type FacilityType = Tables<'facility_types'>;
export type FacilityTypeInsert = TablesInsert<'facility_types'>;
export type FacilityTypeUpdate = TablesUpdate<'facility_types'>;
export type FacilityStatus = Facility['status'];

export type FacilityWithType = Facility & {
  facility_types: {
    id: string;
    name: string;
    description: string | null;
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

  async getActiveFacilityCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('facilities')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'ACTIVE');

    if (error) {
      throw error;
    }

    return count ?? 0;
  }

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

  async getFacilityById(id: string): Promise<FacilityWithType> {
    const { data, error } = await this.supabase
      .from('facilities')
      .select(
        `
      *,
      facility_types (
        id,
        name,
        description
      )
    `,
      )
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

  async createFacilityType(facilityType: FacilityTypeInsert): Promise<FacilityType> {
    const { data, error } = await this.supabase
      .from('facility_types')
      .insert(facilityType)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
  async updateFacilityType(id: string, facilityType: FacilityTypeUpdate): Promise<FacilityType> {
    const { data, error } = await this.supabase
      .from('facility_types')
      .update(facilityType)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
  async deleteFacilityType(id: string): Promise<void> {
    const { error } = await this.supabase.from('facility_types').delete().eq('id', id);

    if (error) {
      throw error;
    }
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
  async updateFacility(id: string, facility: FacilityUpdate): Promise<Facility> {
    const { data, error } = await this.supabase
      .from('facilities')
      .update(facility)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
  async uploadFacilityImage(file: File): Promise<string> {
    const filePath = `${crypto.randomUUID()}-${file.name}`;

    const { error } = await this.supabase.storage.from('facilities').upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data } = this.supabase.storage.from('facilities').getPublicUrl(filePath);

    return data.publicUrl;
  }
  async getAllFacilities(): Promise<FacilityWithType[]> {
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
      .order('name');

    if (error) {
      throw error;
    }

    return data ?? [];
  }
}
