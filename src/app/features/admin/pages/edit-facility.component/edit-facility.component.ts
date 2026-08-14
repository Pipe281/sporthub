import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  selector: 'app-edit-facility',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './edit-facility.component.html',
})
export class EditFacilityComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly facilityService = inject(FacilityService);
  private readonly notificationService = inject(NotificationService);

  readonly loading = signal(true);
  readonly isSaving = signal(false);

  readonly facilityTypes = signal<FacilityType[]>([]);

  private facilityId = '';

  readonly facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    facility_type_id: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    price_per_hour: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE' as FacilityStatus, Validators.required],
    image_url: [''],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.notificationService.error('No se encontró la instalación.');
      this.loading.set(false);
      return;
    }

    this.facilityId = id;

    try {
      const [facility, types] = await Promise.all([
        this.facilityService.getFacilityById(id),
        this.facilityService.getFacilityTypes(),
      ]);

      this.facilityTypes.set(types);

      this.facilityForm.patchValue({
        name: facility.name,
        description: facility.description ?? '',
        facility_type_id: facility.facility_type_id,
        capacity: facility.capacity,
        price_per_hour: facility.price_per_hour,
        status: facility.status ?? 'ACTIVE',
        image_url: facility.image_url ?? '',
      });

      console.log('Formulario cargado:', this.facilityForm.getRawValue());
    } catch (error) {
      console.error('Error al cargar la instalación:', error);

      this.notificationService.error('No fue posible cargar la instalación.');
    } finally {
      this.loading.set(false);
    }
  }
  async submit(): Promise<void> {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    try {
      this.isSaving.set(true);

      const formValue = this.facilityForm.getRawValue();

      const facility = await this.facilityService.updateFacility(this.facilityId, {
        ...formValue,
        image_url: formValue.image_url || null,
      });

      console.log('Instalación actualizada:', facility);

      this.notificationService.success('Instalación actualizada correctamente.');
    } catch (error) {
      console.error('Error al actualizar la instalación:', error);

      this.notificationService.error('No fue posible actualizar la instalación.');
    } finally {
      this.isSaving.set(false);
    }
  }
}
