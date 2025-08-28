import { Type } from "@angular/core";

export interface ModalConfig {
  component: Type<any>;
  inputs?: Record<string, any>;
  outputs?: Record<string, (value: any) => void>;
}
