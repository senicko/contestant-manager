import { STATUS_CODES } from "http";

/**
 * logs incoming requests to the console.
 * @param request incoming request
 */
export const log = (request: Request, response: Response) =>
  console.log(
    `${request.method} ${request.url} -> ${response.status} ${
      STATUS_CODES[response.status]
    }`
  );

export type Method = "GET" | "POST" | "PUT" | "DELETE";

export type Handler = (
  request: Request,
  params: Record<string, string>
) => Promise<Response>;

export type Route =
  | {
      [K in Method]?: Handler;
    } & { path: string };

/**
 * comparePath compares requesy path with route template path.
 * @param path request path
 * @param template route tempalte path
 * @returns boolean meaning if it is coorrect or not
 */
// TODO: This says that / is the same as /contestants
const comparePath = (path: string, template: string) => {
  const pathElements = path.split("/");
  const templateElements = template.split("/");

  if (pathElements.length !== templateElements.length) return false;

  for (let i = 0; i < templateElements.length; i++) {
    if (
      !templateElements.at(i).startsWith(":") &&
      templateElements.at(i) !== pathElements.at(i)
    )
      return false;
  }

  return true;
};

/**
 * getPathParams retrieve path params from request url.
 * @param path
 * @param template
 * @returns
 */
const getPathParams = (
  path: string,
  template: string
): Record<string, string> => {
  const pathElements = path.split("/");
  const templateElements = template.split("/");

  return templateElements.reduce((prev, curr, i) => {
    if (curr.startsWith(":")) prev[curr.slice(1)] = pathElements[i];
    return prev;
  }, {});
};

/**
 * resolver finds registered handler for the request path & method and runs it.
 * @param request http request
 * @param routes route definitions
 * @returns response generated by route handler or 403 if it does not exist.
 */
export const resolver = (request: Request, routes: Route[]): Response => {
  const { pathname } = new URL(request.url);

  const route = routes.find((route) => comparePath(pathname, route.path));
  const handler = route?.[request.method];

  if (!handler) return new Response(STATUS_CODES[403], { status: 404 });

  const params = getPathParams(pathname, route.path);
  return handler(request, params);
};

export type CookieOptions = {
  name: string;
  value: string;

  expire?: Date;
  httpOnly?: boolean;
};

/**
 * setCookie adds a cookie to the request.
 * @param headers request headers
 * @param options cookie options
 */
export const setCookie = (headers: Headers, options: CookieOptions) => {
  let cookie = `${options.name}=${options.value}`;

  if (options.expire) cookie += `; Expires=${options.expire.toUTCString()}`;
  if (options.httpOnly) cookie += "; HttpOnly";

  headers.set("Set-Cookie", `${cookie};`);
};

/**
 * parseCookies parses cookie header and transforms it into a string record.
 * @param request incoming request
 */
export const parseCookies = (request: Request): Record<string, string> => {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.split("=");
    cookies[name] = value;
    return cookies;
  }, {});
};
