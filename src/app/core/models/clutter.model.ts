import {
  Attention,
  ClutterItemRole,
  ClutterSource,
  ClutterStatus,
  Context,
} from './enums';

export interface Clutter {
  id: string;
  goblinId: string;
  hoardId: string;

  name: string;
  description?: string;

  source: ClutterSource;
  status: ClutterStatus;

  targetContexts?: Context[];
  targetAttention?: Attention;

  items: ClutterItem[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ClutterItem {
  shinyId: string;
  role: ClutterItemRole;
  slotOrder: number;
}
