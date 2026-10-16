import { classifyMutationError } from '../mutationError';

describe('classifyMutationError', () => {
  it('red caída', () => {
    expect(classifyMutationError(new TypeError('Network request failed'))).toBe('network');
    expect(classifyMutationError({ message: 'TypeError: Failed to fetch' })).toBe('network');
    expect(classifyMutationError('Network request failed')).toBe('network');
  });

  it('4xx es validación', () => {
    expect(classifyMutationError({ status: 400, message: 'Bad request' })).toBe('validation');
    expect(classifyMutationError({ status: 409 })).toBe('validation');
  });

  it('5xx es servidor', () => {
    expect(classifyMutationError({ status: 500 })).toBe('server');
    expect(classifyMutationError({ status: 503 })).toBe('server');
  });

  it('violación de constraint es validación', () => {
    expect(classifyMutationError({ code: '23505', message: 'duplicate key' })).toBe('validation');
    expect(classifyMutationError({ code: '23503' })).toBe('validation');
    expect(classifyMutationError({ code: '22001' })).toBe('validation');
  });

  it('sin información cae en servidor', () => {
    expect(classifyMutationError(null)).toBe('server');
    expect(classifyMutationError({})).toBe('server');
  });
});
