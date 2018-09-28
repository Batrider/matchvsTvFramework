var uiPanel = require("uiPanel");

cc.Class({

    extends: uiPanel,
    properties: {
        rankPrefab: {
            default: null,
            type: cc.Node
        }
    },

    onLoad: function() {
        this._super();
        this.rankPrefab.active = false;
        Game.UIManager.btnMethodBind(this.nodeDict["exit"], "quit", this);
    },

    quit: function() {
        uiFunc.closeUI(this.node.name);
    },

    setData: function(rankdata) {
        console.log("setData");
        for (var i = 0; i < rankdata.length; i++) {
            var temp = cc.instantiate(this.rankPrefab);
            temp.active = true;
            temp.parent = this.rankPrefab.parent;
            var rankInfo = temp.getComponent("rankUserInfo");
            rankInfo.setData(rankdata[i]);
        }
    }
});
