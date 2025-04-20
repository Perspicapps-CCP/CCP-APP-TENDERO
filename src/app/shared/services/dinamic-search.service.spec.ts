import { TestBed } from '@angular/core/testing';
import { DinamicSearchService } from './dinamic-search.service';

describe('DinamicSearchService', () => {
  let service: DinamicSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DinamicSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an empty array when the input array is empty', () => {
    const result = service.dynamicSearch([], 'search term');
    expect(result).toEqual([]);
  });

  it('should return the input array when the search term is empty', () => {
    const input = [{ name: 'John' }, { name: 'Jane' }];
    const result = service.dynamicSearch(input, '');
    expect(result).toEqual(input);
  });

  it('should return the items that match the search term', () => {
    const input = [{ name: 'John' }, { name: 'Jane' }, { name: 'Bob' }];
    const result = service.dynamicSearch(input, 'Jo');
    expect(result).toEqual([{ name: 'John' }]);
  });

  it('should filter the items based on the columnsObjectToFilter parameter', () => {
    const input = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 40 },
    ];
    const result = service.dynamicSearch(input, '30', ['age']);
    expect(result).toEqual([{ name: 'John', age: 30 }]);
  });
});
