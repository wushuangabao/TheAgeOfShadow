// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
cc.Class({
    extends: cc.Component,

    properties: {
        
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },
    

    onLoad () {
        this.gameData = require("GameJsCfg");
        cc.log(this.gameData);
    },


    start () {

    },

    update (dt) {},
});
