/*  -------内功（直接使用Skill，因为没有其他特效）------
    效果：“每提升一层境界，增加x最大生命值，y最大内力值”。
    x：每升一级增加的Hp。
    y：每升一级增加的内力。x最好大约是y的10倍。
    //战斗中每回合回复的Hp
    //战斗中每回合回复的内力
    //其他特效
    
    ----------招式（Skill的子类ZhaoShi）----------
    效果：“每提升一层境界，增加a攻击力和b防御力”。
    a：
    b：a和b最好都围绕T*x设定。
    类型：空手。（目前先不设置持武器的招式，故只此一种类型）
    招式可于战斗中主动使用。
*/
var Skill = cc.Class({
    extends: cc.Component,

    properties: {
        skill_name: {
            default: "",
        },
        lv: {
            default: 1,
            type: cc.Integer
        },
        type: {
            default: "内功",
            tooltip: "功法分为内功和招式",
        },
        info: {
            default:"这是对功法的介绍。",
        },
        exp_fix: {
            default: 10,
            tooltip: "等级为lv时累积获得的经验为 lv^3*exp_fix",
            type: cc.Integer
        },
        gain: {
            default: [],
            tooltip: "每级给人物增加的hp、mp、atk、def属性",
            type: [cc.Float]
        },
    },

    onLoad() {
        this.setLv(this.lv);
    },

    // 获得经验
    getExp(dE) {
        this.exp += dE;
        // 升级
        if (exp >= this.expNextLv) {
            this.lv++;
            this.expNextLv = this.expOfLv(this.lv + 1);
        }
    },

    // 直接设置等级，并设置exp、expNextLv（它存储升到下一级所需达到的exp量）
    setLv(lv) {
        this.lv = lv;
        let l = lv;
        this.exp = this.expOfLv(l);
        l++;
        this.expNextLv = this.expOfLv(l);
    },

    // 计算等级l所需的累计exp量
    expOfLv(l) {
        l * l * l * this.exp_fix;
    }
});