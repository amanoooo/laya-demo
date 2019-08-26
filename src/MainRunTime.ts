


export default class MainRunTime extends Laya.Scene {

    constructor() {
        super()
    }
    onOpened() {
        const DirectionWrapper = this.getChildByName('Direction')
        DirectionWrapper.scene.pos(Laya.Browser.width - 70, Laya.Browser.height - 70)
        const Hero = this.getChildByName('Hero')
        Hero.pos(Laya.Browser.width / 2, Laya.Browser.height / 2)
    }
}