
import Stage = Laya.Stage;
import List = Laya.List;
import Handler = Laya.Handler;
import WebGL = Laya.WebGL;
import Box = Laya.Box;
import Image = Laya.Image;

import Label = Laya.Label

export default class ProfileRunTime extends Laya.Dialog {

    private clip: Laya.Clip
    private closeBtn: Laya.Button
    constructor() {
        super()
        console.log('profile constructor ', this);
        this.setup();

        // this.stage.bgColor = 'red'
        UIConfig.popupBgColor='#ffa11a'
    }
    onEnable(): void {
        const closeBtn = this.scene.getChildByName('btnClose')
        const bg = this.scene.getChildByName('bgProfile')
        console.log('closeBtn', closeBtn);
        console.log('bg', bg);
        closeBtn.on(Laya.Event.CLICK, this, this.onClick);
    }
    private onClick() {
        console.log('close onClick');
        this.close()
    }
    private setup(): void {
        var list: List = new List();
        list.itemRender = Item;
        list.repeatX = 1;
        list.repeatY = 4;
        // list.x = (Laya.stage.width - Item.WID) / 2;
        // list.y = (Laya.stage.height - Item.HEI * list.repeatY) / 2;
        // 使用但隐藏滚动条
        list.vScrollBarSkin = "";
        list.selectEnable = true;
        list.selectHandler = new Handler(this, this.onSelect);
        list.renderHandler = new Handler(this, this.updateItem);
        // Laya.stage.addChild(list);
        this.addChild(list)
        // 设置数据项为对应图片的路径
        var data: Array<string> = [];
        for (var i: number = 0; i < 10; ++i) {
            data.push("res/ui/listskins/1.jpg");
            data.push("res/ui/listskins/2.jpg");
            data.push("res/ui/listskins/3.jpg");
            data.push("res/ui/listskins/4.jpg");
            data.push("res/ui/listskins/5.jpg");
        }
        list.array = data;
    }
    private updateItem(cell: Item, index: number): void {
        cell.setImg(cell.dataSource);
    }
    private onSelect(index: number): void {
        console.log("当前选择的索引：" + index);
    }
}




class Item extends Box {
    public static WID: number = 373;
    public static HEI: number = 30;
    private img: Label
    constructor() {
        super();
        this.size(Item.WID, Item.HEI);
        this.img = new Label();
        this.img.fontSize = 16
        this.addChild(this.img);
    }
    public setImg(src: string): void {
        // this.img.skin = src;
        this.img.text = src
    }
}