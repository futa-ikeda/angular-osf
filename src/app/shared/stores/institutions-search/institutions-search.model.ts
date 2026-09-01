import { Institution } from '@osf/shared/models/institutions/institutions.model';
import { AsyncStateModel } from '@osf/shared/models/store/async-state.model';

export interface InstitutionsSearchStateModel {
  institution: AsyncStateModel<Institution>;
}

export const INSTITUTIONS_SEARCH_STATE_DEFAULTS: InstitutionsSearchStateModel = {
  institution: {
    data: {} as Institution,
    isLoading: false,
    error: null,
  },
};
