import * as express from 'express';

type WithBody<C, BodyType=unknown> = C & { body: BodyType }

interface Handler<C,R=any> {
  (req: C & express.Request, res: express.Response): Promise<R> | R | void;
}

interface CanHandle<C> extends express.RequestHandler {
  (req: C & express.Request, res: express.Response): void;
}

export interface Router<C extends {},R=any> extends CanHandle<C> {
  use(fn: Handler<C,void>): this;

  // Mount another router
  use(router: CanHandle<C>): this;

  // Mount a normal express app
  use(expressApp: express.Router): this;

  use<T>(path: string, fn: express.RequestHandler): this;

  param(name: string, handler: Handler<C,R>): this;
  get(path: string, handler: Handler<C,R>): this;
  put<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>,R>): this;
  post<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>,R>): this;
  delete<T = {[key: string]: unknown}>(path: string, handler: Handler<WithBody<C, T>,R>): this;
}

export default function createRouter<C,T=any>(): Router<C,T>;
