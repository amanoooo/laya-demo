import { game } from './Main2'



/*
   DirectionRunTime逻辑类 
   */
export default class DirectionRunTime extends Laya.Button {
    public scaleTime: number = 100;
    constructor() {
        super();
        //设置组件的中心点
        // this.anchorX = this.anchorY = 0.5;
        //添加鼠标按下事件侦听。按时时缩小按钮。
        this.on(Laya.Event.MOUSE_DOWN, this, this.scaleSmall);
        //添加鼠标抬起事件侦听。抬起时还原按钮。
        this.on(Laya.Event.MOUSE_UP, this, this.scaleBig);
        //添加鼠标离开事件侦听。离开时还原按钮。
        this.on(Laya.Event.MOUSE_OUT, this, this.scaleBig);


        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);//设置键盘监听事件
        Laya.stage.on(Laya.Event.KEY_UP, this, this.onkeyUp);//设置键盘监听事件

    }
    private scaleBig(e: Laya.Event): void {
        //变大还原的缓动效果
        e.stopPropagation();
        Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, this.scaleTime);
        game.cancelMove()
    }
    private scaleSmall(e: Laya.Event): void {
        e.stopPropagation();
        //缩小至0.8的缓动效果
        Laya.Tween.to(this, { scaleX: 0.9, scaleY: 0.9 }, this.scaleTime);

        switch (this.name) {
            case 'up':
                game.move('up')
                break;
            case 'down':
                game.move('down')
                break;
            case 'left':
                game.move('left')
                break;
            case 'right':
                game.move('right')
                break;
            default:
                throw new Error('invalid name')
        }
    }
    private onKeyDown(e): void {
        switch (e.keyCode) {
            case 37: {
                game.move('left')
                break
            }
            case 38: {
                game.move('up')
                break
            }
            case 39: {
                game.move('right')
                break
            }
            case 40: {
                game.move('down')
                break
            }
            default: break
        }
    }
    private onkeyUp(e): void {
        game.cancelMove()
    }

}



