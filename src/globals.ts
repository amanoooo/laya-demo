interface Patch {
    x: number,
    y: number
}
let patch: Patch = {
    x: 0,
    y: 0
}
export function getPatch(prop: 'x' | 'y'): number {
    return patch[prop]
}
export function setPatch(p: Patch) {
    patch = p
}

export const DURATION = 200