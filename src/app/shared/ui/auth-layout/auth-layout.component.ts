import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth-layout',
  imports: [MatIconModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  readonly title = input.required<string>();

  readonly subtitle = input<string>('');
  readonly heroTitle = input.required<string>();

  readonly heroDescription = input.required<string>();
  readonly fullHeight = input(true);
  readonly image = input.required<string>();
  readonly heroHighlight = input('');
  readonly showBenefits = input(true);
  readonly reverse = input(false);
  readonly benefits = [
    {
      icon: 'calendar_month',
      title: 'Reserva',
      description: 'Agenda en pocos segundos.',
    },
    {
      icon: 'location_on',
      title: 'Instalaciones',
      description: 'Cerca de ti.',
    },
    {
      icon: 'shield',
      title: 'Seguridad',
      description: 'Y confianza.',
    },
  ];
}
