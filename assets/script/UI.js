// 这个脚本须配合this.map（Map脚本组件）才能使用
cc.Class({
    extends: cc.Component,

    properties: {
        nodeMap: {
            default: null,
            type: cc.Node
        },
        nodeTop: {
            default: null,
            type: cc.Node
        },
    },

    onLoad() {
        console.log("==== Move Area UI onLoad ====");
        this.map = this.nodeMap.getComponent('Map');
        this.fitScreen();
    },

    // 适应屏幕，将UI位置上下移动
    fitScreen(){
        this.nodeTop.y += this.map.deltaH;
    },

    update(dt){}
});
