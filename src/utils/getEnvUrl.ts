export function GetEnvUrl(routeQuery:string, idQuery: string) :string {
    let envUrl = `${process.env.BASE_URL}/${routeQuery}`;
    if (idQuery === null || idQuery === undefined) return envUrl;
    else envUrl =`${process.env.BASE_URL}/${routeQuery}/${idQuery}`;
    return envUrl;
}
