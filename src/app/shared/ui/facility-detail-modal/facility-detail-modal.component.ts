import { Component, inject, input, output, signal, OnChanges } from '@angular/core';

import { FacilityService, FacilityWithType } from '../../../core/services/facility.service';

@Component({
  selector: 'app-facility-detail-modal',
  standalone: true,
  imports: [],
  templateUrl: './facility-detail-modal.component.html',
})
export class FacilityDetailModalComponent implements OnChanges {
  private readonly facilityService = inject(FacilityService);

  readonly facilityId = input<string | null>(null);

  readonly closed = output<void>();

  readonly facility = signal<FacilityWithType | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);

  async ngOnChanges(): Promise<void> {
    const id = this.facilityId();

    if (!id) {
      this.facility.set(null);
      return;
    }

    await this.loadFacility(id);
  }

  private async loadFacility(id: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const facility = await this.facilityService.getFacilityById(id);

      this.facility.set(facility);
    } catch (error) {
      console.error('Error al cargar el detalle de la instalación:', error);

      this.error.set(true);
      this.facility.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
