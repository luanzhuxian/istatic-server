// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportErrorHandler from '../../../app/middleware/error_handler';
import ExportNotFoundHandler from '../../../app/middleware/not_found_handler';
import ExportResponseSuccess from '../../../app/middleware/response_success';

declare module 'egg' {
  interface IMiddleware {
    errorHandler: typeof ExportErrorHandler;
    notFoundHandler: typeof ExportNotFoundHandler;
    responseSuccess: typeof ExportResponseSuccess;
  }
}
