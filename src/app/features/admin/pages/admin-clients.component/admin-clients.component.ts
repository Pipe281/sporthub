import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CustomerService, Customer } from '../../../../core/services/customer.service';
import { CustomerDetailModalComponent } from '../../../../shared/ui/customer-detail-modal/customer-detail-modal.component';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [DatePipe, CustomerDetailModalComponent],
  templateUrl: './admin-clients.component.html',
})
export class AdminClientsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  readonly customers = signal<Customer[]>([]);

  readonly loading = signal(true);
  readonly error = signal(false);

  readonly selectedCustomerId = signal<string | null>(null);
  readonly detailModalOpen = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const customers = await this.customerService.getCustomers();
      this.customers.set(customers);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  openCustomerDetail(customerId: string | null): void {
    if (!customerId) {
      return;
    }

    this.selectedCustomerId.set(customerId);
    this.detailModalOpen.set(true);
  }
  closeCustomerDetail(): void {
    this.detailModalOpen.set(false);
    this.selectedCustomerId.set(null);
  }
}
