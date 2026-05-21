import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTableSortComponent } from './mat-table-sort.component';

describe('MatTableSortComponent', () => {
  let component: MatTableSortComponent;
  let fixture: ComponentFixture<MatTableSortComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MatTableSortComponent]
    });
    fixture = TestBed.createComponent(MatTableSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
