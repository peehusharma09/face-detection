import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesPopupComponent } from './images-popup.component';

describe('ImagesPopupComponent', () => {
  let component: ImagesPopupComponent;
  let fixture: ComponentFixture<ImagesPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImagesPopupComponent]
    });
    fixture = TestBed.createComponent(ImagesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
