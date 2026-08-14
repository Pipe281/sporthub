import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  FacilityService,
  FacilityWithType,
  FacilityType,
  FacilityStatus,
} from '../../../core/services/facility.service';

import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../botton/button.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-facility-detail-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './facility-detail-modal.component.html',
})
export class FacilityDetailModalComponent implements OnChanges {
  private readonly facilityService = inject(FacilityService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly notificationService = inject(NotificationService);

  readonly facilityId = input<string | null>(null);
  readonly closed = output<void>();
  readonly facilityUpdated = output<FacilityWithType>();

  readonly facility = signal<FacilityWithType | null>(null);
  readonly facilityTypes = signal<FacilityType[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);

  readonly editing = signal(false);
  readonly isSaving = signal(false);
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);

  readonly facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    facility_type_id: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    price_per_hour: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE' as FacilityStatus, Validators.required],
    image_url: [''],
  });

  async ngOnChanges(): Promise<void> {
    const id = this.facilityId();

    if (!id) {
      this.facility.set(null);
      this.editing.set(false);
      return;
    }

    this.editing.set(false);

    await this.loadFacility(id);
  }

  private async loadFacility(id: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const [facility, types] = await Promise.all([
        this.facilityService.getFacilityById(id),
        this.facilityService.getFacilityTypes(),
      ]);

      this.facility.set(facility);
      this.facilityTypes.set(types);

      this.patchForm(facility);
    } catch (error) {
      console.error('Error al cargar el detalle de la instalación:', error);

      this.error.set(true);
      this.facility.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  private patchForm(facility: FacilityWithType): void {
    this.facilityForm.patchValue({
      name: facility.name,
      description: facility.description ?? '',
      facility_type_id: facility.facility_type_id,
      capacity: facility.capacity,
      price_per_hour: facility.price_per_hour,
      status: facility.status ?? 'ACTIVE',
      image_url: facility.image_url ?? '',
    });
  }

  startEditing(): void {
    const facility = this.facility();

    if (!facility) {
      return;
    }

    this.patchForm(facility);
    this.editing.set(true);
  }

  cancelEditing(): void {
    const facility = this.facility();

    if (facility) {
      this.patchForm(facility);
    }
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
    this.editing.set(false);
  }
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedImage.set(null);
      this.imagePreviewUrl.set(null);
      return;
    }

    const image = input.files[0];
    this.selectedImage.set(image);
    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreviewUrl.set(reader.result as string);
    };

    reader.readAsDataURL(image);
  }

  async saveChanges(): Promise<void> {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    const id = this.facilityId();

    if (!id) {
      return;
    }

    try {
      this.isSaving.set(true);

      const formValue = this.facilityForm.getRawValue();

      // Mantener la imagen actual
      let imageUrl = formValue.image_url || null;

      // Si el administrador seleccionó una nueva imagen,
      // primero la subimos a Supabase Storage.
      const image = this.selectedImage();

      if (image) {
        imageUrl = await this.facilityService.uploadFacilityImage(image);
      }

      // Guardamos la instalación con la nueva URL,
      // o con la URL anterior si no se seleccionó una imagen.
      const updatedFacility = await this.facilityService.updateFacility(id, {
        ...formValue,
        image_url: imageUrl,
      });

      const currentFacility = this.facility();

      if (currentFacility) {
        const updatedFacilityWithType: FacilityWithType = {
          ...currentFacility,
          ...updatedFacility,
        };

        this.facility.set(updatedFacilityWithType);
        this.facilityUpdated.emit(updatedFacilityWithType);
      }

      this.notificationService.success('Instalación actualizada correctamente.');

      this.selectedImage.set(null);
      this.editing.set(false);
    } catch (error) {
      console.error('Error al actualizar la instalación:', error);

      this.notificationService.error('No fue posible actualizar la instalación.');
    } finally {
      this.isSaving.set(false);
    }
  }
  close(): void {
    this.editing.set(false);
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
    this.closed.emit();
  }
}
