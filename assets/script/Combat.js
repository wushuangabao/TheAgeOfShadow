var Config = require("Config").combat,
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
        a: {
            default: null,
            type: Actor
        },
        b: {
            default: null,
            type: Actor
        },
    },

    onLoad() {
        this.a._atk = this.a.atk; this.a._def = this.a.def;
        this.b._atk = this.b.atk; this.b._def = this.b.def;
    },

    /*  BaoJi: 暴击率
        AGe: 攻击被格挡率,
        AShan: 攻击被闪避率,
        PoFang: 破防率,
        DShan: 防守状态闪避率,
        SFan: 防守状态触发闪避后的反击率,
        GFan: 防守状态格挡后的反击率,     */
    refreshConfigs() {
        let VA = this.valueA(), VB = 1 - VA,
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
                BaoJi: Config.BaoJi * V_Up,
                AGe: Config.AGe * V_Down,
                AShan: Config.AShan * V_Down,
                PoFang: Config.PoFang * V_Up,
                DShan: Config.DShan * V_Up,
                SFan: Config.SFan * V_Up,
                GFan: Config.GFan * V_Up
            };
        this.configA = cfgA; this.configB = cfgB;
    },

    valueA() {
        let A = this.v(this.a), B = this.v(this.b);
        return A / (A + B);
    },

    v(a) {
        return (1 + a.nu * 0.1) * (a._atk + a._def + a.hpMax / Config.T + a.mp);
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
