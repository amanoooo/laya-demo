import GameConfig from "./GameConfig";
import Http, { MResponse } from "./Http";


const { Tween, Ease, Handler } = Laya

// 程序入口
class GameMain {
    private tMap: Laya.TiledMap;
    private scaleValue: number = 0;

    private mLastMouseX: number;
    private mLastMouseY: number;
    private stepSize = 32
    private patchX: number = 0 // index
    private patchY: number = 0 // index
    private roleX: number = 0 // index
    private roleY: number = 0 // index
    private newRoleX: number = 0 // index
    private newRoleY: number = 0 // index

    private mLock: boolean = false
    private mHold: boolean = false

    private hold() {
        this.mHold = true
    }
    private unHold() {
        this.mHold = false
    }
    private lock() {
        this.mLock = true
    }
    private unLock() {
        this.mLock = false
    }


    //按钮资源路径
    private skin: string = "button.png";

    test() {
        Http.get('http://localhost:3000/api/pos', { x: 1, y: 2 }, this, this.onTestSuccess)
    }
    onTestSuccess(res: MResponse) {
        console.log('res', res)
    }

    constructor() {
        //初始化舞台

        const bWidth = Laya.Browser.width
        const bHeight = Laya.Browser.height
        console.log('width  %d , height %d', bWidth, bHeight);

        this.tMap = new Laya.TiledMap();
        var viewRect: Laya.Rectangle = new Laya.Rectangle();
        this.tMap.createMap("res/demo4.json", viewRect, Laya.Handler.create(this, this.onMapLoaded));

        Laya.init(bWidth, bHeight, Laya.WebGL);

        this.patchX = - Math.round(bWidth / 2 / this.stepSize)
        this.patchY = - Math.round(bHeight / 2 / this.stepSize)

        Laya.stage.bgColor = "#5a7b9a";
        Laya["Physics"] && Laya["Physics"].enable();
        Laya["DebugPanel"] && Laya["DebugPanel"].enable();
        Laya.stage.scaleMode = GameConfig.scaleMode;
        Laya.stage.screenMode = GameConfig.screenMode;
        Laya.stage.alignV = GameConfig.alignV;
        Laya.stage.alignH = GameConfig.alignH;
        //兼容微信不支持加载scene后缀场景
        Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;

        //打开调试面板（通过IDE设置调试模式，或者url地址增加debug=true参数，均可打开调试面板）
        if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true") Laya.enableDebugPanel();
        if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"]) Laya["PhysicsDebugDraw"].enable();
        if (GameConfig.stat) Laya.Stat.show();
        Laya.alertGlobalError = true;

        //激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
        Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);

        this.test()

    }
    onConfigLoaded(): void {
        //加载IDE指定的场景
        GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
    }
    onVersionLoaded(): void {
        //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    }
    private onMapLoaded(): void {
        //设置缩放中心点为视口的左上角
        this.tMap.setViewPortPivotByScale(0, 0);
        this.tMap.scale = 1;
        Laya.stage.on(Laya.Event.RESIZE, this, this.resize);

        this.resize();
        console.log('tMap', this.tMap)
        const a = this.tMap.getSprite(1, 32, 32)
        console.log('a', a);
        const layer = this.tMap.getLayerByIndex(0)
        console.log('layer ', layer);
        const s0 = this.tMap.getSprite(0, 0, 0)
        console.log('so ', s0);
    }


    /**
     *  改变视口大小
     *  重设地图视口区域
     */
    private resize(direction?: string): void {
        const { roleX, roleY, newRoleX, newRoleY } = this
        console.log('old role', roleX, roleY);

        if (roleX === newRoleX && roleY === newRoleY) {
            const mapX = (this.roleX + this.patchX) * this.stepSize
            const mapY = (this.roleY + this.patchY) * this.stepSize
            this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
            return
        }

        Tween.to(this,
            { roleX: newRoleX, roleY: newRoleY, ease: Ease.linearNone, complete: Handler.create(this, this.onTweenComplete, [direction]), update: new Handler(this, this.onTweenUpdate, [this.roleX]) }
            , 500)

    }
    onTweenComplete(direction: string) {
        console.log('onTweenComplete', this.roleX, this.roleX, );
        const mapX = (this.roleX + this.patchX) * this.stepSize
        const mapY = (this.roleY + this.patchY) * this.stepSize
        this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
        console.log('this mHold is ', this.mHold);

        this.unLock()
        if (this.mHold) {
            this.move(direction)
        }
    }
    onTweenUpdate() {
        const mapX = (this.roleX + this.patchX) * this.stepSize
        const mapY = (this.roleY + this.patchY) * this.stepSize
        this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
    }

    getCoordinate(x: number, y: number): { indexX: number, indexY: number } {
        const indexX = x / this.stepSize
        const indexY = y / this.stepSize
        console.log('indeX ', indexX);
        console.log('indeY', indexY);
        return {
            indexX,
            indexY
        }
    }
    cancelMove(): void {
        this.unHold()
    }
    move(direction: string): void {
        console.log('mlock is', this.mLock);

        if (this.mLock) {
            return
        }
        this.hold()
        this.lock()
        this.newRoleX = this.roleX
        this.newRoleY = this.roleY

        switch (direction) {
            case 'left':
                this.newRoleX = this.roleX - 1
                break;
            case 'right':
                this.newRoleX = this.roleX + 1
                break;
            case 'up':
                this.newRoleY = this.roleY - 1
                break;
            case 'down':
                this.newRoleY = this.roleY + 1
                break;
            default:
                break;
        }

        const tileData = this.tMap.getLayerByIndex(0).getTileData(this.newRoleX, this.newRoleY)

        if (tileData === 1) {
            console.log('return due to (%d, %d) data is 1', this.newRoleX, this.newRoleY, tileData)
            this.unHold()
            this.unLock()
            return
        }


        this.resize(direction)
    }
}

const game = new GameMain();


export { game }