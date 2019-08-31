var laya = (function (exports) {
   'use strict';

   class DirectionRunTime extends Laya.Button {
       constructor() {
           super();
           this.scaleTime = 100;
           this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
           this.on(Laya.Event.MOUSE_UP, this, this.scaleBig);
           this.on(Laya.Event.MOUSE_OUT, this, this.scaleBig);
       }
       scaleBig(e) {
           e.stopPropagation();
           Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, this.scaleTime);
       }
       scaleSmall(e) {
           e.stopPropagation();
           Laya.Tween.to(this, { scaleX: 0.9, scaleY: 0.9 }, this.scaleTime);
           let Hero;
           Hero = this.parent.parent.getChildByName('Hero');
           switch (this.name) {
               case 'up':
                   game.move('up');
                   break;
               case 'down':
                   game.move('down');
                   break;
               case 'left':
                   game.move('left');
                   break;
               case 'right':
                   game.move('right');
                   break;
               default:
                   throw new Error('invalid name');
           }
       }
   }

   class MainRunTime extends Laya.Scene {
       constructor() {
           super();
       }
       onOpened() {
           const DirectionWrapper = this.getChildByName('Direction');
           DirectionWrapper.scene.pos(Laya.Browser.width - 70, Laya.Browser.height - 70);
           this.roleAni = new Laya.Animation();
           console.log(111);
           this.roleAni.scaleX = 1;
           this.roleAni.scaleY = 1;
           const patchX = Math.round(Laya.Browser.width / 2 / 32) * 32;
           const patchY = Math.round(Laya.Browser.height / 2 / 32) * 32;
           this.roleAni.pos(patchX, patchY);
           this.roleAni.loadAtlas("res/atlas/girl.atlas", Laya.Handler.create(this, this.onLoaded));
       }
       onLoaded() {
           console.log('this.roleAni', this.roleAni);
           Laya.stage.addChild(this.roleAni);
           this.roleAni.play();
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
           reg("DirectionRunTime.ts", DirectionRunTime);
           reg("MainRunTime.ts", MainRunTime);
           reg("script/GameUI.ts", GameUI);
           reg("script/GameControl.ts", GameControl);
           reg("script/Bullet.ts", Bullet);
           reg("script/DropBox.ts", DropBox);
       }
   }
   GameConfig.width = 375;
   GameConfig.height = 667;
   GameConfig.scaleMode = "fixedwidth";
   GameConfig.screenMode = "none";
   GameConfig.alignV = "top";
   GameConfig.alignH = "left";
   GameConfig.startScene = "Start.scene";
   GameConfig.sceneRoot = "";
   GameConfig.debug = true;
   GameConfig.stat = false;
   GameConfig.physicsDebug = false;
   GameConfig.exportSceneToJson = true;
   GameConfig.init();

   class HTTP {
       constructor() {
           this.obj2urlParams = (obj = {}) => {
               return Object.keys(obj).length === 0
                   ? ''
                   : Object.keys(obj)
                       .filter(key => obj[key] !== undefined)
                       .reduce((str, key) => `${str}${key}=${obj[key]}&`, '')
                       .slice(0, -1)
                       .replace(/^/, '?');
           };
           this.http = new Laya.HttpRequest;
       }
       get(url, params, caller, callback) {
           this.caller = caller;
           this.callback = callback;
           this.http.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
           this.http.once(Laya.Event.ERROR, this, this.onHttpRequestError);
           this.http.send(url + this.obj2urlParams(params), null, 'get', 'json');
           return this;
       }
       post(url, data, contentType, caller, callback) {
           this.caller = caller;
           this.callback = callback;
           this.http.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
           this.http.once(Laya.Event.ERROR, this, this.onHttpRequestError);
           if (contentType == null) {
               this.http.send(url, data, 'post', 'json');
           }
           else {
               this.http.send(url, data, 'post', 'json', ["content-type", contentType]);
           }
           return this;
       }
       onHttpRequestError(e) {
           this.callback.apply(this.caller, [{ error: 'Server Interal Error', status: 500 }]);
       }
       onHttpRequestComplete(e) {
           const status = this.http.http.status;
           if (status !== 200 || this.http.data.errMsg) {
               this.callback.apply(this.caller, [{ error: this.http.data.payload || 'Client Logic Error', status }]);
           }
           else {
               this.callback.apply(this.caller, [{ error: null, status, payload: this.http.data.payload }]);
           }
       }
   }
   var Http = new HTTP();

   const { Tween, Ease, Handler } = Laya;
   class GameMain {
       constructor() {
           this.scaleValue = 0;
           this.stepSize = 32;
           this.patchX = 0;
           this.patchY = 0;
           this.roleX = 0;
           this.roleY = 0;
           this.newRoleX = 0;
           this.newRoleY = 0;
           this.skin = "button.png";
           const bWidth = Laya.Browser.width;
           const bHeight = Laya.Browser.height;
           console.log('width  %d , height %d', bWidth, bHeight);
           this.tMap = new Laya.TiledMap();
           var viewRect = new Laya.Rectangle();
           this.tMap.createMap("res/demo4.json", viewRect, Laya.Handler.create(this, this.onMapLoaded));
           Laya.init(bWidth, bHeight, Laya.WebGL);
           this.patchX = -Math.round(bWidth / 2 / this.stepSize);
           this.patchY = -Math.round(bHeight / 2 / this.stepSize);
           Laya.stage.bgColor = "#5a7b9a";
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
           this.test();
       }
       test() {
           Http.get('http://localhost:3000/api/pos', { x: 1, y: 2 }, this, this.onTestSuccess);
       }
       onTestSuccess(res) {
           console.log('res', res);
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
           this.resize();
           console.log('tMap', this.tMap);
           const idx = this.tMap.getLayerByIndex(0).getTileDataByScreenPos(1, 1);
           const a = this.tMap.getSprite(1, 32, 32);
           console.log('idx', idx);
           console.log('a', a);
           const layer = this.tMap.getLayerByIndex(0);
           console.log('layer ', layer);
           const tileData = layer.getTileData(0, 0);
           const tileData2 = layer.getTileData(1, 0);
           const tileData3 = layer.getTileData(0, 1);
           const tileData4 = layer.getTileData(1, 1);
           const tileData5 = layer.getTileData(0, 2);
           const tileData6 = layer.getTileData(1, 2);
           console.log('tileData ', tileData);
           console.log('tileData ', tileData2);
           console.log('tileData ', tileData3);
           console.log('tileData ', tileData4);
           console.log('tileData ', tileData5);
           console.log('tileData ', tileData6);
           const p0 = this.tMap.getTileProperties(0, tileData - 1, 'mp');
           const p1 = this.tMap.getTileProperties(0, tileData, 'mp');
           const p2 = this.tMap.getTileProperties(0, tileData + 1, 'mp');
           console.log('p0', p0);
           console.log('p1', p1);
           console.log('p2', p2);
           const s0 = this.tMap.getSprite(0, 0, 0);
           console.log('so ', s0);
       }
       resize() {
           console.log('tmap ', this.tMap.viewPortX);
           console.log('tmap ', this.tMap.viewPortY);
           const { roleX, roleY, newRoleX, newRoleY } = this;
           Tween.to(this, { roleX: newRoleX, roleY: newRoleY, ease: Ease.backOut, complete: Handler.create(this, this.onTweenComplete), update: new Handler(this, this.onTweenUpdate, [this.roleX]) }, 1000);
       }
       onTweenComplete(x, y, z) {
           console.log('onTweenComplete', x, y, z);
       }
       onTweenUpdate(x, y, z) {
           console.log('onTweenUpdate', x, y, z);
           const mapX = (this.roleX + this.patchX) * this.stepSize;
           const mapY = (this.roleY + this.patchY) * this.stepSize;
           this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
       }
       getCoordinate(x, y) {
           const indexX = x / this.stepSize;
           const indexY = y / this.stepSize;
           console.log('indeX ', indexX);
           console.log('indeY', indexY);
           return {
               indexX,
               indexY
           };
       }
       move(direction) {
           this.newRoleX = this.roleX;
           this.newRoleY = this.roleY;
           switch (direction) {
               case 'left':
                   this.newRoleX = this.roleX - 1;
                   break;
               case 'right':
                   this.newRoleX = this.roleX + 1;
                   break;
               case 'up':
                   this.newRoleY = this.roleY - 1;
                   break;
               case 'down':
                   this.newRoleY = this.roleY + 1;
                   break;
               default:
                   break;
           }
           console.log('roleX %d roleY %d ', this.roleX, this.roleY, this.tMap);
           this.resize();
       }
   }
   const game = new GameMain();

   exports.game = game;

   return exports;

}({}));
