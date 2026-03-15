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
  EVENT = 'EVENT',
}

/* =========================================
   ATTENTION LEVEL
   How visually noticeable an item is
========================================= */

export enum AttentionLevel {
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
  RULE_ENGINE = 'RULE_ENGINE',
  AI_GENERATED = 'AI_GENERATED',
}

/* =========================================
   CLUTTER STATUS
========================================= */

export enum ClutterStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/* =========================================
   CLUTTER ITEM ROLE
   Outfit slot definitions
========================================= */

export enum ClutterItemRole {
  TOP = 'TOP',
  BOTTOM = 'BOTTOM',
  DRESS = 'DRESS',
  OUTER = 'OUTER',
  SHOES = 'SHOES',
  BAG = 'BAG',
  ACCESSORY = 'ACCESSORY',
  JEWELLERY = 'JEWELLERY',
  UNDERLAYER = 'UNDERLAYER',
  LEGS = 'LEGS',
  OTHER = 'OTHER',
}

/* =========================================
   QUIRK RULE ENGINE
========================================= */

export enum QuirkScopeType {
  GOBLIN = 'GOBLIN',
  HOARD = 'HOARD',
}

export enum QuirkRuleType {
  DISALLOW = 'DISALLOW',
  REQUIRE = 'REQUIRE',
  PREFER = 'PREFER',
  AVOID = 'AVOID',
  LIMIT = 'LIMIT',
  SCORE_BONUS = 'SCORE_BONUS',
  SCORE_PENALTY = 'SCORE_PENALTY',
}

export enum QuirkOperator {
  EQ = 'eq',
  NEQ = 'neq',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  IN = 'in',
  NOT_IN = 'not_in',
  GTE = 'gte',
  LTE = 'lte',
}

export function enumValues<T>(enumObj: T): string[] {
  return Object.values(enumObj as any);
}
