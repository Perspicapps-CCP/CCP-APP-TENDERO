import { HighlightTextPipe } from './highlight-text.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('HighlightTextPipe', () => {
  let pipe: HighlightTextPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val,
          },
        },
      ],
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new HighlightTextPipe(sanitizer);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the same value if no search term is provided', () => {
    const value = 'some text';
    expect(pipe.transform(value)).toEqual(value);
  });

  it('should return the same value if search term is empty', () => {
    const value = '';
    expect(pipe.transform(value, '')).toEqual(value);
  });

  it('should return the same value if search term is not found', () => {
    const value = 'some text';
    expect(pipe.transform(value, 'other')).toEqual(value);
  });

  it('should highlight the search term if found', () => {
    const value = 'some text';
    const result = pipe.transform(value, 'some');
    expect(result).toEqual('<strong style="color:black" class="highlight">some</strong> text');
  });
});
