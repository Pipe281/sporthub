import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TextInputComponent } from '../../../../shared/ui/text-input/text-input.component';
import { ButtonComponent } from '../../../../shared/ui/botton/button.component';

@Component({
  selector: 'app-create-facility',
  standalone: true,
  imports: [ReactiveFormsModule, TextInputComponent, ButtonComponent],
  templateUrl: './create-facility.component.html',
})
export class CreateFacilityComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly facilityForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    facility_type_id: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    price_per_hour: [0, [Validators.required, Validators.min(0)]],
    status: ['ACTIVE', Validators.required],
    image_url: [''],
  });

  submit(): void {
    if (this.facilityForm.invalid) {
      this.facilityForm.markAllAsTouched();
      return;
    }

    const facility = this.facilityForm.getRawValue();
    console.log('Nueva instalación:', facility);
  }

  cancel(): void {
    this.facilityForm.reset({
      name: '',
      description: '',
      facility_type_id: '',
      capacity: 0,
      price_per_hour: 0,
      status: 'ACTIVE',
      image_url: '',
    });
  }
}
