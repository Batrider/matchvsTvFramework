cc.Class({
    extends: cc.Component,

    properties: {
        defaultBtn: cc.Button
    },

    onLoad: function() {
        this.nodeLink();
        if (this.node.name === "uiGamePanel") {
            return;
        }
        this.componentLink();
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

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

    nodeLink() {
        this.nodeDict = {};
        var linkWidget = function(self, nodeDict) {
            var children = self.children;
            for (var i = 0; i < children.length; i++) {
                var widgetName = children[i].name;
                if (widgetName && widgetName.indexOf("key_") >= 0) {
                    var nodeName = widgetName.substring(4);
                    if (nodeDict[nodeName]) {
                        cc.error("控件名字重复!" + children[i].name);
                    }
                    nodeDict[nodeName] = children[i];
                }
                if (children[i].childrenCount > 0) {
                    linkWidget(children[i], nodeDict);
                }
            }
        }.bind(this);
        linkWidget(this.node, this.nodeDict);
    },

    // [ScrollView,Button]
    componentLink() {
        this.componentDict = [];
        var linkWidget = function(self, nodeDict) {
            var children = self.children;
            for (var i = 0; i < children.length; i++) {
                if (children[i].active) {
                    var btn = children[i].getComponent(cc.Button);
                    if (btn) {
                        nodeDict.push(btn);
                    } else {
                        var scrollView = children[i].getComponent(cc.ScrollView);
                        if (scrollView) {
                            nodeDict.push(scrollView);
                        }
                    }
                    if (children[i].childrenCount > 0) {
                        linkWidget(children[i], nodeDict);
                    }
                }
            }
        }.bind(this);
        linkWidget(this.node, this.componentDict);
    },

    focusTarget(delta) {
        // reset btn sprite
        for (var i = 0; i < this.componentDict.length; i++) {
            if (this.componentDict[i] instanceof cc.Button) {
                this.componentDict[i].node.getComponent(cc.Sprite).spriteFrame
                    = this.componentDict[i].normalSprite;
            }
        }
        // in button
        if (this.componentDict[this.componentIndex] instanceof cc.Button) {
            this.componentIndex += delta;
        }
        // in scrollView
        else if (this.componentDict[this.componentIndex] instanceof cc.ScrollView) {
            let curScrollOffset = this.componentDict[this.componentIndex].getScrollOffset();
            let maxScrollOffset = this.componentDict[this.componentIndex].getMaxScrollOffset();
            let targetOffsetY = curScrollOffset.y + 102 * delta;
            if (Math.abs(curScrollOffset.y - maxScrollOffset.y) < 1 || Math.abs(curScrollOffset.y) < 1) {
                let targetOffsetY = curScrollOffset.y + 102 * delta;
                if (targetOffsetY > maxScrollOffset.y || targetOffsetY < 0) {
                    this.componentIndex += delta;
                } else {
                    targetOffsetY = Math.min(Math.max(0, targetOffsetY), maxScrollOffset.y);
                    this.componentDict[this.componentIndex].scrollToOffset(cc.v2(maxScrollOffset.x / 2, targetOffsetY), 0);
                }
            } else {
                targetOffsetY = Math.min(Math.max(0, targetOffsetY), maxScrollOffset.y);
                this.componentDict[this.componentIndex].scrollToOffset(cc.v2(maxScrollOffset.x / 2, targetOffsetY), 0);
            }
        }

        // check index
        if (this.componentIndex >= this.componentDict.length) {
            this.componentIndex = 0;
        }
        if (this.componentIndex < 0) {
            this.componentIndex = this.componentDict.length - 1;
        }
        // set btn sprite
        if (this.componentDict[this.componentIndex] instanceof cc.Button) {
            this.componentDict[this.componentIndex].node.getComponent(cc.Sprite).spriteFrame
                = this.componentDict[this.componentIndex].hoverSprite;
        }
    },

    onKeyDown: function(event) {
        var uis = cc.Canvas.instance.node.children;
        if (uis.length > 0 && uis[uis.length - 1] === this.node) {
            switch (event.keyCode) {
                case 37:
                case 38:
                    this.focusTarget(-1);
                    break;
                case 39:
                case 40:
                    this.focusTarget(1);
                    break;
                case 13:
                    this.callBtnMethod(this.componentDict[this.componentIndex]);
                    break;
            }
        }
    },

    callBtnMethod(targetBtn) {
        var event = {
            type: "touchend",
            bubbles: true,
            target: targetBtn.node,
            currentTarget: targetBtn.node,
            eventPhase: 2
        };
        cc.Component.EventHandler.emitEvents(targetBtn.clickEvents, event);
    },

    onDestroy: function() {
        clientEvent.clear(this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
});
