import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideOSFCore } from '@testing/osf.testing.provider';

import { FilesDropZoneComponent } from './files-drop-zone.component';

describe('FilesDropZoneComponent', () => {
  let component: FilesDropZoneComponent;
  let fixture: ComponentFixture<FilesDropZoneComponent>;

  function fileList(...files: File[]): FileList {
    const list: { length: number; item: (i: number) => File | null } & Record<number, File> = {
      length: files.length,
      item: (i: number) => files[i] ?? null,
    };
    files.forEach((f, i) => (list[i] = f));
    return list as unknown as FileList;
  }

  function makeDragEvent(
    dataTransfer: { types: string[]; files?: FileList | null; dropEffect?: string } | null
  ): DragEvent {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      dataTransfer: dataTransfer as unknown as DataTransfer,
    } as unknown as DragEvent;
  }

  function makeLeaveEvent(): Event {
    return {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    } as unknown as Event;
  }

  function makeFile(name = 'file.txt'): File {
    return new File(['x'], name, { type: 'text/plain' });
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FilesDropZoneComponent],
      providers: [provideOSFCore()],
    });

    fixture = TestBed.createComponent(FilesDropZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set drag-over state when entering with a file payload', () => {
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    fixture.detectChanges();

    expect(component.isDragOver()).toBe(true);
    expect(fixture.nativeElement.querySelector('.drop-zone.active')).toBeTruthy();
  });

  it('should not set drag-over when there is no file payload', () => {
    component.onDragEnter(makeDragEvent({ types: [] }));
    fixture.detectChanges();

    expect(component.isDragOver()).toBe(false);
    expect(fixture.nativeElement.querySelector('.drop-zone.active')).toBeNull();
  });

  it('should not set drag-over on dragenter when disabled', () => {
    fixture.componentRef.setInput('enabled', false);
    fixture.detectChanges();

    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    fixture.detectChanges();

    expect(component.isDragOver()).toBe(false);
  });

  it('should call preventDefault and stopPropagation on dragenter regardless of enabled state', () => {
    fixture.componentRef.setInput('enabled', false);
    const event = makeDragEvent({ types: ['Files'] });
    component.onDragEnter(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should call preventDefault and stopPropagation on dragover', () => {
    const event = makeDragEvent({ types: ['Files'] });
    component.onDragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should set dropEffect to copy on dragover', () => {
    const dataTransfer = { types: ['Files'], dropEffect: '' };
    component.onDragOver(makeDragEvent(dataTransfer));

    expect(dataTransfer.dropEffect).toBe('copy');
  });

  it('should not set dropEffect and not set drag-over on dragover when disabled', () => {
    fixture.componentRef.setInput('enabled', false);
    const dataTransfer = { types: ['Files'], dropEffect: '' };
    component.onDragOver(makeDragEvent(dataTransfer));

    expect(dataTransfer.dropEffect).toBe('');
    expect(component.isDragOver()).toBe(false);
  });

  it('should still call preventDefault and stopPropagation on dragover when disabled', () => {
    fixture.componentRef.setInput('enabled', false);
    const event = makeDragEvent({ types: ['Files'] });
    component.onDragOver(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should clear drag-over only after all nested enters have left', () => {
    const enter = makeDragEvent({ types: ['Files'] });
    component.onDragEnter(enter);
    component.onDragEnter(enter);
    expect(component.isDragOver()).toBe(true);

    component.onDragLeave(makeLeaveEvent());
    expect(component.isDragOver()).toBe(true);

    component.onDragLeave(makeLeaveEvent());
    expect(component.isDragOver()).toBe(false);
  });

  it('should call preventDefault and stopPropagation on dragleave', () => {
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    const event = makeLeaveEvent();
    component.onDragLeave(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should unwind dragDepth on dragleave when disabled keeping state consistent on re-enable', () => {
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));

    fixture.componentRef.setInput('enabled', false);
    fixture.detectChanges();

    component.onDragLeave(makeLeaveEvent());
    component.onDragLeave(makeLeaveEvent());

    fixture.componentRef.setInput('enabled', true);
    fixture.detectChanges();

    expect(component.isDragOver()).toBe(false);
  });

  it('should not decrement dragDepth below zero on dragleave', () => {
    component.onDragLeave(makeLeaveEvent());
    component.onDragLeave(makeLeaveEvent());

    expect(component.isDragOver()).toBe(false);
  });

  it('should emit dropped files and clear drag state on drop', () => {
    const emitSpy = vi.spyOn(component.filesDropped, 'emit');

    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    component.onDrop(makeDragEvent({ types: ['Files'], files: fileList(makeFile('a.txt')) }));
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledOnce();
    expect(emitSpy).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({ name: 'a.txt' })]));
    expect(component.isDragOver()).toBe(false);
  });

  it('should emit all dropped files on drop', () => {
    const emitSpy = vi.spyOn(component.filesDropped, 'emit');
    const files = [makeFile('a.txt'), makeFile('b.txt'), makeFile('c.txt')];

    component.onDrop(makeDragEvent({ types: ['Files'], files: fileList(...files) }));

    expect(emitSpy).toHaveBeenCalledOnce();
    expect(emitSpy).toHaveBeenCalledWith(
      expect.arrayContaining(files.map((f) => expect.objectContaining({ name: f.name })))
    );
  });

  it('should not emit when drop has no files', () => {
    const emitSpy = vi.spyOn(component.filesDropped, 'emit');
    component.onDrop(makeDragEvent({ types: [], files: fileList() }));

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit when disabled but should still reset drag state on drop', () => {
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    fixture.componentRef.setInput('enabled', false);
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.filesDropped, 'emit');
    component.onDrop(makeDragEvent({ types: ['Files'], files: fileList(makeFile()) }));

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.isDragOver()).toBe(false);
  });

  it('should call preventDefault and stopPropagation on drop regardless of enabled state', () => {
    fixture.componentRef.setInput('enabled', false);
    const event = makeDragEvent({ types: ['Files'], files: fileList(makeFile()) });
    component.onDrop(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it('should reset dragDepth to zero on drop preventing stuck state after re-enter', () => {
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    component.onDragEnter(makeDragEvent({ types: ['Files'] }));

    component.onDrop(makeDragEvent({ types: ['Files'], files: fileList(makeFile()) }));

    component.onDragEnter(makeDragEvent({ types: ['Files'] }));
    component.onDragLeave(makeLeaveEvent());

    expect(component.isDragOver()).toBe(false);
  });
});
