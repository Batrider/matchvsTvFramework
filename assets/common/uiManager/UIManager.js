// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        commonUIPrefabs: [cc.Prefab],
        playerIcons: [cc.SpriteFrame]
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        Game.UIManager = this;
        Game.UIManager.nowUIName = null;
        uiFunc.openUI("uiLogin");
    },

    openUI(uiName, callBack) {
        var targetPrefab;
        for (var i = 0; i < this.commonUIPrefabs.length; i++) {
            if (this.commonUIPrefabs[i].name === uiName) {
                targetPrefab = this.commonUIPrefabs[i]
            }
        }

        if (targetPrefab) {
            callBack(null, targetPrefab);
            return true;
        }
        return false;
    },

    btnMethodBind(targetNode, functionName, target) {
        var btn = targetNode.getComponent(cc.Button);
        if (btn) {
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = target.node;

            var reg = /<(.*)>/ig;
            var componentNames = target.name.match(reg);
            if (componentNames.length > 0) {
                clickEventHandler.component = componentNames[0].substring(1, componentNames[0].length - 1);
                clickEventHandler.handler = functionName;
                btn.clickEvents = [clickEventHandler];
            }
        }
    }
});
