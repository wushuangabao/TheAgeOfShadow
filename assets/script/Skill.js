/*  -------内功（直接使用Skill，因为没有其他特效）------
    效果：“每提升一层境界，增加x最大生命值，y最大内力值”。
    x：每升一级增加的Hp。
    y：每升一级增加的内力。x最好大约是y的10倍。
    //战斗中每回合回复的Hp
    //战斗中每回合回复的内力
    //其他特效
*/
var Skill = cc.Class({
    extends: cc.Component,

    properties: {
        skill_name: {
            default: ""
        },
        lv: {
            default: 1,
            type: cc.Integer,
            displayName: "初始等级"
        },
        lv_max:{
            default: 10,
            type: cc.Integer,
            displayName: "等级上限"
        },
        type: {
            default: "内功",
            visible: false
        },
        info: {
            default:"",
            displayName: "说明文字（功法描述）"
        },
        exp_fix: {
            default: 10,
            displayName: "升级所需经验de系数",
            tooltip: "等级为lv时累积获得的经验为 lv^3*exp_fix",
            type: cc.Integer
        },
        gain_attr: {
            default: [],
            displayName: "每级提升人物属性",
            tooltip: "每级给人物增加的hp、mp、atk、def属性（数组必须有4个值）",
            type: [cc.Float]
        },
    },

    // 构造函数
    ctor() {
        this.setLv(this.lv);
    },

    // 获得经验
    getExp(dE) {
        this.exp += dE;
        // 升级
        if (exp >= this.expNextLv) {
            if(this.lv < this.lv_max) {
                this.lv++;
                this.expNextLv = this.expOfLv(this.lv + 1);
                console.log(this,type + " - " + this.skill_name + "的等级上升到了 " + this.lv + " 级！"); 
            }
            else{
                console.log(this,type + " - " + this.skill_name + "的等级已到达上限，无法升级!");
            }
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