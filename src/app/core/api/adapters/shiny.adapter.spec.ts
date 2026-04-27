import { TestBed } from '@angular/core/testing';

import { ShinyAdapter } from './shiny.adapter';
import {
  Attention,
  Color,
  Context,
  EngineInclusionPolicy,
  Formality,
  Layer,
  Pattern,
  ShinyCategory,
  ShinyStatus,
} from '../../models/enums';
import { ShinyResponseDto } from '../dto/shiny-response.dto';

describe('ShinyAdapter', () => {
  let adapter: ShinyAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    adapter = TestBed.inject(ShinyAdapter);
  });

  it('maps backend enum strings to frontend enum values', () => {
    const shiny = adapter.fromDto(createDto());

    expect(shiny.category).toBe(ShinyCategory.TOP);
    expect(shiny.layer).toBe(Layer.MID);
    expect(shiny.contexts).toEqual([Context.OFFICE, Context.CASUAL]);
    expect(shiny.formality).toBe(Formality.SMART_CASUAL);
    expect(shiny.attention).toBe(Attention.MEDIUM);
    expect(shiny.colorPrimary).toBe(Color.NAVY);
    expect(shiny.colorSecondary).toBe(Color.GREY);
    expect(shiny.pattern).toBe(Pattern.SOLID);
    expect(shiny.engineInclusionPolicy).toBe(EngineInclusionPolicy.PREFER);
    expect(shiny.status).toBe(ShinyStatus.REPAIR);
  });

  it('falls back when required enum fields are unknown', () => {
    const shiny = adapter.fromDto(
      createDto({
        category: 'NOPE',
        layer: 'NOPE',
        contexts: ['NOPE'],
        formality: 'NOPE',
        attention: 'NOPE',
        colorPrimary: 'NOPE',
        engineInclusionPolicy: 'NOPE',
        status: 'NOPE',
      }),
    );

    expect(shiny.category).toBe(ShinyCategory.ACCESSORY);
    expect(shiny.layer).toBe(Layer.BASE);
    expect(shiny.contexts).toEqual([Context.CASUAL]);
    expect(shiny.formality).toBe(Formality.CASUAL);
    expect(shiny.attention).toBe(Attention.LOW);
    expect(shiny.colorPrimary).toBe(Color.BLACK);
    expect(shiny.engineInclusionPolicy).toBe(EngineInclusionPolicy.NORMAL);
    expect(shiny.status).toBe(ShinyStatus.OWNED);
  });

  it('omits optional enum fields when values are blank or unknown', () => {
    const shiny = adapter.fromDto(
      createDto({
        colorSecondary: undefined,
        pattern: 'NOPE',
      }),
    );

    expect(shiny.colorSecondary).toBeUndefined();
    expect(shiny.pattern).toBeUndefined();
  });

  it('maps dto lists', () => {
    const shinies = adapter.fromDtoList([
      createDto({ id: 'SH-001' }),
      createDto({ id: 'SH-002' }),
    ]);

    expect(shinies.map((shiny) => shiny.id)).toEqual(['SH-001', 'SH-002']);
  });
});

function createDto(overrides: Partial<ShinyResponseDto> = {}): ShinyResponseDto {
  return {
    id: 'SH-001',
    goblinId: 'GBL-001',
    hoardId: 'HRD-001',
    name: 'Navy Jacket',
    notes: 'Warm',
    count: 1,
    category: 'TOP',
    subcategory: 'Jacket',
    layer: 'MID',
    contexts: ['OFFICE', 'CASUAL'],
    formality: 'SMART_CASUAL',
    attention: 'MEDIUM',
    colorPrimary: 'NAVY',
    colorSecondary: 'GREY',
    pattern: 'SOLID',
    fabric: 'Cotton',
    fit: 'Regular',
    warmth: 3,
    officeOk: true,
    publicWear: true,
    includeInEngine: true,
    engineInclusionPolicy: 'PREFER',
    imagePath: '/images/navy-jacket.png',
    status: 'REPAIR',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  };
}
