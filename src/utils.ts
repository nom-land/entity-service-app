export function isJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e: any) {
        return [false, e.message];
    }
    return [true, null];
}
