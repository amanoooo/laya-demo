var laya = (function (exports) {
   'use strict';

   class DirectionRunTime extends Laya.Button {
       constructor() {
           super();
           this.scaleTime = 100;
           this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
           this.on(Laya.Event.MOUSE_UP, this, this.scaleBig);
           this.on(Laya.Event.MOUSE_OUT, this, this.scaleBig);
           Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
           Laya.stage.on(Laya.Event.KEY_UP, this, this.onkeyUp);
       }
       scaleBig(e) {
           e.stopPropagation();
           Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, this.scaleTime);
           game.cancelMove();
       }
       scaleSmall(e) {
           e.stopPropagation();
           Laya.Tween.to(this, { scaleX: 0.9, scaleY: 0.9 }, this.scaleTime);
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
       onKeyDown(e) {
           switch (e.keyCode) {
               case 37: {
                   game.move('left');
                   break;
               }
               case 38: {
                   game.move('up');
                   break;
               }
               case 39: {
                   game.move('right');
                   break;
               }
               case 40: {
                   game.move('down');
                   break;
               }
               default: break;
           }
       }
       onkeyUp(e) {
           game.cancelMove();
       }
   }

   class MainRunTime extends Laya.Scene {
       constructor() {
           super();
       }
       onOpened() {
           const DirectionWrapper = this.getChildByName('Direction');
           DirectionWrapper.scene.pos(Laya.Browser.width - 70, Laya.Browser.height - 70);
           DirectionWrapper.scene.zOrder = 100;
           this.roleAni = new Laya.Animation();
           console.log(111);
           this.roleAni.scaleX = 1;
           this.roleAni.scaleY = 1;
           const patchX = Math.round(Laya.Browser.width / 2 / 32) * 32;
           const patchY = Math.round(Laya.Browser.height / 2 / 32) * 32;
           this.roleAni.pos(patchX, patchY);
           this.roleAni.loadAtlas("res/atlas/girl.atlas", Laya.Handler.create(this, this.onLoaded));
           this.roleAni.zOrder = 100;
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

   let patch = {
       x: 0,
       y: 0
   };
   function getPatch(prop) {
       return patch[prop];
   }
   function setPatch(p) {
       patch = p;
   }
   const DURATION = 200;

   function isType1(pos) {
       if (pos.x) {
           return true;
       }
       return false;
   }
   function randomSymbol() {
       return Math.random() >= 0.5 ? 1 : -1;
   }
   function randomMonster(x, y, range = 10) {
       return { x: x + Math.round(Math.random() * range) * randomSymbol(), y: y + Math.round(Math.random() * range) * randomSymbol() };
   }
   function randomNumber() {
       return Math.round(Math.random() * 5);
   }
   let _monsterArr;
   let time = 1;
   class MMonster {
       constructor() {
           this.x = 0;
           this.y = 0;
           this.longitude = 0;
           this.latitude = 0;
           this.monters = [];
           this.monsterPoss = [];
       }
       fetchMonster(pos) {
           if (isType1(pos)) {
               this.x = pos.x;
               this.y = pos.y;
           }
           else {
               this.longitude = pos.longitude;
               this.latitude = pos.latitude;
           }
           Http.get('http://localhost:3000/api/pos', { latitude: this.latitude, longitude: this.longitude }, this, this.onFetchMonster);
       }
       onFetchMonster(res) {
           const monsterArr = new Array(randomNumber()).fill(1).map(() => randomMonster(this.x, this.y));
           if (time < 50) {
               if (time === 1) {
                   _monsterArr = monsterArr;
               }
               time++;
               this.render(_monsterArr);
           }
           else {
               time = 1;
               this.render(monsterArr);
           }
       }
       clearMonster() {
           for (let index = 0; index < this.monters.length; index++) {
               this.monters[index].destroy();
           }
           this.monters.forEach(m => {
               m.destroy();
           });
           this.monters = [];
       }
       moveMonster(item, index) {
           console.log('monster', this.x, this.y);
           const mapX = (item.x - this.x - getPatch('x')) * 32;
           const mapY = (item.y - this.y - getPatch('y')) * 32;
           Laya.Tween.to(this.monters[index], { x: mapX, y: mapY }, DURATION);
       }
       render(monsterArr) {
           if (JSON.stringify(monsterArr) === JSON.stringify(this.monsterPoss)) {
               this.monsterPoss.forEach((item, index) => this.moveMonster(item, index));
               return;
           }
           console.log('render monsterArr', monsterArr);
           this.clearMonster();
           this.monsterPoss = monsterArr;
           monsterArr.forEach(item => {
               const monster = new Laya.Animation();
               monster.scaleX = 1;
               monster.scaleY = 1;
               const mapX = (item.x - this.x - getPatch('x')) * 32;
               const mapY = (item.y - this.y - getPatch('y')) * 32;
               console.log('mapX', mapX);
               console.log('mapY', mapY);
               monster.pos(mapX, mapY);
               monster.loadImage("res/duck.png", Laya.Handler.create(this, this.onLoaded, [monster]));
               monster.width = 32;
               monster.height = 32;
               monster.zOrder = 100;
           });
       }
       onLoaded(monster) {
           Laya.stage.addChild(monster);
           monster.play();
           this.monters.push(monster);
       }
   }

   const { Tween, Ease, Handler } = Laya;
   const SIDE_LENGTH = 49;
   const FIRST_POS = 25;
   const MAP_SOURCE = [
       ['res/demo4.json', 'res/demo6.json'],
       ['res/demo5.json', 'res/demo7.json']
   ];
   class GameMain {
       constructor() {
           this.scaleValue = 0;
           this.stepSize = 32;
           this.roleX = FIRST_POS;
           this.roleY = FIRST_POS;
           this.newRoleX = FIRST_POS;
           this.newRoleY = FIRST_POS;
           this.mLock = false;
           this.mHold = false;
           this.mapRow = 0;
           this.mapColumn = 0;
           this.monster = new MMonster();
           this.skin = "button.png";
           const bWidth = Laya.Browser.width;
           const bHeight = Laya.Browser.height;
           console.log('width  %d , height %d', bWidth, bHeight);
           this.tMap = new Laya.TiledMap();
           var viewRect = new Laya.Rectangle();
           this.tMap.createMap(this.getMap(), viewRect, Laya.Handler.create(this, this.onMapLoaded));
           Laya.init(bWidth, bHeight, Laya.WebGL);
           setPatch({
               x: -Math.round(bWidth / 2 / this.stepSize),
               y: -Math.round(bHeight / 2 / this.stepSize)
           });
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
       }
       hold() {
           this.mHold = true;
       }
       unHold() {
           this.mHold = false;
       }
       lock() {
           this.mLock = true;
       }
       unLock() {
           this.mLock = false;
       }
       getMap() {
           return MAP_SOURCE[this.mapRow][this.mapColumn];
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
           this.resize(undefined, false);
           console.log('onMapLoaded tMap', this.tMap);
       }
       resize(direction, animate) {
           const { roleX, roleY, newRoleX, newRoleY } = this;
           this.monster.fetchMonster({ x: this.newRoleX, y: this.newRoleY });
           if (animate === false) {
               const mapX = (this.newRoleX + getPatch('x')) * this.stepSize;
               const mapY = (this.newRoleY + getPatch('y')) * this.stepSize;
               this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
               return;
           }
           const shouldMove = this.shouldMove();
           if (shouldMove) {
               this.unHold();
               this.unLock();
               return;
           }
           Tween.to(this, { roleX: newRoleX, roleY: newRoleY, ease: Ease.linearNone, complete: Handler.create(this, this.onTweenComplete, [direction]), update: new Handler(this, this.onTweenUpdate, [this.roleX]) }, DURATION);
       }
       onTweenComplete(direction) {
           const mapX = (this.roleX + getPatch('x')) * this.stepSize;
           const mapY = (this.roleY + getPatch('y')) * this.stepSize;
           this.tMap.changeViewPort(mapX, mapY, Laya.Browser.width, Laya.Browser.height);
           this.unLock();
           const changeMap = this.shouldChangeMao();
           if (changeMap) {
               this.unHold();
               return;
           }
           if (this.mHold) {
               this.move(direction);
           }
       }
       onTweenUpdate() {
           const mapX = (this.roleX + getPatch('x')) * this.stepSize;
           const mapY = (this.roleY + getPatch('y')) * this.stepSize;
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
       shouldMove() {
           if (this.mapRow >= MAP_SOURCE.length - 1 && this.newRoleX > SIDE_LENGTH) {
               console.log('右边界');
               return true;
           }
           else if (this.mapRow <= 0 && this.newRoleX < 0) {
               console.log('左边界');
               return true;
           }
           else if (this.mapColumn >= MAP_SOURCE.length - 1 && this.newRoleY > SIDE_LENGTH) {
               console.log('下边界');
               return true;
           }
           else if (this.mapColumn <= 0 && this.newRoleY < 0) {
               console.log('上边界');
               return true;
           }
           return false;
       }
       shouldChangeMao() {
           if (this.newRoleX > SIDE_LENGTH) {
               this.mapRow += 1;
               this.tMap.destroy();
               var viewRect = new Laya.Rectangle();
               this.tMap.createMap(this.getMap(), viewRect, Laya.Handler.create(this, this.onMapLoaded));
               this.newRoleX = 0;
               this.roleX = 0;
               return true;
           }
           else if (this.newRoleX < 0) {
               this.mapRow -= 1;
               this.tMap.destroy();
               var viewRect = new Laya.Rectangle();
               this.tMap.createMap(this.getMap(), viewRect, Laya.Handler.create(this, this.onMapLoaded));
               this.newRoleX = SIDE_LENGTH;
               this.roleX = SIDE_LENGTH;
               return true;
           }
           else if (this.newRoleY > SIDE_LENGTH) {
               this.mapColumn += 1;
               this.tMap.destroy();
               var viewRect = new Laya.Rectangle();
               this.tMap.createMap(this.getMap(), viewRect, Laya.Handler.create(this, this.onMapLoaded));
               this.newRoleY = 0;
               this.roleY = 0;
               return true;
           }
           else if (this.newRoleY < 0) {
               this.mapColumn -= 1;
               this.tMap.destroy();
               var viewRect = new Laya.Rectangle();
               this.tMap.createMap(this.getMap(), viewRect, Laya.Handler.create(this, this.onMapLoaded));
               this.newRoleY = SIDE_LENGTH;
               this.roleY = SIDE_LENGTH;
               return true;
           }
           return false;
       }
       cancelMove() {
           this.unHold();
       }
       move(direction) {
           if (this.mLock) {
               return;
           }
           this.hold();
           this.lock();
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
           const tileData = this.tMap.getLayerByIndex(0).getTileData(this.newRoleX, this.newRoleY);
           this.resize(direction);
       }
   }
   const game = new GameMain();

   exports.game = game;

   return exports;

}({}));
