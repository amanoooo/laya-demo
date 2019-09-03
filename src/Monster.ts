import Http, { MResponse } from "./Http";



interface Position1 {
    x: number
    y: number
}
interface Postion2 {
    latitude: number,
    longitude: number
}
type Position = Position1 | Postion2
function isType1(pos: Position): pos is Position1 {
    if ((pos as Position1).x) {
        return true
    }
    return false
}

function randomSymbol() {
    return Math.random() >= 0.5 ? 1 : -1
}
function randomMonster(x: number, y: number, range: number = 10): Position1 {
    return { x: x + Math.round(Math.random() * range) * randomSymbol(), y: y + Math.round(Math.random() * range) * randomSymbol() }
}
function randomNumber() {
    return Math.round(Math.random() * 5)
}
export default class Monster {
    x: number = 0
    y: number = 0
    longitude: number = 0
    latitude: number = 0

    fetchMonster(pos: Position) {
        if (isType1(pos)) {
            const { x, y } = pos
            this.x = pos.x
            this.y = pos.y
        } else {
            const { longitude, latitude } = pos
            this.longitude = pos.longitude
            this.latitude = pos.latitude
        }
        Http.get('http://localhost:3000/api/pos', { latitude: this.latitude, longitude: this.longitude }, this, this.onFetchMonster)
    }
    onFetchMonster(res: MResponse) {
        // if(res.error) {
        //     console.warn('onFetchMonster error ', res.error + res.status)
        // } else {
        //     console.log('res', res.payload)
        // }


        // @ts-ignore
        const monsterArr = new Array(randomNumber()).fill(1).map(() => randomMonster(this.x, this.y))
        console.log('monsterArr', monsterArr);

    }

}