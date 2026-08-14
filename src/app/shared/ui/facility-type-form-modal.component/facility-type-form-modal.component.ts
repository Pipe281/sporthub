import { Component, inject, input, output, signal, OnChanges } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FacilityService, FacilityType } from '../../../core/services/facility.service';

import { TextInputComponent } from '../text-input/text-input.component';
import { ButtonComponent } from '../botton/button.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-facility-type-form-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './facility-type-form-modal.component.html',
})
export class FacilityTypeFormModalComponent implements OnChanges {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly facilityService = inject(FacilityService);
  private readonly notificationService = inject(NotificationService);

  readonly facilityType = input<FacilityType | null>(null);
  readonly closed = output<void>();
  readonly created = output<FacilityType>();
  readonly updated = output<FacilityType>();

  readonly editing = signal(false);
  readonly loading = signal(false);

  readonly facilityTypeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  ngOnChanges(): void {
    const type = this.facilityType();

    if (!type) {
      this.editing.set(false);

      this.facilityTypeForm.reset({
        name: '',
        description: '',
      });

      return;
    }

    this.editing.set(true);

    this.facilityTypeForm.patchValue({
      name: type.name,
      description: type.description ?? '',
    });
  }
  async save(): Promise<void> {
    if (this.facilityTypeForm.invalid) {
      this.facilityTypeForm.markAllAsTouched();
      return;
    }

    try {
      this.loading.set(true);

      const formValue = this.facilityTypeForm.getRawValue();
      const currentType = this.facilityType();

      if (currentType) {
        const facilityType = await this.facilityService.updateFacilityType(currentType.id, {
          name: formValue.name,
          description: formValue.description || null,
        });

        this.notificationService.success('Tipo de instalación actualizado correctamente.');

        this.updated.emit(facilityType);
      } else {
        const facilityType = await this.facilityService.createFacilityType({
          name: formValue.name,
          description: formValue.description || null,
        });

        this.notificationService.success('Tipo de instalación creado correctamente.');

        this.created.emit(facilityType);
      }
    } catch (error) {
      console.error('Error al guardar el tipo de instalación:', error);

      this.notificationService.error('No fue posible guardar el tipo de instalación.');
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
