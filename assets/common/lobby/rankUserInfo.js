cc.Class({
    extends: cc.Component,

    properties: {
        rankSps: [cc.SpriteFrame],
        rankCntLb: cc.Label,
        rankSprite: cc.Sprite,
        userNameLb: cc.Label,
        userIcon: cc.Sprite,
        userScoreLb: cc.Label
    },

    setData(data) {
        if (this.rankCntLb) {
            if (data.rank < 4) {
                this.rankCntLb.string = "";
                this.rankSprite.spriteFrame = this.rankSps[data.rank - 1];
            } else {
                this.rankCntLb.string = data.rank;
            }
        }
        this.userNameLb.string = data.userName;
        if (data.headIcon && data.headIcon !== "-") {
            cc.loader.load({url: data.headIcon, type: 'png'}, function(err, texture) {
                // Use texture to create sprite frame
                var spriteFrame = new cc.SpriteFrame(texture, cc.Rect(0, 0, texture.width, texture.height));
                if (this.userIcon) {
                    this.userIcon.spriteFrame = spriteFrame;
                }
            }.bind(this));
        }
        this.userScoreLb.string = data.score;
    }
});
