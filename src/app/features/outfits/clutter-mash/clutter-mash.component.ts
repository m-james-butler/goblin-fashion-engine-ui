import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-clutter-mash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './clutter-mash.component.html',
  styleUrl: './clutter-mash.component.scss',
})
export class ClutterMashComponent {}
