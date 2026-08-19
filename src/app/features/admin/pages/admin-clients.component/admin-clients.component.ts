import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CustomerService, Customer } from '../../../../core/services/customer.service';
import { CustomerDetailModalComponent } from '../../../../shared/ui/customer-detail-modal/customer-detail-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [DatePipe, CustomerDetailModalComponent],
  templateUrl: './admin-clients.component.html',
})
export class AdminClientsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly notificationService = inject(NotificationService);

  readonly customers = signal<Customer[]>([]);
  readonly searchTerm = signal('');
  readonly filteredCustomers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();

    if (!term) {
      return this.customers();
    }

    return this.customers().filter((customer) => {
      const firstName = customer.first_name?.toLowerCase() ?? '';
      const lastName = customer.last_name?.toLowerCase() ?? '';
      const email = customer.email?.toLowerCase() ?? '';

      return firstName.includes(term) || lastName.includes(term) || email.includes(term);
    });
  });

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
  async blockCustomer(customerId: string | null): Promise<void> {
    if (!customerId) {
      return;
    }

    try {
      await this.customerService.blockCustomer(customerId);

      this.customers.update((customers) =>
        customers.map((customer) =>
          customer.id === customerId ? { ...customer, status: 'BLOCKED' } : customer,
        ),
      );

      this.notificationService.success('Cliente bloqueado correctamente.');
    } catch (error) {
      console.error('Error al bloquear el cliente:', error);

      this.notificationService.error('No fue posible bloquear el cliente.');
    }
  }
  async unblockCustomer(customerId: string | null): Promise<void> {
    if (!customerId) {
      return;
    }

    try {
      await this.customerService.unblockCustomer(customerId);

      this.customers.update((customers) =>
        customers.map((customer) =>
          customer.id === customerId ? { ...customer, status: 'ACTIVE' } : customer,
        ),
      );

      this.notificationService.success('Cliente desbloqueado correctamente.');
    } catch (error) {
      console.error('Error al desbloquear el cliente:', error);

      this.notificationService.error('No fue posible desbloquear el cliente.');
    }
  }
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm.set(input.value);
  }
}
