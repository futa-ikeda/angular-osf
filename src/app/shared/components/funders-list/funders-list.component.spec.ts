import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Funder } from '@osf/features/metadata/models';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { FundersListComponent } from './funders-list.component';

describe('FundersListComponent', () => {
  let component: FundersListComponent;
  let fixture: ComponentFixture<FundersListComponent>;

  const fundersMock: Funder[] = [
    {
      funderName: 'National Science Foundation',
      funderIdentifier: 'https://ror.org/021nxhr62',
      funderIdentifierType: 'ROR',
      awardNumber: 'NSF-123',
      awardUri: 'https://example.org/nsf-123',
      awardTitle: 'Grant 123',
    },
    {
      funderName: 'National Institutes of Health',
      funderIdentifier: 'https://ror.org/04zaypm56',
      funderIdentifierType: 'ROR',
      awardNumber: 'NIH-456',
      awardUri: 'https://example.org/nih-456',
      awardTitle: 'Grant 456',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FundersListComponent],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(FundersListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render loading skeleton', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.componentRef.setInput('funders', fundersMock);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('p-skeleton')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('National Science Foundation');
    expect(fixture.nativeElement.textContent).not.toContain('project.overview.metadata.noInformation');
  });

  it('should render funder names', () => {
    fixture.componentRef.setInput('funders', fundersMock);
    fixture.detectChanges();

    const funderItems = fixture.nativeElement.querySelectorAll('li');

    expect(funderItems).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('National Science Foundation');
    expect(fixture.nativeElement.textContent).toContain('National Institutes of Health');
  });

  it.each([undefined, []])('should render no information message when funders are %s', (funders) => {
    fixture.componentRef.setInput('funders', funders);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('ul')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('project.overview.metadata.noInformation');
  });
});
