import { TranslatePipe } from '@ngx-translate/core';

import { Button } from 'primeng/button';

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '@osf/shared/components/icon/icon.component';

import { WorkflowLauncherCard } from '../../models/workflow-launcher-card.model';

@Component({
  selector: 'osf-workflow-launcher-card',
  imports: [Button, IconComponent, RouterLink, TranslatePipe],
  templateUrl: './workflow-launcher-card.component.html',
  styleUrl: './workflow-launcher-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowLauncherCardComponent {
  card = input.required<WorkflowLauncherCard>();
}
