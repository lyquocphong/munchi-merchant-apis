import { OrderId } from "src/type";

export function getEnvUrl(
  routeQuery: string,
  idQuery?: OrderId,
  param?: Array<String>,
): string {
  let envUrl = `${process.env.BASE_URL}/${routeQuery}`;
  if (idQuery === null || idQuery === undefined)
    return envUrl;
  else
    envUrl = `${process.env.BASE_URL}/${routeQuery}/${idQuery}`;
  return envUrl;
}
