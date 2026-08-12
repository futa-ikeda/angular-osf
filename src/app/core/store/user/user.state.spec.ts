import { provideStore, Store } from '@ngxs/store';

import { MockProvider } from 'ng-mocks';

import { defaultIfEmpty, firstValueFrom } from 'rxjs';

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { StorageService } from '@core/services/storage.service';
import { UserService } from '@core/services/user.service';
import { FEATURE_FLAGS } from '@osf/shared/constants/feature-flags.const';
import { ProfileSettingsKey } from '@osf/shared/enums/profile-settings-key.enum';
import { removeNullable } from '@osf/shared/helpers/remove-nullable.helper';
import { UserMapper } from '@osf/shared/mappers/user';

import {
  getAcceptedTermsUserDataJsonApi,
  getCurrentUserData,
  getLoggedOutCurrentUserData,
  getUserDataJsonApi,
} from '@testing/data/user/user.data';
import { MOCK_USER } from '@testing/mocks/data.mock';
import { provideOSFCore, provideOSFHttp } from '@testing/osf.testing.provider';
import { StorageServiceMock, StorageServiceMockType } from '@testing/providers/storage.service.mock';

import {
  AcceptTermsOfServiceByUser,
  ClearCurrentUser,
  GetCurrentUser,
  SetCurrentUser,
  UpdateProfileSettingsEducation,
  UpdateProfileSettingsEmployment,
  UpdateProfileSettingsSocialLinks,
  UpdateProfileSettingsUser,
} from './user.actions';
import { UserSelectors } from './user.selectors';
import { UserState } from './user.state';

