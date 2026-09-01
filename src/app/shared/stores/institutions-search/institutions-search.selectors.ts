import { Selector } from '@ngxs/store';

import { InstitutionsSearchStateModel } from './institutions-search.model';
import { InstitutionsSearchState } from './institutions-search.state';

export class InstitutionsSearchSelectors {
  @Selector([InstitutionsSearchState])
  static getInstitution(state: InstitutionsSearchStateModel) {
    return state.institution.data;
  }

  @Selector([InstitutionsSearchState])
  static getInstitutionLoading(state: InstitutionsSearchStateModel) {
    return state.institution.isLoading;
  }
}
