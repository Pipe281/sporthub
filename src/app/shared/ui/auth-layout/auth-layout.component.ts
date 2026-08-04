import { Component, input, computed } from '@angular/core';
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
  readonly dividerPosition = computed(() => (this.reverse() ? 'ml-auto' : ''));
  readonly descriptionPosition = computed(() => (this.reverse() ? 'ml-auto' : ''));
  readonly heroPosition = computed(() =>
    this.reverse() ? 'right-24 text-right' : 'left-24 text-left',
  );
  readonly heroGradient = computed(() =>
    this.reverse()
      ? 'bg-gradient-to-l from-zinc-950 via-black/40 to-black/10'
      : 'bg-gradient-to-r from-zinc-950 via-black/40 to-black/10',
  );

  readonly benefitsPosition = computed(() => (this.reverse() ? 'justify-end' : 'justify-start'));
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