describe('State: User', () => {
  const currentUserApiUrl = 'http://localhost:8000/v2/';
  const userApiUrl = `http://localhost:8000/v2/users/${MOCK_USER.id}/`;

  let store: Store;
  let storageService: StorageServiceMockType;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    storageService = StorageServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        provideOSFCore(),
        provideOSFHttp(),
        provideStore([UserState]),
        UserService,
        MockProvider(StorageService, storageService),
      ],
    });

    store = TestBed.inject(Store);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getCurrentUser should hydrate cached session, fetch current user, and update selectors', async () => {
    storageService.getCachedUser.mockReturnValue(MOCK_USER);
    storageService.getCachedActiveFlags.mockReturnValue(['cached_flag']);

    const dispatchPromise = firstValueFrom(store.dispatch(GetCurrentUser));

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toEqual(MOCK_USER);
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual(['cached_flag']);
    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);

    const request = httpMock.expectOne(currentUserApiUrl);
    expect(request.request.method).toBe('GET');
    request.flush(getCurrentUserData());
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toEqual(
      UserMapper.fromUserGetResponse(getUserDataJsonApi())
    );
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([FEATURE_FLAGS.WORKFLOW_LAUNCHER]);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(true);
    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);
    expect(storageService.setCachedActiveFlags).toHaveBeenCalledWith([FEATURE_FLAGS.WORKFLOW_LAUNCHER]);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(UserMapper.fromUserGetResponse(getUserDataJsonApi()));
  });

  it('getCurrentUser should set loading while fetching when no cached user exists', async () => {
    const dispatchPromise = firstValueFrom(store.dispatch(GetCurrentUser));

    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(true);

    const request = httpMock.expectOne(currentUserApiUrl);
    request.flush(getCurrentUserData());
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(true);
  });

  it('getCurrentUser should clear current user when api returns no user and no cache exists', async () => {
    const dispatchPromise = firstValueFrom(store.dispatch(GetCurrentUser));

    const request = httpMock.expectOne(currentUserApiUrl);
    request.flush(getLoggedOutCurrentUserData());
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toBeNull();
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([]);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);
    expect(storageService.setCachedActiveFlags).toHaveBeenCalledWith([]);
    expect(storageService.setCachedUser).not.toHaveBeenCalled();
  });

  it('getCurrentUser should keep cached user when api returns no user but cache exists', async () => {
    storageService.getCachedUser.mockReturnValue(MOCK_USER);
    storageService.getCachedActiveFlags.mockReturnValue(['cached_flag']);

    const dispatchPromise = firstValueFrom(store.dispatch(GetCurrentUser));

    const request = httpMock.expectOne(currentUserApiUrl);
    request.flush(getLoggedOutCurrentUserData());
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toEqual(MOCK_USER);
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([]);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(true);
    expect(storageService.setCachedActiveFlags).toHaveBeenCalledWith([]);
    expect(storageService.setCachedUser).not.toHaveBeenCalled();
  });

  it('setCurrentUser should set current user in state and cache', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toEqual(MOCK_USER);
    expect(store.selectSnapshot(UserSelectors.getCurrentUserLoading)).toBe(false);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(true);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(MOCK_USER);
  });

  it('clearCurrentUser should clear current user, active flags, and session cache', async () => {
    const userService = TestBed.inject(UserService);
    const resetCacheSpy = vi.spyOn(userService, 'resetCurrentUserCache');

    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));
    await firstValueFrom(store.dispatch(ClearCurrentUser));

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)).toBeNull();
    expect(store.selectSnapshot(UserSelectors.getActiveFlags)).toEqual([]);
    expect(store.selectSnapshot(UserSelectors.isAuthenticated)).toBe(false);
    expect(storageService.clearSession).toHaveBeenCalled();
    expect(resetCacheSpy).toHaveBeenCalled();
  });

  it('updateProfileSettingsEmployment should not call api when current user is missing', async () => {
    await firstValueFrom(
      store.dispatch(new UpdateProfileSettingsEmployment(MOCK_USER.employment)).pipe(defaultIfEmpty(null))
    );

    httpMock.expectNone(userApiUrl);
    expect(storageService.setCachedUser).not.toHaveBeenCalled();
  });

  it('updateProfileSettingsEmployment should update employment and persist current user', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));
    const employment = MOCK_USER.employment.map((item) => removeNullable(item));

    const dispatchPromise = firstValueFrom(store.dispatch(new UpdateProfileSettingsEmployment(MOCK_USER.employment)));

    const request = httpMock.expectOne(userApiUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: { [ProfileSettingsKey.Employment]: employment },
      },
    });
    request.flush({ data: getUserDataJsonApi() });
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getEmployment)).toEqual(MOCK_USER.employment);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(UserMapper.fromUserGetResponse(getUserDataJsonApi()));
  });

  it('updateProfileSettingsEducation should update education and persist current user', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));

    const dispatchPromise = firstValueFrom(store.dispatch(new UpdateProfileSettingsEducation(MOCK_USER.education)));

    const request = httpMock.expectOne(userApiUrl);
    expect(request.request.method).toBe('PATCH');
    request.flush({ data: getUserDataJsonApi() });
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getEducation)).toEqual(MOCK_USER.education);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(UserMapper.fromUserGetResponse(getUserDataJsonApi()));
  });

  it('updateProfileSettingsUser should update user profile names and persist current user', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));
    const payload = {
      fullName: 'Jane Doe',
      givenName: 'Jane',
      familyName: 'Doe',
    };

    const dispatchPromise = firstValueFrom(store.dispatch(new UpdateProfileSettingsUser(payload)));

    const request = httpMock.expectOne(userApiUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: UserMapper.toNamesRequest(payload),
      },
    });
    request.flush({ data: getUserDataJsonApi() });
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getUserNames)?.fullName).toBe('John Doe');
    expect(storageService.setCachedUser).toHaveBeenCalledWith(UserMapper.fromUserGetResponse(getUserDataJsonApi()));
  });

  it('updateProfileSettingsSocialLinks should merge social links and persist current user', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));
    const socialUpdates = [{ github: ['https://github.com/janedoe'] }, { twitter: ['https://twitter.com/janedoe'] }];

    const dispatchPromise = firstValueFrom(store.dispatch(new UpdateProfileSettingsSocialLinks(socialUpdates)));

    const request = httpMock.expectOne(userApiUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: {
          [ProfileSettingsKey.Social]: {
            github: ['https://github.com/janedoe'],
            twitter: ['https://twitter.com/janedoe'],
          },
        },
      },
    });
    request.flush({ data: getUserDataJsonApi() });
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getSocialLinks)).toEqual(MOCK_USER.social);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(UserMapper.fromUserGetResponse(getUserDataJsonApi()));
  });

  it('acceptTermsOfServiceByUser should not call api when current user is missing', async () => {
    await firstValueFrom(store.dispatch(AcceptTermsOfServiceByUser).pipe(defaultIfEmpty(null)));

    httpMock.expectNone(userApiUrl);
    expect(storageService.setCachedUser).not.toHaveBeenCalled();
  });

  it('acceptTermsOfServiceByUser should accept terms of service and persist current user', async () => {
    await firstValueFrom(store.dispatch(new SetCurrentUser(MOCK_USER)));

    const dispatchPromise = firstValueFrom(store.dispatch(AcceptTermsOfServiceByUser));

    const request = httpMock.expectOne(userApiUrl);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: { accepted_terms_of_service: true },
      },
    });
    request.flush({ data: getAcceptedTermsUserDataJsonApi() });
    await dispatchPromise;

    expect(store.selectSnapshot(UserSelectors.getCurrentUser)?.acceptedTermsOfService).toBe(true);
    expect(storageService.setCachedUser).toHaveBeenCalledWith(
      UserMapper.fromUserGetResponse(getAcceptedTermsUserDataJsonApi())
    );
  });
});
