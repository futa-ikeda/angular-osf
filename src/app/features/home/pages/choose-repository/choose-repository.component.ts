import { TranslatePipe } from '@ngx-translate/core';

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SubHeaderComponent } from '@osf/shared/components/sub-header/sub-header.component';

import { REPOSITORY_OPTIONS } from '../../constants/choose-repository.constants';

@Component({
  selector: 'osf-choose-repository',
  imports: [SubHeaderComponent, TranslatePipe],
  templateUrl: './choose-repository.component.html',
  styleUrl: './choose-repository.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseRepositoryComponent {
  readonly repositories = REPOSITORY_OPTIONS;
}
