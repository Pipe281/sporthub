import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SupabaseService } from './core/services/supabase.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  //protected readonly title = signal('sporthub');

  private readonly supabaseService = inject(SupabaseService);

  ngOnInit(): void {
    void this.testConnection();
  }

  private async testConnection(): Promise<void> {
    const client = this.supabaseService.getClient();
    const { data, error } = await client.from('profiles').select('*').limit(1);

    if (error) {
      console.error('Error de conexión:', error);
      return;
    }

    console.log('Conexión exitosa:', data);
  }
}
