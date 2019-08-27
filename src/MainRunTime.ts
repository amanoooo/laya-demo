


export default class MainRunTime extends Laya.Scene {
    private roleAni: Laya.Animation;

    constructor() {
        super()

    }
    onOpened() {
        const DirectionWrapper = this.getChildByName('Direction')
        DirectionWrapper.scene.pos(Laya.Browser.width - 70, Laya.Browser.height - 70)
        // const Hero = this.getChildByName('Hero')
        // Hero.pos(Laya.Browser.width / 2, Laya.Browser.height / 2)

        this.roleAni = new Laya.Animation();
        //加载动画图集，加载成功后执行回调方法
        console.log(111);
        this.roleAni.width=32
        this.roleAni.height=32
        this.roleAni.pos(Laya.Browser.width / 2, Laya.Browser.height / 2)
        
        this.roleAni.loadAtlas("res/atlas/girl.atlas", Laya.Handler.create(this, this.onLoaded));
        
    }
    
    private onLoaded(): void {
        console.log('this.roleAni', this.roleAni);
        console.log(2222);
        //添加到舞台
        Laya.stage.addChild(this.roleAni);
        this.roleAni.play()
    }
}