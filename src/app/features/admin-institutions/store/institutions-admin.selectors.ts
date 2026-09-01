import { Selector } from '@ngxs/store';

import { Institution } from '@osf/shared/models/institutions/institutions.model';

import { InstitutionDepartment, InstitutionSearchFilter, InstitutionSummaryMetrics, InstitutionUser } from '../models';

import { InstitutionsAdminStateModel } from './institutions-admin.model';
import { InstitutionsAdminState } from './institutions-admin.state';

export class InstitutionsAdminSelectors {
  @Selector([InstitutionsAdminState])
  static getDepartments(state: InstitutionsAdminStateModel): InstitutionDepartment[] {
    return state.departments.data;
  }

  @Selector([InstitutionsAdminState])
  static getDepartmentsLoading(state: InstitutionsAdminStateModel): boolean {
    return state.departments.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getSummaryMetrics(state: InstitutionsAdminStateModel): InstitutionSummaryMetrics {
    return state.summaryMetrics.data;
  }

  @Selector([InstitutionsAdminState])
  static getSummaryMetricsLoading(state: InstitutionsAdminStateModel): boolean {
    return state.summaryMetrics.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getHasOsfAddonSearch(state: InstitutionsAdminStateModel): InstitutionSearchFilter[] {
    return state.hasOsfAddonSearch.data;
  }

  @Selector([InstitutionsAdminState])
  static getHasOsfAddonSearchLoading(state: InstitutionsAdminStateModel): boolean {
    return state.hasOsfAddonSearch.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getStorageRegionSearch(state: InstitutionsAdminStateModel): InstitutionSearchFilter[] {
    return state.storageRegionSearch.data;
  }

  @Selector([InstitutionsAdminState])
  static getStorageRegionSearchLoading(state: InstitutionsAdminStateModel): boolean {
    return state.storageRegionSearch.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getSearchResults(state: InstitutionsAdminStateModel): InstitutionSearchFilter[] {
    return state.searchResults.data;
  }

  @Selector([InstitutionsAdminState])
  static getSearchResultsLoading(state: InstitutionsAdminStateModel): boolean {
    return state.searchResults.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getUsers(state: InstitutionsAdminStateModel): InstitutionUser[] {
    return state.users.data;
  }

  @Selector([InstitutionsAdminState])
  static getUsersLoading(state: InstitutionsAdminStateModel): boolean {
    return state.users.isLoading;
  }

  @Selector([InstitutionsAdminState])
  static getUsersTotalCount(state: InstitutionsAdminStateModel): number {
    return state.users.totalCount;
  }

  @Selector([InstitutionsAdminState])
  static getInstitution(state: InstitutionsAdminStateModel): Institution {
    return state.institution.data;
  }

  @Selector([InstitutionsAdminState])
  static getInstitutionLoading(state: InstitutionsAdminStateModel): boolean {
    return state.institution.isLoading;
  }
}
