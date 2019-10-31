import * as express from 'express';

export type JsonValue = string | number | boolean | JsonObject | null;
interface JsonObject {
  [x: string]: JsonValue | undefined;
}
interface JsonArray extends Array<JsonValue> { }

export type JsonSerializableValue = string | number | boolean | Date | JsonSerializableObject | JsonSerializableArray | null;
export interface JsonSerializableObject {
  [x: string]: JsonSerializableValue | undefined;
}
interface JsonSerializableArray extends Array<JsonSerializableValue> { }

type WithBody<C, BodyType> = C & { body: BodyType };

export type ResponseBody = JsonSerializableValue;

export type Request<C> = Omit<express.Request, 'body'> & C;

interface Handler<C,R=any> {
  (req: Request<C>, res: express.Response): Promise<R|void> | R | void;
}

interface CanHandle<C> extends express.RequestHandler {
  (req: C & express.Request, res: express.Response): void;
}

export interface Router<C extends {}, R=JsonSerializableValue, BodyType=JsonValue> extends CanHandle<C> {
  use(fn: Handler<C,void>): this;

  // Mount another router
  use(router: CanHandle<C>): this;

  // Mount a normal express app
  use(expressApp: express.Router): this;

  use<T>(path: string, fn: express.RequestHandler): this;

  param(name: string, handler: Handler<C,R>): this;
  get(path: string, handler: Handler<C,R>): this;
  put<T = BodyType>(path: string, handler: Handler<WithBody<C, T>,R>): this;
  post<T = BodyType>(path: string, handler: Handler<WithBody<C, T>,R>): this;
  delete<T = BodyType>(path: string, handler: Handler<WithBody<C, T>,R>): this;
}

export default function createRouter<C,R=any,BodyType=JsonObject>(): Router<C,R,BodyType>;
