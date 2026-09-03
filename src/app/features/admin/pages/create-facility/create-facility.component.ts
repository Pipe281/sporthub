import { Component, inject, OnInit, signal } from '@angular/core';

import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';

import {
  FacilityService,
  FacilityType,
  FacilityStatus,
} from '../../../../core/services/facility.service';

import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-create-facility',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './create-facility.component.html',
})
export class CreateFacilityComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly facilityService = inject(FacilityService);
  private readonly notificationService = inject(NotificationService);

  readonly isSaving = signal(false);
  readonly facilityTypes = signal<FacilityType[]>([]);
  readonly selectedImage = signal<File | null>(null);

  readonly facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    facility_type_id: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    price_per_hour: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE' as FacilityStatus, Validators.required],
  });

  async ngOnInit(): Promise<void> {
    try {
      const types = await this.facilityService.getFacilityTypes();
      this.facilityTypes.set(types);
    } catch (error) {
      console.error('Error al cargar los tipos de instalación:', error);

      this.notificationService.error('No fue posible cargar los tipos de instalación.');
    }
  }

  async submit(): Promise<void> {
    this.notificationService.info('Crear instalaciones está deshabilitado por el administrador.');
    return;

    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving.set(true);
      const formValue = this.facilityForm.getRawValue();
      let imageUrl: string | null = null;
      const image = this.selectedImage();

      if (image !== null) {
        imageUrl = await this.facilityService.uploadFacilityImage(image!);
      }

      const facility = await this.facilityService.createFacility({
        ...formValue,
        image_url: imageUrl,
      });

      console.log('Instalación creada:', facility);
      this.notificationService.success('Instalación creada correctamente.');

      this.facilityForm.reset({
        name: '',
        description: '',
        facility_type_id: '',
        capacity: 0,
        price_per_hour: 0,
        status: 'ACTIVE',
      });

      this.selectedImage.set(null);
    } catch (error) {
      console.error('Error al crear la instalación:', error);

      this.notificationService.error('No fue posible crear la instalación.');
    } finally {
      this.isSaving.set(false);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedImage.set(null);
      return;
    }
    this.selectedImage.set(input.files[0]);
    console.log('Imagen seleccionada:', this.selectedImage());
  }

  cancel(): void {
    this.facilityForm.reset({
      name: '',
      description: '',
      facility_type_id: '',
      capacity: 0,
      price_per_hour: 0,
      status: 'ACTIVE',
    });

    this.selectedImage.set(null);
  }
}
