export interface Hoard {
  id: string;
  goblinId: string;

  name: string;
  description?: string;

  isDefault: boolean;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}
