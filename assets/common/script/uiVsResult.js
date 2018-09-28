var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,

    properties: {
        loseClip: {
            default: null,
            url: cc.AudioClip
        },
        victoryClip: {
            default: null,
            url: cc.AudioClip
        }
    },

    start() {
        this.player = this.nodeDict["player"].getComponent("resultPlayerIcon");
        this.player.setData(GLB.playerUserIds[0]);
        this.rival = this.nodeDict["rival"].getComponent("resultPlayerIcon");
        this.rival.setData(GLB.playerUserIds[1]);
        this.nodeDict["playerScore"].getComponent(cc.Label).string = Game.GameManager.selfScore;
        this.nodeDict["rivalScore"].getComponent(cc.Label).string = Game.GameManager.rivalScore;

        Game.UIManager.btnMethodBind(this.nodeDict["quit"], "quit", this);

        var isWin = Game.GameManager.isRivalLeave ? true : Game.GameManager.selfScore >= Game.GameManager.rivalScore;
        if (isWin) {
            cc.audioEngine.play(this.victoryClip, false, 1);
            Game.GameManager.loginServer();
        } else {
            cc.audioEngine.play(this.loseClip, false, 1);
        }
        this.nodeDict["lose"].active = !isWin;
        this.nodeDict["win"].active = isWin;
    },

    quit: function() {
        mvs.engine.leaveRoom("");
        uiFunc.closeUI("uiGamePanel");
        uiFunc.closeUI(this.node.name);

        Game.GameManager.lobbyShow();
    }
});
