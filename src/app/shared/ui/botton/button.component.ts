import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);
  readonly variant = input<'primary' | 'secondary' | 'outline'>('primary');

  readonly classes = computed(() => {
    const base =
      'inline-flex items-center justify-center rounded-xl px-6 py-4 font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#9FEA00]/40';

    const variants = {
      primary: 'bg-[#9FEA00] text-black hover:brightness-110',
      secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
      outline: 'border border-zinc-600 bg-transparent text-white hover:bg-zinc-900',
    };

    const disabled = this.disabled() || this.loading() ? 'opacity-60 cursor-not-allowed' : '';
    const width = this.fullWidth() ? 'w-full' : '';

    return `${base} ${variants[this.variant()]} ${disabled} ${width}`;
  });
}
