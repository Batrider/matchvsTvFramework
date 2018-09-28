var uiPanel = require("uiPanel");
var mvs = require("Matchvs");
cc.Class({
    extends: uiPanel,
    start() {
        this.roomPrefab = this.nodeDict["roomPrefab"];
        Game.UIManager.btnMethodBind(this.nodeDict["quit"], "quit", this);
        Game.UIManager.btnMethodBind(this.nodeDict["refresh"], "refresh", this);

        this.rooms = [];

        clientEvent.on(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.on(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);

        this.getRoomList();
    },

    refresh: function() {
        this.getRoomList();
    },

    getRoomList: function() {
        var filter = {
            maxPlayer: 0,
            mode: 0,
            canWatch: 0,
            roomProperty: "",
            full: 2,
            state: 1,
            sort: 1,
            order: 0,
            pageNo: 0,
            pageSize: 20
        };
        mvs.engine.getRoomListEx(filter);
    },

    getRoomListExResponse: function(data) {
        for (var j = 0; j < this.rooms.length; j++) {
            this.rooms[j].active = false;
            this.rooms[j].destroy();
        }
        this.rooms = [];
        this.roomAttrs = data.rsp.roomAttrs;
        for (var i = 0; i < data.rsp.roomAttrs.length; i++) {
            var room = cc.instantiate(this.roomPrefab);
            room.active = true;
            room.parent = this.roomPrefab.parent;
            var roomScript = room.getComponent('roomInfo');
            roomScript.setData(data.rsp.roomAttrs[i]);
            Game.UIManager.btnMethodBind(room, "joinRoom", roomScript);

            this.rooms.push(room);
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

    quit: function() {
        clearInterval(this.roomRqId);
        uiFunc.closeUI(this.node.name);
    },

    search: function() {
        if (this.editBox.string === '') {
            for (var i = 0; i < this.rooms.length; i++) {
                this.rooms[i].active = true;
            }
        } else {
            for (var j = 0; j < this.rooms.length; j++) {
                var roomScript = this.rooms[j].getComponent('roomInfo');
                if (roomScript.roomIdLb.string === this.editBox.string) {
                    this.rooms[j].active = true;
                } else {
                    this.rooms[j].active = false;
                }
            }
        }
    },

    joinRoomResponse: function(data) {
        if (data.status !== 200) {
            console.log('进入房间失败,异步回调错误码: ' + data.status);
            uiFunc.options
        } else {
            console.log('进入房间成功');
            console.log('房间号: ' + data.roomInfo.roomID);
            if (!data.roomUserInfoList.some(function(x) {
                return x.userId === GLB.userInfo.id;
            })) {
                data.roomUserInfoList.push({
                    userId: GLB.userInfo.id,
                    userProfile: ""
                });
            }
            // 设置房间最大人数--
            for (var i = 0; i < this.roomAttrs.length; i++) {
                if (data.roomInfo.roomID === this.roomAttrs[i].roomID) {
                    GLB.MAX_PLAYER_COUNT = this.roomAttrs[i].maxPlayer;
                    break;
                }
            }

            uiFunc.openUI("uiRoom", function(obj) {
                var room = obj.getComponent('uiRoom');
                room.joinRoomInit(data.roomUserInfoList, data.roomInfo);
                uiFunc.closeUI(this.node.name);
            }.bind(this));
        }
    },

    onDestroy() {
        clearInterval(this.roomRqId);
        clientEvent.off(clientEvent.eventType.joinRoomResponse, this.joinRoomResponse, this);
        clientEvent.off(clientEvent.eventType.getRoomListExResponse, this.getRoomListExResponse, this);
    }
});
