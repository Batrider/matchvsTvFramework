var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,
    properties: {},

    onLoad() {
        this._super();
        this.players = [];
        this.roomId = 0;
        this.roomInfo = null;
        this.owner = 0;
        this.playerPrefab = this.nodeDict["player"];
        this.playerPrefab.active = false;

        Game.UIManager.btnMethodBind(this.nodeDict["quit"], "quit", this);
        Game.UIManager.btnMethodBind(this.nodeDict["startGame"], "startGame", this);


        clientEvent.on(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.on(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.on(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
        clientEvent.on(clientEvent.eventType.kickPlayerResponse, this.kickPlayerResponse, this);
        clientEvent.on(clientEvent.eventType.kickPlayerNotify, this.kickPlayerNotify, this);
        clientEvent.on(clientEvent.eventType.joinOverResponse, this.joinOverResponse, this);
        clientEvent.on(clientEvent.eventType.leaveRoomMedNotify, this.leaveRoomMedNotify, this);

        for (var i = 0; i < GLB.MAX_PLAYER_COUNT; i++) {
            var temp = cc.instantiate(this.playerPrefab);
            temp.active = true;
            temp.parent = this.nodeDict["layout"];
            var roomUserInfo = temp.getComponent('roomUserInfo');
            roomUserInfo.init();
            this.players.push(roomUserInfo);
        }
        this.resetComponentLink();
    },

    resetComponentLink: function() {
        this.componentLink();
        this.componentIndex = 0;
        for (var i = 0; i < this.componentDict.length; i++) {
            if (this.componentDict[i] === this.defaultBtn) {
                this.componentIndex = i;
                break;
            }
        }
        if (this.componentDict[this.componentIndex] instanceof cc.Button) {
            this.componentDict[this.componentIndex].node.getComponent(cc.Sprite).spriteFrame = this.componentDict[this.componentIndex].hoverSprite;
        }
    },

    kickPlayerResponse: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === data.kickPlayerRsp.userID) {
                this.players[j].init();
                break;
            }
        }
        if (GLB.userInfo.id === data.kickPlayerRsp.userID) {
            GLB.isRoomOwner = false;
            uiFunc.closeUI(this.node.name);
        }
        this.resetComponentLink();
    },

    kickPlayerNotify: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === data.kickPlayerNotify.userId) {
                this.players[j].init();
                break;
            }
        }

        if (GLB.userInfo.id === data.kickPlayerNotify.userId) {
            GLB.isRoomOwner = false;
            uiFunc.closeUI(this.node.name);
        }
    },

    joinRoomNotify: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === 0) {
                this.players[j].setData(data.roomUserInfo.userId, this.ownerId);
                Game.UIManager.btnMethodBind(this.players[j].kick, "kickPlayer", this.players[j]);
                break;
            }
        }
        this.resetComponentLink();
    },

    leaveRoomResponse: function(data) {
        if (data.leaveRoomRsp.status === 200) {
            console.log("离开房间成功！");
        } else {
            console.log("离开房间失败");
        }
        GLB.isRoomOwner = false;
        uiFunc.closeUI(this.node.name);
    },

    leaveRoomMedNotify: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === data.userID) {
                this.players[j].init();
                break;
            }
        }
        this.ownerId = data.owner;
        if (this.ownerId === GLB.userInfo.id) {
            GLB.isRoomOwner = true;
        }
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].userId !== 0) {
                this.players[i].setData(this.players[i].userId, this.ownerId);
                Game.UIManager.btnMethodBind(this.players[i].kick, "kickPlayer", this.players[i]);
            }
        }
        this.refreshStartBtn();
    },

    leaveRoomNotify: function(data) {
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId === data.leaveRoomInfo.userId) {
                this.players[j].init();
                break;
            }
        }
        this.ownerId = data.leaveRoomInfo.owner;
        if (this.ownerId === GLB.userInfo.id) {
            GLB.isRoomOwner = true;
        }
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].userId !== 0) {
                this.players[i].setData(this.players[i].userId, this.ownerId);
                Game.UIManager.btnMethodBind(this.players[i].kick, "kickPlayer", this.players[i]);
            }
        }
        this.refreshStartBtn();
        this.resetComponentLink();
    },

    refreshStartBtn() {
        var spNode = this.nodeDict["startGame"];
        var btn = this.nodeDict["startGame"].getComponent(cc.Button);
        if (GLB.isRoomOwner) {
            spNode.color = cc.Color.WHITE;
            btn.enabled = true;
        } else {
            spNode.color = cc.Color.BLACK;
            btn.enabled = false;
        }
    },

    quit: function() {
        mvs.engine.leaveRoom("");
    },

    startGame: function() {
        if (!GLB.isRoomOwner) {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("等待房主开始游戏");
                }
            }.bind(this));
            return;
        }
        var userIds = [];
        var playerCnt = 0;
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].userId !== 0) {
                playerCnt++;
                userIds.push(this.players[j].userId);
            }
        }


        if (playerCnt === GLB.MAX_PLAYER_COUNT) {
            var result = mvs.engine.joinOver("");
            console.log("发出关闭房间的通知");
            if (result !== 0) {
                console.log("关闭房间失败，错误码：", result);
            }

            GLB.playerUserIds = userIds;

            var msg = {
                action: GLB.GAME_START_EVENT,
                userIds: userIds
            };
            Game.GameManager.sendEventEx(msg);
        } else {
            uiFunc.openUI("uiTip", function(obj) {
                var uiTip = obj.getComponent("uiTip");
                if (uiTip) {
                    uiTip.setData("房间人数不足");
                }
            }.bind(this));
        }
    },

    createRoomInit(rsp) {
        this.roomId = rsp.roomID;
        this.ownerId = rsp.owner;
        this.players[0].setData(this.ownerId, this.ownerId);
        GLB.isRoomOwner = true;
        this.refreshStartBtn();
    },

    joinRoomInit(roomUserInfoList, roomInfo) {
        roomUserInfoList.sort(function(a, b) {
            if (roomInfo.ownerId === b.userId) {
                return 1;
            }
            return 0;
        });
        this.ownerId = roomInfo.ownerId;
        for (var j = 0; j < roomUserInfoList.length; j++) {
            this.players[j].setData(roomUserInfoList[j].userId, this.ownerId);
            Game.UIManager.btnMethodBind(this.players[j].kick, "kickPlayer", this.players[j]);

        }
        this.refreshStartBtn();
        this.resetComponentLink();
    },

    onDestroy() {
        clientEvent.off(clientEvent.eventType.joinRoomNotify, this.joinRoomNotify, this);
        clientEvent.off(clientEvent.eventType.leaveRoomResponse, this.leaveRoomResponse, this);
        clientEvent.off(clientEvent.eventType.leaveRoomNotify, this.leaveRoomNotify, this);
    }
});
