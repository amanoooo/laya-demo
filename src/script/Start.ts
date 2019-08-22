


export default class Start extends Laya.Script {

    constructor() {super()}
    onEnable(): void {

    }
    onClick(): void {
        Laya.Scene.open('Fight.scene')
    }
}