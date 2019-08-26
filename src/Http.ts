
export interface MResponse {
    error: null | string,
    payload: any
    status
}
export type HttpCallback = (res: MResponse) => void


class HTTP {

    private callback: any;
    private caller: any;

    private http: Laya.HttpRequest;

    constructor() {
        this.http = new Laya.HttpRequest;
    }

    obj2urlParams = (obj: Object = {}): string => {
        return Object.keys(obj).length === 0
            ? ''
            : Object.keys(obj)
                .filter(key => obj[key] !== undefined)
                .reduce((str, key) => `${str}${key}=${obj[key]}&`, '')
                .slice(0, -1)
                .replace(/^/, '?')
    }


    public get(url: string, params: Object, caller: any, callback: HttpCallback): HTTP {
        this.caller = caller;
        this.callback = callback;
        //this.http.once(Laya.Event.PROGRESS, this, this.onHttpRequestProgress);
        this.http.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
        this.http.once(Laya.Event.ERROR, this, this.onHttpRequestError);
        this.http.send(url + this.obj2urlParams(params), null, 'get', 'json');
        return this;
    }

    public post(url: string, data: any, contentType: string, caller: any, callback: HttpCallback): HTTP {
        this.caller = caller;
        this.callback = callback;
        //this.http.once(Laya.Event.PROGRESS, this, this.onHttpRequestProgress);
        this.http.once(Laya.Event.COMPLETE, this, this.onHttpRequestComplete);
        this.http.once(Laya.Event.ERROR, this, this.onHttpRequestError);
        if (contentType == null) {
            this.http.send(url, data, 'post', 'json');
        } else {
            this.http.send(url, data, 'post', 'json', ["content-type", contentType]);
        }

        return this;
    }


    private onHttpRequestError(e: any): void {
        this.callback.apply(this.caller, [{ error: 'Server Interal Error', status: 500 }]);
    }

    private onHttpRequestComplete(e: any): void {
        const status = this.http.http.status
        if (status !== 200 || this.http.data.errMsg) {
            this.callback.apply(this.caller, [{ error: this.http.data.payload || 'Client Logic Error', status }]);
        } else {
            this.callback.apply(this.caller, [{ error: null, status, payload: this.http.data.payload }]);
        }
    }
}

export default new HTTP()