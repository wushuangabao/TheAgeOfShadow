const Config = require("Config").combat,
    Actor = require("Actor"),
    ZhaoShi = require("ZhaoShi");
/*===========PVE战斗方法==============
（目前没有PVP,且PVE中的敌人只会攻击不会防守。）
本游戏战斗是回合制，但没有先手、后手的概念，每回合双方同时发动动作，所以有可能同归于尽。
本游戏人物的功防属性影响战斗中暴击、格挡等发生的几率（关键值）
-----------攻击类--------------
关键值V的作用是对战斗中的概率进行增幅或减幅，如：a本回合的实际暴击率=系统暴击率*(Va+0.5)，实际被格挡率=系统攻挡率*(1.5-Va)，……
case1.1：a击中要害（暴击），b也暴击。b减少2*a.atk点Hp，a减少2*b.atk点Hp。
case1.2：a暴击，b普通命中（造成a损失b.atk点Hp）。
case1.3：a暴击，b的攻击被格挡（造成a损失b.atk-a.def点Hp）。
case1.4：a暴击，b的攻击落空（没有造成a的生命减少）。
case2.1：a普通命中，b暴击。
case2.2：双方都命中对手，但都没有命中要害。
……共16种情况。
多个敌人或有队友时的攻击，组合更复杂，但每人无非4种情况：暴击、命中、被格挡、被闪避，根据参数设定，实力相当时概率分配为1:5:3:1，
写程序时，对一个角色生成一个0-100的随机数，根据随机数落在哪个区间做选择。
-----------防守类--------------
关键值：与攻击类的相同。
case1：破防，b巧妙避开防守结结实实打到了a身上，使其损失b.atk点生命值。
case2：格挡。
case3：闪避。
case4：截击，a半路阻截了b的进攻并给予了b一定的打击。a减损的Hp按格挡成功计算，b损失a.atk点Hp。
case5：闪避并抓住空挡发起攻击。
-----------逃跑类--------------
关键值：a.lv/(a.lv+b.lv)  当a.lv=b.lv时，值为0.5；根据等级上下限，极值为0.99和0.01。
case1：躲开攻击，逃跑成功
case2：受到攻击，损失b.atk点Hp
case3：受到致命打击，损失b.atk*2点Hp
*/
cc.Class({
    extends: cc.Component,

    properties: {
        aGroup: {
            default: [],
            type: [Actor]
        },
        bGroup: {
            default: [],
            type: [Actor]
        },
        roundMax: {
            default: 100,
            tooltip: "超过最大回合数自动结束战斗",
            type: cc.Integer
        }
    },

    onLoad() {
        this.round = 0;
        this.numOpacity = this.node.opacity;
        this.sizeVisible=cc.view.getVisibleSize();
        this.node.width = this.sizeVisible.width;
        this.node.height = this.sizeVisible.height;
        this.node.opacity = 0;
        console.log("====== combat onLoad =======", this);
        this.startBattle(); //用于测试
    },

    update(dt) {
        // 正在进行战斗
        if (this.round > 0) {
            if (this.alive(this.aGroup) && this.alive(this.bGroup) && this.round <= this.roundMax) {
                // 回合处理
                this.roundEvent();
                this.round++;
            } else {
                // 结束战斗
                this.round = 0;
                this.node.opacity = 0;
            }
        }
    },

    // 开始战斗
    startBattle(aGroup, bGroup) {
        let aG = this.aGroup, bG = this.bGroup; //注意js中非基本数据类型都是引用传递的
        if (arguments.length == 2) {
            if (aGroup instanceof Array) aG = aGroup;
            if (bGroup instanceof Array) bG = bGroup;
        }
        else if (arguments.length == 1)
            console.log("Combat.start()输入的参数不能只有1个！");
        // 判断参数是否正确
        if (aG[0].constructor != Actor && bG[0].constructor != Actor) {
            console.log("Combat.start()的角色组aG、bG赋值错误！");
            return;
        }
        // 设置精灵半透明度
        this.node.opacity = this.numOpacity;
        // 初始化战斗参数
        this.initializeAll(aG, bG);
        // 进入回合1
        this.round = 1;
    },

    // 一个回合
    roundEvent() {
        console.log("---第", this.round, "回合：---\n");
    },

    initializeAll(aG, bG) {
        this.initializeG(aG);
        this.initializeG(bG);
        console.log("-----initialize a combat: ", this);
    },

    initializeG(g) {
        let l = g.length;
        for (let i = 0; i < l; i++) {
            let a = g[i]; a._atk_ = a.atk; a._def_ = a.def;
        }
    },

    // 判断队伍是否存活
    alive(g) {
        let l = g.length;
        for (let i = 0; i < l; i++)
            if (g[i].hp <= 0) {
                return false;
            }
        return true;
    },

    /*  BaoJi: 暴击率
        AGe: 攻击被格挡率,
        AShan: 攻击被闪避率,
        PoFang: 破防率,
        DShan: 防守状态闪避率,
        SFan: 防守状态触发闪避后的反击率,
        GFan: 防守状态格挡后的反击率,     */
    refreshConfigs(a, b) {
        let VA = this.valueA(a, b),
            V_Up = VA + 0.5, V_Down = 1.5 - VA,
            cfgA = {
                BaoJi: Config.BaoJi * V_Up,
                AGe: Config.AGe * V_Down,
                AShan: Config.AShan * V_Down,
                PoFang: Config.PoFang * V_Up,
                DShan: Config.DShan * V_Up,
                SFan: Config.SFan * V_Up,
                GFan: Config.GFan * V_Up
            },
            cfgB = {
                BaoJi: Config.BaoJi * V_Down,
                AGe: Config.AGe * V_Up,
                AShan: Config.AShan * V_Up,
                PoFang: Config.PoFang * V_Down,
                DShan: Config.DShan * V_Down,
                SFan: Config.SFan * V_Down,
                GFan: Config.GFan * V_Down
            };
        this.configA = cfgA; this.configB = cfgB;
    },

    valueA(a, b) {
        let A = this.v(a), B = this.v(b);
        return A / (A + B);
    },

    v(a) {
        return (1 + a.nu * 0.1) * (a._atk_ + a._def_ + a.hpMax / Config.T + a.mp);
    },

    // 获取指定范围内的随机数（闭区间）
    randomFrom(lowerValue, upperValue) {
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    },

    // 获取0到100随机数
    randomNum() {
        return randomFrom(0, 100);
    }

});
