import { TranslateService } from '@ngx-translate/core';

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { REPOSITORY_OPTIONS } from '../../constants/choose-repository.constants';

import { ChooseRepositoryComponent } from './choose-repository.component';

describe('ChooseRepositoryComponent', () => {
  let fixture: ComponentFixture<ChooseRepositoryComponent>;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChooseRepositoryComponent],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(ChooseRepositoryComponent);
    translateService = TestBed.inject(TranslateService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the page title', () => {
    const title = fixture.debugElement.query(By.css('h1'));
    expect(title.nativeElement.textContent).toContain(translateService.instant('chooseRepository.title'));
  });

  it('should render a card for each repository', () => {
    const cards = fixture.debugElement.queryAll(By.css('.repository-card'));
    expect(cards.length).toBe(REPOSITORY_OPTIONS.length);
  });

  it('should link each repository button to its home page', () => {
    const links = fixture.debugElement.queryAll(By.css('.repository-card-link'));

    links.forEach((link, index) => {
      const repository = REPOSITORY_OPTIONS[index];
      expect(link.nativeElement.href).toBe(repository.linkUrl);
      expect(link.nativeElement.textContent.trim()).toBe(translateService.instant(repository.linkTextKey));
      expect(link.nativeElement.target).toBe('_blank');
      expect(link.nativeElement.rel).toBe('noopener noreferrer');
    });
  });
});
