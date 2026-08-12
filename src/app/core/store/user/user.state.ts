import { Action, State, StateContext } from '@ngxs/store';

import { tap } from 'rxjs';

import { inject, Injectable } from '@angular/core';

import { StorageService } from '@core/services/storage.service';
import { UserService } from '@core/services/user.service';
import { ProfileSettingsKey } from '@osf/shared/enums/profile-settings-key.enum';
import { removeNullable } from '@osf/shared/helpers/remove-nullable.helper';
import { UserMapper } from '@osf/shared/mappers/user';
import { AsyncStateModel } from '@osf/shared/models/store/async-state.model';
import { UserData, UserModel } from '@osf/shared/models/user/user.model';
import { SocialModel } from '@shared/models/user/social.model';

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
import { USER_STATE_INITIAL, UserStateModel } from './user.model';

@State<UserStateModel>({
  name: 'user',
  defaults: USER_STATE_INITIAL,
})
@Injectable()
export class UserState {
  private readonly userService = inject(UserService);
  private readonly storageService = inject(StorageService);

  @Action(GetCurrentUser)
  getCurrentUser(ctx: StateContext<UserStateModel>) {
    const hadCachedUser = this.hydrateFromStorage(ctx);

    return this.userService.getCurrentUser().pipe(tap((data) => this.applySession(ctx, data, hadCachedUser)));
  }

  @Action(SetCurrentUser)
  setCurrentUser(ctx: StateContext<UserStateModel>, action: SetCurrentUser) {
    ctx.patchState({
      currentUser: this.toUserState(action.user, false),
    });

    this.storageService.setCachedUser(action.user);
  }

  @Action(UpdateProfileSettingsEmployment)
  updateProfileSettingsEmployment(ctx: StateContext<UserStateModel>, { payload }: UpdateProfileSettingsEmployment) {
    const state = ctx.getState();
    const userId = state.currentUser.data?.id;

    if (!userId) {
      return;
    }

    const withoutNulls = payload.map((item) => removeNullable(item));

    return this.userService.updateUserProfile(userId, ProfileSettingsKey.Employment, withoutNulls).pipe(
      tap((user) => {
        this.updateCurrentUser(ctx, state, user);
      })
    );
  }

  @Action(UpdateProfileSettingsEducation)
  updateProfileSettingsEducation(ctx: StateContext<UserStateModel>, { payload }: UpdateProfileSettingsEducation) {
    const state = ctx.getState();
    const userId = state.currentUser.data?.id;

    if (!userId) {
      return;
    }

    const withoutNulls = payload.map((item) => removeNullable(item));

    return this.userService.updateUserProfile(userId, ProfileSettingsKey.Education, withoutNulls).pipe(
      tap((user) => {
        this.updateCurrentUser(ctx, state, user);
      })
    );
  }

  @Action(UpdateProfileSettingsUser)
  updateProfileSettingsUser(ctx: StateContext<UserStateModel>, { payload }: UpdateProfileSettingsUser) {
    const state = ctx.getState();
    const userId = state.currentUser.data?.id;

    if (!userId) {
      return;
    }

    const withoutNulls = UserMapper.toNamesRequest(removeNullable(payload));

    return this.userService.updateUserProfile(userId, ProfileSettingsKey.User, withoutNulls).pipe(
      tap((user) => {
        this.updateCurrentUser(ctx, state, user);
      })
    );
  }

  @Action(UpdateProfileSettingsSocialLinks)
  updateProfileSettingsSocialLinks(ctx: StateContext<UserStateModel>, { payload }: UpdateProfileSettingsSocialLinks) {
    const state = ctx.getState();
    const userId = state.currentUser.data?.id;

    if (!userId) {
      return;
    }

    let social = {} as Partial<SocialModel>;

    payload.forEach((item) => {
      social = {
        ...social,
        ...item,
      };
    });

    return this.userService.updateUserProfile(userId, ProfileSettingsKey.Social, social).pipe(
      tap((user) => {
        this.updateCurrentUser(ctx, state, user);
      })
    );
  }

  @Action(AcceptTermsOfServiceByUser)
  acceptTermsOfServiceByUser(ctx: StateContext<UserStateModel>) {
    const state = ctx.getState();
    const currentUser = state.currentUser.data;

    if (!currentUser) {
      return;
    }

    const updatePayload: Partial<UserModel> = {
      acceptedTermsOfService: true,
    };
    const apiRequest = UserMapper.toAcceptedTermsOfServiceRequest(updatePayload);

    return this.userService.updateUserAcceptedTermsOfService(currentUser.id, apiRequest).pipe(
      tap((response: UserModel): void => {
        if (response.acceptedTermsOfService) {
          ctx.patchState({
            currentUser: {
              ...state.currentUser,
              data: {
                ...currentUser,
                acceptedTermsOfService: true,
              },
            },
          });
          this.storageService.setCachedUser(response);
        }
      })
    );
  }

  @Action(ClearCurrentUser)
  clearCurrentUser(ctx: StateContext<UserStateModel>) {
    this.userService.resetCurrentUserCache();

    ctx.patchState({
      currentUser: this.toUserState(null, false),
      activeFlags: [],
    });

    this.storageService.clearSession();
  }

  private hydrateFromStorage(ctx: StateContext<UserStateModel>): boolean {
    const cachedUser = this.storageService.getCachedUser();

    ctx.patchState({
      activeFlags: this.storageService.getCachedActiveFlags(),
      currentUser: cachedUser
        ? this.toUserState(cachedUser, false)
        : { ...ctx.getState().currentUser, isLoading: true },
    });

    return !!cachedUser;
  }

  private applySession(ctx: StateContext<UserStateModel>, data: UserData, hadCachedUser: boolean): void {
    const activeFlags = data.activeFlags ?? [];

    this.storageService.setCachedActiveFlags(activeFlags);

    if (data.currentUser) {
      this.storageService.setCachedUser(data.currentUser);
      ctx.patchState({
        activeFlags,
        currentUser: this.toUserState(data.currentUser, false),
      });
      return;
    }

    if (!hadCachedUser) {
      ctx.patchState({
        activeFlags,
        currentUser: this.toUserState(null, false),
      });
      return;
    }

    ctx.patchState({ activeFlags });
  }

  private updateCurrentUser(ctx: StateContext<UserStateModel>, state: UserStateModel, user: UserModel): void {
    ctx.patchState({
      currentUser: {
        ...state.currentUser,
        data: user,
      },
    });

    this.storageService.setCachedUser(user);
  }

  private toUserState(data: UserModel | null, isLoading: boolean): AsyncStateModel<UserModel | null> {
    return { data, isLoading, error: null };
  }
}
