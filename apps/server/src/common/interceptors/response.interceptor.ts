import type { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import type { Observable } from "rxjs";

import { Injectable } from "@nestjs/common";
import { map } from "rxjs/operators";
import { BizCode } from "../constants/codes";

export interface ApiResponse<T> {
  ok: boolean;
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        ok: true,
        code: BizCode.SUCCESS,
        message: "success",
        data,
      })),
    );
  }
}
