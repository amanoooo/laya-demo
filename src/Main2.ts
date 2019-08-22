// 程序入口
class GameMain{
    private tMap:Laya.TiledMap;
    private scaleValue:number = 0;
    private MapX:number = 0;
    private MapY:number = 0;
    private mLastMouseX:number;
    private mLastMouseY:number;
    constructor()
    {
        //初始化舞台
        Laya.init(Laya.Browser.width,Laya.Browser.height,Laya.WebGL);
        //创建TiledMap实例
        this.tMap = new Laya.TiledMap();
        //创建Rectangle实例，视口区域
        var viewRect:Laya.Rectangle = new Laya.Rectangle();
        //创建TiledMap地图，加载orthogonal.json后，执行回调方法onMapLoaded()
        this.tMap.createMap("res/demo1.json",viewRect,Laya.Handler.create(this,this.onMapLoaded));
    }
    private onMapLoaded():void{
        //设置缩放中心点为视口的左上角
        this.tMap.setViewPortPivotByScale(0,0);
        //将原地图放大3倍
        this.tMap.scale = 3;
        Laya.stage.on(Laya.Event.RESIZE,this,this.resize);
        Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
        this.resize();
    }
    /**
     * 移动地图视口
     */
    private mouseMove():void{
        var moveX:number = this.MapX - (Laya.stage.mouseX - this.mLastMouseX);
        var moveY:number = this.MapY - (Laya.stage.mouseY - this.mLastMouseY)
            //移动地图视口
        this.tMap.moveViewPort(moveX, moveY);
    }
    private mouseUp():void
    {
        this.MapX = this.MapX - (Laya.stage.mouseX - this.mLastMouseX);
        this.MapY = this.MapY - (Laya.stage.mouseY - this.mLastMouseY);
        Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }
    private mouseDown():void
    {
        this.mLastMouseX = Laya.stage.mouseX;
        this.mLastMouseY = Laya.stage.mouseY;
        Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
    }        
    /**
     *  改变视口大小
     *  重设地图视口区域
     */    
    private resize():void
    {
        //改变视口大小
        this.tMap.changeViewPort(this.MapX, this.MapY, Laya.Browser.width, Laya.Browser.height);
    }
}
new GameMain();