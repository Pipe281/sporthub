import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CustomerService, Customer } from '../../../../core/services/customer.service';

@Component({
  selector: 'app-admin-clients',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-clients.component.html',
})
export class AdminClientsComponent implements OnInit {
  private readonly customerService = inject(CustomerService);

  readonly customers = signal<Customer[]>([]);

  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(false);

      const customers = await this.customerService.getCustomers();

      console.log('Clientes:', customers);

      this.customers.set(customers);
    } catch (error) {
      console.error('Error al cargar los clientes:', error);

      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
