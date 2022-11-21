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
