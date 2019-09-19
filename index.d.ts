import * as express from 'express';

type WithBody<C, BodyType=unknown> = C & { body: BodyType }

interface Handler<C> {
  (req: C & express.Request, res: express.Response): Promise<any> | void;
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

export default function createRouter<C>(): Router<C>;
