import { Injectable } from '@angular/core';

import { ShinyResponseDto } from '../dto/shiny-response.dto';
import { Shiny } from '../../models/shiny.model';
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

@Injectable({
  providedIn: 'root',
})
export class ShinyAdapter {
  fromDto(dto: ShinyResponseDto): Shiny {
    return {
      id: dto.id,
      goblinId: dto.goblinId,
      hoardId: dto.hoardId,
      name: dto.name,
      notes: dto.notes,
      count: dto.count,
      category: this.toEnum(dto.category, ShinyCategory, ShinyCategory.ACCESSORY),
      subcategory: dto.subcategory,
      layer: this.toEnum(dto.layer, Layer, Layer.BASE),
      contexts: this.toContexts(dto.contexts),
      formality: this.toEnum(dto.formality, Formality, Formality.CASUAL),
      attention: this.toEnum(dto.attention, Attention, Attention.LOW),
      colorPrimary: this.toEnum(dto.colorPrimary, Color, Color.BLACK),
      colorSecondary: this.toOptionalEnum(dto.colorSecondary, Color),
      pattern: this.toOptionalEnum(dto.pattern, Pattern),
      fabric: dto.fabric,
      fit: dto.fit,
      warmth: dto.warmth,
      officeOk: dto.officeOk,
      publicWear: dto.publicWear,
      includeInEngine: dto.includeInEngine,
      engineInclusionPolicy: this.toEnum(
        dto.engineInclusionPolicy,
        EngineInclusionPolicy,
        EngineInclusionPolicy.NORMAL,
      ),
      imagePath: dto.imagePath,
      status: this.toEnum(dto.status, ShinyStatus, ShinyStatus.OWNED),
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  fromDtoList(dtos: ShinyResponseDto[]): Shiny[] {
    return dtos.map((dto) => this.fromDto(dto));
  }

  private toContexts(values: string[]): Context[] {
    const contexts = values
      .map((value) => this.toOptionalEnum(value, Context))
      .filter((context): context is Context => Boolean(context));

    return contexts.length > 0 ? contexts : [Context.CASUAL];
  }

  private toEnum<T extends Record<string, string>>(
    value: string,
    enumType: T,
    fallback: T[keyof T],
  ): T[keyof T] {
    if (value in enumType) {
      return enumType[value as keyof T];
    }
    return fallback;
  }

  private toOptionalEnum<T extends Record<string, string>>(
    value: string | undefined,
    enumType: T,
  ): T[keyof T] | undefined {
    if (!value) {
      return undefined;
    }
    if (value in enumType) {
      return enumType[value as keyof T];
    }
    return undefined;
  }
}
