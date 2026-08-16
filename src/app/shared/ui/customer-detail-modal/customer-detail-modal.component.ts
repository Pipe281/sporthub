import { DatePipe } from '@angular/common';
import { Component, inject, input, OnChanges, output, signal } from '@angular/core';

import { CustomerService, Customer, Reservation } from '../../../core/services/customer.service';

@Component({
  selector: 'app-customer-detail-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './customer-detail-modal.component.html',
})
export class CustomerDetailModalComponent implements OnChanges {
  private readonly customerService = inject(CustomerService);

  readonly customerId = input<string | null>(null);

  readonly closed = output<void>();

  readonly customer = signal<Customer | null>(null);
  readonly reservations = signal<Reservation[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);

  async ngOnChanges(): Promise<void> {
    const id = this.customerId();

    if (!id) {
      this.customer.set(null);
      this.reservations.set([]);
      return;
    }

    await this.loadCustomer(id);
  }

  private async loadCustomer(id: string): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const [customer, reservations] = await Promise.all([
        this.customerService.getCustomerById(id),
        this.customerService.getCustomerReservations(id),
      ]);

      this.customer.set(customer);
      this.reservations.set(reservations);
    } catch (error) {
      console.error('Error al cargar el detalle del cliente:', error);

      this.error.set(true);
      this.customer.set(null);
      this.reservations.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  close(): void {
    this.closed.emit();
  }
}
