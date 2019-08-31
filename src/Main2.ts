import GameConfig from "./GameConfig";
import Http, { MResponse } from "./Http";


// 程序入口
class GameMain {
    private tMap: Laya.TiledMap;
    private scaleValue: number = 0;
    private MapX: number = 0;
    private MapY: number = 0;
    private mLastMouseX: number;
    private mLastMouseY: number;
    private offsetUnit = 50
    private mapOffset = -50


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
        console.log('width ', Laya.Browser.width);
        console.log('height ', Laya.Browser.height);


        this.tMap = new Laya.TiledMap();
        var viewRect: Laya.Rectangle = new Laya.Rectangle();
        this.tMap.createMap("res/demo4.json", viewRect, Laya.Handler.create(this, this.onMapLoaded));

        Laya.init(Laya.Browser.width, Laya.Browser.height, Laya.WebGL);
        // Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
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
        this.resize2()
    }
    onVersionLoaded(): void {
        //激活大小图映射，加载小图的时候，如果发现小图在大图合集里面，则优先加载大图合集，而不是小图
        Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
    }
    private onMapLoaded(): void {
        //设置缩放中心点为视口的左上角
        this.tMap.setViewPortPivotByScale(0, 0);
        this.tMap.scale = 2;
        Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);

        this.resize();
        console.log('tMap', this.tMap)


        const idx = this.tMap.getLayerByIndex(0).getTileDataByScreenPos(1, 1);
        const a = this.tMap.getSprite(1, 32, 32)

        console.log('idx', idx);

        console.log('a', a);
        const layer = this.tMap.getLayerByIndex(0)

        console.log('layer ', layer);

        const tileData = layer.getTileData(0, 0)
        const tileData2 = layer.getTileData(1, 0)
        const tileData3 = layer.getTileData(0, 1)
        const tileData4 = layer.getTileData(1, 1)
        const tileData5 = layer.getTileData(0, 2)
        const tileData6 = layer.getTileData(1, 2)
        console.log('tileData ', tileData);
        console.log('tileData ', tileData2);
        console.log('tileData ', tileData3);
        console.log('tileData ', tileData4);
        console.log('tileData ', tileData5);
        console.log('tileData ', tileData6);

        const p0 = this.tMap.getTileProperties(0, tileData - 1, 'mp')
        const p1 = this.tMap.getTileProperties(0, tileData, 'mp')
        const p2 = this.tMap.getTileProperties(0, tileData + 1, 'mp')
        console.log('p0', p0);
        console.log('p1', p1);
        console.log('p2', p2);



        const s0 = this.tMap.getSprite(0, 0, 0)
        console.log('so ', s0);




    }



    /**
     * 移动地图视口
     */
    private mouseMove(): void {
        var moveX: number = this.MapX - (Laya.stage.mouseX - this.mLastMouseX);
        var moveY: number = this.MapY - (Laya.stage.mouseY - this.mLastMouseY)
        //移动地图视口

        if (moveX < this.mapOffset
            || moveY < this.mapOffset
            || moveX > this.tMap.width - this.mapOffset - Laya.Browser.width
            || moveY > this.tMap.height - this.mapOffset - Laya.Browser.height) {
            return
        }
        this.tMap.moveViewPort(moveX, moveY);
    }
    private mouseUp(): void {

        let _MapX = this.MapX - (Laya.stage.mouseX - this.mLastMouseX)
        let _MapY = this.MapY - (Laya.stage.mouseY - this.mLastMouseY);
        this.MapX = _MapX
        this.MapY = _MapY

        const maxOffsetX = this.tMap.width - this.mapOffset - Laya.Browser.width
        const maxOffsetY = this.tMap.height - this.mapOffset - Laya.Browser.height
        if (_MapX < this.mapOffset) {
            this.MapX = this.mapOffset
        } else if (_MapX > maxOffsetX) {
            this.MapX = maxOffsetX
        }
        if (_MapY < this.mapOffset) {
            this.MapY = this.mapOffset
        } else if (_MapY > maxOffsetY) {
            this.MapY = maxOffsetY
        }
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }
    private mouseDown(): void {
        this.mLastMouseX = Laya.stage.mouseX
        this.mLastMouseY = Laya.stage.mouseY;
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }
    /**
     *  改变视口大小
     *  重设地图视口区域
     */
    private resize(): void {
        //改变视口大小
        this.tMap.changeViewPort(this.MapX, this.MapY, Laya.Browser.width, Laya.Browser.height);
    }
    resize2(): void {
        let w = GameConfig.width;
        let h = GameConfig.height;
        console.log('w ', w);
        console.log('h ', h);

        let screen_wh_scale = Laya.Browser.width / Laya.Browser.height;
        h = GameConfig.width / screen_wh_scale;
        Laya.Scene.unDestroyedScenes.forEach(element => {
            let s = element as Laya.Scene;
            s.width = w;
            s.height = h;
        });
    }

    move(direction: string): void {
        switch (direction) {
            case 'left':
                this.MapX = this.MapX - this.offsetUnit
                break;
            case 'right':
                this.MapX = this.MapX + this.offsetUnit
                break;
            case 'up':
                this.MapY = this.MapY - this.offsetUnit
                break;
            case 'down':
                this.MapY = this.MapY + this.offsetUnit
                break;
            default:
                break;
        }
        this.tMap.moveViewPort(this.MapX, this.MapY);
        // this.tMap.setViewPortPivotByScale(0,0)
        // this.tMap.scale = 5;
        // this.resize();
    }
}

const game = new GameMain();


export { game }