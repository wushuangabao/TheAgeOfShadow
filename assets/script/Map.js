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
            default: cc.v2(0, 0),
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
        this.playerTryingMove = this.playerIsMoving; //用于判断是否播放角色跑动的动画
        this.posTouchStart = undefined;
        this.player.spriteFrame = this.atlas.getSpriteFrame('run_1');
        this.nodeMainCamera = this.node.getChildByName('Main Camera');
        this.nodeMoveArea = this.node.getChildByName('Move Area');
        this.visibleSize = cc.view.getVisibleSize();
        this.canvasSize = this.node.getComponent(cc.Canvas).designResolution;
        this.deltaH = (this.visibleSize.height - this.canvasSize.height) * 0.5; //屏幕高度与画布高度之差的一半
        this.posTileTop = this.getPosTileTop();
        this.playerTile = this.convertPosTile2Vis(this.playerTile);

        console.log("cc.view = ", this.visibleSize, "canvasSize = ", this.canvasSize);

        // 初始化相机位置
        this.nodeMainCamera.setPosition(this.player.node.getPosition());

        // 注册结点系统事件
        this.nodeMainCamera.on('position-changed', this.onPosCameraChanged, this);
        //this.backGround.node.on(cc.Node.EventType.TOUCH_START, this.onMouseDown, this);
    },

    onPosCameraChanged() {
        // 移动Move Area到相机的位置
        this.nodeMoveArea.setPosition(this.nodeMainCamera.getPosition());
    },

    // 注意：此方法关闭，玩家只能靠方向来移动，避免写寻路、通行判断
    onMouseDown(event) {
        console.log("--------onMouseDown-------");

        let posMouse = event.getLocation(); //经测试为this.visibleSize内一点，原点位于左下(可称为屏幕坐标系)
        posMouse = this.convertToCanvas(posMouse);

        // 获取player在canvas下的坐标
        let pos = this.tiledMap.getLayer('layer1').getPositionAt(this.playerTile); pos.y += this.deltaY;
        console.log("player's pos = ", pos);

        // 获取鼠标坐标相对player坐标的向量(dx,dy）
        let dx = posMouse.x - pos.x, dy = posMouse.y - pos.y;

        // 将(dx,dy)换算到tiledMap的坐标系中，换算过程已拍照
        let tileSize = this.tiledMap.getTileSize(), w = tileSize.width, h = tileSize.height,
            dxTile = dx / w - dy / h, dyTile = -dx / w - dy / h;

        // 在playerTile上增加位移向量，得到newTile
        let newTile = cc.v2(Math.ceil(this.playerTile.x + dxTile), Math.ceil(this.playerTile.y + dyTile));
        console.log("playerTile = ", this.playerTile, "\nnewTile = ", newTile);

        // 开始移动（todo:通行判断、寻路算法）
        this.playerTile = newTile;
        this.playerIsMoving = true;
    },

    // 尝试移动player朝某个方向
    tryMoveByDirection(direction) {
        if (this.playerIsMoving)
            return;
        this.changePlayerDirection(direction);
        this.playerTryingMove = true;
        let newTile = cc.v2(this.playerTile.x, this.playerTile.y);
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
        //console.log("---- tryMove ", direction, " ----\nnewTile = ", newTile);

        // 判断newTile是否超出tileMap的范围
        let tilePos = this.convertPosTile2Map(newTile);
        //console.log("after convert, tilePos = ", tilePos);
        if (tilePos.x < 0 || tilePos.x >= this.sizeMapTile.width) return;
        if (tilePos.y < 0 || tilePos.y >= this.sizeMapTile.height) return;

        // 判断newTile对应的图块是否可通行
        var gid = this.tiledMap.getLayer('layer1').getTileGIDAt(tilePos);
        //console.log("newTile GID = ", gid);
        if (gid >= 23) //【表示图块无法通行】gid=ID+1 故没有0
            return;

        // 准备移动角色
        this.playerTile = newTile;
        this.playerIsMoving = true;
    },

    convertPosTile2Map(visibleTile) {
        // 计算visibleTile相对于顶端tile的位移
        let dx = visibleTile.x - this.posTileTop.x,
            dy = visibleTile.y - this.posTileTop.y;
        return cc.v2(dx, dy);
    },

    convertPosTile2Vis(mapTile) {
        return cc.v2(mapTile.x + this.posTileTop.x, mapTile.y + this.posTileTop.y);
    },

    // 将屏幕坐标系中的坐标转换为Canvas坐标系中的坐标
    convertToCanvas(posVisible) {
        let visibleSize = this.visibleSize,
            posCamera = this.nodeMainCamera.getPosition(),
            posCanvas = cc.v2(posVisible.x - visibleSize.width / 2.0 + posCamera.x, posVisible.y - visibleSize.height / 2.0 + this.nodeMainCamera.y);
        return posCanvas;
    },

    // 根据向量(dx,dy)判断方向
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

    // 当tilemap的anchor为(0.5,0.5)时，计算最上端的tile的坐标
    getPosTileTop: function () {
        let sizeMap = this.tiledMap.getMapSize(),
            x = (sizeMap.height - sizeMap.width) * 0.5,
            y = sizeMap.height - 1 - x;
        this.sizeMapTile = sizeMap;
        return cc.v2(x, y);
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

    showPlayerMovingAction(dt) {
        this.timeMoving += dt;
        if (this.timeMoving > this.timeForOneFrame) {
            // 设置player的spriteFrame
            this.changeSpriteFrame();
            // 计时器清零
            this.timeMoving = 0;
        }
    },

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

    // 改变player朝向
    changePlayerDirection(direction) {
        if (direction.indexOf('eft') > 0)
            this.player.node.scaleX = -1;
        else if (direction.indexOf('ight') > 0)
            this.player.node.scaleX = 1;
    },

    update(dt) {
        // 播放player移动的动画
        if (this.playerTryingMove)
            this.showPlayerMovingAction(dt);
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
                this.playerTryingMove = false;
            }
            else {
                // 移动，距离为distance_dt
                let p = distance_dt / distance; this.player.node.x += p * dx; this.player.node.y += p * dy;
            }
            // 移动相机
            this.nodeMainCamera.setPosition(this.player.node.getPosition());
        }

    }
});
