import { Selector } from '@ngxs/store';

import { SubjectModel } from '@osf/shared/models/subject/subject.model';

import { SubjectsStateModel } from './subjects.model';
import { SubjectsState } from './subjects.state';

export class SubjectsSelectors {
  @Selector([SubjectsState])
  static getSubjects(state: SubjectsStateModel): SubjectModel[] {
    return state.subjects.data;
  }

  @Selector([SubjectsState])
  static getSubjectsLoading(state: SubjectsStateModel): boolean {
    return state.subjects.isLoading;
  }

  @Selector([SubjectsState])
  static getSearchedSubjects(state: SubjectsStateModel): SubjectModel[] {
    return state.searchedSubjects.data;
  }

  @Selector([SubjectsState])
  static getSearchedSubjectsLoading(state: SubjectsStateModel): boolean {
    return state.searchedSubjects.isLoading;
  }

  @Selector([SubjectsState])
  static getSelectedSubjects(state: SubjectsStateModel): SubjectModel[] {
    return state.selectedSubjects.data;
  }

  @Selector([SubjectsState])
  static areSelectedSubjectsLoading(state: SubjectsStateModel): boolean {
    return state.selectedSubjects.isLoading;
  }
}
