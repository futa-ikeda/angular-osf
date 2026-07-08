import { Store } from '@ngxs/store';

import { MockComponents, MockProvider } from 'ng-mocks';

import { Mock } from 'vitest';

import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { CreateSchemaResponse, FetchAllSchemaResponses, RegistriesSelectors } from '@osf/features/registries/store';
import { RegistrationReviewStates } from '@osf/shared/enums/registration-review-states.enum';
import { RevisionReviewStates } from '@osf/shared/enums/revision-review-states.enum';
import { UserPermissions } from '@osf/shared/enums/user-permissions.enum';
import { RegistrationCard } from '@shared/models/registration/registration-card.model';

import { MOCK_REGISTRATION } from '@testing/mocks/registration.mock';
import { provideOSFCore } from '@testing/osf.testing.provider';
import { RouterMockBuilder, RouterMockType } from '@testing/providers/router-provider.mock';
import {
  BaseSetupOverrides,
  mergeSignalOverrides,
  provideMockStore,
  SignalOverride,
} from '@testing/providers/store-provider.mock';

import { ContributorsListComponent } from '../contributors-list/contributors-list.component';
import { DataResourcesComponent } from '../data-resources/data-resources.component';
import { IconComponent } from '../icon/icon.component';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

import { RegistrationCardComponent } from './registration-card.component';

describe('RegistrationCardComponent', () => {
  let component: RegistrationCardComponent;
  let fixture: ComponentFixture<RegistrationCardComponent>;
  let store: Store;
  let routerMock: RouterMockType;

  const mockRegistrationData: RegistrationCard = MOCK_REGISTRATION;

  const defaultSignals: SignalOverride[] = [
    { selector: RegistriesSelectors.getSchemaResponse, value: signal({ id: 'revision-id' }) },
  ];

  type SetupOverrides = BaseSetupOverrides & {
    registrationData?: RegistrationCard;
    isDraft?: boolean;
  };

  function setup(overrides: SetupOverrides = {}): void {
    routerMock = RouterMockBuilder.create().build();

    TestBed.configureTestingModule({
      imports: [
        RegistrationCardComponent,
        ...MockComponents(StatusBadgeComponent, DataResourcesComponent, IconComponent, ContributorsListComponent),
      ],
      providers: [
        provideOSFCore(),
        MockProvider(Router, routerMock),
        provideMockStore({ signals: mergeSignalOverrides(defaultSignals, overrides.selectorOverrides) }),
      ],
    });

    store = TestBed.inject(Store);
    fixture = TestBed.createComponent(RegistrationCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('registrationData', overrides.registrationData ?? mockRegistrationData);
    fixture.componentRef.setInput('isDraft', overrides.isDraft ?? false);
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();

    expect(component).toBeTruthy();
  });

  it.each([
    [[UserPermissions.Read, UserPermissions.Write, UserPermissions.Admin], true, true],
    [[UserPermissions.Write], false, true],
    [[UserPermissions.Admin], true, false],
  ] as [UserPermissions[], boolean, boolean][])(
    'should identify user permissions',
    (currentUserPermissions, hasAdminAccess, hasWriteAccess) => {
      setup({
        registrationData: {
          ...mockRegistrationData,
          currentUserPermissions,
        },
      });

      expect(component.hasAdminAccess()).toBe(hasAdminAccess);
      expect(component.hasWriteAccess()).toBe(hasWriteAccess);
    }
  );

  it.each([
    [RegistrationReviewStates.Accepted, true],
    [RegistrationReviewStates.Pending, true],
    [RegistrationReviewStates.Embargo, true],
    [RegistrationReviewStates.Withdrawn, false],
  ] as [RegistrationReviewStates, boolean][])(
    'should identify update-eligible review states',
    (reviewsState, eligible) => {
      setup({
        registrationData: {
          ...mockRegistrationData,
          reviewsState,
        },
      });

      expect(component.isAccepted()).toBe(reviewsState === RegistrationReviewStates.Accepted);
      expect(component.isPending()).toBe(reviewsState === RegistrationReviewStates.Pending);
      expect(component.isEmbargo()).toBe(reviewsState === RegistrationReviewStates.Embargo);
      expect(component.showButtons()).toBe(eligible);
    }
  );

  it.each([
    [RevisionReviewStates.Approved, true, false, false],
    [RevisionReviewStates.Unapproved, false, true, false],
    [RevisionReviewStates.RevisionInProgress, false, false, true],
  ] as [RevisionReviewStates, boolean, boolean, boolean][])(
    'should identify revision states',
    (revisionState, isApproved, isUnapproved, isInProgress) => {
      setup({
        registrationData: {
          ...mockRegistrationData,
          revisionState,
        },
      });

      expect(component.isApproved()).toBe(isApproved);
      expect(component.isUnapproved()).toBe(isUnapproved);
      expect(component.isInProgress()).toBe(isInProgress);
    }
  );

  it.each([
    [null, true],
    [mockRegistrationData.id, true],
    ['different-root-id', false],
  ] as [string | null, boolean][])('should identify root registrations', (rootParentId, isRootRegistration) => {
    setup({
      registrationData: {
        ...mockRegistrationData,
        rootParentId,
      },
    });

    expect(component.isRootRegistration()).toBe(isRootRegistration);
  });

  it.each([
    ['updates are disabled', { allowUpdates: false }],
    ['user lacks admin access', { currentUserPermissions: [UserPermissions.Write] }],
    ['registration is not root', { rootParentId: 'different-root-id' }],
  ] as [string, Partial<RegistrationCard>][])('should hide update buttons when %s', (_label, registrationData) => {
    setup({
      registrationData: {
        ...mockRegistrationData,
        ...registrationData,
      },
    });

    expect(component.showButtons()).toBe(false);
  });

  it('should dispatch create schema response and navigate to justification page on updateRegistration', () => {
    setup();
    (store.dispatch as Mock).mockClear();

    component.updateRegistration(mockRegistrationData.id);

    expect(store.dispatch).toHaveBeenCalledWith(new CreateSchemaResponse(mockRegistrationData.id));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/registries/revisions/revision-id/justification']);
  });

  it('should dispatch fetch schema responses and navigate to review page for unapproved revision', () => {
    setup({
      registrationData: {
        ...mockRegistrationData,
        revisionState: RevisionReviewStates.Unapproved,
      },
    });
    (store.dispatch as Mock).mockClear();

    component.continueUpdateRegistration(mockRegistrationData.id);

    expect(store.dispatch).toHaveBeenCalledWith(new FetchAllSchemaResponses(mockRegistrationData.id));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/registries/revisions/revision-id/review']);
  });

  it('should dispatch fetch schema responses and navigate to justification page for non-unapproved revision', () => {
    setup({
      registrationData: {
        ...mockRegistrationData,
        revisionState: RevisionReviewStates.RevisionInProgress,
      },
    });
    (store.dispatch as Mock).mockClear();

    component.continueUpdateRegistration(mockRegistrationData.id);

    expect(store.dispatch).toHaveBeenCalledWith(new FetchAllSchemaResponses(mockRegistrationData.id));
    expect(routerMock.navigate).toHaveBeenCalledWith(['/registries/revisions/revision-id/justification']);
  });

  it('should not navigate when schema response is not present', () => {
    setup({
      selectorOverrides: [{ selector: RegistriesSelectors.getSchemaResponse, value: signal(null) }],
    });
    (store.dispatch as Mock).mockClear();

    component.updateRegistration(mockRegistrationData.id);

    expect(store.dispatch).toHaveBeenCalledWith(new CreateSchemaResponse(mockRegistrationData.id));
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
