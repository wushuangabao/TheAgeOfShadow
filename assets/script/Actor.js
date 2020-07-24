const Config = require("Config").combat,
    Skill = require("Skill"),
    ZhaoShi = require("ZhaoShi");
var Actor = cc.Class({
        extends: cc.Component,
        /*
        1.Hp生命值：1-9999。降至0，人物死亡。战斗中不能吃药，平时可以靠吃补品和药物恢复Hp。
        2.内力：0-999。作用是通过临时增加攻或防来提升招式的威力。不附带内力发出的招式是很弱的。平时打坐、吃补品可以恢复内力。
        3.攻：1-999。使用武器可以增加基础攻击力。
        4.防：1-999。穿戴防具可以增加基础防御力。
        5.怒气：0-10。数值默认为0，会根据剧情变化。战斗中每累计受到 Hp*0.1（该系数待设定）的伤害时会提升1点，会因为使用某些招式而增加或消耗。
        6.等级：对人物总体战斗力的评估。等于 (atk+def+(Hp+10*Mp)/T)*0.25
                //等于人物所修功法等级之和。初始等级是1级。由于功法最多有11个，所以最大等级为99。
        7.功法：人物所修炼的内功与招式。初始只有一个1级的招式“咏春拳”（初始剧情）。
                游戏中最多再学习1内功、9招式。内功可以被“废掉”（这时人物等级会下降），以重学其他内功。
        */
        properties: {
            hpMax: {
                default: 100,
                range:[1, 9999],
                type: cc.Integer
            },
            mpMax: {
                default: 10,
                range:[1, 999],
                type: cc.Integer
            },
            atk: {
                default: 10,
                range:[1, 999],
                type: cc.Integer
            },
            def: {
                default: 10,
                range:[1, 999],
                type: cc.Integer
            },
            nei_gong: {
                default: [],
                displayName: "修习内功表",
                type: [Skill]
            },
            zhao_shi: {
                default: [],
                displayName: "所学招式表",
                type: [ZhaoShi]
            }
        },

        ctor() {
            this.hp = this.hpMax;
            this.mp = this.mpMax;
            this.nu = 0;
            this.nuMax = 10;
            this.lv = this.resetLevel();
        },

        onLoad() {
        },

        resetLevel() {
            let n = (this.atk + this.def + this.mpMax + this.hpMax / Config.T) * 0.025;
            this.lv = Math.floor(n);
        }
    });
