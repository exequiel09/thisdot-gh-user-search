import { DefaultValuePipe } from './default-value.pipe';

describe('DefaultValuePipe', () => {
  let pipe: DefaultValuePipe;

  beforeEach(() => {
    pipe = new DefaultValuePipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a default value in case of null/undefined value was passed', () => {
    expect(pipe.transform(undefined)).toBe('N/A');
    expect(pipe.transform(null)).toBe('N/A');
  });

  it('should return the same value passed', () => {
    const val1 = 'Test';
    const val2 = 'Hello';

    expect(pipe.transform(val1)).toBe(val1);
    expect(pipe.transform(val2)).toBe(val2);
  });
});
