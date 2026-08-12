import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WORKFLOW_LAUNCHER_CARDS } from '../../constants/workflow-launcher.constants';
import { WorkflowLauncherCardComponent } from '../workflow-launcher-card/workflow-launcher-card.component';

@Component({
  selector: 'osf-workflow-launcher-section',
  imports: [WorkflowLauncherCardComponent, TranslatePipe],
  templateUrl: './workflow-launcher-section.component.html',
  styleUrl: './workflow-launcher-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowLauncherSectionComponent {
  readonly cards = WORKFLOW_LAUNCHER_CARDS;
}
