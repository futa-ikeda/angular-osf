import { provideStore, Store } from '@ngxs/store';

import { TestBed } from '@angular/core/testing';

import { FEATURE_FLAGS } from '@osf/shared/constants/feature-flags.const';

import { MOCK_USER } from '@testing/mocks/data.mock';

import { USER_STATE_INITIAL, UserStateModel } from './user.model';
import { UserSelectors } from './user.selectors';
import { UserState } from './user.state';

describe('UserSelectors', () => {
  let store: Store;

  const setUserState = (userState: UserStateModel) => {
    store.reset({
      ...store.snapshot(),
      user: userState,
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([UserState])],
    });

    store = TestBed.inject(Store);
  });

  it('should select default logged out state', () => {
    setUserState(USER_STATE_INITIAL);

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toBeNull();
    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.getShareIndexing)).toBeUndefined();
    expect(store.selectSnapshot(UserSelectors.getUserNames)).toBeNull();
    expect(store.selectSnapshot(UserSelectors.getEmployment)).toEqual([]);
    expect(store.selectSnapshot(UserSelectors.getEducation)).toEqual([]);
    expect(store.selectSnapshot(UserSelectors.getSocialLinks)).toBeUndefined();
    expect(store.selectSnapshot(UserSelectors.getCanViewReviews)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([]);
  });

  it('should select current user and authentication state', () => {
    setUserState({
      currentUser: {
        data: MOCK_USER,
        isLoading: false,
        error: null,
      },
      activeFlags: [FEATURE_FLAGS.WORKFLOW_LAUNCHER],
    });

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toEqual(MOCK_USER);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([FEATURE_FLAGS.WORKFLOW_LAUNCHER]);
  });

  it('should select current user loading state', () => {
    setUserState({
      currentUser: {
        data: null,
        isLoading: true,
        error: null,
      },
      activeFlags: [],
    });

    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(true);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(false);
  });

  it('should select user profile fields', () => {
    setUserState({
      currentUser: {
        data: MOCK_USER,
        isLoading: false,
        error: null,
      },
      activeFlags: [],
    });

    expect(store.selectSnapshot(UserSelectors.getUserNames)).toEqual(MOCK_USER);
    expect(store.selectSnapshot(UserSelectors.getEmployment)).toEqual(MOCK_USER.employment);
    expect(store.selectSnapshot(UserSelectors.getEducation)).toEqual(MOCK_USER.education);
    expect(store.selectSnapshot(UserSelectors.getSocialLinks)).toEqual(MOCK_USER.social);
    expect(store.selectSnapshot(UserSelectors.getShareIndexing)).toBe(true);
    expect(store.selectSnapshot(UserSelectors.getCanViewReviews)).toBe(true);
  });

  it('should default can view reviews to false when user flag is missing', () => {
    setUserState({
      currentUser: {
        data: { ...MOCK_USER, canViewReviews: undefined as unknown as boolean },
        isLoading: false,
        error: null,
      },
      activeFlags: [],
    });

    expect(store.selectSnapshot(UserSelectors.getCanViewReviews)).toBe(false);
  });

  it('should default active flags to empty array when state value is missing', () => {
    setUserState({
      currentUser: USER_STATE_INITIAL.currentUser,
      activeFlags: undefined as unknown as string[],
    });

    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([]);
  });
});
