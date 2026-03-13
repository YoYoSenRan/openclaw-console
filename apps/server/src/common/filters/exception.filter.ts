import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { BizException } from "../exceptions/biz.exception";
import { BizCode } from "../constants/codes";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatus: number;
    let bizCode: number;
    let message: string;

    if (exception instanceof BizException) {
      httpStatus = exception.getStatus();
      bizCode = exception.bizCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      bizCode = mapHttpStatusToBizCode(httpStatus);
      const res = exception.getResponse();
      message = typeof res === "string" ? res : ((res as any).message ?? exception.message);
      if (Array.isArray(message)) message = message.join("; ");
    } else {
      httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
      bizCode = BizCode.INTERNAL_ERROR;
      message = "Internal server error";
    }

    response.status(httpStatus).json({
      ok: false,
      code: bizCode,
      message,
      data: null,
    });
  }
}

function mapHttpStatusToBizCode(status: number): number {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return BizCode.NOT_AUTHENTICATED;
    case HttpStatus.NOT_FOUND:
      return BizCode.NOT_FOUND;
    case HttpStatus.TOO_MANY_REQUESTS:
      return BizCode.RATE_LIMITED;
    case HttpStatus.BAD_REQUEST:
      return BizCode.VALIDATION_ERROR;
    default:
      return BizCode.INTERNAL_ERROR;
  }
}
