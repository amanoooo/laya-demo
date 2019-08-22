(function () {
    'use strict';

    class GameMain {
        constructor() {
            this.scaleValue = 0;
            this.MapX = 0;
            this.MapY = 0;
            this.skin = "button.png";
            Laya.init(Laya.Browser.width, Laya.Browser.height, Laya.WebGL);
            Laya.stage.bgColor = "#5a7b9a";
            this.tMap = new Laya.TiledMap();
            var viewRect = new Laya.Rectangle();
            let gameMain = new ui.view.gameMainUI();
            Laya.stage.addChild(gameMain);
            Laya.loader.load(this.skin, Laya.Handler.create(this, this.onLoaded));
        }
        onMapLoaded() {
            this.tMap.setViewPortPivotByScale(0, 0);
            this.tMap.scale = 1;
            Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
            Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
            this.resize();
        }
        mouseMove() {
            var moveX = this.MapX - (Laya.stage.mouseX - this.mLastMouseX);
            var moveY = this.MapY - (Laya.stage.mouseY - this.mLastMouseY);
            this.tMap.moveViewPort(moveX, moveY);
        }
        mouseUp() {
            this.MapX = this.MapX - (Laya.stage.mouseX - this.mLastMouseX);
            this.MapY = this.MapY - (Laya.stage.mouseY - this.mLastMouseY);
            Laya.stage.off(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        }
        mouseDown() {
            this.mLastMouseX = Laya.stage.mouseX;
            this.mLastMouseY = Laya.stage.mouseY;
            Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.mouseMove);
        }
        resize() {
            this.tMap.changeViewPort(this.MapX, this.MapY, Laya.Browser.width, Laya.Browser.height);
        }
        onLoaded() {
            const btn = new Laya.Button(this.skin);
            Laya.stage.addChild(btn);
            btn.width = 50;
            btn.height = 50;
            btn.pos(1, 1);
            btn.labelSize = 30;
            btn.label = "上";
        }
    }
    new GameMain();

}());
