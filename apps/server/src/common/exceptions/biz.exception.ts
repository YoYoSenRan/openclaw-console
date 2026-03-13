import { HttpException, HttpStatus } from "@nestjs/common";
import { BizCodeValue } from "../constants/codes";

export class BizException extends HttpException {
  public readonly bizCode: number;

  constructor(code: BizCodeValue, message: string, httpStatus?: HttpStatus) {
    const status = httpStatus ?? inferHttpStatus(code);
    super(message, status);
    this.bizCode = code;
  }
}

function inferHttpStatus(code: number): HttpStatus {
  if (code >= 10000 && code < 10100) return HttpStatus.UNAUTHORIZED;
  if (code === 90003) return HttpStatus.NOT_FOUND;
  if (code === 90004) return HttpStatus.TOO_MANY_REQUESTS;
  if (code >= 90000) return HttpStatus.INTERNAL_SERVER_ERROR;
  return HttpStatus.BAD_REQUEST;
}
