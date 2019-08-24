


export default class Wrapper extends Laya.View {

    constructor() {
        super()
        console.log('Wrapper', this );
        console.log('Wrapper parent', this.parent );
        
        // this["Hero"].left = 100
    }
}