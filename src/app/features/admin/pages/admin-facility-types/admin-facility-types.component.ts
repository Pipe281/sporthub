import { Component, inject, OnInit, signal } from '@angular/core';

import { FacilityService, FacilityType } from '../../../../core/services/facility.service';
import { FacilityTypeFormModalComponent } from '../../../../shared/ui/facility-type-form-modal.component/facility-type-form-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-facility-types',
  standalone: true,
  imports: [FacilityTypeFormModalComponent],
  templateUrl: './admin-facility-types.component.html',
})
export class AdminFacilityTypesComponent implements OnInit {
  private readonly facilityService = inject(FacilityService);
  private readonly notificationService = inject(NotificationService);

  readonly facilityTypes = signal<FacilityType[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly showCreateModal = signal(false);
  readonly selectedFacilityType = signal<FacilityType | null>(null);
  readonly selectedFacilityTypeToDelete = signal<FacilityType | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const types = await this.facilityService.getFacilityTypes();

      this.facilityTypes.set(types);
    } catch (error) {
      console.error('Error al cargar los tipos de instalación:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  openCreateModal(): void {
    this.showCreateModal.set(true);
  }
  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }
  onFacilityTypeCreated(type: FacilityType): void {
    this.facilityTypes.update((types) => [...types, type]);
    this.showCreateModal.set(false);
  }
  openEditModal(type: FacilityType): void {
    this.selectedFacilityType.set(type);
  }

  closeEditModal(): void {
    this.selectedFacilityType.set(null);
  }
  async deleteFacilityType(): Promise<void> {
    const type = this.selectedFacilityTypeToDelete();

    if (!type) {
      return;
    }

    try {
      await this.facilityService.deleteFacilityType(type.id);
      this.facilityTypes.update((types) =>
        types.filter((currentType) => currentType.id !== type.id),
      );
      this.notificationService.success('Tipo de instalación eliminado correctamente.');
      this.closeDeleteModal();
    } catch (error) {
      console.error('Error al eliminar el tipo de instalación:', error);
      this.notificationService.error(
        'No fue posible eliminar el tipo de instalación. Puede que tenga instalaciones asociadas.',
      );
    }
  }
  onFacilityTypeUpdated(type: FacilityType): void {
    this.facilityTypes.update((types) =>
      types.map((currentType) => (currentType.id === type.id ? type : currentType)),
    );

    this.selectedFacilityType.set(null);
  }
  openDeleteModal(type: FacilityType): void {
    this.selectedFacilityTypeToDelete.set(type);
  }

  closeDeleteModal(): void {
    this.selectedFacilityTypeToDelete.set(null);
  }
}
