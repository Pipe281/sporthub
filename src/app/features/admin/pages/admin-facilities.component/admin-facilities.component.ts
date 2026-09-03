import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FacilityService,
  FacilityStatus,
  FacilityType,
  FacilityWithType,
} from '../../../../core/services/facility.service';
import { FacilityDetailModalComponent } from '../../../../shared/ui/facility-detail-modal/facility-detail-modal.component';
import { ADMIN_ROUTES } from '../../../../core/constants/app-routes.constants';

@Component({
  selector: 'app-admin-facilities',
  standalone: true,
  imports: [RouterLink, FacilityDetailModalComponent],
  templateUrl: './admin-facilities.component.html',
})
export class AdminFacilitiesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);
  protected readonly ADMIN_ROUTES = ADMIN_ROUTES;
  readonly selectedFacilityId = signal<string | null>(null);

  readonly facilities = signal<FacilityWithType[]>([]);
  readonly facilityTypes = signal<FacilityType[]>([]);
  readonly searchTerm = signal('');
  readonly selectedType = signal('');
  readonly selectedStatus = signal<FacilityStatus | ''>('');
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const [facilities, types] = await Promise.all([
        this.facilityService.getAllFacilities(),
        this.facilityService.getFacilityTypes(),
      ]);

      this.facilities.set(facilities);
      this.facilityTypes.set(types);
    } catch (error) {
      console.error('Error al cargar las instalaciones:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  openFacilityDetail(id: string): void {
    this.selectedFacilityId.set(id);
  }

  closeFacilityDetail(): void {
    this.selectedFacilityId.set(null);
  }
  onFacilityUpdated(updatedFacility: FacilityWithType): void {
    this.facilities.update((facilities) =>
      facilities.map((facility) =>
        facility.id === updatedFacility.id ? updatedFacility : facility,
      ),
    );
  }
  readonly filteredFacilities = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const type = this.selectedType();
    const status = this.selectedStatus();

    return this.facilities().filter((facility) => {
      const matchesSearch = !search || facility.name.toLowerCase().includes(search);
      const matchesType = !type || facility.facility_type_id === type;
      const matchesStatus = !status || facility.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  });
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }
  onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedType.set(select.value);
  }
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value as FacilityStatus | '');
  }
  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedType.set('');
    this.selectedStatus.set('');
  }
}
