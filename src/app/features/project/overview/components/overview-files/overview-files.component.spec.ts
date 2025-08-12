import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewFilesComponent } from './overview-files.component';

describe('OverviewFilesComponent', () => {
  let component: OverviewFilesComponent;
  let fixture: ComponentFixture<OverviewFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewFilesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OverviewFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
