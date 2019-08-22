/*
   ImageRunTime逻辑类 
   */
export default class ImageRunTime extends Laya.Button {
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
    }
    private scaleBig(): void {
        //变大还原的缓动效果
        Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, this.scaleTime);
    }
    private scaleSmall(): void {
        //缩小至0.8的缓动效果
        Laya.Tween.to(this, { scaleX: 0.8, scaleY: 0.8 }, this.scaleTime);
        console.log('this ', this)
        let Hero: Laya.Image
        Hero = this.parent.parent.getChildByName('Hero') as Laya.Image

        switch (this.name) {
            case 'up':
                Hero.pivotY += +5
                break;
            case 'down':
                Hero.pivotY += -5
                break;
            case 'left':
                Hero.pivotX += 5
                break;
            case 'right':
                Hero.pivotX += -5
                break;
            default:
                throw new Error('invalid name')
        }


    }
}