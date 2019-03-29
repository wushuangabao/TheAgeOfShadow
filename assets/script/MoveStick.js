// 这个脚本须配合this.map（Map脚本组件）才能使用
cc.Class({
    extends: cc.Component,

    properties: {
        nodeMap: {
            default: null,
            type: cc.Node
        },
        dToCenterMin: {
            default: 15
        }
    },

    onLoad() {
        console.log("====== moveStick onLoad ======");
        this.directionMoving = '';
        this.radis = this.node.width * 0.5;
        this.map = this.nodeMap.getComponent('Map');
        // console.log("this.map = ", this.map);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.y -= this.map.deltaH; //适应屏幕，将stick位置下移
    },

    start() { },

    update(dt) {
        if (this.directionMoving)
            this.map.tryMoveByDirection(this.directionMoving);
    },

    onTouchMove(touch) {
        this.onTouchStart(touch);
    },

    onTouchEnd(touch) {
        this.directionMoving = '';
    },

    onTouchStart(event) {
        let posTouch = this.map.convertToCanvas(event.getLocation()),
            x = posTouch.x, y = posTouch.y;
        // console.log("touch on canvas(", x, ",", y, ")");

        let centerX = this.node.x + this.map.nodeMoveArea.x,
            centerY = this.node.y + this.map.nodeMoveArea.y;
        // console.log("this.node on canvas(", centerX, ",", centerY, ")");

        let dx = x - centerX, dy = y - centerY,
            dToCenter = Math.sqrt(dx * dx + dy * dy);
        if (dToCenter < this.dToCenterMin || dToCenter > this.radis) this.directionMoving = '';
        else this.directionMoving = this.map.getDirection(dx, dy);
    },
});
