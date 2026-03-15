import { Context, enumValues } from './enums';

describe('enumValues', () => {
  it('should return all enum values as strings', () => {
    const values = enumValues(Context);

    expect(values).toContain('OFFICE');
    expect(values).toContain('CASUAL');
    expect(values.length).toBe(Object.keys(Context).length);
  });
});
