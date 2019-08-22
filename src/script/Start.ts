


export default class Start extends Laya.Script {

    constructor() {super()}
    onEnable(): void {

    }
    onClick(): void {
        console.log(1)
        // Laya.Scene.open('Fight.scene')
        const Up = this.owner.getChildByName('ButtonUp')
        console.log('up is ', Up)
    }
}