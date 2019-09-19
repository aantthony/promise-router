import * as express from 'express';

export interface Request {
  params: Readonly<{
    [key: string]: string | undefined;
  }>;
  query: Readonly<{
    [key: string]: string | string[] | undefined;
  }>;
}

type WithBody<C, BodyType=unknown> = C & { body: BodyType }

interface Handler<C> {
  (req: C & Request): Promise<any> | void;
}
export interface Router<C extends {}> extends express.RequestHandler {
  use<T>(fn: Router<T> | Handler<C>): this;
  use<T>(path: string, fn: Router<T> | Handler<C>): this;
  param(name: string, handler: Handler<C>): this;
  get(path: string, handler: Handler<C>): this;
  put<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>>): this;
  post<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>>): this;
  delete<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>>): this;
}
type RouterResponse = {};
const constructor: {
  new<C>(): Router<C>;
  Response: {
    new(contentType: string, data: Buffer | string): RouterResponse;
  };
};
export default constructor;