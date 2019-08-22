(function () {
   'use strict';

   class ImageRunTime extends Laya.Button {
       constructor() {
           super();
           this.scaleTime = 100;
           this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
           this.on(Laya.Event.MOUSE_UP, this, this.scaleBig);
           this.on(Laya.Event.MOUSE_OUT, this, this.scaleBig);
       }
       scaleBig() {
           Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, this.scaleTime);
       }
       scaleSmall() {
           Laya.Tween.to(this, { scaleX: 0.8, scaleY: 0.8 }, this.scaleTime);
           console.log('this ', this);
           let Hero;
           Hero = this.parent.parent.getChildByName('Hero');
           switch (this.name) {
               case 'up':
                   Hero.pivotY += +5;
                   break;
               case 'down':
                   Hero.pivotY += -5;
                   break;
               case 'left':
                   Hero.pivotX += 5;
                   break;
               case 'right':
                   Hero.pivotX += -5;
                   break;
               default:
                   throw new Error('invalid name');
           }
       }
   }

   var REG = Laya.ClassUtils.regClass;
   var ui;
   (function (ui) {
       var test;
       (function (test) {
           class TestSceneUI extends Laya.Scene {
               constructor() { super(); }
               createChildren() {
                   super.createChildren();
                   this.loadScene("test/TestScene");
               }
           }
           test.TestSceneUI = TestSceneUI;
           REG("ui.test.TestSceneUI", TestSceneUI);
       })(test = ui.test || (ui.test = {}));
   })(ui || (ui = {}));

   class GameControl extends Laya.Script {
       constructor() {
           super();
           this.createBoxInterval = 1000;
           this._time = 0;
           this._started = false;
       }
       onEnable() {
           this._time = Date.now();
           this._gameBox = this.owner.getChildByName("gameBox");
       }
       onUpdate() {
           let now = Date.now();
           if (now - this._time > this.createBoxInterval && this._started) {
               this._time = now;
               this.createBox();
           }
       }
       createBox() {
           let box = Laya.Pool.getItemByCreateFun("dropBox", this.dropBox.create, this.dropBox);
           box.pos(Math.random() * (Laya.stage.width - 100), -100);
           this._gameBox.addChild(box);
       }
       onStageClick(e) {
           e.stopPropagation();
           let flyer = Laya.Pool.getItemByCreateFun("bullet", this.bullet.create, this.bullet);
           flyer.pos(Laya.stage.mouseX, Laya.stage.mouseY);
           this._gameBox.addChild(flyer);
       }
       startGame() {
           if (!this._started) {
               this._started = true;
               this.enabled = true;
           }
       }
       stopGame() {
           this._started = false;
           this.enabled = false;
           this.createBoxInterval = 1000;
           this._gameBox.removeChildren();
       }
   }

   class GameUI extends ui.test.TestSceneUI {
       constructor() {
           super();
           GameUI.instance = this;
           Laya.MouseManager.multiTouchEnabled = false;
       }
       onEnable() {
           this._control = this.getComponent(GameControl);
           this.tipLbll.on(Laya.Event.CLICK, this, this.onTipClick);
       }
       onTipClick(e) {
           this.tipLbll.visible = false;
           this._score = 0;
           this.scoreLbl.text = "";
           this._control.startGame();
       }
       addScore(value = 1) {
           this._score += value;
           this.scoreLbl.changeText("分数：" + this._score);
           if (this._control.createBoxInterval > 600 && this._score % 20 == 0)
               this._control.createBoxInterval -= 20;
       }
       stopGame() {
           this.tipLbll.visible = true;
           this.tipLbll.text = "游戏结束了，点击屏幕重新开始";
           this._control.stopGame();
       }
   }

   class Bullet extends Laya.Script {
       constructor() { super(); }
       onEnable() {
           var rig = this.owner.getComponent(Laya.RigidBody);
           rig.setVelocity({ x: 0, y: -10 });
       }
       onTriggerEnter(other, self, contact) {
           this.owner.removeSelf();
       }
       onUpdate() {
           if (this.owner.y < -10) {
               this.owner.removeSelf();
           }
       }
       onDisable() {
           Laya.Pool.recover("bullet", this.owner);
       }
   }

   class DropBox extends Laya.Script {
       constructor() {
           super();
           this.level = 1;
       }
       onEnable() {
           this._rig = this.owner.getComponent(Laya.RigidBody);
           this.level = Math.round(Math.random() * 5) + 1;
           this._text = this.owner.getChildByName("levelTxt");
           this._text.text = this.level + "";
       }
       onUpdate() {
           this.owner.rotation++;
       }
       onTriggerEnter(other, self, contact) {
           var owner = this.owner;
           if (other.label === "buttle") {
               if (this.level > 1) {
                   this.level--;
                   this._text.changeText(this.level + "");
                   owner.getComponent(Laya.RigidBody).setVelocity({ x: 0, y: -10 });
                   Laya.SoundManager.playSound("sound/hit.wav");
               }
               else {
                   if (owner.parent) {
                       let effect = Laya.Pool.getItemByCreateFun("effect", this.createEffect, this);
                       effect.pos(owner.x, owner.y);
                       owner.parent.addChild(effect);
                       effect.play(0, true);
                       owner.removeSelf();
                       Laya.SoundManager.playSound("sound/destroy.wav");
                   }
               }
               GameUI.instance.addScore(1);
           }
           else if (other.label === "ground") {
               owner.removeSelf();
               GameUI.instance.stopGame();
           }
       }
       createEffect() {
           let ani = new Laya.Animation();
           ani.loadAnimation("test/TestAni.ani");
           ani.on(Laya.Event.COMPLETE, null, recover);
           function recover() {
               ani.removeSelf();
               Laya.Pool.recover("effect", ani);
           }
           return ani;
       }
       onDisable() {
           Laya.Pool.recover("dropBox", this.owner);
       }
   }

   class GameConfig {
       constructor() { }
       static init() {
           var reg = Laya.ClassUtils.regClass;
           reg("DirectionRunTime.ts", ImageRunTime);
           reg("script/GameUI.ts", GameUI);
           reg("script/GameControl.ts", GameControl);
           reg("script/Bullet.ts", Bullet);
           reg("script/DropBox.ts", DropBox);
       }
   }
   GameConfig.width = 640;
   GameConfig.height = 1136;
   GameConfig.scaleMode = "fixedwidth";
   GameConfig.screenMode = "none";
   GameConfig.alignV = "top";
   GameConfig.alignH = "left";
   GameConfig.startScene = "Start.scene";
   GameConfig.sceneRoot = "";
   GameConfig.debug = false;
   GameConfig.stat = false;
   GameConfig.physicsDebug = false;
   GameConfig.exportSceneToJson = true;
   GameConfig.init();

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
           this.tMap.createMap("res/demo1.json", viewRect, Laya.Handler.create(this, this.onMapLoaded));
           if (window["Laya3D"])
               Laya3D.init(GameConfig.width, GameConfig.height);
           else
               Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
           Laya["Physics"] && Laya["Physics"].enable();
           Laya["DebugPanel"] && Laya["DebugPanel"].enable();
           Laya.stage.scaleMode = GameConfig.scaleMode;
           Laya.stage.screenMode = GameConfig.screenMode;
           Laya.stage.alignV = GameConfig.alignV;
           Laya.stage.alignH = GameConfig.alignH;
           Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
           if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
               Laya.enableDebugPanel();
           if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
               Laya["PhysicsDebugDraw"].enable();
           if (GameConfig.stat)
               Laya.Stat.show();
           Laya.alertGlobalError = true;
           Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
       }
       onConfigLoaded() {
           GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
       }
       onVersionLoaded() {
           Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
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
