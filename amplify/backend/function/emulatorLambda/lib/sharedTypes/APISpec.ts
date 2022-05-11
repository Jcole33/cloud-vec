type SuccessResponse<R> = { success: true, body: R } | { success: false, message: string, error?: unknown }

export interface MethodSpec {
    params?: Record<string, string>
    query?: Record<string, string>
    body?: unknown
    response: unknown
}

export type GetSpec = Pick<MethodSpec, 'params' | 'query' | 'response'>
export type PutSpec = MethodSpec
export type PostSpec = Pick<MethodSpec, 'body' | 'response'>
export type DeleteSpec = Pick<MethodSpec, 'params' | 'response'>


export interface RouteSpec {
    get?: GetSpec
    put?: PutSpec
    post?: PostSpec
    delete?: DeleteSpec
}

export interface APISpec {
    [key: string]: RouteSpec
}

type RealMethod<Method extends MethodSpec> = {
    [Property in keyof Method]: Property extends 'response' ? SuccessResponse<Method[Property]> : Method[Property]
}

type RealRoute<Route extends RouteSpec> = {
    [Method in keyof Route]: Route[Method] extends MethodSpec ? RealMethod<Route[Method]> : never
}

type RemoveIndex<T> = {
    [K in keyof T as string extends K ? never : K]: T[K]
}

export type RealAPI<API extends APISpec> = {
    [Route in keyof RemoveIndex<API>]: RealRoute<API[Route]>
}

export type EndPointMethod<
    API extends RealAPI<APISpec>,
    RouteName extends keyof API,
    MethodName extends keyof RouteSpec
    > = MethodName extends keyof API[RouteName] ? API[RouteName][MethodName] : never

export type EndPointProperty<
    API extends RealAPI<APISpec>,
    RouteName extends keyof API,
    MethodName extends keyof RouteSpec,
    PropName extends keyof MethodSpec
    > = MethodName extends keyof API[RouteName] ? (
        PropName extends keyof API[RouteName][MethodName] ? (
            API[RouteName][MethodName][PropName] extends MethodSpec[PropName] ?
            API[RouteName][MethodName][PropName]
            : never
        ) : never
    ) : never


export type MethodDefinition<API extends RemoveIndex<APISpec>, RouteName extends keyof API, MethodName extends keyof RouteSpec> = {
    [Property in keyof Required<MethodSpec>]: EndPointProperty<API, RouteName, MethodName, Property>
}