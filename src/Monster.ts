import Http, { MResponse } from "./Http";
import { getPatch, DURATION } from "./globals";



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
type MonsterPos = Position1
let _monsterArr: MonsterPos[]
let time = 1


export default class MMonster {
    x: number = 0 // roleX
    y: number = 0 // roleY
    longitude: number = 0
    latitude: number = 0
    monters: Laya.Animation[] = []
    monsterPoss: MonsterPos[] = []

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


        const monsterArr: MonsterPos[] = new Array(randomNumber()).fill(1).map(() => randomMonster(this.x, this.y))

        if (time < 50) {
            if (time === 1) {
                _monsterArr = monsterArr
            }
            time++
            this.render(_monsterArr)
        } else {
            time = 1
            this.render(monsterArr)
        }

    }
    clearMonster() {
        for (let index = 0; index < this.monters.length; index++) {
            this.monters[index].destroy()
        }
        this.monters.forEach(m => {
            m.destroy()
        })
        this.monters = []
    }
    moveMonster(item: MonsterPos, index: number) {

        console.log('monster', this.x, this.y);

        const mapX = (item.x - this.x - getPatch('x')) * 32
        const mapY = (item.y - this.y - getPatch('y')) * 32
        Laya.Tween.to(this.monters[index], { x: mapX, y: mapY }, DURATION);
    }
    render(monsterArr: MonsterPos[]) {
        if (JSON.stringify(monsterArr) === JSON.stringify(this.monsterPoss)) {
            this.monsterPoss.forEach((item, index) => this.moveMonster(item, index))
            return
        }
        console.log('render monsterArr', monsterArr);
        this.clearMonster()
        this.monsterPoss = monsterArr

        monsterArr.forEach(item => {
            const monster = new Laya.Animation();
            //加载动画图集，加载成功后执行回调方法
            monster.scaleX = 1
            monster.scaleY = 1

            const mapX = (item.x - this.x - getPatch('x')) * 32
            const mapY = (item.y - this.y - getPatch('y')) * 32

            console.log('mapX', mapX);
            console.log('mapY', mapY);

            monster.pos(mapX, mapY)
            monster.loadImage("res/duck.png", Laya.Handler.create(this, this.onLoaded, [monster]));
            monster.width=32
            monster.height=32
            monster.zOrder = 100

        });
    }
    private onLoaded(monster: Laya.Animation): void {
        Laya.stage.addChild(monster);
        monster.play()
        this.monters.push(monster)
    }

}