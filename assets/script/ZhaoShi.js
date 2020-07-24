const Skill = require("Skill");
/*---------战斗中使用的招式（Skill的子类ZhaoShi）----------
    效果：“每提升一层境界，增加a攻击力和b防御力”。
    a和b最好都围绕T*x(每升一级增加的Hp)设定。
    类型：空手。（目前先不设置持武器的招式，故只此一种类型）
    招式可于战斗中主动使用。

    效果：对技能作用的描述
    //类型：进攻 或 防守
    消耗内力：0-99。将内力消耗一空的99内的招式都是毁天灭地的。
    消耗怒气：0-10。一般是绝招、必杀技，特别是10怒的招式，威力一定要惊人。
    获得怒气：0-3。有的招式容易积攒怒气，但耗费大量内力。
    属性提升：0-？。当前回合的攻或防（对应“类型”的属性）会提升一个值,用于命中率的计算中，但不用于伤害计算（，即隐性的提升）。
    //属性增率：上述的属性直接提升一个百分比数值。
*/
var ZhaoShi = cc.Class({
    extends: Skill,

    properties: {
        eff: {
            default: "运少量内力于腿，发起迅猛的雷霆一击!",
            tooltip: "战斗时播报的文字，前面会加上角色姓名"
        },
        mpCost: {
            default: 0,
            type: cc.Integer,
            displayName: "内力消耗"
        },
        nuCost: {
            default: 0,
            range: [0, 10, 1],
            type: cc.Integer,
            displayName: "怒气消耗"
        },
        nuGain: {
            default: 0,
            range: [0, 3],
            type: cc.Integer,
            displayName: "回复怒气"
        },
        atkExtra: {
            default: 0,
            tooltip: "本回合计算概率时给攻击力增加的值",
            type: cc.Integer
        },
        defExtra: {
            default: 0,
            tooltip: "本回合计算概率时给防御力增加的值",
            type: cc.Integer
        }
    },
});
