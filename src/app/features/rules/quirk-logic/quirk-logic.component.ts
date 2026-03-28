import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-quirk-logic',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './quirk-logic.component.html',
  styleUrl: './quirk-logic.component.scss',
})
export class QuirkLogicComponent {}
