/* =========================================
   CONTEXTS
   Where an item or outfit is appropriate
========================================= */

export enum Context {
  ACCESSORY = 'ACCESSORY',
  PRIVATE = 'PRIVATE',
  GYM = 'GYM',
  BEACH = 'BEACH',
  CASUAL = 'CASUAL',
  OFFICE = 'OFFICE',
  DINNER = 'DINNER',
  SWIM = 'SWIM',
  SMART_CASUAL = 'SMART_CASUAL',
  FORMAL = 'FORMAL',
  BUSINESS = 'BUSINESS',
  OUTDOOR = 'OUTDOOR',
  WINTER = 'WINTER',
  ATHLETIC = 'ATHLETIC',
  FESTIVAL = 'FESTIVAL',
  VACATION = 'VACATION',
  DATE = 'DATE',
}

/* =========================================
   ATTENTION
   How visually noticeable an item is
========================================= */

export enum Attention {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  MAXIMUM = 'MAXIMUM',
}

/* =========================================
   FORMALITY
   Dress-code level of an item
========================================= */

export enum Formality {
  PRIVATE = 'PRIVATE',
  CASUAL = 'CASUAL',
  SMART_CASUAL = 'SMART_CASUAL',
  SEMI_FORMAL = 'SEMI_FORMAL',
  FORMAL = 'FORMAL',
  BUSINESS = 'BUSINESS',
  STATEMENT = 'STATEMENT',
}

/* =========================================
   ENGINE INCLUSION POLICY
   How the outfit engine should treat the item
========================================= */

export enum EngineInclusionPolicy {
  NORMAL = 'NORMAL',
  PREFER = 'PREFER',
  REQUIRE = 'REQUIRE',
  EXCLUDE = 'EXCLUDE',
}

/* =========================================
   SHINY STATUS
   Lifecycle of a wardrobe item
========================================= */

export enum ShinyStatus {
  OWNED = 'OWNED',
  DONATE = 'DONATE',
  REPAIR = 'REPAIR',
  SEASONAL = 'SEASONAL',
  RETIRED = 'RETIRED',
  YARDWORK = 'YARDWORK',
}

/* =========================================
   LAYER
   Clothing layering position
========================================= */

export enum Layer {
  ACCESSORY = 'ACCESSORY',
  BASE = 'BASE',
  MID = 'MID',
  OUTER = 'OUTER',
  LEGWEAR = 'LEGWEAR',
  UNDERLAYER = 'UNDERLAYER',
}

/* =========================================
   SHINY CATEGORY
   Broad clothing categories
========================================= */

export enum ShinyCategory {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  DRESS = 'DRESS',
  OUTERWEAR = 'OUTERWEAR',
  SHOES = 'SHOES',
  BAG = 'BAG',
  ACCESSORY = 'ACCESSORY',
  JEWELLERY = 'JEWELLERY',
  SWIMWEAR = 'SWIMWEAR',
  ACTIVEWEAR = 'ACTIVEWEAR',
  SLEEPWEAR = 'SLEEPWEAR',
  UNDERGARMENT = 'UNDERGARMENT',
}

/* =========================================
   COLOURS
   Controlled vocabulary for wardrobe colours
========================================= */

export enum Color {
  BLACK = 'BLACK',
  CHARCOAL = 'CHARCOAL',
  GREY = 'GREY',
  WHITE = 'WHITE',
  CREAM = 'CREAM',
  BEIGE = 'BEIGE',
  TAN = 'TAN',
  BROWN = 'BROWN',
  NAVY = 'NAVY',
  BLUE = 'BLUE',
  LIGHT_BLUE = 'LIGHT_BLUE',
  DARK_INDIGO = 'DARK_INDIGO',
  GREEN = 'GREEN',
  OLIVE = 'OLIVE',
  BURGUNDY = 'BURGUNDY',
  RED = 'RED',
  PINK = 'PINK',
  PURPLE = 'PURPLE',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  MULTI = 'MULTI',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  KHAKI = 'KHAKI',
  RUST = 'RUST',
  DARK_TEAL = 'DARK_TEAL',
}

/* =========================================
   PATTERN
========================================= */

export enum Pattern {
  SOLID = 'SOLID',
  STRIPE = 'STRIPE',
  PLAID = 'PLAID',
  CHECK = 'CHECK',
  GRAPHIC = 'GRAPHIC',
  NOVELTY = 'NOVELTY',
  HEATHERED = 'HEATHERED',
  TEXTURED = 'TEXTURED',
  OTHER = 'OTHER',
  WOVEN = 'WOVEN',
  COLORBLOCK = 'COLORBLOCK',
  BROCADE = 'BROCADE',
  FLORAL = 'FLORAL',
  EYELET = 'EYELET',
  MICRO_PATTERN = 'MICRO_PATTERN',
  MICRO_PLAID = 'MICRO_PLAID',
  GEOMETRIC = 'GEOMETRIC',
}

/* =========================================
   CLUTTER SOURCE
   Where an outfit came from
========================================= */

export enum ClutterSource {
  MANUAL = 'MANUAL',
  ENGINE = 'ENGINE',
  AI = 'AI',
  IMPORTED = 'IMPORTED',
}

/* =========================================
   CLUTTER STATUS
========================================= */

export enum ClutterStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DRAFT = 'DRAFT',
  DELETED = 'DELETED',
}

/* =========================================
   CLUTTER ITEM ROLE
   Outfit slot definitions
========================================= */

export enum ClutterItemRole {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  ONE_PIECE = 'ONE_PIECE',
  OUTERWEAR = 'OUTERWEAR',
  SHOES = 'SHOES',
  ACCESSORY = 'ACCESSORY',
  BAG = 'BAG',
  JEWELLERY = 'JEWELLERY',
  UNDERLAYER = 'UNDERLAYER',
  LEGWEAR = 'LEGWEAR',
  OTHER = 'OTHER',
}

/* =========================================
   QUIRK RULE ENGINE
========================================= */

export enum QuirkScopeType {
  GLOBAL = 'GLOBAL',
  GOBLIN = 'GOBLIN',
  HOARD = 'HOARD',
  ITEM = 'ITEM',
}

export enum QuirkRuleType {
  REQUIRE = 'REQUIRE',
  FORBID = 'FORBID',
  PREFER = 'PREFER',
  EXCLUDE = 'EXCLUDE',
  LIMIT = 'LIMIT',
}

export enum QuirkOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

export function enumValues<T extends Record<string, string | number>>(
  enumObj: T,
): string[] {
  return Object.values(enumObj).filter(
    (value): value is string => typeof value === 'string',
  );
}