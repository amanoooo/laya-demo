


export default class MenuItemRunTime extends Laya.Button {

    constructor() {
        super()
        console.log('menu item constructor ', this);
        this.on(Laya.Event.CLICK, this, this.onClick);
    }
    onClick() {
        switch (this.name) {
            case 'setting':
                console.log('setting click');
                break;
            case 'friend':
                console.log('friend click');
                break;
            case 'profile':
                console.log('profile click');
                Laya.Scene.open('Profile.scene')
                break;
            default:
                console.log('warning not expect click');
                break;

        }
    }
    onOpened() {
        console.log('MenuItemRunTime on Opened', this)


    }


}