import { MockProvider } from 'ng-mocks';

import { firstValueFrom, of, Subject } from 'rxjs';

import { TestBed } from '@angular/core/testing';

import { FEATURE_FLAGS } from '@osf/shared/constants/feature-flags.const';
import { ProfileSettingsKey } from '@osf/shared/enums/profile-settings-key.enum';
import { UserMapper } from '@osf/shared/mappers/user';
import { UserData } from '@osf/shared/models/user/user.model';
import {
  UserAcceptedTermsOfServiceJsonApi,
  UserDataResponseJsonApi,
} from '@osf/shared/models/user/user-json-api.model';
import { JsonApiService } from '@osf/shared/services/json-api.service';

import { getCurrentUserData, getUserDataJsonApi } from '@testing/data/user/user.data';
import { MOCK_USER } from '@testing/mocks/data.mock';
import { JsonApiServiceMock, JsonApiServiceMockType } from '@testing/providers/json-api.service.mock';

import { ENVIRONMENT } from '../provider/environment.provider';

import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let jsonApiService: JsonApiServiceMockType;

  const apiResponse = getCurrentUserData();

  const mappedUserData: UserData = {
    activeFlags: [FEATURE_FLAGS.WORKFLOW_LAUNCHER],
    currentUser: MOCK_USER,
  };

  beforeEach(() => {
    jsonApiService = JsonApiServiceMock.simple();

    TestBed.configureTestingModule({
      providers: [
        UserService,
        MockProvider(JsonApiService, jsonApiService),
        MockProvider(ENVIRONMENT, { apiDomainUrl: 'https://api.test' }),
      ],
    });

    service = TestBed.inject(UserService);
  });

  it('should expose apiUrl from environment', () => {
    expect(service.apiUrl).toBe('https://api.test/v2');
  });

  it('should fetch and map current user from /v2/', async () => {
    jsonApiService.get.mockReturnValue(of(apiResponse));
    const mapperSpy = vi.spyOn(UserMapper, 'fromUserDataGetResponse').mockReturnValue(mappedUserData);

    const result = await firstValueFrom(service.getCurrentUser());

    expect(jsonApiService.get).toHaveBeenCalledWith('https://api.test/v2/');
    expect(mapperSpy).toHaveBeenCalledWith(apiResponse);
    expect(result).toEqual(mappedUserData);
  });

  it('should share in-flight getCurrentUser request across concurrent subscribers', async () => {
    const response$ = new Subject<UserDataResponseJsonApi>();
    jsonApiService.get.mockReturnValue(response$.asObservable());
    vi.spyOn(UserMapper, 'fromUserDataGetResponse').mockReturnValue(mappedUserData);

    const first = firstValueFrom(service.getCurrentUser());
    const second = firstValueFrom(service.getCurrentUser());

    expect(jsonApiService.get).toHaveBeenCalledTimes(1);

    response$.next(apiResponse);
    response$.complete();

    await expect(first).resolves.toEqual(mappedUserData);
    await expect(second).resolves.toEqual(mappedUserData);
  });

  it('should fetch again after previous getCurrentUser completes', async () => {
    jsonApiService.get.mockReturnValue(of(apiResponse));
    vi.spyOn(UserMapper, 'fromUserDataGetResponse').mockReturnValue(mappedUserData);

    await firstValueFrom(service.getCurrentUser());
    await firstValueFrom(service.getCurrentUser());

    expect(jsonApiService.get).toHaveBeenCalledTimes(2);
  });

  it('should fetch again after resetCurrentUserCache', async () => {
    const response$ = new Subject<UserDataResponseJsonApi>();
    jsonApiService.get.mockReturnValue(response$.asObservable());
    vi.spyOn(UserMapper, 'fromUserDataGetResponse').mockReturnValue(mappedUserData);

    const first = firstValueFrom(service.getCurrentUser());
    expect(jsonApiService.get).toHaveBeenCalledTimes(1);

    service.resetCurrentUserCache();

    const second = firstValueFrom(service.getCurrentUser());
    expect(jsonApiService.get).toHaveBeenCalledTimes(2);

    response$.next(apiResponse);
    response$.complete();

    await expect(first).resolves.toEqual(mappedUserData);
    await expect(second).resolves.toEqual(mappedUserData);
  });

  it('should fetch and map user by id', async () => {
    const userResponse = { data: getUserDataJsonApi() };
    jsonApiService.get.mockReturnValue(of(userResponse));
    const mapperSpy = vi.spyOn(UserMapper, 'fromUserGetResponse').mockReturnValue(MOCK_USER);

    const result = await firstValueFrom(service.getUserById(MOCK_USER.id));

    expect(jsonApiService.get).toHaveBeenCalledWith(`https://api.test/v2/users/${MOCK_USER.id}/`);
    expect(mapperSpy).toHaveBeenCalledWith(userResponse.data);
    expect(result).toEqual(MOCK_USER);
  });

  it('should patch user profile attributes', async () => {
    const userResponse = getUserDataJsonApi();
    jsonApiService.patch.mockReturnValue(of(userResponse));
    const mapperSpy = vi.spyOn(UserMapper, 'fromUserGetResponse').mockReturnValue(MOCK_USER);
    const employment = MOCK_USER.employment;

    const result = await firstValueFrom(
      service.updateUserProfile(MOCK_USER.id, ProfileSettingsKey.Employment, employment)
    );

    expect(jsonApiService.patch).toHaveBeenCalledWith(`https://api.test/v2/users/${MOCK_USER.id}/`, {
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: { [ProfileSettingsKey.Employment]: employment },
      },
    });
    expect(mapperSpy).toHaveBeenCalledWith(userResponse);
    expect(result).toEqual(MOCK_USER);
  });

  it('should patch accepted terms of service', async () => {
    const userResponse = getUserDataJsonApi();
    jsonApiService.patch.mockReturnValue(of(userResponse));
    const mapperSpy = vi.spyOn(UserMapper, 'fromUserGetResponse').mockReturnValue(MOCK_USER);
    const payload: UserAcceptedTermsOfServiceJsonApi = { accepted_terms_of_service: true };

    const result = await firstValueFrom(service.updateUserAcceptedTermsOfService(MOCK_USER.id, payload));

    expect(jsonApiService.patch).toHaveBeenCalledWith(`https://api.test/v2/users/${MOCK_USER.id}/`, {
      data: {
        type: 'users',
        id: MOCK_USER.id,
        attributes: payload,
      },
    });
    expect(mapperSpy).toHaveBeenCalledWith(userResponse);
    expect(result).toEqual(MOCK_USER);
  });
});
