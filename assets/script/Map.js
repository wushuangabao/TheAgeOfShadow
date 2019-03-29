cc.Class({
    extends: cc.Component,

    properties: {
        backGround: {
            default: null,
            type: cc.Sprite,
        },
        tiledMap: {
            default: null,
            type: cc.TiledMap,
        },
        player: {
            default: null,
            type: cc.Sprite,
        },
        playerTile: {
            default: new cc.Vec2(),
            tooltip: "角色初始位置（tile坐标)",
        },
        atlas: {
            default: null,
            type: cc.SpriteAtlas,
        },
        deltaY: {
            default: 16,
            tooltip: "角色站立点比图块底端高的值",
        },
        speed: 3,
        timeForOneFrame: 0.033,
        playerIsMoving: {
            default: true,
            tooltip: "是否在一开始让角色向初始位置移动",
        },
    },


    onLoad() {
        console.log("====== canvas Map onLoad ======");

        // 初始化变量
        this.timeMoving = 0;
        this.posTouchStart = undefined;
        // this.keyUpPressed = false;
        // this.keyDownPressed = false;
        // this.keyLeftPressed = false;
        // this.keyRightPressed = false;
        this.player.spriteFrame = this.atlas.getSpriteFrame('run_1');
        this.nodeMainCamera = this.node.getChildByName('Main Camera');
        this.nodeMoveArea = this.node.getChildByName('Move Area');
        this.visibleSize = cc.view.getVisibleSize();
        this.canvasSize = this.node.getComponent(cc.Canvas).designResolution;

        console.log("cc.view = ", this.visibleSize, "canvasSize = ", this.canvasSize);

        // 初始化相机位置
        this.nodeMainCamera.setPosition(this.player.node.getPosition());

        // 注册全局系统事件
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        // 注册结点系统事件
        this.nodeMainCamera.on('position-changed', this.onPosCameraChanged, this);
        // this.nodeMoveArea.on('touchmove', this.onTouchMove, this); //使用cc.Node.EventType.TOUCH_MOVE有bug
        // this.nodeMoveArea.on('touchstart', this.onTouchStart, this);
        // this.nodeMoveArea.on('touchend', this.onTouchEnd, this);
        this.backGround.node.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);
    },

    onPosCameraChanged() {
        // 移动Move Area到相机的位置
        this.nodeMoveArea.setPosition(this.nodeMainCamera.getPosition());
    },

    onTouchEnd(event) {
        console.log("--------onTouchEnd-------");
        this.posTouchStart = undefined;
    },

    onTouchStart(event) {
        console.log("--------onTouchStart-------");
        this.posTouchStart = event.getLocation();
        console.log("pos = ", this.posTouchStart);
    },

    onTouchMove(event) {
        if (this.playerIsMoving || this.posTouchStart === undefined)
            return;
        console.log("----onTouchMove----");

        // 如果移出了nodeMoveArea的范围，停止移动
        let x = event.getLocationX(),
            y = event.getLocationY();
        console.log("(", x, ",", y, ")");
        if (x <= 0 || y <= 0 || x > this.nodeMoveArea.width || y > this.nodeMoveArea.height) {
            this.posTouchStart = undefined;
            return;
        }

        let dx = x - this.posTouchStart.x,
            dy = y - this.posTouchStart.y,
            direction = this.getDirection(dx, dy);
        console.log(direction);
        this.playerMovingDirection = direction;
    },

    onMouseDown(event) {
        console.log("--------onMouseDown-------");

        let posMouse = event.getLocation(); //经测试为this.visibleSize内一点，原点位于左下(可称为屏幕坐标系)
        posMouse = this.convertToCanvas(posMouse);

        // 获取player在canvas下的坐标
        let pos = this.tiledMap.getLayer('layer1').getPositionAt(this.playerTile); pos.y += this.deltaY;
        console.log("player's pos = ", pos);

        // 获取鼠标坐标相对player坐标的向量(dx,dy）
        let dx = posMouse.x - pos.x, dy = posMouse.y - pos.y;
        console.log("dx = ", dx, ",  dy = ", dy);

        // 将(dx,dy)换算到tiledMap的坐标系中，换算过程已拍照
        let tileSize = this.tiledMap.getTileSize(), w = tileSize.width, h = tileSize.height,
            dxTile = dx / w - dy / h, dyTile = -dx / w - dy / h;
        console.log("dxTile = ", dxTile, ",  dyTile = ", dyTile);

        // 在playerTile上增加位移向量，得到newTile
        let newTile = cc.v2(Math.ceil(this.playerTile.x + dxTile), Math.ceil(this.playerTile.y + dyTile));
        console.log("playerTile = ", this.playerTile, "  newTile = ", newTile);

        // 开始移动（todo:通行判断、寻路算法）
        this.playerTile = newTile;
        this.playerIsMoving = true;
    },


    onKeyDown(event) {
        var direction_;
        switch (event.keyCode) {
            case cc.macro.KEY.up:
                this.keyUpPressed = true; direction_ = "up";
                if (this.keyLeftPressed) direction_ += "Left";
                else if (this.keyRightPressed) direction_ += "Right";
                break;
            case cc.macro.KEY.down:
                this.keyDownPressed = true; direction_ = "down";
                if (this.keyLeftPressed) direction_ += "Left";
                else if (this.keyRightPressed) direction_ += "Right";
                break;
            case cc.macro.KEY.left:
                this.keyLeftPressed = true; direction_ = "left";
                if (this.keyUpPressed) direction_ = direction_ + "Up";
                else if (this.keyDownPressed) direction_ += "Down";
                break;
            case cc.macro.KEY.right:
                this.keyRightPressed = true; direction_ = "right";
                if (this.keyUpPressed) direction_ += "Up";
                else if (this.keyDownPressed) direction_ += "Down";
                break;
            default:
                return;
        }
        this.direction = direction_;
        this.tryMoveByDirection();
    },

    onKeyUp: function (event) {
        this.direction = "";
        switch (event.keyCode) {
            case cc.macro.KEY.up:
                this.keyUpPressed = false;
                break;
            case cc.macro.KEY.down:
                this.keyDownPressed = false;
                break;
            case cc.macro.KEY.left:
                this.keyLeftPressed = false;
                break;
            case cc.macro.KEY.right:
                this.keyRightPressed = false;
                break;
            default:
                return;
        }
        /*
        if(this.keyUpPressed)
            this.direction = "up";
        if(this.keyDownPressed)
            this.direction = "down";
        if(this.keyLeftPressed)
            this.direction = "left";
        if(this.keyRightPressed)
            this.direction = "right";
        this.tryMoveByDirection();
        */
    },


    // 尝试移动player朝某个方向
    tryMoveByDirection(_direction) {
        if (this.playerIsMoving)
            return;
        let direction = this.playerMovingDirection,
            newTile = cc.v2(this.playerTile.x, this.playerTile.y);
        if (_direction)
            direction = _direction;
        switch (direction) {
            case "up":
                newTile.y -= 1; newTile.x -= 1; break;
            case "down":
                newTile.y += 1; newTile.x += 1; break;
            case "left":
                newTile.x -= 1; newTile.y += 1; break;
            case "right":
                newTile.x += 1; newTile.y -= 1; break;
            case "upLeft": case "leftUp":
                newTile.x -= 1; break;
            case "upRight": case "rightUp":
                newTile.y -= 1; break;
            case "downLeft": case "leftDown":
                newTile.y += 1; break;
            case "downRight": case "rightDown":
                newTile.x += 1; break;
            default:
                return;
        }
        // console.log("newTile = ", newTile, "（Tile坐标）");

        // 判断newTile是否超出tileMap的范围
        // var tilePos = this.getTilePosByTile(newTile);
        // var mapSize = this.tiledMap.getMapSize();
        // if (tilePos.x < 0 || tilePos.x >= mapSize.width) return;
        // if (tilePos.y < 0 || tilePos.y >= mapSize.height) return;

        // 判断newTile对应的图块是否可通行
        // var gid = this.tiledMap.getLayer('layer1').getTileGIDAt(tilePos);
        // console.log("newTile GID = ", gid);
        //if(gid >= 8 || gid == 5) //【表示图块无法通行】手动设置该条件
        //    return;

        // 准备移动角色
        this.playerTile = newTile;
        this.playerIsMoving = true;
    },

    // 将屏幕坐标系中的坐标转换为Canvas坐标系中的坐标
    convertToCanvas(posVisible) {
        let visibleSize = this.visibleSize,
            posCamera = this.nodeMainCamera.getPosition(),
            posCanvas = cc.v2(posVisible.x - visibleSize.width / 2.0 + posCamera.x, posVisible.y - visibleSize.height / 2.0 + this.nodeMainCamera.y);
        return posCanvas;
    },

    getDirection(dx, dy) {
        let direction = '';
        if (dx === 0) {
            if (dy > 0)
                direction = 'up';
            else direction = 'down';
        } else {
            let tan = dy / dx;
            if (tan > 2.414213562) {
                if (dx > 0) direction = 'up';
                else direction = 'down';
            }
            else if (tan < -2.414213562) {
                if (dx > 0) direction = 'down';
                else direction = 'up';
            }
            else if (dx > 0) {
                direction = 'right';
                if (tan > 0.414213562)
                    direction += 'Up';
                else if (tan < -0.414213562)
                    direction += 'Down';
            }
            else if (dx < 0) {
                direction = 'left';
                if (tan > 0.414213562)
                    direction += 'Down';
                else if (tan < -0.414213562)
                    direction += 'Up';
            }
        }
        return direction;
    },

    // 转换为能用于layer.getTileXXX的Tile坐标
    getTilePosByTile: function (tile) {
        return cc.v2(tile.x, tile.y + 1); //【当tilemap的anchor为(0,0)时测试无误】
    },

    /*
    // 将pixel坐标转换为Tile坐标
    getTilePosByPixelPos: function(posInPixel) {
        var mapSize = this.tileMap.node.getContentSize();
        var tileSize = this.tiledMap.getTileSize();
        var x = Math.floor(posInPixel.x / tileSize.width);
        var y = Math.floor((mapSize.height - posInPixel.y) / tileSize.height);
        return cc.v2(x, y);
    },
    */


    // 改变player的贴图
    changeSpriteFrame: function (param) {
        if (typeof (param) === "string")
            this.player.spriteFrame = this.atlas.getSpriteFrame(param);
        else if (param === undefined) {
            let str = this.player.spriteFrame.name;
            switch (str) {
                case "run_1":
                    str = "run_2";
                    break;
                case "run_2":
                    str = "run_0";
                    break;
                case "run_0":
                    str = "run_1";
                    break;
                default:
                    str = "run_1";
            }
            this.player.spriteFrame = this.atlas.getSpriteFrame(str);
        }
    },


    start() { },


    update(dt) {
        // 移动player
        if (this.playerIsMoving) {
            // 获取playerTile的像素坐标，作为移动的终点
            let pos = this.tiledMap.getLayer('layer1').getPositionAt(this.playerTile);
            pos.y += this.deltaY;
            let posPlayer = this.player.node.getPosition(),
                dx = pos.x - posPlayer.x, dy = pos.y - posPlayer.y,
                distance = Math.sqrt(dx * dx + dy * dy), //距离（单位：像素）
                distance_dt = this.speed * dt * 100;
            if (distance <= distance_dt) {
                // 到达playerTile指定的位置pos
                this.player.node.setPosition(pos.x, pos.y);
                // 关闭移动
                this.playerIsMoving = false;
            }
            else {
                // 移动，距离为distance_dt
                let p = distance_dt / distance; this.player.node.x += p * dx; this.player.node.y += p * dy;
                // 计时器增加
                this.timeMoving += dt;
                if (this.timeMoving > this.timeForOneFrame) {
                    // 设置player的spriteFrame
                    this.changeSpriteFrame();
                    // 计时器清零
                    this.timeMoving = 0;
                }
            }
            // 移动相机
            posPlayer = this.player.node.getPosition();
            this.nodeMainCamera.setPosition(posPlayer);
        }
        // else if (this.posTouchStart) // 若仍然有触摸，继续移动
        //     this.tryMoveByDirection();
    },
});
