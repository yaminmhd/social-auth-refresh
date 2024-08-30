import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentUserByContext = (context: ExecutionContext) => {
  //user object is populated by passport local strategy
  return context.switchToHttp().getRequest().user;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentUserByContext(context),
);
