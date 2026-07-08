import { TranslatePipe } from '@ngx-translate/core';

import { Tag } from 'primeng/tag';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { RegistryStatusMap } from '@osf/shared/constants/registration-statuses';
import { RegistryStatus } from '@osf/shared/enums/registry-status.enum';

@Component({
  selector: 'osf-status-badge',
  imports: [Tag, TranslatePipe],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  status = input.required<RegistryStatus>();

  label = computed(() => RegistryStatusMap[this.status()]?.label ?? 'resourceCard.type.null');
  severity = computed(() => RegistryStatusMap[this.status()]?.severity ?? null);
}
