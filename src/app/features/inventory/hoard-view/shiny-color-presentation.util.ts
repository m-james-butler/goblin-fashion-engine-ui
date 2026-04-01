import { Color } from '../../../core/models/enums';
import { formatEnumLabel } from '../../../core/utils/enum-label.util';

export type ColorPresentation = {
  swatch: string;
  displayLabel: string;
};

const COLOR_SWATCH_BY_ENUM: Record<Color, string> = {
  [Color.BLACK]: '#111111',
  [Color.CHARCOAL]: '#36454f',
  [Color.GREY]: '#808080',
  [Color.WHITE]: '#f7f7f7',
  [Color.CREAM]: '#fff7d1',
  [Color.BEIGE]: '#d9c4a1',
  [Color.TAN]: '#c79b6d',
  [Color.BROWN]: '#7b4f28',
  [Color.NAVY]: '#1f2f5d',
  [Color.BLUE]: '#2f5ee5',
  [Color.LIGHT_BLUE]: '#8cc8ff',
  [Color.DARK_INDIGO]: '#2d2b55',
  [Color.GREEN]: '#2e8b57',
  [Color.OLIVE]: '#6b7b2b',
  [Color.BURGUNDY]: '#7d1e3f',
  [Color.RED]: '#c62828',
  [Color.PINK]: '#e98ab7',
  [Color.PURPLE]: '#6a4c93',
  [Color.YELLOW]: '#f2c94c',
  [Color.ORANGE]: '#f08c2b',
  [Color.MULTI]:
    'linear-gradient(135deg,#f94144 0%,#f3722c 20%,#f9c74f 40%,#90be6d 60%,#577590 80%,#9b5de5 100%)',
  [Color.SILVER]: '#b8b8b8',
  [Color.GOLD]: '#cfae34',
  [Color.KHAKI]: '#9f9657',
  [Color.RUST]: '#b14d1b',
  [Color.DARK_TEAL]: '#0f5c63',
};

export function getShinyColorPresentation(color: Color | undefined): ColorPresentation {
  if (!color) {
    return {
      swatch: '#7f7f7f',
      displayLabel: 'Unknown',
    };
  }

  const swatch = COLOR_SWATCH_BY_ENUM[color] ?? '#7f7f7f';
  return {
    swatch,
    displayLabel: formatEnumLabel(color),
  };
}
