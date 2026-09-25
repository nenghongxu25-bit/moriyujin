"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __decorateClass = (decorators, target, key, kind) => {
    var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
    for (var i = decorators.length - 1, decorator; i >= 0; i--)
      if (decorator = decorators[i])
        result = (kind ? decorator(target, key, result) : decorator(result)) || result;
    if (kind && result) __defProp(target, key, result);
    return result;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/CloseSprite.ts
  var { regClass, property } = Laya;
  var CloseSprite = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.targetNode = null;
      this.boundOwner = null;
    }
    onAwake() {
      this.bindClickTarget();
    }
    onEnable() {
      this.bindClickTarget();
    }
    onDisable() {
      this.unbindClickTarget();
    }
    onDestroy() {
      this.unbindClickTarget();
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onCloseClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onCloseClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onCloseClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onCloseClick);
      }
      this.boundOwner = null;
    }
    onCloseClick() {
      if (this.targetNode) {
        this.notifyTargetPanelClosing(this.targetNode);
        this.targetNode.visible = false;
      }
    }
    notifyTargetPanelClosing(node) {
      const components = node._components;
      if (!Array.isArray(components)) {
        return;
      }
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component && typeof component.closePanel === "function") {
          component.closePanel();
        } else if (component && typeof component.showDefaultState === "function") {
          component.showDefaultState();
        }
      }
    }
  };
  __name(CloseSprite, "CloseSprite");
  __decorateClass([
    property({ type: Laya.Node })
  ], CloseSprite.prototype, "targetNode", 2);
  CloseSprite = __decorateClass([
    regClass("14d09e1b-aa6f-4bcf-afc1-cf0226a43024", "../src/CloseSprite.ts")
  ], CloseSprite);

  // src/Enemy/HpBar.ts
  var { regClass: regClass2, property: property2 } = Laya;
  var HpBar = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.fill = null;
      this.maxHp = 100;
      this.hp = 100;
      this.fullWidth = 0;
    }
    onAwake() {
      if (this.fill) {
        this.fullWidth = this.fill.width;
      }
      this.refresh();
    }
    setHp(hp, maxHp = this.maxHp) {
      this.maxHp = Math.max(1, Math.floor(maxHp));
      this.hp = Math.max(0, Math.min(Math.floor(hp), this.maxHp));
      this.refresh();
    }
    refresh() {
      if (!this.fill) {
        return;
      }
      if (this.fullWidth <= 0) {
        this.fullWidth = this.fill.width;
      }
      const width = Math.max(0, this.fullWidth * (this.hp / Math.max(1, this.maxHp)));
      this.fill.width = width;
      const fill = this.fill;
      if (fill.graphics && typeof fill.graphics.clear === "function" && typeof fill.graphics.drawRect === "function") {
        fill.graphics.clear();
        if (width > 0) {
          fill.graphics.drawRect(0, 0, width, this.resolveFillHeight(), this.resolveFillColor());
        }
      }
    }
    resolveFillHeight() {
      const fill = this.fill;
      if (Number.isFinite(fill == null ? void 0 : fill.height) && fill.height > 0) {
        return fill.height;
      }
      const commands = fill == null ? void 0 : fill._gcmds;
      if (Array.isArray(commands)) {
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command && Number.isFinite(command.height) && command.height > 0) {
            return command.height;
          }
        }
      }
      return 10;
    }
    resolveFillColor() {
      const fill = this.fill;
      const commands = fill == null ? void 0 : fill._gcmds;
      if (Array.isArray(commands)) {
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command && typeof command.fillColor === "string" && command.fillColor) {
            return command.fillColor;
          }
        }
      }
      return "#c93826";
    }
  };
  __name(HpBar, "HpBar");
  __decorateClass([
    property2(Laya.Sprite)
  ], HpBar.prototype, "fill", 2);
  __decorateClass([
    property2(Number)
  ], HpBar.prototype, "maxHp", 2);
  __decorateClass([
    property2(Number)
  ], HpBar.prototype, "hp", 2);
  HpBar = __decorateClass([
    regClass2("86bfbc2d-ef6a-4258-a8f7-45cc2548f891", "../src/Enemy/HpBar.ts")
  ], HpBar);

  // src/Enemy/ZombieCombatController.ts
  var _ZombieCombatController = class _ZombieCombatController {
    constructor(controller) {
      this.controller = controller;
      this.attackLocked = false;
      this.attackToken = 0;
    }
    startAttack() {
      if (this.attackLocked || this.controller.isDead()) {
        return;
      }
      if (!this.controller.view.isReady()) {
        return;
      }
      this.attackLocked = true;
      this.attackToken += 1;
      this.controller.view.setAttackNodeVisible(false);
      Laya.timer.clear(this, this.showAttackNode);
      Laya.timer.once(Math.max(0, this.controller.attackNodeShowDelay || 0), this, this.showAttackNode);
      this.controller.view.playOneShot(this.controller.attackAnimation || "attack");
      Laya.timer.clear(this, this.onAttackFinished);
      Laya.timer.once(Math.max(100, this.controller.attackInterval || 700), this, this.onAttackFinished);
    }
    reset() {
      var _a;
      this.attackLocked = false;
      this.attackToken = 0;
      Laya.timer.clear(this, this.showAttackNode);
      Laya.timer.clear(this, this.onAttackFinished);
      (_a = this.controller.view) == null ? void 0 : _a.setAttackNodeVisible(false);
    }
    onDestroy() {
      this.reset();
    }
    isAttackLocked() {
      return this.attackLocked;
    }
    getAttackToken() {
      return this.attackToken;
    }
    snapshot() {
      return {
        attackLocked: this.attackLocked,
        attackToken: this.attackToken
      };
    }
    showAttackNode() {
      if (this.controller.isDead()) {
        return;
      }
      this.controller.view.setAttackNodeVisible(true);
    }
    onAttackFinished() {
      if (this.controller.isDead()) {
        return;
      }
      this.attackLocked = false;
      this.attackToken = 0;
      Laya.timer.clear(this, this.showAttackNode);
      this.controller.view.setAttackNodeVisible(false);
    }
  };
  __name(_ZombieCombatController, "ZombieCombatController");
  var ZombieCombatController = _ZombieCombatController;

  // src/PlayUI/playerui/Joystick.ts
  var { regClass: regClass3, property: property3 } = Laya;
  var Joystick = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.joystickBase = null;
      this.joystickHandle = null;
      this.radius = 60;
      this.activationThreshold = 20;
      this.valueX = 0;
      this.valueY = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.handleStartX = 0;
      this.handleStartY = 0;
      this.dragging = false;
      this.activePointerId = -1;
      this.inputActive = false;
    }
    onAwake() {
      Joystick.instance = this;
      if (!this.joystickBase || !this.joystickHandle) {
        return;
      }
      this.centerX = this.joystickBase.width / 2;
      this.centerY = this.joystickBase.height / 2;
      this.handleStartX = this.joystickHandle.x;
      this.handleStartY = this.joystickHandle.y;
      this.joystickHandle.pos(
        this.handleStartX,
        this.handleStartY
      );
      this.joystickBase.on(
        "mousedown",
        this,
        this.onJoystickDown
      );
      this.joystickBase.on(
        "touchstart",
        this,
        this.onJoystickDown
      );
    }
    onEnable() {
      Joystick.instance = this;
    }
    onDisable() {
      this.dragging = false;
      this.resetJoystick();
      Laya.stage.offAllCaller(this);
    }
    onDestroy() {
      if (Joystick.instance === this) {
        Joystick.instance = null;
      }
      if (this.joystickBase) {
        this.joystickBase.offAllCaller(this);
      }
      Laya.stage.offAllCaller(this);
    }
    getPointerId(e) {
      const pointerId = e && typeof e.touchId === "number" ? e.touchId : -1;
      return pointerId;
    }
    onJoystickDown(e) {
      this.activePointerId = this.getPointerId(e);
      this.dragging = true;
      Laya.stage.on(
        "mousemove",
        this,
        this.onJoystickMove
      );
      Laya.stage.on(
        "mouseup",
        this,
        this.onJoystickUp
      );
      Laya.stage.on(
        "mouseout",
        this,
        this.onJoystickUp
      );
      Laya.stage.on(
        "touchmove",
        this,
        this.onJoystickMove
      );
      Laya.stage.on(
        "touchend",
        this,
        this.onJoystickUp
      );
      this.onJoystickMove(e);
    }
    onJoystickMove(e) {
      if (!this.dragging || !this.joystickBase || !this.joystickHandle) {
        return;
      }
      const pointerId = this.getPointerId(e);
      if (this.activePointerId !== -1 && pointerId !== -1 && pointerId !== this.activePointerId) {
        return;
      }
      const stageMouseX = Laya.stage.mouseX;
      const stageMouseY = Laya.stage.mouseY;
      const stageTouchX = Laya.stage.touchX;
      const stageTouchY = Laya.stage.touchY;
      const mouseX = typeof stageMouseX === "number" ? stageMouseX : stageTouchX;
      const mouseY = typeof stageMouseY === "number" ? stageMouseY : stageTouchY;
      const localPoint = this.joystickBase.globalToLocal(
        new Laya.Point(mouseX, mouseY)
      );
      let offsetX = localPoint.x - this.centerX;
      let offsetY = localPoint.y - this.centerY;
      const distance = Math.sqrt(
        offsetX * offsetX + offsetY * offsetY
      );
      const threshold = Math.max(
        0,
        Math.min(
          this.radius,
          this.activationThreshold
        )
      );
      const releaseThreshold = Math.max(
        0,
        threshold * 0.7
      );
      const hasReachedThreshold = this.inputActive ? distance >= releaseThreshold : distance >= threshold;
      this.inputActive = hasReachedThreshold;
      if (distance > this.radius) {
        offsetX = offsetX / distance * this.radius;
        offsetY = offsetY / distance * this.radius;
      }
      this.joystickHandle.pos(
        this.handleStartX + offsetX,
        this.handleStartY + offsetY
      );
      if (hasReachedThreshold) {
        const normalizedDistance = distance > this.radius ? this.radius : distance;
        this.valueX = offsetX / normalizedDistance;
        this.valueY = offsetY / normalizedDistance;
      } else {
        this.valueX = 0;
        this.valueY = 0;
      }
    }
    onJoystickUp(e) {
      const pointerId = this.getPointerId(e);
      if (this.activePointerId !== -1 && pointerId !== -1 && pointerId !== this.activePointerId) {
        return;
      }
      this.dragging = false;
      this.activePointerId = -1;
      Laya.stage.off(
        "mousemove",
        this,
        this.onJoystickMove
      );
      Laya.stage.off(
        "mouseup",
        this,
        this.onJoystickUp
      );
      Laya.stage.off(
        "mouseout",
        this,
        this.onJoystickUp
      );
      Laya.stage.off(
        "touchmove",
        this,
        this.onJoystickMove
      );
      Laya.stage.off(
        "touchend",
        this,
        this.onJoystickUp
      );
      this.resetJoystick();
    }
    resetJoystick() {
      this.valueX = 0;
      this.valueY = 0;
      this.inputActive = false;
      if (this.joystickHandle) {
        this.joystickHandle.pos(
          this.handleStartX,
          this.handleStartY
        );
      }
    }
  };
  __name(Joystick, "Joystick");
  Joystick.instance = null;
  __decorateClass([
    property3(Laya.Sprite)
  ], Joystick.prototype, "joystickBase", 2);
  __decorateClass([
    property3(Laya.Sprite)
  ], Joystick.prototype, "joystickHandle", 2);
  __decorateClass([
    property3(Number)
  ], Joystick.prototype, "radius", 2);
  __decorateClass([
    property3(Number)
  ], Joystick.prototype, "activationThreshold", 2);
  Joystick = __decorateClass([
    regClass3("86ea2fa4-fb96-4e24-a36e-36cc0c2d5253", "../src/PlayUI/playerui/Joystick.ts")
  ], Joystick);

  // src/systems/TileBlockMovement.ts
  var _TileBlockMovement = class _TileBlockMovement {
    constructor() {
      this.blockLayer = null;
      this.blockLayerOwner = null;
      this.warnedMissingBlockLayer = false;
    }
    move(sprite, dx, dy, options = {}) {
      if (!this.blockLayer) {
        this.resolveBlockLayer(sprite);
      }
      const startX = sprite.x;
      const startY = sprite.y;
      const nextX = startX + dx;
      if (!this.isBlockedAt(sprite, nextX, startY, options)) {
        sprite.x = nextX;
      }
      const nextY = startY + dy;
      if (!this.isBlockedAt(sprite, sprite.x, nextY, options)) {
        sprite.y = nextY;
      }
      return {
        moved: Math.abs(sprite.x - startX) > 1e-3 || Math.abs(sprite.y - startY) > 1e-3,
        blockLayerName: this.blockLayerOwner ? this.blockLayerOwner.name : null
      };
    }
    getBlockLayerName(sprite) {
      if (!this.blockLayer && sprite) {
        this.resolveBlockLayer(sprite);
      }
      return this.blockLayerOwner ? this.blockLayerOwner.name : null;
    }
    isBlockedAt(sprite, parentX, parentY, options) {
      if (!this.blockLayer || !this.blockLayerOwner) {
        return false;
      }
      const parent = sprite.parent;
      if (!parent) {
        return false;
      }
      const footOffsetY = Number(options.footOffsetY) || 0;
      const stagePoint = parent.localToGlobal(new Laya.Point(parentX, parentY + footOffsetY), true);
      const center = this.blockLayerOwner.globalToLocal(stagePoint, true);
      const sampleHalfWidth = Math.max(0, Number(options.halfWidth) || 0);
      return this.hasBlockTile(center.x, center.y) || this.hasBlockTile(center.x - sampleHalfWidth, center.y) || this.hasBlockTile(center.x + sampleHalfWidth, center.y);
    }
    hasBlockTile(localX, localY) {
      var _a;
      try {
        return !!((_a = this.blockLayer) == null ? void 0 : _a.getCellData(localX, localY, true));
      } catch (error) {
        return false;
      }
    }
    resolveBlockLayer(sprite) {
      const scene = this.resolveSceneRoot(sprite);
      const layerOwner = scene ? this.findNodeByName(scene, "BlockLayer") || this.findNodeByName(scene, "2") : null;
      const tileMapLayerType = Laya.TileMapLayer;
      const layer = layerOwner && typeof tileMapLayerType === "function" ? layerOwner.getComponent(tileMapLayerType) : null;
      if (layer) {
        this.blockLayerOwner = layerOwner;
        this.blockLayer = layer;
        return;
      }
      if (!this.warnedMissingBlockLayer) {
        this.warnedMissingBlockLayer = true;
      }
    }
    resolveSceneRoot(sprite) {
      let node = sprite;
      while (node && node.parent) {
        node = node.parent;
      }
      return node;
    }
    findNodeByName(root, name) {
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      for (let i = 0; i < children.length; i++) {
        const found = this.findNodeByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(_TileBlockMovement, "TileBlockMovement");
  var TileBlockMovement = _TileBlockMovement;

  // src/Player/PlayerMovementController.ts
  var _PlayerMovementController = class _PlayerMovementController {
    constructor(controller) {
      this.controller = controller;
      this.joystick = null;
      this.updateFrame = 0;
      this.warnedMissingJoystick = false;
      this.warnedTinyMoveSpeed = false;
      this.resolveSource = "";
      this.baseScaleX = 1;
      this.facingSign = 1;
      this.attackDirection = 1;
      this.attackFacingLocked = false;
      this.isMovingNow = false;
      this.footstepElapsed = 0;
      this.lastFootstepUrl = "";
      this.tileBlockMovement = new TileBlockMovement();
      this.blockedFootstepUrls = {};
    }
    onAwake() {
      this.captureBaseScale();
      this.syncAttackArea();
      this.resolveJoystick();
      this.tileBlockMovement.getBlockLayerName(this.owner);
      this.preloadFootstepSounds();
    }
    onStart() {
      this.captureBaseScale();
      this.syncAttackArea();
      this.resolveJoystick();
      this.tileBlockMovement.getBlockLayerName(this.owner);
      this.preloadFootstepSounds();
    }
    onUpdate() {
      if (!this.joystick) {
        this.resolveJoystick();
      }
      if (!this.joystick) {
        if (this.updateFrame++ % 60 === 0 && !this.warnedMissingJoystick) {
          this.warnedMissingJoystick = true;
        }
        this.controller.animation.setLocomotionState(this.controller.idleAnimation);
        return;
      }
      const x = this.joystick.valueX;
      const y = this.joystick.valueY;
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude <= 1e-4) {
        this.isMovingNow = false;
        this.footstepElapsed = 0;
        this.controller.animation.setLocomotionState(this.controller.idleAnimation);
        if (this.updateFrame++ % 60 === 0) {
        }
        return;
      }
      this.isMovingNow = true;
      const speed = this.getCurrentSpeed();
      const sprite = this.owner;
      const dt = Laya.timer.delta / 1e3;
      if (speed > 0 && speed < 1 && !this.warnedTinyMoveSpeed) {
        this.warnedTinyMoveSpeed = true;
      }
      const nx = x / magnitude;
      const ny = y / magnitude;
      const dx = nx * speed * dt;
      const dy = ny * speed * dt;
      const moved = this.moveWithTileBlocking(sprite, dx, dy);
      if (!this.attackFacingLocked) {
        this.updateFacing(nx);
      }
      if (moved) {
        const nextAnimation = this.controller.isRunning ? this.controller.runAnimation : this.controller.walkAnimation;
        this.controller.animation.setLocomotionState(nextAnimation);
        this.updateFootstepSound();
      } else {
        this.isMovingNow = false;
        this.footstepElapsed = 0;
        this.controller.animation.setLocomotionState(this.controller.idleAnimation);
      }
    }
    getIsMovingNow() {
      return this.isMovingNow;
    }
    getCurrentSpeed() {
      if (this.controller.moveSpeed > 0) {
        return this.controller.moveSpeed;
      }
      return this.controller.isRunning ? this.controller.runSpeed : this.controller.walkSpeed;
    }
    getScaleX() {
      const owner = this.owner;
      return owner ? owner.scaleX : 0;
    }
    getFacingSign() {
      return this.facingSign;
    }
    getAttackDirection() {
      return this.attackDirection;
    }
    setAttackFacingByDirection(x, y = 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude <= 1e-4 || Math.abs(x) <= 0.1) {
        this.attackFacingLocked = true;
        return false;
      }
      this.attackFacingLocked = true;
      this.applyHorizontalFacing(x > 0 ? 1 : -1);
      return true;
    }
    clearAttackFacingOverride() {
      this.attackFacingLocked = false;
    }
    getResolveSource() {
      return this.resolveSource;
    }
    snapshot() {
      return {
        walkSpeed: this.controller.walkSpeed,
        runSpeed: this.controller.runSpeed,
        moveSpeed: this.controller.moveSpeed,
        isRunning: this.controller.isRunning,
        joystickNode: this.controller.joystickNode ? this.controller.joystickNode.name : null,
        attackNode: this.attackNode ? this.attackNode.name : null,
        detectNode: this.controller.detectNode ? this.controller.detectNode.name : null,
        owner: this.owner ? this.owner.name : null,
        scaleX: this.owner ? this.owner.scaleX : null,
        initialFacingSign: this.controller.initialFacingSign,
        attackAreaRightX: this.controller.attackAreaRightX,
        attackAreaLeftX: this.controller.attackAreaLeftX,
        attackFacingLocked: this.attackFacingLocked,
        footstepElapsed: this.footstepElapsed,
        lastFootstepUrl: this.lastFootstepUrl,
        blockLayer: this.tileBlockMovement.getBlockLayerName(this.owner)
      };
    }
    get owner() {
      return this.controller.owner;
    }
    get attackNode() {
      return this.controller.attackNode;
    }
    resolveJoystick() {
      if (this.controller.joystickNode) {
        const component = this.controller.joystickNode.getComponent(Joystick);
        if (component) {
          this.setJoystick(component, "joystickNode");
        }
        return;
      }
      if (!this.warnedMissingJoystick) {
        this.warnedMissingJoystick = true;
      }
    }
    setJoystick(joystick, source) {
      if (this.joystick !== joystick) {
        this.joystick = joystick;
        this.resolveSource = source;
      }
    }
    moveWithTileBlocking(sprite, dx, dy) {
      return this.tileBlockMovement.move(sprite, dx, dy, {
        halfWidth: this.controller.tileBlockHalfWidth,
        footOffsetY: this.controller.tileBlockFootOffsetY
      }).moved;
    }
    syncAttackArea() {
      const attackNode = this.attackNode;
      if (!attackNode) {
        return;
      }
      attackNode.x = this.attackDirection > 0 ? this.controller.attackAreaRightX : this.controller.attackAreaLeftX;
    }
    updateFacing(moveX) {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      if (moveX > 0.1) {
        this.applyHorizontalFacing(1);
      } else if (moveX < -0.1) {
        this.applyHorizontalFacing(-1);
      }
    }
    applyHorizontalFacing(direction) {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      const normalizedDirection = direction >= 0 ? 1 : -1;
      if (this.attackDirection === normalizedDirection) {
        return;
      }
      this.attackDirection = normalizedDirection;
      this.facingSign = this.controller.initialFacingSign >= 0 ? normalizedDirection : -normalizedDirection;
      owner.scaleX = this.baseScaleX * this.facingSign;
      this.syncAttackArea();
      this.controller.syncStatusBarTransform();
    }
    resolveWorldScaleSign(node) {
      let scaleX = 1;
      let scaleY = 1;
      let current = node;
      while (current) {
        if (typeof current.scaleX === "number" && current.scaleX !== 0) {
          scaleX *= current.scaleX;
        }
        if (typeof current.scaleY === "number" && current.scaleY !== 0) {
          scaleY *= current.scaleY;
        }
        current = current.parent;
      }
      return {
        x: scaleX >= 0 ? 1 : -1,
        y: scaleY >= 0 ? 1 : -1
      };
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      for (let i = 0; i < root.numChildren; i++) {
        const found = this.findChildByName(root.getChildAt(i), name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    updateFootstepSound() {
      if (!this.controller.footstepSoundEnabled) {
        this.footstepElapsed = 0;
        return;
      }
      const url = this.resolveFootstepUrl();
      if (!url || this.blockedFootstepUrls[url]) {
        this.footstepElapsed = 0;
        return;
      }
      if (url !== this.lastFootstepUrl) {
        this.footstepElapsed = 0;
        this.lastFootstepUrl = url;
      }
      const interval = Math.max(80, this.controller.isRunning ? this.controller.runFootstepInterval : this.controller.walkFootstepInterval);
      this.footstepElapsed += Math.max(0, Laya.timer.delta || 0);
      if (this.footstepElapsed < interval) {
        return;
      }
      this.footstepElapsed %= interval;
      try {
        const channel = Laya.SoundManager.playSound(url, 1);
        if (channel) {
          channel.playbackRate = this.resolveFootstepPlaybackRate();
        }
      } catch (error) {
        this.blockedFootstepUrls[url] = true;
      }
    }
    resolveFootstepPlaybackRate() {
      const baseRate = this.controller.isRunning ? this.controller.runFootstepPlaybackRate : this.controller.walkFootstepPlaybackRate;
      const variance = Math.max(0, Number(this.controller.footstepPlaybackRateVariance) || 0);
      const randomOffset = variance > 0 ? (Math.random() * 2 - 1) * variance : 0;
      return Math.max(0.1, Number(baseRate) + randomOffset || 1);
    }
    resolveFootstepUrl() {
      const sceneUrl = this.resolveSceneUrl();
      const isRunning = this.controller.isRunning;
      if (sceneUrl.includes("mine")) {
        return this.normalizeSoundUrl(isRunning ? this.controller.mineRunSoundUrl : this.controller.mineWalkSoundUrl);
      }
      if (sceneUrl.includes("cunzhuang")) {
        return this.normalizeSoundUrl(isRunning ? this.controller.cunzhuangRunSoundUrl : this.controller.cunzhuangWalkSoundUrl);
      }
      if (sceneUrl.includes("forest") || sceneUrl.includes("main")) {
        return this.normalizeSoundUrl(isRunning ? this.controller.forestRunSoundUrl : this.controller.forestWalkSoundUrl);
      }
      return this.normalizeSoundUrl(isRunning ? this.controller.forestRunSoundUrl : this.controller.forestWalkSoundUrl);
    }
    resolveSceneUrl() {
      let node = this.owner;
      while (node) {
        const url = String(node.url || "");
        if (url.endsWith(".ls")) {
          return url.toLowerCase();
        }
        node = node.parent;
      }
      return "";
    }
    normalizeSoundUrl(url) {
      return String(url || "").trim().replace(/^assets\//, "");
    }
    preloadFootstepSounds() {
      var _a, _b;
      const urls = [
        this.controller.cunzhuangWalkSoundUrl,
        this.controller.cunzhuangRunSoundUrl,
        this.controller.forestWalkSoundUrl,
        this.controller.forestRunSoundUrl,
        this.controller.mineWalkSoundUrl,
        this.controller.mineRunSoundUrl
      ].map((url) => this.normalizeSoundUrl(url)).filter(Boolean);
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        if (this.blockedFootstepUrls[url]) {
          continue;
        }
        try {
          const loaded = (_b = (_a = Laya.loader).getRes) == null ? void 0 : _b.call(_a, url);
          if (loaded) {
            continue;
          }
          const result = Laya.loader.load(url);
          if (result && typeof result.catch === "function") {
            result.catch(() => {
              this.blockedFootstepUrls[url] = true;
            });
          }
        } catch (error) {
          this.blockedFootstepUrls[url] = true;
        }
      }
    }
    captureBaseScale() {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      const sign = this.controller.initialFacingSign >= 0 ? 1 : -1;
      this.facingSign = sign;
      this.baseScaleX = Math.abs(owner.scaleX || 1);
      owner.scaleX = this.baseScaleX * this.facingSign;
      this.controller.syncStatusBarTransform();
    }
  };
  __name(_PlayerMovementController, "PlayerMovementController");
  var PlayerMovementController = _PlayerMovementController;

  // src/Player/PlayerUIHints.ts
  var _PlayerUIHints = class _PlayerUIHints {
    constructor(controller) {
      this.controller = controller;
      this.stateText = null;
      this.itemText = null;
    }
    onAwake() {
      this.resolveFromController();
    }
    onStart() {
      this.resolveFromController();
    }
    onDestroy() {
      Laya.timer.clear(this, this.hideStateText);
      Laya.timer.clear(this, this.hideItemText);
    }
    showState(text, duration = 1200) {
      if (!this.stateText) {
        this.resolveFromController();
      }
      if (!this.stateText) {
        return;
      }
      this.stateText.visible = true;
      this.stateText.text = text;
      Laya.timer.clear(this, this.hideStateText);
      Laya.timer.once(duration, this, this.hideStateText);
    }
    showItem(text, duration = 1500) {
      if (!this.itemText) {
        this.resolveFromController();
      }
      if (!this.itemText) {
        return;
      }
      this.itemText.visible = true;
      this.itemText.text = text;
      Laya.timer.clear(this, this.hideItemText);
      Laya.timer.once(duration, this, this.hideItemText);
    }
    hideStateText() {
      if (!this.stateText) {
        return;
      }
      this.stateText.text = "";
      this.stateText.visible = false;
    }
    hideItemText() {
      if (!this.itemText) {
        return;
      }
      this.itemText.text = "";
      this.itemText.visible = false;
    }
    snapshot() {
      return {
        stateText: this.stateText ? this.stateText.name : null,
        itemText: this.itemText ? this.itemText.name : null
      };
    }
    resolveFromController() {
      this.stateText = this.controller.stateText ? this.controller.stateText : this.stateText;
      this.itemText = this.controller.itemText ? this.controller.itemText : this.itemText;
    }
  };
  __name(_PlayerUIHints, "PlayerUIHints");
  var PlayerUIHints = _PlayerUIHints;

  // src/Player/PlayerCombatController.ts
  var _PlayerCombatController = class _PlayerCombatController {
    constructor(controller) {
      this.controller = controller;
      this.attackLocked = false;
      this.queuedAttack = false;
      this.queuedAttackOptions = null;
      this.finishAttack = /* @__PURE__ */ __name(() => {
        this.attackLocked = false;
        this.controller.endAttackHit();
        this.setAttackNodeVisible(false);
        Laya.timer.clear(this.controller, this.applyRangedAttack);
        if (this.queuedAttack) {
          this.startAttack(this.queuedAttackOptions || {});
        }
      }, "finishAttack");
      this.applyRangedAttack = /* @__PURE__ */ __name((options = {}) => {
        if (!this.attackLocked || !this.controller.isEquippedRangedWeapon()) {
          return;
        }
        this.controller.applyRangedAttackDamage(options);
      }, "applyRangedAttack");
    }
    playAttack(queueIfBusy = false, options = {}) {
      if (this.attackLocked || this.controller.animation.isBusy()) {
        if (queueIfBusy) {
          this.queuedAttack = true;
          this.queuedAttackOptions = options;
        }
        return false;
      }
      this.startAttack(options);
      return true;
    }
    clearQueuedAttack() {
      this.queuedAttack = false;
      this.queuedAttackOptions = null;
    }
    startAttack(options = {}) {
      this.queuedAttack = false;
      this.queuedAttackOptions = null;
      const attackSpeed = Math.max(0.1, this.controller.attackSpeed || 1);
      const lockDuration = Math.max(
        Math.floor(this.controller.attackCooldown / attackSpeed),
        Math.floor(this.controller.attackAnimationDuration / attackSpeed)
      );
      const isRanged = this.controller.isEquippedRangedWeapon();
      this.attackLocked = true;
      this.controller.beginAttackHit();
      this.setAttackNodeVisible(!isRanged);
      this.controller.animation.playActionAnimation(
        this.controller.resolveAttackAnimation(),
        lockDuration,
        void 0,
        attackSpeed,
        () => {
          this.controller.consumeStaminaForCompletedAttack();
        }
      );
      const finishDelay = this.controller.layeredSpineAnimationEnabled ? Math.max(1, lockDuration - 34) : lockDuration;
      if (isRanged) {
        this.playRangedAttackSound();
        this.controller.spawnRangedBullet(options);
        const hitDelay = Math.max(0, this.controller.rangedAttackHitDelay || 0);
        Laya.timer.clear(this.controller, this.applyRangedAttack);
        Laya.timer.once(hitDelay, this.controller, this.applyRangedAttack, [options]);
      }
      Laya.timer.clear(this.controller, this.finishAttack);
      Laya.timer.once(finishDelay, this.controller, this.finishAttack);
    }
    setAttackNodeVisible(visible) {
      const attackNode = this.controller.attackNode;
      if (!attackNode) {
        return;
      }
      attackNode.visible = visible;
      if ("active" in attackNode) {
        attackNode.active = visible;
      }
    }
    onDestroy() {
      Laya.timer.clear(this.controller, this.finishAttack);
      Laya.timer.clear(this.controller, this.applyRangedAttack);
      this.queuedAttack = false;
      this.queuedAttackOptions = null;
      this.controller.endAttackHit();
      this.setAttackNodeVisible(false);
    }
    snapshot() {
      return {
        attackLocked: this.attackLocked,
        queuedAttack: this.queuedAttack
      };
    }
    playRangedAttackSound() {
      const url = String(this.controller.rangedAttackSoundUrl || "").trim().replace(/^assets\//, "");
      if (!url) {
        return;
      }
      try {
        Laya.SoundManager.playSound(url, 1);
      } catch (error) {
      }
    }
  };
  __name(_PlayerCombatController, "PlayerCombatController");
  var PlayerCombatController = _PlayerCombatController;

  // src/Player/PlayerAnimationController.ts
  var _PlayerAnimationController = class _PlayerAnimationController {
    constructor(controller) {
      this.controller = controller;
      this.spine = null;
      this.currentAnimation = "";
      this.currentLowerAnimation = "";
      this.currentUpperAnimation = "";
      this.desiredAnimation = "";
      this.pendingAnimation = "";
      this.actionAnimation = "";
      this.actionFallbackAnimation = "";
      this.actionEndAt = 0;
      this.actionSequenceActive = false;
      this.actionSequenceToken = 0;
      this.actionSequenceStepIndex = 0;
      this.actionSequence = [];
    }
    onAwake() {
      this.resolveSpine();
      this.setLocomotionState(this.controller.idleAnimation);
      this.sync(true);
    }
    onStart() {
      this.resolveSpine();
      this.sync(true);
    }
    onUpdate() {
      this.resolveSpine();
      this.sync(false);
    }
    onDestroy() {
      this.spine = null;
      this.currentAnimation = "";
      this.currentLowerAnimation = "";
      this.currentUpperAnimation = "";
      this.desiredAnimation = "";
      this.pendingAnimation = "";
      this.actionAnimation = "";
      this.actionFallbackAnimation = "";
      this.actionEndAt = 0;
      this.actionSequenceActive = false;
      this.actionSequenceToken += 1;
      this.actionSequenceStepIndex = 0;
      this.actionSequence = [];
    }
    setLocomotionState(animationName) {
      this.pendingAnimation = animationName || this.controller.idleAnimation || "idle";
    }
    playActionAnimation(animationName, durationMs, fallbackAnimation, playbackRate = 1, onComplete) {
      this.playActionSequence([
        {
          animation: animationName || this.controller.attackAnimation || this.controller.idleAnimation || "idle",
          duration: Math.max(0, durationMs || 0),
          loop: false,
          playbackRate
        }
      ], fallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle", onComplete);
    }
    playActionSequence(phases, fallbackAnimation, onComplete) {
      const normalizedPhases = Array.isArray(phases) ? phases.filter((phase) => !!phase && !!phase.animation) : [];
      if (normalizedPhases.length === 0) {
        if (typeof onComplete === "function") {
          onComplete();
        }
        return;
      }
      this.actionSequenceToken += 1;
      const token = this.actionSequenceToken;
      this.actionSequenceActive = true;
      this.actionSequence = normalizedPhases;
      this.actionSequenceStepIndex = 0;
      this.actionFallbackAnimation = fallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle";
      this.runActionSequenceStep(token, onComplete);
    }
    isBusy() {
      return this.actionSequenceActive;
    }
    invalidateLocomotion() {
      this.currentAnimation = "";
      this.currentLowerAnimation = "";
      this.currentUpperAnimation = "";
      this.sync(true);
    }
    snapshot() {
      return {
        currentAnimation: this.currentAnimation,
        currentLowerAnimation: this.currentLowerAnimation,
        currentUpperAnimation: this.currentUpperAnimation,
        desiredAnimation: this.desiredAnimation,
        pendingAnimation: this.pendingAnimation,
        actionAnimation: this.actionAnimation,
        actionFallbackAnimation: this.actionFallbackAnimation,
        actionEndAt: this.actionEndAt,
        actionSequenceActive: this.actionSequenceActive,
        hasSpine: !!this.spine,
        ready: this.isReady(),
        spineAnimationName: this.spine ? this.spine.animationName : null,
        spineCurrentTime: this.safeReadSpineNumber("currentTime"),
        spinePlayState: this.safeReadSpineNumber("playState"),
        spineReadyState: this.getReadyState(),
        spineSource: this.getSpineSource(),
        spineTempletUrl: this.getSpineTempletUrl()
      };
    }
    safeReadSpineNumber(propertyName) {
      if (!this.spine) {
        return null;
      }
      try {
        const value = this.spine[propertyName];
        return typeof value === "number" ? value : null;
      } catch (error) {
        return null;
      }
    }
    playSpineAnimation(animationName, loop) {
      if (!this.spine || !this.isReady()) {
        return false;
      }
      if (!this.hasAnimation(animationName)) {
        return false;
      }
      try {
        this.spine.trackIndex = 0;
        this.spine.play(animationName, loop, true);
        return true;
      } catch (error) {
        return false;
      }
    }
    playSpineTrack(animationName, loop, trackIndex) {
      if (!this.spine || !this.isReady()) {
        return false;
      }
      if (!this.hasAnimation(animationName)) {
        return false;
      }
      this.wakeSpineRenderer(animationName, loop);
      try {
        this.spine.trackIndex = Math.max(0, Math.floor(trackIndex || 0));
        this.spine.play(animationName, loop, true);
        return true;
      } catch (error) {
        return false;
      }
    }
    hasAnimation(animationName) {
      if (!this.spine) {
        return false;
      }
      const name = String(animationName || "").trim();
      if (!name) {
        return false;
      }
      const templet = this.spine.templet;
      if (templet && typeof templet.hasAnimation === "function") {
        return !!templet.hasAnimation(name);
      }
      const anySpine = this.spine;
      if (templet && typeof anySpine.getAnimNum === "function" && typeof anySpine.getAniNameByIndex === "function") {
        try {
          const count = Math.max(0, Number(anySpine.getAnimNum()) || 0);
          for (let i = 0; i < count; i++) {
            if (anySpine.getAniNameByIndex(i) === name) {
              return true;
            }
          }
          return false;
        } catch (error) {
          return true;
        }
      }
      return true;
    }
    wakeSpineRenderer(animationName, loop) {
      if (!this.spine || this.safeReadSpineNumber("playState") !== 0) {
        return;
      }
      try {
        this.spine.trackIndex = 0;
        this.spine.play(animationName, loop, true);
      } catch (error) {
      }
    }
    sync(force) {
      if (!this.spine) {
        return;
      }
      if (!this.isReady()) {
        return;
      }
      const nextAnimation = this.resolveSingleTrackLocomotionAnimation(this.pendingAnimation || this.controller.idleAnimation || "idle");
      this.desiredAnimation = nextAnimation;
      if (this.actionSequenceActive && this.controller.layeredSpineAnimationEnabled) {
        this.syncLayeredLowerOnly(nextAnimation, force);
        return;
      }
      if (this.actionSequenceActive) {
        return;
      }
      if (this.controller.layeredSpineAnimationEnabled) {
        this.syncLayeredLocomotion(nextAnimation, force);
        return;
      }
      if (!force && this.currentAnimation === nextAnimation) {
        return;
      }
      this.applyLocomotionPlaybackRate(nextAnimation);
      if (this.playSpineAnimation(nextAnimation, true)) {
        this.currentAnimation = nextAnimation;
      }
    }
    runActionSequenceStep(token, onComplete) {
      if (token !== this.actionSequenceToken || !this.spine) {
        return;
      }
      if (!this.isReady()) {
        Laya.timer.callLater(this, () => {
          this.runActionSequenceStep(token, onComplete);
        });
        return;
      }
      const step = this.actionSequence[this.actionSequenceStepIndex];
      if (!step) {
        this.finishActionSequence(token, onComplete);
        return;
      }
      const duration = Math.max(0, step.duration || 0);
      this.actionAnimation = step.animation;
      this.actionEndAt = Date.now() + duration;
      this.desiredAnimation = step.animation;
      this.currentAnimation = step.animation;
      if (typeof this.spine.playbackRate === "function") {
        this.spine.playbackRate(Math.max(0.1, step.playbackRate || 1));
      }
      let advanced = false;
      const advanceStep = /* @__PURE__ */ __name(() => {
        if (advanced || token !== this.actionSequenceToken) {
          return;
        }
        advanced = true;
        this.actionSequenceStepIndex += 1;
        this.runActionSequenceStep(token, onComplete);
      }, "advanceStep");
      if (!step.loop) {
        const spineNode = this.controller.spineNode;
        if (!this.controller.layeredSpineAnimationEnabled && spineNode) {
          spineNode.once(Laya.Event.STOPPED, this, advanceStep);
        }
        if (duration > 0) {
          const advanceDelay = this.controller.layeredSpineAnimationEnabled ? Math.max(1, duration - 34) : duration + 50;
          Laya.timer.once(advanceDelay, this, advanceStep);
        }
      } else if (duration > 0) {
        Laya.timer.once(duration, this, advanceStep);
      } else {
        advanceStep();
      }
      const played = this.controller.layeredSpineAnimationEnabled ? this.playSpineTrack(step.animation, true, 1) : this.playSpineAnimation(step.animation, !!step.loop);
      if (!played) {
        Laya.timer.callLater(this, () => {
          this.runActionSequenceStep(token, onComplete);
        });
        return;
      }
      if (this.controller.layeredSpineAnimationEnabled) {
        this.currentUpperAnimation = step.animation;
      }
    }
    finishActionSequence(token, onComplete) {
      if (token !== this.actionSequenceToken) {
        return;
      }
      const fallbackAnimation = this.controller.layeredSpineAnimationEnabled ? this.pendingAnimation || this.controller.idleAnimation || "idle" : this.actionFallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle";
      this.actionSequenceActive = false;
      this.actionSequenceStepIndex = 0;
      this.actionSequence = [];
      this.actionAnimation = "";
      this.actionEndAt = 0;
      this.desiredAnimation = fallbackAnimation;
      this.actionFallbackAnimation = fallbackAnimation;
      if (this.spine) {
        if (typeof this.spine.playbackRate === "function") {
          this.spine.playbackRate(1);
        }
        if (this.controller.layeredSpineAnimationEnabled) {
          this.currentUpperAnimation = "";
          this.syncLayeredLocomotion(fallbackAnimation, true);
        } else {
          const singleTrackFallback = this.resolveSingleTrackLocomotionAnimation(fallbackAnimation);
          if (this.playSpineAnimation(singleTrackFallback, true)) {
            this.currentAnimation = singleTrackFallback;
          }
        }
      }
      this.actionFallbackAnimation = "";
      if (typeof onComplete === "function") {
        onComplete();
      }
    }
    isReady() {
      if (!this.spine) {
        return false;
      }
      const anySpine = this.spine;
      if (!anySpine.templet) {
        return false;
      }
      if (typeof anySpine.getAnimNum !== "function") {
        return true;
      }
      try {
        return Number(anySpine.getAnimNum()) > 0;
      } catch (error) {
        return false;
      }
    }
    getReadyState() {
      if (!this.spine) {
        return 0;
      }
      const anySpine = this.spine;
      const templet = anySpine.templet;
      if (!templet) {
        return 0;
      }
      return typeof templet.readyState === "number" ? templet.readyState : 0;
    }
    getSpineTempletUrl() {
      if (!this.spine) {
        return null;
      }
      const anySpine = this.spine;
      const templet = anySpine.templet;
      if (!templet) {
        return null;
      }
      return typeof templet.url === "string" ? templet.url : null;
    }
    getSpineSource() {
      if (!this.spine) {
        return null;
      }
      const anySpine = this.spine;
      return typeof anySpine.source === "string" ? anySpine.source : null;
    }
    resolveSpine() {
      if (this.spine) {
        return;
      }
      const spineNode = this.controller.spineNode;
      if (!spineNode) {
        return;
      }
      const found = spineNode.getComponent(Laya.Spine2DRenderNode);
      if (found) {
        this.spine = found;
      }
    }
    syncLayeredLocomotion(lowerAnimation, force) {
      const upperAnimation = this.resolveUpperLocomotionAnimation(lowerAnimation);
      this.applyLocomotionPlaybackRate(lowerAnimation);
      this.syncLayeredLowerOnly(lowerAnimation, force);
      if ((force || this.currentUpperAnimation !== upperAnimation) && this.playSpineTrack(upperAnimation, true, 1)) {
        this.currentUpperAnimation = upperAnimation;
      }
      this.currentAnimation = `${this.currentLowerAnimation} + ${this.currentUpperAnimation}`;
    }
    syncLayeredLowerOnly(lowerAnimation, force) {
      this.applyLocomotionPlaybackRate(lowerAnimation);
      if ((force || this.currentLowerAnimation !== lowerAnimation) && this.playSpineTrack(lowerAnimation, true, 0)) {
        this.currentLowerAnimation = lowerAnimation;
      }
    }
    applyLocomotionPlaybackRate(animationName) {
      var _a;
      if (typeof ((_a = this.spine) == null ? void 0 : _a.playbackRate) !== "function") {
        return;
      }
      this.spine.playbackRate(this.resolveLocomotionPlaybackRate(animationName));
    }
    resolveLocomotionPlaybackRate(animationName) {
      if (animationName === this.controller.runAnimation) {
        return Math.max(0.1, Number(this.controller.runAnimationPlaybackRate) || 1);
      }
      return 1;
    }
    resolveUpperLocomotionAnimation(lowerAnimation) {
      return this.controller.resolveUpperLocomotionAnimation(lowerAnimation);
    }
    resolveSingleTrackLocomotionAnimation(animationName) {
      if (!this.controller.isEquippedRangedWeapon()) {
        return animationName;
      }
      if (animationName === this.controller.walkAnimation || animationName === this.controller.runAnimation) {
        return animationName;
      }
      return this.controller.resolveUpperLocomotionAnimation(animationName);
    }
  };
  __name(_PlayerAnimationController, "PlayerAnimationController");
  var PlayerAnimationController = _PlayerAnimationController;

  // src/systems/data/CraftingManager.ts
  var _CraftingManager = class _CraftingManager {
    constructor() {
      this.recipes = this.createDefaultRecipes();
    }
    getRecipesByStation(station) {
      return this.recipes.filter((recipe) => recipe.station === station).map((recipe) => this.cloneRecipe(recipe));
    }
    getRecipe(recipeId) {
      const recipe = this.recipes.find((item) => item.id === recipeId) || null;
      return recipe ? this.cloneRecipe(recipe) : null;
    }
    cloneRecipe(recipe) {
      return __spreadProps(__spreadValues({}, recipe), {
        inputs: recipe.inputs.map((item) => __spreadValues({}, item)),
        output: __spreadValues({}, recipe.output)
      });
    }
    createDefaultRecipes() {
      return [
        {
          id: "campfire_bread",
          station: "campfire",
          name: "面包",
          inputs: [
            { itemId: "wheat", name: "小麦", count: 2, icon: "atlas/picture/items/materials/food_materials/wheat.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "bread", name: "面包", count: 1, icon: "atlas/picture/items/foods/eats/bread.png" }
        },
        {
          id: "campfire_grilled_fish",
          station: "campfire",
          name: "烤鱼",
          inputs: [
            { itemId: "fish", name: "鱼", count: 1, icon: "atlas/picture/items/materials/food_materials/fish.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "grilled_fish", name: "烤鱼", count: 1, icon: "atlas/picture/items/foods/eats/grilled_fish.png" }
        },
        {
          id: "campfire_grilled_mushroom",
          station: "campfire",
          name: "烤蘑菇",
          inputs: [
            { itemId: "mushroom", name: "蘑菇", count: 2, icon: "atlas/picture/items/materials/food_materials/mushroom.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "grilled_mushroom", name: "烤蘑菇", count: 1, icon: "atlas/picture/items/foods/eats/grilled_mushroom.png" }
        },
        {
          id: "campfire_grilled_corn",
          station: "campfire",
          name: "烤玉米",
          inputs: [
            { itemId: "corn", name: "玉米", count: 2, icon: "atlas/picture/items/materials/food_materials/corn.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "grilled_corn", name: "烤玉米", count: 1, icon: "atlas/picture/items/foods/eats/grilled_corn.png" }
        },
        {
          id: "campfire_grilled_potato",
          station: "campfire",
          name: "烤土豆",
          inputs: [
            { itemId: "potato", name: "土豆", count: 2, icon: "atlas/picture/items/materials/food_materials/potato.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "grilled_potato", name: "烤土豆", count: 1, icon: "atlas/picture/items/foods/eats/grilled_potato.png" }
        },
        {
          id: "campfire_roast",
          station: "campfire",
          name: "烤肉",
          inputs: [
            { itemId: "meat", name: "生肉", count: 1, icon: "atlas/picture/items/materials/food_materials/meat.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "roast", name: "烤肉", count: 1, icon: "atlas/picture/items/foods/eats/roast.png" }
        },
        {
          id: "campfire_rice",
          station: "campfire",
          name: "米饭",
          inputs: [
            { itemId: "rice_grain", name: "水稻", count: 2, icon: "atlas/picture/items/materials/food_materials/rice grain.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "rice", name: "米饭", count: 1, icon: "atlas/picture/items/foods/eats/rice.png" }
        },
        {
          id: "campfire_juice",
          station: "campfire",
          name: "果汁",
          inputs: [{ itemId: "food_material_01", name: "浆果", count: 4, icon: "atlas/picture/items/materials/food_materials/fruit.png" }],
          output: { itemId: "juice", name: "果汁", count: 1, icon: "atlas/picture/items/foods/drinks/juice.png" }
        },
        {
          id: "campfire_mushroom_soup",
          station: "campfire",
          name: "蘑菇汤",
          inputs: [
            { itemId: "mushroom", name: "蘑菇", count: 2, icon: "atlas/picture/items/materials/food_materials/mushroom.png" },
            { itemId: "water", name: "水", count: 1, icon: "atlas/picture/items/foods/drinks/water.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
            { itemId: "seasoning", name: "调料", count: 1, icon: "atlas/picture/items/materials/food_materials/seasoning.png" }
          ],
          output: { itemId: "mushroom_soup", name: "蘑菇汤", count: 1, icon: "atlas/picture/items/foods/eats/mushroom_soup.png" }
        },
        {
          id: "campfire_fried_chips",
          station: "campfire",
          name: "薯条",
          inputs: [
            { itemId: "potato", name: "土豆", count: 2, icon: "atlas/picture/items/materials/food_materials/potato.png" },
            { itemId: "seasoning", name: "调料", count: 1, icon: "atlas/picture/items/materials/food_materials/seasoning.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "fried_chips", name: "薯条", count: 1, icon: "atlas/picture/items/foods/eats/fried_chips.png" }
        },
        {
          id: "campfire_gujiao",
          station: "campfire",
          name: "骨胶",
          inputs: [
            { itemId: "shougu", name: "兽骨", count: 2, icon: "atlas/picture/items/materials/basic_materials/shougu.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "gujiao", name: "骨胶", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" }
        },
        {
          id: "processing_leather",
          station: "processing",
          name: "皮革",
          inputs: [
            { itemId: "hide", name: "兽皮", count: 2, icon: "atlas/picture/items/materials/basic_materials/hide.png" },
            { itemId: "shupi", name: "树皮", count: 1, icon: "atlas/picture/items/materials/basic_materials/shupi.png" }
          ],
          output: { itemId: "leather", name: "皮革", count: 1, icon: "atlas/picture/items/materials/advanced_materials/leather.png" }
        },
        {
          id: "processing_honey",
          station: "processing",
          name: "蜂蜜",
          inputs: [
            { itemId: "hua", name: "花", count: 3, icon: "atlas/picture/items/materials/food_materials/hua.png" }
          ],
          output: { itemId: "fengmi", name: "蜂蜜", count: 1, icon: "atlas/picture/items/materials/food_materials/fengmi.png" }
        },
        {
          id: "processing_rope",
          station: "processing",
          name: "绳子",
          inputs: [
            { itemId: "grass", name: "草", count: 2, icon: "atlas/picture/items/materials/basic_materials/grass.png" }
          ],
          output: { itemId: "shengzi", name: "绳子", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shengzi.png" }
        },
        {
          id: "processing_stone_block",
          station: "processing",
          name: "石块",
          inputs: [{ itemId: "common_material_02", name: "石头", count: 2, icon: "atlas/picture/items/materials/basic_materials/shitou.png" }],
          output: { itemId: "shikuai", name: "石块", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shikuai.png" }
        },
        {
          id: "processing_plank",
          station: "processing",
          name: "木板",
          inputs: [{ itemId: "wood", name: "木头", count: 2, icon: "atlas/picture/items/materials/basic_materials/wood.png" }],
          output: { itemId: "muban", name: "木板", count: 1, icon: "atlas/picture/items/materials/advanced_materials/muban.png" }
        },
        {
          id: "processing_iron_ingot",
          station: "processing",
          name: "铁锭",
          inputs: [{ itemId: "iron", name: "铁", count: 2, icon: "atlas/picture/items/materials/basic_materials/iron.png" }],
          output: { itemId: "tieding", name: "铁锭", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" }
        },
        {
          id: "processing_copper_ingot",
          station: "processing",
          name: "铜锭",
          inputs: [{ itemId: "copper", name: "铜", count: 2, icon: "atlas/picture/items/materials/basic_materials/copper.png" }],
          output: { itemId: "tongding", name: "铜锭", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tongding.png" }
        },
        {
          id: "equipment_knife",
          station: "equipment",
          name: "小刀",
          inputs: [
            { itemId: "tieding", name: "铁锭", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "muban", name: "木板", count: 1, icon: "atlas/picture/items/materials/advanced_materials/muban.png" }
          ],
          output: { itemId: "knife", name: "小刀", count: 1, icon: "atlas/picture/items/weapons/melees/knife.png" }
        },
        {
          id: "equipment_baseket_bat",
          station: "equipment",
          name: "棒球棍",
          inputs: [
            { itemId: "yingmu", name: "硬木", count: 3, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
            { itemId: "gujiao", name: "骨胶", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" }
          ],
          output: { itemId: "baseket_bat", name: "棒球棍", count: 1, icon: "atlas/picture/items/weapons/melees/baseket_bat.png" }
        },
        {
          id: "equipment_qiaogun",
          station: "equipment",
          name: "撬棍",
          inputs: [{ itemId: "tieding", name: "铁锭", count: 4, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" }],
          output: { itemId: "qiaogun", name: "撬棍", count: 1, icon: "atlas/picture/items/weapons/melees/qiaogun.png" }
        },
        {
          id: "equipment_langyabang",
          station: "equipment",
          name: "狼牙棒",
          inputs: [
            { itemId: "nail", name: "铁钉", count: 2, icon: "atlas/picture/items/materials/basic_materials/nail.png" },
            { itemId: "yingmu", name: "硬木", count: 3, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
            { itemId: "gujiao", name: "骨胶", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gujiao.png" }
          ],
          output: { itemId: "langyabang", name: "狼牙棒", count: 1, icon: "atlas/picture/items/weapons/melees/langyabang.png" }
        },
        {
          id: "equipment_cleaver",
          station: "equipment",
          name: "菜刀",
          inputs: [
            { itemId: "tieding", name: "铁锭", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "yingmu", name: "硬木", count: 1, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "cleaver", name: "菜刀", count: 1, icon: "atlas/picture/items/weapons/melees/cleaver.png" }
        },
        {
          id: "equipment_machete",
          station: "equipment",
          name: "大砍刀",
          inputs: [
            { itemId: "tieding", name: "铁锭", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "yingmu", name: "硬木", count: 2, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "machete", name: "大砍刀", count: 1, icon: "atlas/picture/items/weapons/melees/machete.png" }
        },
        {
          id: "equipment_long_knife",
          station: "equipment",
          name: "长刀",
          inputs: [
            { itemId: "tieding", name: "铁锭", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "yingmu", name: "硬木", count: 1, icon: "atlas/picture/items/materials/advanced_materials/yingmu.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 2, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "long_knife", name: "长刀", count: 1, icon: "atlas/picture/items/weapons/melees/long_knife.png" }
        },
        {
          id: "armor_old_steel_helmet",
          station: "pengrenji",
          name: "老式钢盔",
          inputs: [
            { itemId: "tieding", name: "铁锭", count: 5, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" },
            { itemId: "cotton", name: "棉花", count: 2, icon: "atlas/picture/items/materials/basic_materials/cotton.png" }
          ],
          output: { itemId: "laoshigangkui", name: "老式钢盔", count: 1, icon: "atlas/picture/items/armors/heads/laoshigangkui.png" }
        },
        {
          id: "armor_k1_helmet",
          station: "pengrenji",
          name: "K1",
          inputs: [
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "tezhonghejin", name: "特种合金", count: 1, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
            { itemId: "gongyejiao", name: "工业胶水", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "k1", name: "K1", count: 1, icon: "atlas/picture/items/armors/heads/k1.png" }
        },
        {
          id: "armor_g6_helmet",
          station: "pengrenji",
          name: "G6",
          inputs: [
            { itemId: "tezhonghejin", name: "特种合金", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
            { itemId: "tieding", name: "铁锭", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tieding.png" },
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 1, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "G6", name: "G6", count: 1, icon: "atlas/picture/items/armors/heads/G6.png" }
        },
        {
          id: "armor_ce3_helmet",
          station: "pengrenji",
          name: "CE3",
          inputs: [
            { itemId: "taihejin", name: "钛合金", count: 1, icon: "atlas/picture/items/materials/advanced_materials/Ti.png" },
            { itemId: "tezhonghejin", name: "特种合金", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 5, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "CE3", name: "CE3", count: 1, icon: "atlas/picture/items/armors/heads/CE3.png" }
        },
        {
          id: "armor_k1_insert_plate",
          station: "pengrenji",
          name: "K1插板",
          inputs: [
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 5, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "tezhonghejin", name: "特种合金", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 3, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "k1chaban", name: "K1插板", count: 1, icon: "atlas/picture/items/armors/bodies/k1chaban.png" }
        },
        {
          id: "armor_fn_steel_plate",
          station: "pengrenji",
          name: "FN钢板",
          inputs: [
            { itemId: "tezhonggang", name: "特种钢", count: 4, icon: "atlas/picture/items/materials/advanced_materials/Wuding.png" },
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "gongyejiao", name: "工业胶水", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "FNgangban", name: "FN钢板", count: 1, icon: "atlas/picture/items/armors/bodies/FNgangban.png" }
        },
        {
          id: "armor_g6_ceramic_plate",
          station: "pengrenji",
          name: "G6陶瓷板",
          inputs: [
            { itemId: "junyongcaoci", name: "军用陶瓷", count: 2, icon: "atlas/picture/items/materials/advanced_materials/junyongcaoci.png" },
            { itemId: "tezhonghejin", name: "特种合金", count: 2, icon: "atlas/picture/items/materials/advanced_materials/tezhonghejin.png" },
            { itemId: "gaofenzicailiao", name: "高分子材料", count: 4, icon: "atlas/picture/items/materials/advanced_materials/gaofenzicailiao.png" },
            { itemId: "gongyejiao", name: "工业胶", count: 6, icon: "atlas/picture/items/materials/advanced_materials/gongyejiao.png" }
          ],
          output: { itemId: "G6taociban", name: "G6陶瓷板", count: 1, icon: "atlas/picture/items/armors/bodies/G6taociban.png" }
        },
        {
          id: "campfire_fried_egg",
          station: "campfire",
          name: "荷包蛋",
          inputs: [
            { itemId: "egg", name: "鸡蛋", count: 1, icon: "atlas/picture/items/materials/food_materials/egg.png" },
            { itemId: "wood", name: "木头", count: 1, icon: "atlas/picture/items/materials/basic_materials/wood.png" }
          ],
          output: { itemId: "hebaodan", name: "荷包蛋", count: 1, icon: "atlas/picture/items/foods/eats/hebaodan.png" }
        },
        {
          id: "processing_gunpowder",
          station: "processing",
          name: "火药",
          inputs: [
            { itemId: "xiaoshi", name: "硝石", count: 1, icon: "atlas/picture/items/materials/basic_materials/xiaoshi.png" },
            { itemId: "liuhuang", name: "硫", count: 1, icon: "atlas/picture/items/materials/basic_materials/liuhuang.png" },
            { itemId: "mutan", name: "碳", count: 1, icon: "atlas/picture/items/materials/basic_materials/mutan.png" }
          ],
          output: { itemId: "huoyao", name: "火药", count: 1, icon: "atlas/picture/items/materials/advanced_materials/huoyao.png" }
        },
        {
          id: "equipment_wood_club",
          station: "equipment",
          name: "木棒",
          inputs: [
            { itemId: "wood", name: "木头", count: 3, icon: "atlas/picture/items/materials/basic_materials/wood.png" },
            { itemId: "shengzi", name: "绳子", count: 1, icon: "atlas/picture/items/materials/advanced_materials/shengzi.png" }
          ],
          output: { itemId: "wood_club", name: "木棒", count: 1, icon: "atlas/picture/items/weapons/melees/wood_club.png" }
        }
      ];
    }
  };
  __name(_CraftingManager, "CraftingManager");
  var CraftingManager = _CraftingManager;

  // src/systems/data/ItemDataManager.ts
  var _ItemDataManager = class _ItemDataManager {
    constructor() {
      this.itemMetaById = /* @__PURE__ */ new Map();
    }
    registerItemTable(table) {
      if (!table || !Array.isArray(table.items)) {
        const type = typeof table;
        const keys = table && type === "object" ? Object.keys(table).join(",") : "";
        throw new Error(`Item table is invalid. type=${type} keys=${keys}`);
      }
      const items = table.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || !item.id) {
          throw new Error(`Item table entry is invalid at index ${i}.`);
        }
        this.itemMetaById.set(item.id, {
          id: item.id,
          category: table.category,
          displayName: item.displayName || item.nameZh || item.id,
          nameZh: item.nameZh,
          subCategory: item.subCategory,
          icon: this.normalizeIconPath(item.icon),
          stackMax: this.normalizeOptionalNumber(item.stackMax),
          consumable: typeof item.consumable === "boolean" ? item.consumable : void 0,
          satiety: this.normalizeOptionalNumber(item.satiety),
          hydration: this.normalizeOptionalNumber(item.hydration),
          description: item.description,
          attackPower: this.normalizeOptionalNumber(item.attackPower),
          attackSpeed: this.normalizeOptionalNumber(item.attackSpeed),
          bulletSpeed: this.normalizeOptionalNumber(item.bulletSpeed),
          defense: this.normalizeOptionalNumber(item.defense),
          durability: this.normalizeOptionalNumber(item.durability),
          useEffect: this.normalizeUseEffect(item.useEffect)
        });
      }
    }
    resolveItemMeta(itemId) {
      return this.itemMetaById.get(itemId) || null;
    }
    resolveFallbackIcon(itemId) {
      const fallbackIconMap = {
        wood: "atlas/picture/items/materials/basic_materials/wood.png",
        shupi: "atlas/picture/items/materials/basic_materials/shupi.png",
        xiaoshuzhi: "atlas/picture/items/materials/basic_materials/xiaoshuzhi.png",
        grass: "atlas/picture/items/materials/basic_materials/grass.png",
        yaocao: "atlas/picture/items/materials/basic_materials/yaocao.png",
        iron: "atlas/picture/items/materials/basic_materials/iron.png",
        copper: "atlas/picture/items/materials/basic_materials/copper.png",
        liuhuang: "atlas/picture/items/materials/basic_materials/liuhuang.png",
        xiyoujinshu: "atlas/picture/items/materials/basic_materials/xiyoujinshu.png",
        shitou: "atlas/picture/items/materials/basic_materials/shitou.png",
        common_material_02: "atlas/picture/items/materials/basic_materials/shitou.png",
        food_material_01: "atlas/picture/items/materials/food_materials/fruit.png",
        base_material_10: "atlas/picture/items/materials/basic_materials/chenshuimu.png",
        mutant_blood_1: "atlas/picture/items/misc/flood_1.png",
        mutant_blood_2: "atlas/picture/items/misc/flood_2.png",
        mutant_blood_3: "atlas/picture/items/misc/flood_3.png"
      };
      return fallbackIconMap[itemId] || void 0;
    }
    resolveFallbackName(itemId) {
      const fallbackNameMap = {
        mutant_blood_1: "一阶变异血",
        mutant_blood_2: "二阶变异血",
        mutant_blood_3: "三阶变异血"
      };
      return fallbackNameMap[itemId] || void 0;
    }
    normalizeIconPath(icon) {
      const raw = String(icon || "").trim();
      if (!raw) {
        return void 0;
      }
      return raw.replace(/^assets\//, "");
    }
    normalizeOptionalNumber(value) {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : void 0;
    }
    normalizeUseEffect(effect) {
      if (!effect || typeof effect !== "object") {
        return void 0;
      }
      const raw = effect;
      const type = String(raw.type || "").trim();
      if (!type) {
        return void 0;
      }
      return {
        type,
        amount: this.normalizeOptionalNumber(raw.amount)
      };
    }
  };
  __name(_ItemDataManager, "ItemDataManager");
  var ItemDataManager = _ItemDataManager;

  // src/systems/data/HarvestManager.ts
  var _HarvestManager = class _HarvestManager {
    constructor(itemData) {
      this.itemData = itemData;
      this.harvestDropsById = /* @__PURE__ */ new Map();
    }
    registerHarvestTable(table) {
      if (!table || !Array.isArray(table.items)) {
        throw new Error("Harvest table is invalid.");
      }
      const items = table.items;
      for (let i = 0; i < items.length; i++) {
        const entry = items[i];
        if (!entry || !entry.id) {
          throw new Error(`Harvest table entry is invalid at index ${i}.`);
        }
        if (!Array.isArray(entry.drops)) {
          throw new Error(`Harvest table drops are invalid for entry ${entry.id}.`);
        }
        this.harvestDropsById.set(entry.id, this.cloneDropList(entry.drops));
      }
    }
    getHarvestDrops(harvestId, fallback = []) {
      const source = this.harvestDropsById.get(harvestId);
      return this.cloneDropList(source && source.length > 0 ? source : fallback);
    }
    rollHarvestDrops(harvestId, fallback = []) {
      const drops = this.getHarvestDrops(harvestId, fallback);
      const results = [];
      for (let i = 0; i < drops.length; i++) {
        const drop = drops[i];
        if (!this.rollProbability(drop.probability)) {
          continue;
        }
        const count = this.rollCount(drop);
        const meta = this.itemData.resolveItemMeta(drop.itemId);
        const icon = meta && meta.icon ? meta.icon : this.itemData.resolveFallbackIcon(drop.itemId);
        results.push({
          itemId: drop.itemId,
          name: meta ? meta.displayName : drop.label,
          count,
          icon
        });
      }
      return results;
    }
    formatHarvestResults(results) {
      if (!results || results.length === 0) {
        return "没有可获得的物品";
      }
      return results.map((item) => `${item.name} x${item.count}`).join(", ");
    }
    cloneDropList(drops) {
      return drops.map((drop) => __spreadProps(__spreadValues({}, drop), {
        countWeights: drop.countWeights ? drop.countWeights.map((weight) => __spreadValues({}, weight)) : void 0
      }));
    }
    rollProbability(probability) {
      const chance = Number.isFinite(probability) ? Math.max(0, Math.min(1, probability)) : 0;
      return Math.random() <= chance;
    }
    rollCount(drop) {
      if (Array.isArray(drop.countWeights) && drop.countWeights.length > 0) {
        return this.rollWeightedCount(drop.countWeights, drop.minCount, drop.maxCount);
      }
      const minCount = Math.min(drop.minCount, drop.maxCount);
      const maxCount = Math.max(drop.minCount, drop.maxCount);
      if (minCount === maxCount) {
        return Math.max(1, minCount);
      }
      return Math.floor(minCount + Math.random() * (maxCount - minCount + 1));
    }
    rollWeightedCount(weights, fallbackMin, fallbackMax) {
      let totalWeight = 0;
      for (let i = 0; i < weights.length; i++) {
        totalWeight += Math.max(0, weights[i].probability);
      }
      if (totalWeight <= 0) {
        return this.rollCount({
          itemId: "",
          label: "",
          minCount: fallbackMin,
          maxCount: fallbackMax,
          probability: 1
        });
      }
      let cursor = Math.random() * totalWeight;
      for (let i = 0; i < weights.length; i++) {
        cursor -= Math.max(0, weights[i].probability);
        if (cursor <= 0) {
          return Math.max(1, weights[i].count);
        }
      }
      return Math.max(1, weights[weights.length - 1].count);
    }
  };
  __name(_HarvestManager, "HarvestManager");
  var HarvestManager = _HarvestManager;

  // src/systems/data/InventoryManager.ts
  var _InventoryManager = class _InventoryManager {
    constructor(saveManager) {
      this.saveManager = saveManager;
      this.loaded = false;
      this.currentScope = "base";
      this.baseInventory = [];
      this.runInventory = [];
      this.bagViews = /* @__PURE__ */ new Set();
      this.playerBagSlotCount = 50;
      this.stackMaxResolver = null;
      this.itemNormalizer = null;
      this.sortPriorityResolver = null;
    }
    setStackMaxResolver(resolver) {
      this.stackMaxResolver = resolver;
    }
    setItemNormalizer(normalizer) {
      this.itemNormalizer = normalizer;
    }
    setSortPriorityResolver(resolver) {
      this.sortPriorityResolver = resolver;
    }
    loadPersistedInventories() {
      if (this.loaded) {
        this.syncBagViews();
        return;
      }
      this.loadInventoryFromStorage(_InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
      this.normalizeInventoryStacks(this.baseInventory);
      this.saveManager.saveInventory(_InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
      this.currentScope = "base";
      this.runInventory.length = 0;
      this.loaded = true;
      this.syncBagViews();
    }
    enterScene(sceneUrl) {
      const nextScope = this.isBaseSceneUrl(sceneUrl) ? "base" : "instance";
      if (nextScope === this.currentScope) {
        if (nextScope === "instance" && this.runInventory.length === 0) {
          this.copyInventoryList(this.baseInventory, this.runInventory);
        }
        this.syncBagViews();
        return;
      }
      if (nextScope === "instance") {
        this.copyInventoryList(this.baseInventory, this.runInventory);
        this.currentScope = "instance";
        this.syncBagViews();
        return;
      }
      this.copyInventoryList(this.runInventory, this.baseInventory);
      this.saveManager.saveInventory(_InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
      this.runInventory.length = 0;
      this.currentScope = "base";
      this.syncBagViews();
    }
    returnToBaseAfterDeath(sceneUrl) {
      const nextScope = this.isBaseSceneUrl(sceneUrl) ? "base" : "instance";
      if (nextScope !== "base") {
        this.enterScene(sceneUrl);
        return;
      }
      this.runInventory.length = 0;
      this.baseInventory.length = 0;
      this.currentScope = "base";
      this.saveManager.saveInventory(_InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
      this.syncBagViews();
    }
    getCurrentScope() {
      return this.currentScope;
    }
    getPlayerBagSlotCount() {
      return Math.max(0, Math.floor(this.playerBagSlotCount));
    }
    setPlayerBagSlotCount(count) {
      const nextCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
      if (this.playerBagSlotCount === nextCount) {
        return;
      }
      this.playerBagSlotCount = nextCount;
      this.syncBagViews();
    }
    getInventorySnapshot() {
      const snapshot = this.baseOrRunInventory().map((item) => item ? __spreadValues({}, item) : null);
      const slotCount = this.getPlayerBagSlotCount();
      while (snapshot.length < slotCount) {
        snapshot.push(null);
      }
      return snapshot;
    }
    getItemCount(itemId) {
      const normalizedItemId = String(itemId || "").trim();
      if (!normalizedItemId) {
        return 0;
      }
      let count = 0;
      const inventory = this.getActiveInventory();
      for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];
        if (item && item.itemId === normalizedItemId) {
          count += Math.max(0, Math.floor(item.count || 0));
        }
      }
      return count;
    }
    consumeItem(itemId, count) {
      const normalizedItemId = String(itemId || "").trim();
      let remaining = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
      if (!normalizedItemId || remaining <= 0) {
        return 0;
      }
      let consumed = 0;
      const inventory = this.getActiveInventory();
      for (let i = 0; i < inventory.length && remaining > 0; i++) {
        const item = inventory[i];
        if (!item || item.itemId !== normalizedItemId) {
          continue;
        }
        const available = Math.max(0, Math.floor(item.count || 0));
        const used = Math.min(available, remaining);
        if (used <= 0) {
          continue;
        }
        item.count = available - used;
        if (item.count <= 0) {
          inventory[i] = null;
        }
        remaining -= used;
        consumed += used;
      }
      if (consumed > 0) {
        this.persistCurrentScope();
        this.syncBagViews();
      }
      return consumed;
    }
    registerBagView(view) {
      this.bagViews.add(view);
      view.setItems(this.getInventorySnapshot());
    }
    unregisterBagView(view) {
      this.bagViews.delete(view);
    }
    refreshBagViews() {
      this.syncBagViews();
    }
    addItemToActive(itemId, name, count, icon) {
      const inventory = this.getActiveInventory();
      const payload = this.normalizeItem({
        itemId,
        name,
        count,
        icon
      });
      let remaining = Math.max(0, Math.floor(payload.count || 0));
      while (remaining > 0) {
        remaining = this.mergeIntoExistingSlot(inventory, __spreadProps(__spreadValues({}, payload), { count: remaining }));
        if (remaining <= 0) {
          break;
        }
        const stackMax = this.getStackMax(payload.itemId || "");
        const placedCount = Math.min(remaining, stackMax);
        if (placedCount <= 0) {
          break;
        }
        this.placeItemIntoInventory(inventory, __spreadProps(__spreadValues({}, payload), { count: placedCount }));
        remaining -= placedCount;
      }
      this.persistCurrentScope();
      this.syncBagViews();
    }
    canAddItems(items) {
      const incoming = Array.isArray(items) ? items.filter((item) => item && !!item.itemId && Number.isFinite(item.count) && item.count > 0) : [];
      if (incoming.length === 0) {
        return true;
      }
      const slotCountsByItemId = /* @__PURE__ */ new Map();
      const inventory = this.getActiveInventory();
      const limit = this.getPlayerBagSlotCount();
      for (let i = 0; i < Math.min(inventory.length, limit); i++) {
        const item = inventory[i];
        if (!item || !item.itemId) {
          continue;
        }
        const itemId = item.itemId;
        const counts = slotCountsByItemId.get(itemId) || [];
        counts.push(Math.max(0, Math.floor(item.count || 0)));
        slotCountsByItemId.set(itemId, counts);
      }
      let usedSlots = 0;
      slotCountsByItemId.forEach((counts) => {
        usedSlots += counts.length;
      });
      for (let i = 0; i < incoming.length; i++) {
        const itemId = incoming[i].itemId || "";
        let remaining = Math.max(0, Math.floor(incoming[i].count || 0));
        if (!itemId || remaining <= 0) {
          continue;
        }
        const stackMax = this.getStackMax(itemId);
        const counts = slotCountsByItemId.get(itemId) || [];
        for (let slotIndex = 0; slotIndex < counts.length && remaining > 0; slotIndex++) {
          const capacity = Math.max(0, stackMax - counts[slotIndex]);
          const filled = Math.min(capacity, remaining);
          counts[slotIndex] += filled;
          remaining -= filled;
        }
        while (remaining > 0) {
          if (usedSlots >= limit) {
            return false;
          }
          const placed = Math.min(stackMax, remaining);
          counts.push(placed);
          usedSlots += 1;
          remaining -= placed;
        }
        slotCountsByItemId.set(itemId, counts);
      }
      return true;
    }
    removeItemFromActive(itemId) {
      const inventory = this.getActiveInventory();
      const index = this.findItemIndex(inventory, itemId);
      if (index < 0) {
        return null;
      }
      const item = inventory[index];
      if (!item) {
        return null;
      }
      inventory[index] = null;
      this.persistCurrentScope();
      this.syncBagViews();
      return __spreadValues({}, item);
    }
    removeActiveSlot(slotIndex) {
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return null;
      }
      const inventory = this.getActiveInventory();
      const item = inventory[index] || null;
      if (!item) {
        return null;
      }
      inventory[index] = null;
      this.persistCurrentScope();
      this.syncBagViews();
      return __spreadValues({}, item);
    }
    consumeActiveSlotItem(slotIndex, count) {
      const index = this.normalizeSlotIndex(slotIndex);
      const amount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
      if (index === null || amount <= 0) {
        return null;
      }
      const inventory = this.getActiveInventory();
      const item = inventory[index] || null;
      if (!item) {
        return null;
      }
      const consumed = Math.min(Math.max(0, Math.floor(item.count || 0)), amount);
      if (consumed <= 0) {
        return null;
      }
      item.count -= consumed;
      if (item.count <= 0) {
        inventory[index] = null;
      }
      this.persistCurrentScope();
      this.syncBagViews();
      return {
        itemId: item.itemId,
        name: item.name,
        count: consumed,
        icon: item.icon
      };
    }
    canSplitActiveSlot(slotIndex) {
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return false;
      }
      const inventory = this.getActiveInventory();
      const item = inventory[index] || null;
      if (!item || !item.itemId) {
        return false;
      }
      const count = Math.max(0, Math.floor(item.count || 0));
      return count > 1 && this.getStackMax(item.itemId) > 1 && this.findEmptySlotIndexWithinLimit(inventory) >= 0;
    }
    splitActiveSlot(slotIndex) {
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null || !this.canSplitActiveSlot(index)) {
        return false;
      }
      const inventory = this.getActiveInventory();
      const item = inventory[index];
      if (!item || !item.itemId) {
        return false;
      }
      const emptyIndex = this.findEmptySlotIndexWithinLimit(inventory);
      if (emptyIndex < 0) {
        return false;
      }
      const totalCount = Math.max(0, Math.floor(item.count || 0));
      const newSlotCount = Math.floor(totalCount / 2);
      const sourceSlotCount = totalCount - newSlotCount;
      if (newSlotCount <= 0 || sourceSlotCount <= 0) {
        return false;
      }
      item.count = sourceSlotCount;
      this.placeItemAtIndex(inventory, emptyIndex, __spreadProps(__spreadValues({}, item), { count: newSlotCount }));
      this.persistCurrentScope();
      this.syncBagViews();
      return true;
    }
    organizeActiveInventory() {
      const inventory = this.getActiveInventory();
      const organized = this.buildOrganizedInventory(inventory);
      inventory.length = 0;
      const slotCount = this.getPlayerBagSlotCount();
      const targetLength = Math.max(slotCount, organized.length);
      for (let i = 0; i < targetLength; i++) {
        inventory.push(organized[i] || null);
      }
      this.persistCurrentScope();
      this.syncBagViews();
    }
    moveActiveSlot(sourceSlotIndex, targetSlotIndex) {
      const sourceIndex = this.normalizeSlotIndex(sourceSlotIndex);
      const targetIndex = this.normalizeSlotIndex(targetSlotIndex);
      if (sourceIndex === null || targetIndex === null || sourceIndex === targetIndex) {
        return false;
      }
      const inventory = this.getActiveInventory();
      while (inventory.length <= Math.max(sourceIndex, targetIndex)) {
        inventory.push(null);
      }
      const sourceItem = inventory[sourceIndex];
      if (!sourceItem) {
        return false;
      }
      const targetItem = inventory[targetIndex] || null;
      if (targetItem && targetItem.itemId === sourceItem.itemId && this.getStackMax(sourceItem.itemId || "") > 1) {
        const stackMax = this.getStackMax(sourceItem.itemId || "");
        const targetCount = Math.max(0, Math.floor(targetItem.count || 0));
        const sourceCount = Math.max(0, Math.floor(sourceItem.count || 0));
        const movedCount = Math.min(Math.max(0, stackMax - targetCount), sourceCount);
        if (movedCount <= 0) {
          return false;
        }
        targetItem.count = targetCount + movedCount;
        sourceItem.count = sourceCount - movedCount;
        if (!targetItem.icon && sourceItem.icon) {
          targetItem.icon = sourceItem.icon;
        }
        if (!targetItem.name && sourceItem.name) {
          targetItem.name = sourceItem.name;
        }
        if (sourceItem.count <= 0) {
          inventory[sourceIndex] = null;
        }
        this.persistCurrentScope();
        this.syncBagViews();
        return true;
      }
      inventory[sourceIndex] = inventory[targetIndex] || null;
      inventory[targetIndex] = sourceItem;
      this.persistCurrentScope();
      this.syncBagViews();
      return true;
    }
    canPlaceItemInBucket(bucket, slotIndex, itemId) {
      if (bucket !== "active") {
        return false;
      }
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return false;
      }
      const slot = this.getActiveInventory()[index] || null;
      if (!slot) {
        return true;
      }
      if (slot.itemId !== itemId || this.getStackMax(itemId) <= 1) {
        return false;
      }
      return Math.max(0, Math.floor(slot.count || 0)) < this.getStackMax(itemId);
    }
    placeItemInBucket(bucket, slotIndex, item) {
      if (bucket !== "active") {
        return false;
      }
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return false;
      }
      if (!this.canPlaceItemInBucket(bucket, index, item.itemId || "")) {
        return false;
      }
      this.placeItemAtIndex(this.getActiveInventory(), index, item);
      this.persistCurrentScope();
      this.syncBagViews();
      return true;
    }
    swapActiveSlotItem(slotIndex, item) {
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return null;
      }
      const inventory = this.getActiveInventory();
      while (inventory.length <= index) {
        inventory.push(null);
      }
      const previous = inventory[index] || null;
      inventory[index] = item ? __spreadValues({}, item) : null;
      this.persistCurrentScope();
      this.syncBagViews();
      return previous ? __spreadValues({}, previous) : null;
    }
    syncBagViews() {
      const snapshot = this.getInventorySnapshot();
      for (const view of this.bagViews) {
        view.setItems(snapshot);
        if (typeof view.refreshPlayerStats === "function") {
          view.refreshPlayerStats();
        }
      }
    }
    getActiveInventory() {
      return this.currentScope === "base" ? this.baseInventory : this.runInventory;
    }
    baseOrRunInventory() {
      return this.getActiveInventory();
    }
    copyInventoryList(source, target) {
      target.length = 0;
      for (let i = 0; i < source.length; i++) {
        const item = source[i];
        target.push(item ? __spreadValues({}, item) : null);
      }
      this.normalizeInventoryStacks(target);
    }
    loadInventoryFromStorage(storageKey, target) {
      const items = this.saveManager.loadInventory(storageKey);
      target.length = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) {
          target.push(null);
          continue;
        }
        const itemId = item.itemId ? String(item.itemId) : "";
        if (!itemId) {
          throw new Error(`Inventory storage "${storageKey}" itemId is invalid at index ${i}.`);
        }
        target.push(this.normalizeItem({
          itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        }));
      }
    }
    normalizeInventoryStacks(inventory) {
      const normalized = this.buildNormalizedInventory(inventory, false);
      inventory.length = 0;
      for (let i = 0; i < normalized.length; i++) {
        inventory.push(normalized[i]);
      }
    }
    buildOrganizedInventory(inventory) {
      const normalized = this.buildNormalizedInventory(inventory, false).filter((item) => !!item);
      normalized.sort((a, b) => {
        const priorityA = this.resolveSortPriority(a);
        const priorityB = this.resolveSortPriority(b);
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        const nameCompare = String(a.name || "").localeCompare(String(b.name || ""));
        if (nameCompare !== 0) {
          return nameCompare;
        }
        return String(a.itemId || "").localeCompare(String(b.itemId || ""));
      });
      return normalized;
    }
    buildNormalizedInventory(inventory, keepEmptySlots) {
      const normalized = [];
      const totals = /* @__PURE__ */ new Map();
      for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i] ? this.normalizeItem(inventory[i]) : null;
        if (!item || !item.itemId) {
          if (keepEmptySlots) {
            normalized.push(null);
          }
          continue;
        }
        const itemId = item.itemId;
        const existing = totals.get(itemId);
        if (existing) {
          existing.count += Math.max(0, Math.floor(item.count || 0));
          if (!existing.icon && item.icon) {
            existing.icon = item.icon;
          }
          if (!existing.name && item.name) {
            existing.name = item.name;
          }
        } else {
          totals.set(itemId, __spreadProps(__spreadValues({}, item), { count: Math.max(0, Math.floor(item.count || 0)) }));
        }
      }
      totals.forEach((item) => {
        let remaining = Math.max(0, Math.floor(item.count || 0));
        const itemId = item.itemId || "";
        const stackMax = this.getStackMax(itemId);
        while (remaining > 0) {
          const count = Math.min(stackMax, remaining);
          normalized.push({
            itemId,
            name: item.name,
            count,
            icon: item.icon
          });
          remaining -= count;
        }
      });
      return normalized;
    }
    mergeIntoExistingSlot(inventory, item) {
      const itemId = item.itemId || "";
      const stackMax = this.getStackMax(itemId);
      let remaining = Math.max(0, Math.floor(item.count || 0));
      if (!itemId || stackMax <= 1) {
        return remaining;
      }
      for (let i = 0; i < inventory.length && remaining > 0; i++) {
        const existing = inventory[i];
        if (!existing || existing.itemId !== itemId) {
          continue;
        }
        const currentCount = Math.max(0, Math.floor(existing.count || 0));
        const capacity = Math.max(0, stackMax - currentCount);
        if (capacity <= 0) {
          continue;
        }
        const added = Math.min(capacity, remaining);
        existing.count = currentCount + added;
        remaining -= added;
        if (!existing.icon && item.icon) {
          existing.icon = item.icon;
        }
        if (!existing.name && item.name) {
          existing.name = item.name;
        }
      }
      return remaining;
    }
    placeItemIntoInventory(inventory, item) {
      const emptyIndex = this.findEmptySlotIndex(inventory);
      if (emptyIndex >= 0) {
        this.placeItemAtIndex(inventory, emptyIndex, item);
        return;
      }
      inventory.push(__spreadValues({}, item));
    }
    placeItemAtIndex(inventory, slotIndex, item) {
      while (inventory.length <= slotIndex) {
        inventory.push(null);
      }
      const current = inventory[slotIndex];
      if (current && current.itemId === item.itemId && this.getStackMax(item.itemId || "") > 1) {
        const stackMax = this.getStackMax(item.itemId || "");
        current.count = Math.min(stackMax, Math.max(0, Math.floor(current.count || 0)) + Math.max(0, Math.floor(item.count || 0)));
        if (!current.icon && item.icon) {
          current.icon = item.icon;
        }
        if (!current.name && item.name) {
          current.name = item.name;
        }
        return;
      }
      inventory[slotIndex] = __spreadValues({}, item);
    }
    getStackMax(itemId) {
      const resolved = this.stackMaxResolver ? this.stackMaxResolver(itemId) : Number.MAX_SAFE_INTEGER;
      if (!Number.isFinite(resolved)) {
        return Number.MAX_SAFE_INTEGER;
      }
      return Math.max(1, Math.floor(resolved));
    }
    normalizeItem(item) {
      const normalized = this.itemNormalizer ? this.itemNormalizer(__spreadValues({}, item)) : __spreadValues({}, item);
      return {
        itemId: normalized.itemId,
        name: normalized.name,
        count: Math.max(0, Math.floor(normalized.count || 0)),
        icon: normalized.icon
      };
    }
    resolveSortPriority(item) {
      return this.sortPriorityResolver ? this.sortPriorityResolver(item) : Number.MAX_SAFE_INTEGER;
    }
    persistCurrentScope() {
      if (this.currentScope === "base") {
        this.saveManager.saveInventory(_InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
      }
    }
    findItemIndex(inventory, itemId) {
      if (!itemId) {
        return -1;
      }
      for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];
        if (item && item.itemId === itemId) {
          return i;
        }
      }
      return -1;
    }
    findEmptySlotIndex(inventory) {
      for (let i = 0; i < inventory.length; i++) {
        if (!inventory[i]) {
          return i;
        }
      }
      return -1;
    }
    findEmptySlotIndexWithinLimit(inventory) {
      const limit = this.getPlayerBagSlotCount();
      for (let i = 0; i < limit; i++) {
        if (!inventory[i]) {
          return i;
        }
      }
      return -1;
    }
    normalizeSlotIndex(slotIndex) {
      if (!Number.isFinite(slotIndex)) {
        return null;
      }
      const index = Math.floor(slotIndex);
      return index >= 0 ? index : null;
    }
    isBaseSceneUrl(sceneUrl) {
      const url = String(sceneUrl || "").trim().toLowerCase();
      if (!url) {
        return false;
      }
      return url.includes("cunzhuang") || url.includes("base");
    }
  };
  __name(_InventoryManager, "InventoryManager");
  _InventoryManager.BASE_STORAGE_KEY = "laya_test_base_inventory_v1";
  var InventoryManager = _InventoryManager;

  // src/systems/data/MailManager.ts
  var _MailManager = class _MailManager {
    constructor() {
      this.mails = [];
      this.listeners = /* @__PURE__ */ new Set();
      this.load();
    }
    static getInstance() {
      if (!_MailManager.instance) {
        _MailManager.instance = new _MailManager();
      }
      return _MailManager.instance;
    }
    // =========================
    // Get all mails
    // =========================
    getMails() {
      return this.mails.map((mail) => __spreadProps(__spreadValues({}, mail), {
        attachments: mail.attachments.map((item) => __spreadValues({}, item))
      }));
    }
    // =========================
    // Get one mail
    // =========================
    getMail(mailId) {
      return this.mails.find((mail) => mail.id === mailId) || null;
    }
    // =========================
    // Add mail
    // =========================
    addMail(mail) {
      if (!mail || !mail.id) {
        return false;
      }
      if (this.getMail(mail.id)) {
        return false;
      }
      this.mails.push(__spreadProps(__spreadValues({}, mail), {
        attachments: Array.isArray(mail.attachments) ? mail.attachments.map((item) => __spreadValues({}, item)) : []
      }));
      this.mails.sort((a, b) => b.createdAt - a.createdAt);
      this.notifyChanged();
      return true;
    }
    addChangeListener(listener) {
      if (listener) {
        this.listeners.add(listener);
      }
    }
    removeChangeListener(listener) {
      this.listeners.delete(listener);
    }
    // =========================
    // Mark read
    // =========================
    markRead(mailId) {
      const mail = this.getMail(mailId);
      if (!mail) {
        return;
      }
      mail.isRead = true;
      this.notifyChanged();
    }
    // =========================
    // Mark claimed
    // =========================
    markClaimed(mailId) {
      const mail = this.getMail(mailId);
      if (!mail) {
        return false;
      }
      if (mail.isClaimed) {
        return false;
      }
      mail.isClaimed = true;
      this.notifyChanged();
      return true;
    }
    // =========================
    // Remove mail
    // =========================
    removeMail(mailId) {
      const next = this.mails.filter((mail) => mail.id !== mailId);
      if (next.length === this.mails.length) {
        return;
      }
      this.mails = next;
      this.notifyChanged();
    }
    // =========================
    // Default welcome mail
    // =========================
    addWelcomeMail() {
      this.addMail({
        id: "welcome_mail",
        title: "欢迎来到废土摸金录",
        content: "欢迎来到废土摸金录！\n\n在这片危险四伏的废土中，探索未知区域、搜集物资，并努力生存下去。\n\n祝你好运，幸存者！",
        createdAt: Date.now(),
        isRead: false,
        isClaimed: false,
        attachments: [
          {
            itemId: "grass",
            name: "草",
            count: 10,
            icon: "atlas/picture/items/materials/basic_materials/grass.png"
          },
          {
            itemId: "common_material_02",
            name: "石头",
            count: 10,
            icon: "atlas/picture/items/materials/basic_materials/shitou.png"
          }
        ]
      });
    }
    // =========================
    // Test reward mail
    // Can be removed later
    // =========================
    addTestRewardMail() {
      this.addMail({
        id: "test_reward_mail",
        title: "测试奖励邮件",
        content: "这是一封用于测试奖励领取功能的邮件。",
        createdAt: Date.now() - 1e3,
        isRead: false,
        isClaimed: false,
        attachments: [
          {
            itemId: "wood",
            name: "木头",
            count: 10,
            icon: "atlas/picture/items/materials/basic_materials/wood.png"
          },
          {
            itemId: "common_material_02",
            name: "石头",
            count: 5,
            icon: "atlas/picture/items/materials/basic_materials/shitou.png"
          }
        ]
      });
    }
    addSignInRewardMail(day, attachments) {
      const normalizedDay = Number.isFinite(day) ? Math.max(1, Math.floor(day)) : 1;
      const normalizedAttachments = Array.isArray(attachments) ? attachments.filter((item) => item && item.itemId && Number.isFinite(item.count) && item.count > 0).map((item) => ({
        itemId: item.itemId,
        name: item.name,
        count: Math.floor(item.count),
        icon: item.icon
      })) : [];
      if (normalizedAttachments.length === 0) {
        return false;
      }
      return this.addMail({
        id: `sign_in_reward_day_${normalizedDay}`,
        title: `每日签到 第${normalizedDay}天奖励`,
        content: `你已完成第${normalizedDay}天签到，奖励已发放到本邮件附件。`,
        createdAt: Date.now(),
        isRead: false,
        isClaimed: false,
        attachments: normalizedAttachments
      });
    }
    // =========================
    // Ensure default mails
    // =========================
    ensureDefaultMails() {
      this.addWelcomeMail();
      this.addTestRewardMail();
    }
    notifyChanged() {
      this.save();
      this.listeners.forEach((listener) => listener());
    }
    load() {
      var _a;
      try {
        const raw = (_a = this.getStorage()) == null ? void 0 : _a.getItem(_MailManager.STORAGE_KEY);
        if (!raw) {
          return;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          return;
        }
        this.mails = parsed.map((mail) => this.normalizeMail(mail)).filter((mail) => !!mail).sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        console.error("[MailManager] 邮件存档读取失败:", error);
      }
    }
    save() {
      var _a;
      try {
        (_a = this.getStorage()) == null ? void 0 : _a.setItem(_MailManager.STORAGE_KEY, JSON.stringify(this.mails));
        const scope = globalThis;
        if (scope && typeof scope.__scheduleDouyinCloudSave === "function") {
          scope.__scheduleDouyinCloudSave();
        }
      } catch (error) {
        console.error("[MailManager] 邮件存档保存失败:", error);
      }
    }
    normalizeMail(mail) {
      if (!mail || typeof mail.id !== "string" || !mail.id) {
        return null;
      }
      return {
        id: mail.id,
        title: typeof mail.title === "string" ? mail.title : "",
        content: typeof mail.content === "string" ? mail.content : "",
        createdAt: Number.isFinite(Number(mail.createdAt)) ? Number(mail.createdAt) : Date.now(),
        isRead: !!mail.isRead,
        isClaimed: !!mail.isClaimed,
        attachments: Array.isArray(mail.attachments) ? mail.attachments.filter((item) => item && typeof item.itemId === "string" && !!item.itemId).map((item) => ({
          itemId: item.itemId,
          name: typeof item.name === "string" ? item.name : item.itemId,
          count: Number.isFinite(Number(item.count)) ? Math.max(1, Math.floor(Number(item.count))) : 1,
          icon: typeof item.icon === "string" ? item.icon : void 0
        })) : []
      };
    }
    getStorage() {
      const scope = globalThis;
      return scope && scope.localStorage ? scope.localStorage : null;
    }
  };
  __name(_MailManager, "MailManager");
  _MailManager.STORAGE_KEY = "laya_test_mail_v1";
  _MailManager.instance = null;
  var MailManager = _MailManager;

  // src/systems/data/PlayerStatsManager.ts
  var _PlayerStatsManager = class _PlayerStatsManager {
    constructor(save, storageKey, onHpChanged) {
      this.save = save;
      this.storageKey = storageKey;
      this.onHpChanged = onHpChanged;
      this.stats = _PlayerStatsManager.createDefaultStats();
    }
    getSnapshot() {
      return __spreadValues({}, this.stats);
    }
    setHp(currentHp, maxHp = this.stats.maxHp) {
      const nextMaxHp = this.normalizePositiveInt(maxHp, this.stats.maxHp || 100);
      const nextCurrentHp = Math.max(0, Math.min(nextMaxHp, this.normalizeInt(currentHp, nextMaxHp)));
      if (this.stats.currentHp === nextCurrentHp && this.stats.maxHp === nextMaxHp) {
        return;
      }
      this.stats = __spreadProps(__spreadValues({}, this.stats), {
        currentHp: nextCurrentHp,
        maxHp: nextMaxHp
      });
      this.saveStats();
      if (this.onHpChanged) {
        this.onHpChanged();
      }
    }
    setStamina(currentStamina, maxStamina = this.stats.maxStamina) {
      const nextMaxStamina = this.normalizePositiveInt(maxStamina, this.stats.maxStamina || 100);
      const nextCurrentStamina = Math.max(0, Math.min(nextMaxStamina, this.normalizeInt(currentStamina, nextMaxStamina)));
      if (this.stats.currentStamina === nextCurrentStamina && this.stats.maxStamina === nextMaxStamina) {
        return;
      }
      this.stats = __spreadProps(__spreadValues({}, this.stats), {
        currentStamina: nextCurrentStamina,
        maxStamina: nextMaxStamina
      });
      this.saveStats();
    }
    grantGatherExperience() {
      this.grantExperience(1);
    }
    grantEnemyDefeatExperience() {
      this.grantExperience(1);
    }
    grantExperience(amount) {
      const value = Number.isFinite(amount) ? Math.floor(amount) : 0;
      if (value <= 0) {
        return;
      }
      let leveledUp = false;
      this.stats.experience += value;
      while (this.stats.experience >= this.stats.nextLevelExperience) {
        this.stats.experience -= this.stats.nextLevelExperience;
        this.stats.level += 1;
        this.stats.maxHp += 10;
        this.stats.currentHp = this.stats.maxHp;
        this.stats.nextLevelExperience += 50;
        leveledUp = true;
      }
      if (leveledUp) {
        this.stats.currentHp = Math.min(this.stats.currentHp, this.stats.maxHp);
        if (this.onHpChanged) {
          this.onHpChanged();
        }
      }
      this.saveStats();
    }
    setSurvivalStats(currentSatiety = this.stats.currentSatiety, currentHydration = this.stats.currentHydration, maxSatiety = this.stats.maxSatiety, maxHydration = this.stats.maxHydration) {
      const nextMaxSatiety = this.normalizePositiveInt(maxSatiety, this.stats.maxSatiety || 100);
      const nextMaxHydration = this.normalizePositiveInt(maxHydration, this.stats.maxHydration || 100);
      const nextCurrentSatiety = Math.max(0, Math.min(nextMaxSatiety, this.normalizeInt(currentSatiety, nextMaxSatiety)));
      const nextCurrentHydration = Math.max(0, Math.min(nextMaxHydration, this.normalizeInt(currentHydration, nextMaxHydration)));
      if (this.stats.currentSatiety === nextCurrentSatiety && this.stats.maxSatiety === nextMaxSatiety && this.stats.currentHydration === nextCurrentHydration && this.stats.maxHydration === nextMaxHydration) {
        return;
      }
      this.stats = __spreadProps(__spreadValues({}, this.stats), {
        currentSatiety: nextCurrentSatiety,
        maxSatiety: nextMaxSatiety,
        currentHydration: nextCurrentHydration,
        maxHydration: nextMaxHydration
      });
      this.saveStats();
      if (this.onHpChanged) {
        this.onHpChanged();
      }
    }
    load() {
      const stored = this.save.loadJson(this.storageKey);
      if (!stored) {
        this.stats = _PlayerStatsManager.createDefaultStats();
        this.saveStats();
        return;
      }
      const level = this.normalizePositiveInt(stored.level, 1);
      const maxHp = this.normalizePositiveInt(stored.maxHp, 100);
      const maxStamina = this.normalizePositiveInt(stored.maxStamina, 100);
      const maxSatiety = this.normalizePositiveInt(stored.maxSatiety, 100);
      const maxHydration = this.normalizePositiveInt(stored.maxHydration, 100);
      this.stats = {
        level,
        maxHp,
        currentHp: Math.min(maxHp, this.normalizePositiveInt(stored.currentHp, maxHp)),
        maxStamina,
        currentStamina: Math.max(0, Math.min(maxStamina, this.normalizeInt(stored.currentStamina, maxStamina))),
        maxSatiety,
        currentSatiety: Math.max(0, Math.min(maxSatiety, this.normalizeInt(stored.currentSatiety, maxSatiety))),
        maxHydration,
        currentHydration: Math.max(0, Math.min(maxHydration, this.normalizeInt(stored.currentHydration, maxHydration))),
        experience: Math.max(0, this.normalizeInt(stored.experience, 0)),
        nextLevelExperience: this.normalizePositiveInt(stored.nextLevelExperience, 200 + Math.max(0, level - 1) * 50)
      };
    }
    saveStats() {
      this.save.saveJson(this.storageKey, this.stats);
    }
    normalizePositiveInt(value, fallback) {
      const normalized = this.normalizeInt(value, fallback);
      return normalized > 0 ? normalized : fallback;
    }
    normalizeInt(value, fallback) {
      const next = Number(value);
      return Number.isFinite(next) ? Math.floor(next) : fallback;
    }
    static createDefaultStats() {
      return {
        level: 1,
        currentHp: 100,
        maxHp: 100,
        currentStamina: 100,
        maxStamina: 100,
        currentSatiety: 100,
        maxSatiety: 100,
        currentHydration: 100,
        maxHydration: 100,
        experience: 0,
        nextLevelExperience: 200
      };
    }
  };
  __name(_PlayerStatsManager, "PlayerStatsManager");
  var PlayerStatsManager = _PlayerStatsManager;

  // src/systems/data/QuickMakeManager.ts
  var _QuickMakeManager = class _QuickMakeManager {
    constructor() {
      this.recipes = this.createDefaultRecipes();
    }
    getRecipes() {
      return this.recipes.map((recipe) => this.cloneRecipe(recipe));
    }
    getRecipe(recipeId) {
      const recipe = this.recipes.find((item) => item.id === recipeId) || null;
      return recipe ? this.cloneRecipe(recipe) : null;
    }
    cloneRecipe(recipe) {
      return __spreadProps(__spreadValues({}, recipe), {
        inputs: recipe.inputs.map((item) => __spreadValues({}, item)),
        output: __spreadValues({}, recipe.output)
      });
    }
    createDefaultRecipes() {
      return [
        {
          id: "quick_make_wood_club",
          name: "简易木棒",
          inputs: [{ itemId: "wood", name: "木头", count: 3, icon: "atlas/picture/items/materials/basic_materials/wood.png" }],
          output: { itemId: "wood_club", name: "简易木棒", count: 1, icon: "atlas/picture/items/weapons/melees/wood_club.png" }
        },
        {
          id: "quick_make_bandage",
          name: "绷带",
          inputs: [
            { itemId: "grass", name: "草", count: 3, icon: "atlas/picture/items/materials/basic_materials/grass.png" },
            { itemId: "shupi", name: "树皮", count: 1, icon: "atlas/picture/items/materials/basic_materials/shupi.png" }
          ],
          output: { itemId: "bandage", name: "绷带", count: 1, icon: "atlas/picture/items/medicines/bandage.png" }
        }
      ];
    }
  };
  __name(_QuickMakeManager, "QuickMakeManager");
  var QuickMakeManager = _QuickMakeManager;

  // src/systems/data/QuickSlotManager.ts
  var _QuickSlotManager = class _QuickSlotManager {
    constructor(data, storageKey) {
      this.data = data;
      this.storageKey = storageKey;
      this.items = [null, null, null, null];
      this.views = /* @__PURE__ */ new Set();
    }
    getItems() {
      return this.items.map((item) => item ? __spreadValues({}, item) : null);
    }
    registerView(view) {
      if (!view) {
        return;
      }
      this.views.add(view);
      view.refreshQuickSlots(this.getItems());
    }
    unregisterView(view) {
      this.views.delete(view);
    }
    canAssignItem(itemId) {
      const meta = this.data.resolveItemMeta(itemId);
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      return category === "foods" || category === "medicines" || category === "weapons" || subCategory.includes("food") || subCategory.includes("medicine") || subCategory.includes("weapon") || subCategory.includes("melee") || subCategory.includes("ranged");
    }
    assignActiveItem(quickSlotIndex, itemId) {
      const inventory = this.data.inventory.getInventorySnapshot();
      for (let i = 0; i < inventory.length; i++) {
        const item = inventory[i];
        if (item && item.itemId === itemId) {
          return this.assignActiveSlot(quickSlotIndex, i);
        }
      }
      return false;
    }
    assignActiveSlot(quickSlotIndex, activeSlotIndex) {
      const index = this.normalizeIndex(quickSlotIndex);
      const slotIndex = Number.isFinite(activeSlotIndex) ? Math.floor(activeSlotIndex) : -1;
      const activeItems = this.data.inventory.getInventorySnapshot();
      const sourceItem = slotIndex >= 0 ? activeItems[slotIndex] : null;
      const itemId = String((sourceItem == null ? void 0 : sourceItem.itemId) || "");
      if (index < 0 || slotIndex < 0 || !sourceItem || !itemId || !this.canAssignItem(itemId)) {
        return false;
      }
      const removed = this.data.inventory.removeActiveSlot(slotIndex);
      if (!removed) {
        return false;
      }
      const previousQuickItem = this.items[index];
      this.items[index] = removed;
      if (previousQuickItem) {
        this.data.inventory.placeItemInBucket("active", slotIndex, previousQuickItem);
      }
      this.save();
      this.refreshViews();
      return true;
    }
    clear(quickSlotIndex) {
      const index = this.normalizeIndex(quickSlotIndex);
      if (index < 0 || !this.items[index]) {
        return false;
      }
      this.items[index] = null;
      this.save();
      this.refreshViews();
      return true;
    }
    move(sourceQuickSlotIndex, targetQuickSlotIndex) {
      const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
      const targetIndex = this.normalizeIndex(targetQuickSlotIndex);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
        return false;
      }
      const sourceItem = this.items[sourceIndex];
      if (!sourceItem) {
        return false;
      }
      this.items[sourceIndex] = this.items[targetIndex] || null;
      this.items[targetIndex] = sourceItem;
      this.save();
      this.refreshViews();
      return true;
    }
    moveToActiveSlot(sourceQuickSlotIndex, targetActiveSlotIndex) {
      const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
      const targetIndex = Number.isFinite(targetActiveSlotIndex) ? Math.floor(targetActiveSlotIndex) : -1;
      if (sourceIndex < 0 || targetIndex < 0) {
        return false;
      }
      const sourceItem = this.items[sourceIndex];
      if (!sourceItem) {
        return false;
      }
      const previousActiveItem = this.data.inventory.swapActiveSlotItem(targetIndex, sourceItem);
      if (previousActiveItem && !this.canAssignItem(previousActiveItem.itemId || "")) {
        this.data.inventory.swapActiveSlotItem(targetIndex, previousActiveItem);
        return false;
      }
      this.items[sourceIndex] = previousActiveItem || null;
      this.save();
      this.refreshViews();
      return true;
    }
    moveToEquipment(sourceQuickSlotIndex, targetSlot) {
      var _a;
      const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
      if (sourceIndex < 0) {
        return false;
      }
      const sourceItem = this.items[sourceIndex];
      const itemId = String((sourceItem == null ? void 0 : sourceItem.itemId) || "");
      if (!sourceItem || !this.data.canEquipItemToSlot(itemId, targetSlot)) {
        return false;
      }
      const previousEquipment = this.data.equippedItems[targetSlot];
      this.data.equippedItems[targetSlot] = {
        itemId,
        name: this.data.resolveDisplayName(itemId, sourceItem.name),
        count: 1,
        icon: sourceItem.icon || ((_a = this.data.resolveItemMeta(itemId)) == null ? void 0 : _a.icon) || this.data.resolveFallbackIcon(itemId)
      };
      this.items[sourceIndex] = previousEquipment ? __spreadValues({}, previousEquipment) : null;
      this.data.saveEquipment();
      this.save();
      this.refreshViews();
      return true;
    }
    activate(quickSlotIndex) {
      const index = this.normalizeIndex(quickSlotIndex);
      if (index < 0) {
        return { success: false };
      }
      const item = this.items[index];
      const itemId = String((item == null ? void 0 : item.itemId) || "").trim();
      if (!item || !itemId) {
        this.clear(index);
        return { success: false };
      }
      if (this.data.canEquipItemToSlot(itemId, "weapon")) {
        return this.switchWeapon(index, itemId);
      }
      if (this.data.canUseItem(itemId)) {
        return this.useItem(index, itemId);
      }
      return { success: false };
    }
    clearAll() {
      let changed = false;
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i]) {
          this.items[i] = null;
          changed = true;
        }
      }
      if (changed) {
        this.save();
      }
      this.refreshViews();
    }
    clearMissingItems() {
      let changed = false;
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item && (!item.itemId || item.count <= 0 || !this.canAssignItem(item.itemId))) {
          this.items[i] = null;
          changed = true;
        }
      }
      if (changed) {
        this.save();
      }
      this.refreshViews();
    }
    load() {
      var _a;
      const stored = this.data.save.loadJson(this.storageKey);
      for (let i = 0; i < this.items.length; i++) {
        const storedItem = Array.isArray(stored) ? stored[i] : null;
        if (typeof storedItem === "string") {
          this.items[i] = null;
          continue;
        }
        const item = storedItem || null;
        const itemId = String((item == null ? void 0 : item.itemId) || "").trim();
        const rawCount = item ? item.count : 0;
        const count = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
        this.items[i] = itemId && count > 0 && this.canAssignItem(itemId) ? {
          itemId,
          name: this.data.resolveDisplayName(itemId, item == null ? void 0 : item.name),
          count,
          icon: (item == null ? void 0 : item.icon) || ((_a = this.data.resolveItemMeta(itemId)) == null ? void 0 : _a.icon) || this.data.resolveFallbackIcon(itemId)
        } : null;
      }
      this.clearMissingItems();
    }
    refreshViews() {
      const items = this.getItems();
      this.views.forEach((view) => view.refreshQuickSlots(items));
    }
    useItem(quickSlotIndex, itemId) {
      const item = this.items[quickSlotIndex];
      if (!item || item.itemId !== itemId || item.count <= 0) {
        this.clear(quickSlotIndex);
        return { success: false };
      }
      item.count = Math.max(0, Math.floor(item.count || 0) - 1);
      if (item.count <= 0) {
        this.items[quickSlotIndex] = null;
      }
      this.data.applyItemUseStats(itemId);
      this.save();
      this.refreshViews();
      return { success: true, usedItem: true };
    }
    switchWeapon(quickSlotIndex, itemId) {
      var _a;
      if (!this.data.canEquipItemToSlot(itemId, "weapon")) {
        return { success: false };
      }
      const nextItem = this.items[quickSlotIndex];
      if (!nextItem || nextItem.itemId !== itemId) {
        this.clear(quickSlotIndex);
        return { success: false };
      }
      const previousWeapon = this.data.equippedItems.weapon;
      this.data.equippedItems.weapon = {
        itemId: nextItem.itemId,
        name: this.data.resolveDisplayName(nextItem.itemId, nextItem.name),
        count: 1,
        icon: nextItem.icon || ((_a = this.data.resolveItemMeta(nextItem.itemId)) == null ? void 0 : _a.icon) || this.data.resolveFallbackIcon(nextItem.itemId)
      };
      if (previousWeapon) {
        this.items[quickSlotIndex] = __spreadValues({}, previousWeapon);
      } else {
        this.items[quickSlotIndex] = null;
      }
      this.data.saveEquipment();
      this.save();
      this.refreshViews();
      return { success: true, switchedWeapon: true };
    }
    save() {
      this.data.save.saveJson(this.storageKey, this.items.map((item) => item ? __spreadValues({}, item) : null));
    }
    normalizeIndex(slotIndex) {
      const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
      return index >= 0 && index < this.items.length ? index : -1;
    }
  };
  __name(_QuickSlotManager, "QuickSlotManager");
  var QuickSlotManager = _QuickSlotManager;

  // src/systems/data/SaveManager.ts
  var _SaveManager = class _SaveManager {
    loadInventory(storageKey) {
      const storage = this.getStorage();
      const raw = storage.getItem(storageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error(`Inventory storage "${storageKey}" is invalid.`);
      }
      const next = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (!item) {
          next.push(null);
          continue;
        }
        const itemId = item && typeof item.itemId === "string" ? item.itemId : "";
        const name = item && typeof item.name === "string" ? item.name : "";
        const count = Number(item && item.count);
        const icon = item && typeof item.icon === "string" ? item.icon : void 0;
        if (!itemId) {
          throw new Error(`Inventory storage "${storageKey}" itemId is invalid at index ${i}.`);
        }
        if (!name) {
          throw new Error(`Inventory storage "${storageKey}" name is invalid for itemId ${itemId}.`);
        }
        if (!Number.isFinite(count) || count <= 0) {
          throw new Error(`Inventory storage "${storageKey}" count is invalid for itemId ${itemId}.`);
        }
        next.push({
          itemId,
          name,
          count: Math.floor(count),
          icon
        });
      }
      return next;
    }
    saveInventory(storageKey, source) {
      const storage = this.getStorage();
      const payload = Array.isArray(source) ? source.map(
        (item) => item ? {
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        } : null
      ) : [];
      storage.setItem(storageKey, JSON.stringify(payload));
      this.notifyCloudSaveChanged();
    }
    loadJson(storageKey) {
      const storage = this.getStorage();
      const raw = storage.getItem(storageKey);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    }
    saveJson(storageKey, value) {
      const storage = this.getStorage();
      storage.setItem(storageKey, JSON.stringify(value));
      this.notifyCloudSaveChanged();
    }
    removeItems(storageKeys) {
      const storage = this.getStorage();
      for (let i = 0; i < storageKeys.length; i++) {
        const key = String(storageKeys[i] || "").trim();
        if (key) {
          storage.removeItem(key);
        }
      }
      this.notifyCloudSaveChanged();
    }
    getStorage() {
      const scope = globalThis;
      if (!scope || !scope.localStorage) {
        throw new Error("localStorage is unavailable.");
      }
      return scope.localStorage;
    }
    notifyCloudSaveChanged() {
      const scope = globalThis;
      if (scope && typeof scope.__scheduleDouyinCloudSave === "function") {
        scope.__scheduleDouyinCloudSave();
      }
    }
  };
  __name(_SaveManager, "SaveManager");
  var SaveManager = _SaveManager;

  // src/platform/douyin/DouyinCloudManager.ts
  var _DouyinCloudManager = class _DouyinCloudManager {
    static login() {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "login"
        });
      });
    }
    static loadSave() {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "loadSave"
        });
      });
    }
    static saveGame(saveData) {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "saveGame",
          saveData
        });
      });
    }
    static getServerTime() {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "getServerTime"
        });
      });
    }
    static getProfile() {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "getProfile"
        });
      });
    }
    static updateProfile(profile) {
      return __async(this, null, function* () {
        return this.callFunction({
          action: "updateProfile",
          profile
        });
      });
    }
    static callFunction(body) {
      return __async(this, null, function* () {
        const action = String(body && body.action || "unknown");
        console.log("[DouyinCloud] callFunction start:", action);
        if (!this.cloud && !this.init()) {
          throw new Error("Douyin cloud init failed.");
        }
        console.log("[DouyinCloud] call capabilities:", this.getDebugConfig());
        const loginResult = yield this.loginDouyin();
        const requestBody = __spreadProps(__spreadValues({}, body || {}), {
          loginCode: String(loginResult && loginResult.code || "").trim(),
          anonymousCode: String(
            loginResult && (loginResult.anonymousCode || loginResult.anonymous_code) || ""
          ).trim()
        });
        if (typeof this.cloud.callFunction === "function") {
          return this.callCloudFunction(requestBody);
        }
        if (typeof this.cloud.callContainer === "function") {
          console.log("[DouyinCloud] callFunction unavailable, use callContainer:", this.getDebugConfig());
          return this.callCloudContainer(requestBody);
        }
        throw new Error("Douyin cloud call API is unavailable.");
      });
    }
    static init() {
      if (this.cloud) {
        return true;
      }
      if (typeof tt === "undefined") {
        console.error("[DouyinCloud] tt is unavailable.");
        return false;
      }
      if (typeof tt.createCloud !== "function") {
        console.error("[DouyinCloud] tt.createCloud is unavailable.");
        return false;
      }
      try {
        this.cloud = tt.createCloud({
          envID: this.ENV_ID,
          envId: this.ENV_ID,
          serviceID: this.SERVICE_ID,
          serviceId: this.SERVICE_ID
        });
        if (!this.cloud) {
          console.error("[DouyinCloud] tt.createCloud returned empty cloud.");
          return false;
        }
        console.log("[DouyinCloud] cloud initialized:", this.getDebugConfig());
        return true;
      } catch (error) {
        console.error("[DouyinCloud] cloud init error:", error);
        this.cloud = null;
        return false;
      }
    }
    static getCloud() {
      return this.cloud;
    }
    static getDebugConfig() {
      return {
        envID: this.ENV_ID,
        serviceID: this.SERVICE_ID,
        functionName: this.FUNCTION_NAME,
        hasTT: typeof tt !== "undefined",
        hasCreateCloud: typeof tt !== "undefined" && typeof tt.createCloud === "function",
        hasCloud: !!this.cloud,
        hasCallFunction: !!this.cloud && typeof this.cloud.callFunction === "function",
        hasCallContainer: !!this.cloud && typeof this.cloud.callContainer === "function"
      };
    }
    static isInitialized() {
      return !!this.cloud;
    }
    static reset() {
      this.cloud = null;
      console.log("[DouyinCloud] reset.");
    }
    static loginDouyin() {
      return new Promise((resolve, reject) => {
        if (typeof tt === "undefined" || typeof tt.login !== "function") {
          reject(new Error("tt.login is unavailable."));
          return;
        }
        tt.login({
          force: true,
          success: /* @__PURE__ */ __name((res) => {
            const hasLoginCode = !!String(res && res.code || "").trim();
            const hasAnonymousCode = !!String(
              res && (res.anonymousCode || res.anonymous_code) || ""
            ).trim();
            if (!res || !hasLoginCode && !hasAnonymousCode) {
              reject(new Error("tt.login did not return code."));
              return;
            }
            resolve(res);
          }, "success"),
          fail: /* @__PURE__ */ __name((err) => {
            console.error("[DouyinCloud] tt.login failed:", err);
            reject(err);
          }, "fail")
        });
      });
    }
    static callCloudFunction(body) {
      return new Promise((resolve, reject) => {
        try {
          this.cloud.callFunction({
            name: this.FUNCTION_NAME,
            data: body || {},
            success: /* @__PURE__ */ __name((res) => {
              console.log("[DouyinCloud] callFunction success:", res);
              this.resolveCloudResponse(res, resolve, reject);
            }, "success"),
            fail: /* @__PURE__ */ __name((err) => {
              console.error("[DouyinCloud] callFunction failed:", {
                config: this.getDebugConfig(),
                error: err
              });
              reject(err);
            }, "fail")
          });
        } catch (error) {
          console.error("[DouyinCloud] callFunction error:", {
            config: this.getDebugConfig(),
            error
          });
          reject(error);
        }
      });
    }
    static callCloudContainer(body) {
      return new Promise((resolve, reject) => {
        const requestBody = JSON.stringify(body || {});
        try {
          this.cloud.callContainer({
            serviceID: this.SERVICE_ID,
            serviceId: this.SERVICE_ID,
            path: "/index",
            init: {
              method: "POST",
              header: {
                "content-type": "application/json"
              },
              body: requestBody
            },
            success: /* @__PURE__ */ __name((res) => {
              console.log("[DouyinCloud] callContainer success:", res);
              this.resolveCloudResponse(res, resolve, reject);
            }, "success"),
            fail: /* @__PURE__ */ __name((err) => {
              console.error("[DouyinCloud] callContainer failed:", {
                config: this.getDebugConfig(),
                error: err
              });
              reject(err);
            }, "fail")
          });
        } catch (error) {
          console.error("[DouyinCloud] callContainer error:", {
            config: this.getDebugConfig(),
            error
          });
          reject(error);
        }
      });
    }
    static resolveCloudResponse(res, resolve, reject) {
      const statusCode = Number(res && res.statusCode);
      if (Number.isFinite(statusCode) && statusCode !== 200) {
        reject(new Error("Cloud request failed, statusCode=" + statusCode));
        return;
      }
      const data = res && res.result || res && res.data || res;
      if (!data) {
        reject(new Error("Cloud function returned empty data."));
        return;
      }
      const code = Number(data.code);
      if (!Number.isFinite(code)) {
        reject(new Error("Cloud function returned invalid code."));
        return;
      }
      if (code !== 0) {
        const message = data.message || "Cloud function failed, code=" + code;
        console.error("[DouyinCloud] business failed:", data);
        reject(new Error(message));
        return;
      }
      resolve(data);
    }
    static isCloudUserAuthError(error) {
      const value = error;
      const errNo = Number(value && value.errNo);
      const message = String(
        value && (value.errMsg || value.message) || error || ""
      ).toLowerCase();
      return errNo === 24001013 || message.indexOf("auth") >= 0 || message.indexOf("login") >= 0 || message.indexOf("user") >= 0;
    }
  };
  __name(_DouyinCloudManager, "DouyinCloudManager");
  _DouyinCloudManager.cloud = null;
  _DouyinCloudManager.ENV_ID = "env-EUnG5g6IM0";
  _DouyinCloudManager.SERVICE_ID = "1mah1688m72uu";
  _DouyinCloudManager.FUNCTION_NAME = "player";
  var DouyinCloudManager = _DouyinCloudManager;

  // src/systems/time/GameTimeService.ts
  var _GameTimeService = class _GameTimeService {
    constructor() {
      this.serverNowMs = 0;
      this.serverReceivedClientMs = 0;
      this.debugNowMs = null;
      this.lastSyncError = "";
    }
    static getInstance() {
      if (!_GameTimeService.instance) {
        _GameTimeService.instance = new _GameTimeService();
      }
      return _GameTimeService.instance;
    }
    syncServerTime() {
      return __async(this, null, function* () {
        try {
          const response = yield DouyinCloudManager.getServerTime();
          const serverTimeMs = Number(response && response.data && response.data.serverTimeMs);
          if (!Number.isFinite(serverTimeMs) || serverTimeMs <= 0) {
            throw new Error("serverTimeMs is invalid");
          }
          this.serverNowMs = serverTimeMs;
          this.serverReceivedClientMs = Date.now();
          this.lastSyncError = "";
          return {
            success: true,
            source: this.getSource(),
            nowMs: this.getNowMs()
          };
        } catch (error) {
          this.lastSyncError = error instanceof Error ? error.message : String(error);
          return {
            success: false,
            source: this.getSource(),
            nowMs: this.getNowMs(),
            error: this.lastSyncError
          };
        }
      });
    }
    getNow() {
      return new Date(this.getNowMs());
    }
    getNowMs() {
      if (this.debugNowMs !== null) {
        return this.debugNowMs;
      }
      if (this.serverNowMs > 0 && this.serverReceivedClientMs > 0) {
        return this.serverNowMs + Math.max(0, Date.now() - this.serverReceivedClientMs);
      }
      return Date.now();
    }
    getTodayKey() {
      return this.getDayKey(this.getNow());
    }
    getSource() {
      if (this.debugNowMs !== null) {
        return "debug";
      }
      return this.serverNowMs > 0 && this.serverReceivedClientMs > 0 ? "server" : "client";
    }
    getLastSyncError() {
      return this.lastSyncError;
    }
    setDebugNow(date) {
      const time = date ? date.getTime() : NaN;
      this.debugNowMs = Number.isFinite(time) ? time : null;
    }
    clearServerTime() {
      this.serverNowMs = 0;
      this.serverReceivedClientMs = 0;
    }
    getDayKey(date) {
      const year = date.getFullYear();
      const month = this.pad2(date.getMonth() + 1);
      const day = this.pad2(date.getDate());
      return `${year}-${month}-${day}`;
    }
    pad2(value) {
      return value < 10 ? `0${value}` : String(value);
    }
  };
  __name(_GameTimeService, "GameTimeService");
  _GameTimeService.instance = null;
  var GameTimeService = _GameTimeService;

  // src/systems/data/SignInManager.ts
  var _SignInManager = class _SignInManager {
    constructor(save) {
      this.save = save;
      this.rewards = this.createDefaultRewards();
    }
    getRewardViews(resolveReward) {
      const data = this.loadOrCreateSaveData();
      const unlockedDay = this.getUnlockedDay(data.startDayKey);
      const claimed = this.toClaimedSet(data.claimedDays);
      const views = [];
      for (let i = 0; i < this.rewards.length; i++) {
        const reward = this.rewards[i];
        const base = resolveReward(reward);
        views.push(__spreadProps(__spreadValues({}, base), {
          state: claimed.has(reward.day) ? "claimed" : reward.day <= unlockedDay ? "claimable" : "locked"
        }));
      }
      return views;
    }
    claim(day) {
      const normalizedDay = Number.isFinite(day) ? Math.floor(day) : 0;
      const reward = this.rewards.find((item) => item.day === normalizedDay) || null;
      if (!reward) {
        return null;
      }
      const data = this.loadOrCreateSaveData();
      const unlockedDay = this.getUnlockedDay(data.startDayKey);
      const claimed = this.toClaimedSet(data.claimedDays);
      if (reward.day > unlockedDay || claimed.has(reward.day)) {
        return null;
      }
      claimed.add(reward.day);
      this.save.saveJson(_SignInManager.STORAGE_KEY, {
        startDayKey: data.startDayKey,
        claimedDays: Array.from(claimed).sort((a, b) => a - b)
      });
      return __spreadValues({}, reward);
    }
    previewUnlock(startDayKey, now) {
      const todayKey = this.getDayKey(now);
      return {
        startDayKey,
        todayKey,
        unlockedDay: this.getUnlockedDayForTodayKey(startDayKey, todayKey)
      };
    }
    getCurrentDayKey() {
      return this.getTodayKey();
    }
    syncTimeSource() {
      return __async(this, null, function* () {
        yield GameTimeService.getInstance().syncServerTime();
      });
    }
    loadOrCreateSaveData() {
      const todayKey = this.getTodayKey();
      const stored = this.save.loadJson(_SignInManager.STORAGE_KEY);
      if (stored && typeof stored.startDayKey === "string" && Array.isArray(stored.claimedDays)) {
        return {
          startDayKey: stored.startDayKey,
          claimedDays: stored.claimedDays.map((day) => Math.floor(Number(day))).filter((day) => Number.isFinite(day) && day > 0)
        };
      }
      const next = {
        startDayKey: todayKey,
        claimedDays: []
      };
      this.save.saveJson(_SignInManager.STORAGE_KEY, next);
      return next;
    }
    getUnlockedDay(startDayKey) {
      return this.getUnlockedDayForTodayKey(startDayKey, this.getTodayKey());
    }
    getUnlockedDayForTodayKey(startDayKey, todayKey) {
      const start = this.parseDayKey(startDayKey);
      const today = this.parseDayKey(todayKey);
      if (!start || !today) {
        return 1;
      }
      const elapsedDays = Math.floor((today.getTime() - start.getTime()) / _SignInManager.DAY_MS);
      return Math.max(1, Math.min(this.rewards.length, elapsedDays + 1));
    }
    getTodayKey() {
      return GameTimeService.getInstance().getTodayKey();
    }
    getDayKey(date) {
      const year = date.getFullYear();
      const month = this.pad2(date.getMonth() + 1);
      const day = this.pad2(date.getDate());
      return `${year}-${month}-${day}`;
    }
    pad2(value) {
      return value < 10 ? `0${value}` : String(value);
    }
    parseDayKey(dayKey) {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
      if (!match) {
        return null;
      }
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }
    toClaimedSet(days) {
      const claimed = /* @__PURE__ */ new Set();
      for (let i = 0; i < days.length; i++) {
        const day = Math.floor(Number(days[i]));
        if (Number.isFinite(day) && day > 0 && day <= this.rewards.length) {
          claimed.add(day);
        }
      }
      return claimed;
    }
    createDefaultRewards() {
      const cycle = [
        { itemId: "wood", name: "木头", count: 20 },
        { itemId: "grass", name: "草", count: 20 },
        { itemId: "xiaoshuzhi", name: "小树枝", count: 12 },
        { itemId: "food_material_01", name: "食物", count: 5 },
        { itemId: "common_material_02", name: "石头", count: 15 },
        { itemId: "iron", name: "铁", count: 6 },
        { itemId: "mutant_blood_1", name: "变异血", count: 1 }
      ];
      const rewards = [];
      for (let day = 1; day <= 31; day++) {
        const base = cycle[(day - 1) % cycle.length];
        const week = Math.floor((day - 1) / cycle.length);
        rewards.push({
          day,
          itemId: base.itemId,
          name: base.name,
          count: Math.max(1, base.count + week * 2),
          icon: base.icon
        });
      }
      return rewards;
    }
  };
  __name(_SignInManager, "SignInManager");
  _SignInManager.STORAGE_KEY = "laya_test_sign_in_v1";
  _SignInManager.DAY_MS = 24 * 60 * 60 * 1e3;
  var SignInManager = _SignInManager;

  // src/systems/data/WarehouseManager.ts
  var _WarehouseManager = class _WarehouseManager {
    constructor(saveManager) {
      this.saveManager = saveManager;
      this.items = [];
      this.slotCount = _WarehouseManager.DEFAULT_SLOT_COUNT;
      this.stackMaxResolver = null;
      this.itemNormalizer = null;
    }
    setStackMaxResolver(resolver) {
      this.stackMaxResolver = resolver;
    }
    setItemNormalizer(normalizer) {
      this.itemNormalizer = normalizer;
    }
    load() {
      const items = this.saveManager.loadInventory(_WarehouseManager.STORAGE_KEY);
      const meta = this.saveManager.loadJson(_WarehouseManager.META_STORAGE_KEY);
      this.slotCount = this.normalizeSlotCount(meta && meta.slotCount);
      this.items.length = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        this.items.push(item ? this.normalizeItem(item) : null);
      }
      this.normalizeStacks();
      this.save();
    }
    getSlotCount() {
      return this.slotCount;
    }
    setSlotCount(count) {
      const nextCount = this.normalizeSlotCount(count);
      if (this.slotCount === nextCount) {
        return;
      }
      this.slotCount = nextCount;
      this.saveMeta();
    }
    getSnapshot() {
      const snapshot = this.items.map((item) => item ? __spreadValues({}, item) : null);
      while (snapshot.length < this.slotCount) {
        snapshot.push(null);
      }
      return snapshot;
    }
    getItemCount(itemId) {
      const normalizedItemId = String(itemId || "").trim();
      if (!normalizedItemId) {
        return 0;
      }
      let count = 0;
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item && item.itemId === normalizedItemId) {
          count += Math.max(0, Math.floor(item.count || 0));
        }
      }
      return count;
    }
    consumeItem(itemId, count) {
      const normalizedItemId = String(itemId || "").trim();
      let remaining = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
      if (!normalizedItemId || remaining <= 0) {
        return 0;
      }
      let consumed = 0;
      for (let i = 0; i < this.items.length && remaining > 0; i++) {
        const item = this.items[i];
        if (!item || item.itemId !== normalizedItemId) {
          continue;
        }
        const available = Math.max(0, Math.floor(item.count || 0));
        const used = Math.min(available, remaining);
        if (used <= 0) {
          continue;
        }
        item.count = available - used;
        if (item.count <= 0) {
          this.items[i] = null;
        }
        remaining -= used;
        consumed += used;
      }
      if (consumed > 0) {
        this.save();
      }
      return consumed;
    }
    addItem(item, targetSlotIndex) {
      if (!item.itemId) {
        return false;
      }
      item = this.normalizeItem(item);
      const itemId = item.itemId || "";
      if (!itemId) {
        return false;
      }
      const normalizedTarget = this.normalizeSlotIndex(targetSlotIndex);
      if (normalizedTarget !== null) {
        if (!this.canPlaceItemAt(normalizedTarget, itemId)) {
          return false;
        }
        this.placeItemAt(normalizedTarget, item);
        this.save();
        return true;
      }
      let remaining = Math.max(0, Math.floor(item.count || 0));
      while (remaining > 0) {
        remaining = this.mergeIntoExistingSlots(__spreadProps(__spreadValues({}, item), { count: remaining }));
        if (remaining <= 0) {
          this.save();
          return true;
        }
        const stackMax = this.getStackMax(itemId);
        const placedCount = Math.min(remaining, stackMax);
        const emptyIndex = this.findEmptySlotIndex();
        if (emptyIndex < 0) {
          this.save();
          return false;
        }
        this.placeItemAt(emptyIndex, __spreadProps(__spreadValues({}, item), { count: placedCount }));
        remaining -= placedCount;
      }
      this.save();
      return true;
    }
    canAddItems(items) {
      const incoming = Array.isArray(items) ? items.filter((item) => item && !!item.itemId && Number.isFinite(item.count) && item.count > 0) : [];
      if (incoming.length === 0) {
        return true;
      }
      const slotCountsByItemId = /* @__PURE__ */ new Map();
      const limit = Math.max(0, this.slotCount);
      for (let i = 0; i < Math.min(this.items.length, limit); i++) {
        const item = this.items[i];
        if (!item || !item.itemId) {
          continue;
        }
        const itemId = item.itemId;
        const counts = slotCountsByItemId.get(itemId) || [];
        counts.push(Math.max(0, Math.floor(item.count || 0)));
        slotCountsByItemId.set(itemId, counts);
      }
      let usedSlots = 0;
      slotCountsByItemId.forEach((counts) => {
        usedSlots += counts.length;
      });
      for (let i = 0; i < incoming.length; i++) {
        const itemId = incoming[i].itemId || "";
        let remaining = Math.max(0, Math.floor(incoming[i].count || 0));
        if (!itemId || remaining <= 0) {
          continue;
        }
        const stackMax = this.getStackMax(itemId);
        const counts = slotCountsByItemId.get(itemId) || [];
        for (let slotIndex = 0; slotIndex < counts.length && remaining > 0; slotIndex++) {
          const capacity = Math.max(0, stackMax - counts[slotIndex]);
          const filled = Math.min(capacity, remaining);
          counts[slotIndex] += filled;
          remaining -= filled;
        }
        while (remaining > 0) {
          if (usedSlots >= limit) {
            return false;
          }
          const placed = Math.min(stackMax, remaining);
          counts.push(placed);
          usedSlots += 1;
          remaining -= placed;
        }
        slotCountsByItemId.set(itemId, counts);
      }
      return true;
    }
    removeItem(itemId) {
      const index = this.findItemIndex(itemId);
      if (index < 0) {
        return null;
      }
      const item = this.items[index];
      if (!item) {
        return null;
      }
      this.items[index] = null;
      this.save();
      return __spreadValues({}, item);
    }
    moveSlot(sourceSlotIndex, targetSlotIndex) {
      const sourceIndex = this.normalizeSlotIndex(sourceSlotIndex);
      const targetIndex = this.normalizeSlotIndex(targetSlotIndex);
      if (sourceIndex === null || targetIndex === null || sourceIndex === targetIndex) {
        return false;
      }
      if (sourceIndex >= this.slotCount || targetIndex >= this.slotCount) {
        return false;
      }
      while (this.items.length <= Math.max(sourceIndex, targetIndex)) {
        this.items.push(null);
      }
      const sourceItem = this.items[sourceIndex];
      if (!sourceItem) {
        return false;
      }
      this.items[sourceIndex] = this.items[targetIndex] || null;
      this.items[targetIndex] = sourceItem;
      this.save();
      return true;
    }
    canPlaceItemAt(slotIndex, itemId) {
      const index = this.normalizeSlotIndex(slotIndex);
      if (index === null) {
        return false;
      }
      const slot = this.items[index] || null;
      if (!slot) {
        return true;
      }
      if (slot.itemId !== itemId || this.getStackMax(itemId) <= 1) {
        return false;
      }
      return Math.max(0, Math.floor(slot.count || 0)) < this.getStackMax(itemId);
    }
    mergeIntoExistingSlots(item) {
      const itemId = item.itemId || "";
      const stackMax = this.getStackMax(itemId);
      let remaining = Math.max(0, Math.floor(item.count || 0));
      if (!itemId || stackMax <= 1) {
        return remaining;
      }
      for (let i = 0; i < this.items.length && remaining > 0; i++) {
        const existing = this.items[i];
        if (!existing || existing.itemId !== itemId) {
          continue;
        }
        const currentCount = Math.max(0, Math.floor(existing.count || 0));
        const capacity = Math.max(0, stackMax - currentCount);
        if (capacity <= 0) {
          continue;
        }
        const added = Math.min(capacity, remaining);
        existing.count = currentCount + added;
        remaining -= added;
        if (!existing.icon && item.icon) {
          existing.icon = item.icon;
        }
        if (!existing.name && item.name) {
          existing.name = item.name;
        }
      }
      return remaining;
    }
    save() {
      this.saveManager.saveInventory(_WarehouseManager.STORAGE_KEY, this.items);
      this.saveMeta();
    }
    normalizeStacks() {
      const normalized = [];
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i] ? this.normalizeItem(this.items[i]) : null;
        if (!item || !item.itemId) {
          normalized.push(null);
          continue;
        }
        let remaining = Math.max(0, Math.floor(item.count || 0));
        const stackMax = this.getStackMax(item.itemId);
        while (remaining > 0) {
          const count = Math.min(stackMax, remaining);
          normalized.push({
            itemId: item.itemId,
            name: item.name,
            count,
            icon: item.icon
          });
          remaining -= count;
        }
      }
      this.items.length = 0;
      for (let i = 0; i < normalized.length; i++) {
        this.items.push(normalized[i]);
      }
    }
    saveMeta() {
      this.saveManager.saveJson(_WarehouseManager.META_STORAGE_KEY, {
        slotCount: this.slotCount
      });
    }
    findItemIndex(itemId) {
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (item && item.itemId === itemId) {
          return i;
        }
      }
      return -1;
    }
    findEmptySlotIndex() {
      for (let i = 0; i < this.slotCount; i++) {
        if (!this.items[i]) {
          return i;
        }
      }
      return -1;
    }
    placeItemAt(slotIndex, item) {
      const normalized = this.normalizeSlotIndex(slotIndex);
      if (normalized === null) {
        return;
      }
      if (normalized >= this.slotCount) {
        return;
      }
      while (this.items.length <= normalized) {
        this.items.push(null);
      }
      const current = this.items[normalized];
      if (current && current.itemId === item.itemId && this.getStackMax(item.itemId || "") > 1) {
        const stackMax = this.getStackMax(item.itemId || "");
        current.count = Math.min(stackMax, Math.max(0, Math.floor(current.count || 0)) + Math.max(0, Math.floor(item.count || 0)));
        if (!current.icon && item.icon) {
          current.icon = item.icon;
        }
        if (!current.name && item.name) {
          current.name = item.name;
        }
        return;
      }
      this.items[normalized] = __spreadValues({}, item);
    }
    getStackMax(itemId) {
      const resolved = this.stackMaxResolver ? this.stackMaxResolver(itemId) : Number.MAX_SAFE_INTEGER;
      if (!Number.isFinite(resolved)) {
        return Number.MAX_SAFE_INTEGER;
      }
      return Math.max(1, Math.floor(resolved));
    }
    normalizeItem(item) {
      const normalized = this.itemNormalizer ? this.itemNormalizer(__spreadValues({}, item)) : __spreadValues({}, item);
      return {
        itemId: normalized.itemId,
        name: normalized.name,
        count: Math.max(0, Math.floor(normalized.count || 0)),
        icon: normalized.icon
      };
    }
    normalizeSlotIndex(slotIndex) {
      if (slotIndex === void 0 || slotIndex === null || !Number.isFinite(slotIndex)) {
        return null;
      }
      const normalized = Math.floor(slotIndex);
      return normalized >= 0 ? normalized : null;
    }
    normalizeSlotCount(count) {
      if (!Number.isFinite(Number(count))) {
        return _WarehouseManager.DEFAULT_SLOT_COUNT;
      }
      const normalized = Math.floor(Number(count));
      return normalized >= _WarehouseManager.DEFAULT_SLOT_COUNT ? normalized : _WarehouseManager.DEFAULT_SLOT_COUNT;
    }
  };
  __name(_WarehouseManager, "WarehouseManager");
  _WarehouseManager.STORAGE_KEY = "laya_test_warehouse_inventory_v1";
  _WarehouseManager.META_STORAGE_KEY = "laya_test_warehouse_meta_v1";
  _WarehouseManager.PAGE_SIZE = 30;
  _WarehouseManager.PAGE_COUNT = 7;
  _WarehouseManager.DEFAULT_SLOT_COUNT = _WarehouseManager.PAGE_SIZE * _WarehouseManager.PAGE_COUNT;
  var WarehouseManager = _WarehouseManager;

  // src/systems/datamanager.ts
  var _DataManager = class _DataManager {
    constructor() {
      this.items = new ItemDataManager();
      this.save = new SaveManager();
      this.inventory = new InventoryManager(this.save);
      this.warehouse = new WarehouseManager(this.save);
      this.harvest = new HarvestManager(this.items);
      this.crafting = new CraftingManager();
      this.quickMake = new QuickMakeManager();
      this.signIn = new SignInManager(this.save);
      this.playerStats = new PlayerStatsManager(this.save, _DataManager.PLAYER_STATS_STORAGE_KEY, () => this.inventory.refreshBagViews());
      this.quickSlots = new QuickSlotManager(this, _DataManager.QUICK_SLOT_STORAGE_KEY);
      this.warehouseViews = /* @__PURE__ */ new Set();
      this.equippedItems = {
        insertPlate: null,
        helmet: null,
        weapon: null,
        armor: null
      };
      this.loaded = false;
      this.loading = false;
      this.inventory.setStackMaxResolver((itemId) => this.resolveItemStackMax(itemId));
      this.inventory.setItemNormalizer((item) => this.normalizeInventoryItem(item));
      this.inventory.setSortPriorityResolver((item) => this.resolveInventorySortPriority(item));
      this.warehouse.setStackMaxResolver((itemId) => this.resolveItemStackMax(itemId));
      this.warehouse.setItemNormalizer((item) => this.normalizeInventoryItem(item));
    }
    static getInstance() {
      if (!_DataManager.instance) {
        _DataManager.instance = new _DataManager();
      }
      return _DataManager.instance;
    }
    loadAll() {
      return __async(this, null, function* () {
        this.resetDevelopmentSaveOnStartup();
        if (this.loaded) {
          this.inventory.loadPersistedInventories();
          this.warehouse.load();
          this.loadEquipment();
          this.playerStats.load();
          this.quickSlots.load();
          this.ensureStarterItems();
          return;
        }
        if (this.loading) {
          yield this.waitForLoadComplete();
          return;
        }
        this.loading = true;
        try {
          const [materials, foods, weapons, misc, medicines, harvest] = yield Promise.all([
            this.loadJson("config/items/materials.json", "assets/config/items/materials.json"),
            this.loadJson("config/items/foods.json", "assets/config/items/foods.json"),
            this.loadJson("config/items/weapons.json", "assets/config/items/weapons.json"),
            this.loadJson("config/items/misc.json", "assets/config/items/misc.json"),
            this.loadJson("config/items/medicines.json", "assets/config/items/medicines.json"),
            this.loadJson("config/harvest/drops.json", "assets/config/harvest/drops.json")
          ]);
          this.items.registerItemTable(materials);
          this.items.registerItemTable(foods);
          this.items.registerItemTable(weapons);
          this.items.registerItemTable(misc);
          this.items.registerItemTable(medicines);
          this.harvest.registerHarvestTable(harvest);
          this.inventory.loadPersistedInventories();
          this.warehouse.load();
          this.loadEquipment();
          this.playerStats.load();
          this.quickSlots.load();
          this.loaded = true;
          this.ensureStarterItems();
        } finally {
          this.loading = false;
        }
      });
    }
    enterScene(sceneUrl) {
      this.inventory.enterScene(sceneUrl);
      if (this.loaded) {
        this.ensureStarterItems();
      }
    }
    returnToBaseAfterDeath(sceneUrl) {
      const stats = this.playerStats.getSnapshot();
      this.playerStats.setHp(stats.maxHp, stats.maxHp);
      this.playerStats.setStamina(stats.maxStamina, stats.maxStamina);
      this.inventory.returnToBaseAfterDeath(sceneUrl);
      this.clearQuickSlots();
    }
    getCurrentScope() {
      return this.inventory.getCurrentScope();
    }
    getPlayerBagSlotCount() {
      return this.inventory.getPlayerBagSlotCount();
    }
    setPlayerBagSlotCount(count) {
      this.inventory.setPlayerBagSlotCount(count);
    }
    getWarehouseSlotCount() {
      return this.warehouse.getSlotCount();
    }
    setWarehouseSlotCount(count) {
      this.warehouse.setSlotCount(count);
    }
    getHarvestDrops(harvestId, fallback = []) {
      return this.harvest.getHarvestDrops(harvestId, fallback);
    }
    rollHarvestDrops(harvestId, fallback = []) {
      return this.harvest.rollHarvestDrops(harvestId, fallback);
    }
    grantHarvestDrops(harvestId, fallback = []) {
      const results = this.harvest.rollHarvestDrops(harvestId, fallback);
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        this.inventory.addItemToActive(result.itemId, result.name, result.count, result.icon);
      }
      this.refreshQuickSlotViews();
      return results;
    }
    grantItemsToActive(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
          continue;
        }
        const meta = this.resolveItemMeta(item.itemId);
        const icon = item.icon || (meta == null ? void 0 : meta.icon) || this.items.resolveFallbackIcon(item.itemId);
        const name = this.resolveDisplayName(item.itemId, item.name);
        this.inventory.addItemToActive(item.itemId, name, item.count, icon);
      }
      this.refreshQuickSlotViews();
    }
    canGrantItemsToActive(items) {
      return this.inventory.canAddItems(this.resolveWarehouseGrantItems(items));
    }
    grantItemsToActiveIfSpace(items) {
      const resolvedItems = this.resolveWarehouseGrantItems(items);
      if (!this.inventory.canAddItems(resolvedItems)) {
        return false;
      }
      for (let i = 0; i < resolvedItems.length; i++) {
        const item = resolvedItems[i];
        this.inventory.addItemToActive(item.itemId, item.name, item.count, item.icon);
      }
      this.refreshQuickSlotViews();
      return true;
    }
    canGrantItemsToWarehouse(items) {
      return this.warehouse.canAddItems(this.resolveWarehouseGrantItems(items));
    }
    grantItemsToWarehouse(items) {
      const resolvedItems = this.resolveWarehouseGrantItems(items);
      if (!this.warehouse.canAddItems(resolvedItems)) {
        return false;
      }
      for (let i = 0; i < resolvedItems.length; i++) {
        this.warehouse.addItem(resolvedItems[i]);
      }
      this.syncWarehouseViews();
      this.clearQuickSlotsForMissingItems();
      return true;
    }
    resolveWarehouseGrantItems(items) {
      const resolvedItems = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
          continue;
        }
        const meta = this.resolveItemMeta(item.itemId);
        resolvedItems.push({
          itemId: item.itemId,
          name: this.resolveDisplayName(item.itemId, item.name),
          count: Math.floor(item.count),
          icon: item.icon || (meta == null ? void 0 : meta.icon) || this.items.resolveFallbackIcon(item.itemId)
        });
      }
      return resolvedItems;
    }
    formatHarvestResults(results) {
      return this.harvest.formatHarvestResults(results);
    }
    getPlayerStats() {
      return this.playerStats.getSnapshot();
    }
    setPlayerHp(currentHp, maxHp = this.playerStats.getSnapshot().maxHp) {
      this.playerStats.setHp(currentHp, maxHp);
    }
    discardActiveSlot(slotIndex) {
      const removed = this.inventory.removeActiveSlot(slotIndex);
      if (removed == null ? void 0 : removed.itemId) {
        this.clearQuickSlotsForMissingItems();
      }
      return !!removed;
    }
    canSplitActiveSlot(slotIndex) {
      return this.inventory.canSplitActiveSlot(slotIndex);
    }
    splitActiveSlot(slotIndex) {
      return this.inventory.splitActiveSlot(slotIndex);
    }
    organizeActiveInventory() {
      this.inventory.organizeActiveInventory();
      this.clearQuickSlotsForMissingItems();
    }
    useActiveItemAtSlot(slotIndex) {
      const snapshot = this.inventory.getInventorySnapshot();
      const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
      const item = index >= 0 ? snapshot[index] : null;
      const itemId = String((item == null ? void 0 : item.itemId) || "");
      if (!item || !itemId || !this.canUseItem(itemId)) {
        return false;
      }
      const consumed = this.inventory.consumeActiveSlotItem(index, 1);
      if (!consumed) {
        return false;
      }
      this.applyItemUseStats(consumed.itemId || "");
      this.clearQuickSlotsForMissingItems();
      return true;
    }
    canUseItem(itemId) {
      const meta = this.resolveItemMeta(itemId);
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      return category === "foods" || category === "medicines" || subCategory.includes("food") || subCategory.includes("medicine") || itemId === "bandage" || itemId === "kangfuyao";
    }
    setPlayerStamina(currentStamina, maxStamina = this.playerStats.getSnapshot().maxStamina) {
      this.playerStats.setStamina(currentStamina, maxStamina);
    }
    setPlayerSurvivalStats(currentSatiety, currentHydration, maxSatiety = this.playerStats.getSnapshot().maxSatiety, maxHydration = this.playerStats.getSnapshot().maxHydration) {
      this.playerStats.setSurvivalStats(currentSatiety, currentHydration, maxSatiety, maxHydration);
    }
    applyItemUseStats(itemId) {
      const normalizedItemId = String(itemId || "").trim();
      if (!normalizedItemId) {
        return;
      }
      const meta = this.resolveItemMeta(normalizedItemId);
      const stats = this.getPlayerStats();
      const healAmount = this.resolveUseHealAmount(normalizedItemId);
      const satietyAmount = Number.isFinite(meta == null ? void 0 : meta.satiety) ? Math.max(0, Math.floor(meta.satiety)) : 0;
      const hydrationAmount = Number.isFinite(meta == null ? void 0 : meta.hydration) ? Math.max(0, Math.floor(meta.hydration)) : 0;
      if (healAmount > 0) {
        this.setPlayerHp(stats.currentHp + healAmount, stats.maxHp);
      }
      if (satietyAmount > 0 || hydrationAmount > 0) {
        this.setPlayerSurvivalStats(
          stats.currentSatiety + satietyAmount,
          stats.currentHydration + hydrationAmount,
          stats.maxSatiety,
          stats.maxHydration
        );
      }
    }
    grantGatherExperience() {
      this.playerStats.grantGatherExperience();
    }
    grantEnemyDefeatExperience() {
      this.playerStats.grantEnemyDefeatExperience();
    }
    grantPlayerExperience(amount) {
      this.playerStats.grantExperience(amount);
    }
    getInventorySnapshot(bucket = "active") {
      return bucket === "warehouse" ? this.warehouse.getSnapshot() : this.inventory.getInventorySnapshot();
    }
    getQuickSlotItems() {
      return this.quickSlots.getItems();
    }
    canAssignItemToQuickSlot(itemId) {
      return this.quickSlots.canAssignItem(itemId);
    }
    assignActiveItemToQuickSlot(quickSlotIndex, itemId) {
      return this.quickSlots.assignActiveItem(quickSlotIndex, itemId);
    }
    assignActiveSlotToQuickSlot(quickSlotIndex, activeSlotIndex) {
      return this.quickSlots.assignActiveSlot(quickSlotIndex, activeSlotIndex);
    }
    clearQuickSlot(quickSlotIndex) {
      return this.quickSlots.clear(quickSlotIndex);
    }
    moveQuickSlot(sourceQuickSlotIndex, targetQuickSlotIndex) {
      return this.quickSlots.move(sourceQuickSlotIndex, targetQuickSlotIndex);
    }
    moveQuickSlotToActiveSlot(sourceQuickSlotIndex, targetActiveSlotIndex) {
      return this.quickSlots.moveToActiveSlot(sourceQuickSlotIndex, targetActiveSlotIndex);
    }
    moveQuickSlotToEquipment(sourceQuickSlotIndex, targetSlot) {
      return this.quickSlots.moveToEquipment(sourceQuickSlotIndex, targetSlot);
    }
    activateQuickSlot(quickSlotIndex) {
      return this.quickSlots.activate(quickSlotIndex);
    }
    getWarehouseSnapshot() {
      return this.warehouse.getSnapshot();
    }
    getAvailableItemCount(itemId) {
      return this.inventory.getItemCount(itemId) + this.warehouse.getItemCount(itemId);
    }
    getSignInRewards() {
      return this.signIn.getRewardViews((reward) => this.resolveSignInRewardView(reward));
    }
    previewSignInUnlock(startDayKey, now) {
      return this.signIn.previewUnlock(startDayKey, now);
    }
    getCurrentSignInDayKey() {
      return this.signIn.getCurrentDayKey();
    }
    syncSignInTimeSource() {
      return __async(this, null, function* () {
        yield this.signIn.syncTimeSource();
      });
    }
    getCraftingRecipes(station) {
      return this.crafting.getRecipesByStation(station).map((recipe) => this.resolveCraftingRecipe(recipe));
    }
    getCraftingRecipe(recipeId) {
      const recipe = this.crafting.getRecipe(recipeId);
      return recipe ? this.resolveCraftingRecipe(recipe) : null;
    }
    getQuickMakeRecipes() {
      return this.quickMake.getRecipes().map((recipe) => this.resolveQuickMakeRecipe(recipe));
    }
    getQuickMakeRecipe(recipeId) {
      const recipe = this.quickMake.getRecipe(recipeId);
      return recipe ? this.resolveQuickMakeRecipe(recipe) : null;
    }
    canQuickMakeToWarehouse(recipeId) {
      const recipe = this.getQuickMakeRecipe(recipeId);
      if (!recipe) {
        return false;
      }
      return this.canRecipeToActivePreferred(recipe);
    }
    quickMakeToWarehouse(recipeId) {
      const recipe = this.getQuickMakeRecipe(recipeId);
      if (!recipe) {
        return { success: false, message: "配方不存在" };
      }
      return this.makeRecipeToActivePreferred(recipe);
    }
    canCraftToWarehouse(recipeId) {
      const recipe = this.getCraftingRecipe(recipeId);
      if (!recipe) {
        return false;
      }
      return this.canRecipeToWarehouse(recipe);
    }
    craftToWarehouse(recipeId) {
      const recipe = this.getCraftingRecipe(recipeId);
      if (!recipe) {
        return { success: false, message: "配方不存在" };
      }
      return this.makeRecipeToWarehouse(recipe);
    }
    canRecipeToWarehouse(recipe) {
      if (!recipe) {
        return false;
      }
      return this.hasIngredientsInActiveAndWarehouse(recipe.inputs) && this.canGrantItemsToWarehouse([recipe.output]);
    }
    canRecipeToActivePreferred(recipe) {
      if (!recipe) {
        return false;
      }
      return this.hasIngredientsInActiveAndWarehouse(recipe.inputs) && (this.canGrantItemsToActive([recipe.output]) || this.canGrantItemsToWarehouse([recipe.output]));
    }
    makeRecipeToActivePreferred(recipe) {
      if (!recipe) {
        return { success: false, message: "配方不存在" };
      }
      if (!this.hasIngredientsInActiveAndWarehouse(recipe.inputs)) {
        return { success: false, message: "材料不足，不进行制造" };
      }
      if (!this.canGrantItemsToActive([recipe.output]) && !this.canGrantItemsToWarehouse([recipe.output])) {
        return { success: false, message: "背包和仓库空间不足" };
      }
      if (!this.consumeIngredientsFromActiveAndWarehouse(recipe.inputs)) {
        return { success: false, message: "材料不足，不进行制造" };
      }
      if (!this.grantItemsToActiveIfSpace([recipe.output]) && !this.grantItemsToWarehouse([recipe.output])) {
        return { success: false, message: "背包和仓库空间不足" };
      }
      return {
        success: true,
        message: `获得${recipe.output.name || recipe.output.itemId}*${Math.max(0, Math.floor(recipe.output.count || 0))}`
      };
    }
    makeRecipeToWarehouse(recipe) {
      if (!recipe) {
        return { success: false, message: "配方不存在" };
      }
      if (!this.hasIngredientsInActiveAndWarehouse(recipe.inputs)) {
        return { success: false, message: "材料不足，不进行制造" };
      }
      if (!this.canGrantItemsToWarehouse([recipe.output])) {
        return { success: false, message: "仓库空间不足" };
      }
      if (!this.consumeIngredientsFromActiveAndWarehouse(recipe.inputs)) {
        return { success: false, message: "材料不足，不进行制造" };
      }
      if (!this.grantItemsToWarehouse([recipe.output])) {
        return { success: false, message: "仓库空间不足" };
      }
      return {
        success: true,
        message: `获得${recipe.output.name || recipe.output.itemId}*${Math.max(0, Math.floor(recipe.output.count || 0))}`
      };
    }
    claimSignInReward(day) {
      const reward = this.signIn.claim(day);
      if (!reward) {
        return false;
      }
      const resolved = this.resolveSignInRewardView(reward);
      MailManager.getInstance().addSignInRewardMail(resolved.day, [
        {
          itemId: resolved.itemId,
          name: resolved.name,
          count: resolved.count,
          icon: resolved.icon
        }
      ]);
      return true;
    }
    registerBagView(view) {
      this.inventory.registerBagView(view);
      if (!this.loaded) {
        void this.loadAll();
      }
    }
    unregisterBagView(view) {
      this.inventory.unregisterBagView(view);
    }
    registerQuickSlotView(view) {
      this.quickSlots.registerView(view);
      if (!this.loaded) {
        void this.loadAll();
      }
    }
    unregisterQuickSlotView(view) {
      this.quickSlots.unregisterView(view);
    }
    registerWarehouseView(view) {
      this.warehouseViews.add(view);
      view.refresh();
    }
    unregisterWarehouseView(view) {
      this.warehouseViews.delete(view);
    }
    resolveItemMeta(itemId) {
      return this.items.resolveItemMeta(itemId);
    }
    resolveItemStackMax(itemId) {
      const meta = this.resolveItemMeta(itemId);
      if (meta && Number.isFinite(meta.stackMax)) {
        return Math.max(1, Math.floor(meta.stackMax || 1));
      }
      return Number.MAX_SAFE_INTEGER;
    }
    resolveFallbackIcon(itemId) {
      return this.items.resolveFallbackIcon(itemId);
    }
    resolveFallbackName(itemId) {
      return this.items.resolveFallbackName(itemId);
    }
    normalizeInventoryItem(item) {
      const itemId = this.resolveCanonicalItemId(item.itemId || "");
      const meta = this.resolveItemMeta(itemId);
      return {
        itemId,
        name: this.resolveDisplayName(itemId, item.name),
        count: item.count,
        icon: item.icon || (meta == null ? void 0 : meta.icon) || this.resolveFallbackIcon(itemId)
      };
    }
    resolveCanonicalItemId(itemId) {
      const normalizedItemId = String(itemId || "").trim();
      if (normalizedItemId === "common_material_04") {
        return "grass";
      }
      return normalizedItemId;
    }
    resolveInventorySortPriority(item) {
      const itemId = this.resolveCanonicalItemId(item.itemId || "");
      const meta = this.resolveItemMeta(itemId);
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      if (category === "weapons" || subCategory.includes("weapon") || subCategory.includes("melee") || Number.isFinite(meta == null ? void 0 : meta.attackPower) || Number.isFinite(meta == null ? void 0 : meta.attackSpeed)) {
        return 0;
      }
      if (category.includes("armor") || category.includes("helmet") || category.includes("plate") || subCategory.includes("armor") || subCategory.includes("helmet") || subCategory.includes("plate") || subCategory.includes("insert") || subCategory.includes("body") || subCategory.includes("head")) {
        return 1;
      }
      if (category === "medicines" || subCategory.includes("medicine")) {
        return 2;
      }
      if (category === "foods" || subCategory.includes("food")) {
        return 3;
      }
      if (category === "materials" || subCategory.includes("material")) {
        return 4;
      }
      if (category === "misc") {
        return 5;
      }
      return 6;
    }
    getEquippedItem(slot) {
      const item = this.equippedItems[slot] || null;
      return item ? __spreadValues({}, item) : null;
    }
    getEquippedItems() {
      return {
        insertPlate: this.getEquippedItem("insertPlate"),
        helmet: this.getEquippedItem("helmet"),
        weapon: this.getEquippedItem("weapon"),
        armor: this.getEquippedItem("armor")
      };
    }
    canEquipItemToSlot(itemId, slot) {
      const meta = this.resolveItemMeta(itemId);
      if (!meta) {
        return false;
      }
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      if (slot === "weapon") {
        return category === "weapons" || subCategory.includes("weapon") || subCategory.includes("melee") || Number.isFinite(meta.attackPower) || Number.isFinite(meta.attackSpeed);
      }
      if (slot === "insertPlate") {
        return category.includes("plate") || subCategory.includes("plate") || subCategory.includes("insert");
      }
      if (slot === "helmet") {
        return category.includes("helmet") || subCategory.includes("helmet") || subCategory.includes("head");
      }
      if (slot === "armor") {
        return category.includes("armor") || subCategory.includes("armor") || subCategory.includes("body");
      }
      return false;
    }
    resolveEquipmentSlotForItem(itemId) {
      const slots = ["weapon", "insertPlate", "helmet", "armor"];
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (this.canEquipItemToSlot(itemId, slot)) {
          return slot;
        }
      }
      return null;
    }
    equipItemFromActive(slot, itemId) {
      var _a;
      if (!this.canEquipItemToSlot(itemId, slot)) {
        return false;
      }
      const nextItem = this.inventory.removeItemFromActive(itemId);
      if (!nextItem || !nextItem.itemId) {
        return false;
      }
      const previousItem = this.equippedItems[slot];
      this.equippedItems[slot] = {
        itemId: nextItem.itemId,
        name: this.resolveDisplayName(nextItem.itemId, nextItem.name),
        count: 1,
        icon: nextItem.icon || ((_a = this.resolveItemMeta(nextItem.itemId)) == null ? void 0 : _a.icon) || this.resolveFallbackIcon(nextItem.itemId)
      };
      if (previousItem) {
        this.inventory.addItemToActive(previousItem.itemId, previousItem.name, previousItem.count, previousItem.icon);
      }
      this.saveEquipment();
      this.clearQuickSlotsForMissingItems();
      return true;
    }
    resolveUseHealAmount(itemId) {
      const normalizedItemId = String(itemId || "").trim();
      const meta = this.resolveItemMeta(normalizedItemId);
      const useEffect = meta == null ? void 0 : meta.useEffect;
      if (useEffect && useEffect.type === "healHp" && Number.isFinite(useEffect.amount)) {
        return Math.max(0, Math.floor(useEffect.amount || 0));
      }
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      if (category === "foods") {
        return 10;
      }
      return 0;
    }
    unequipItemToActive(slot) {
      const item = this.equippedItems[slot];
      if (!item) {
        return false;
      }
      this.equippedItems[slot] = null;
      this.inventory.addItemToActive(item.itemId, item.name, item.count, item.icon);
      this.saveEquipment();
      this.refreshQuickSlotViews();
      return true;
    }
    getEquipmentAttackBonus() {
      var _a;
      const weapon = this.equippedItems.weapon;
      if (!weapon) {
        return 0;
      }
      return ((_a = this.resolveItemMeta(weapon.itemId)) == null ? void 0 : _a.attackPower) || 0;
    }
    getEquipmentDefenseBonus() {
      var _a;
      const slots = ["insertPlate", "helmet", "armor"];
      let totalDefense = 0;
      for (let i = 0; i < slots.length; i++) {
        const item = this.equippedItems[slots[i]];
        const defense = item ? (_a = this.resolveItemMeta(item.itemId)) == null ? void 0 : _a.defense : 0;
        if (Number.isFinite(defense)) {
          totalDefense += Math.max(0, Math.floor(defense));
        }
      }
      return totalDefense;
    }
    getEquipmentAttackSpeed() {
      var _a;
      const weapon = this.equippedItems.weapon;
      if (!weapon) {
        return 1;
      }
      return Math.max(0.1, ((_a = this.resolveItemMeta(weapon.itemId)) == null ? void 0 : _a.attackSpeed) || 1);
    }
    getEquipmentBulletSpeed(fallbackSpeed) {
      var _a;
      const fallback = Math.max(1, Number(fallbackSpeed) || 1);
      const weapon = this.equippedItems.weapon;
      if (!weapon) {
        return fallback;
      }
      const speed = (_a = this.resolveItemMeta(weapon.itemId)) == null ? void 0 : _a.bulletSpeed;
      return Number.isFinite(speed) ? Math.max(1, speed) : fallback;
    }
    transferItem(sourceBucket, targetBucket, itemId, targetSlotIndex) {
      if (sourceBucket === targetBucket) {
        return false;
      }
      if (sourceBucket === "active" && targetBucket === "warehouse") {
        if (targetSlotIndex !== void 0 && !this.warehouse.canPlaceItemAt(targetSlotIndex, itemId)) {
          return false;
        }
        const item = this.inventory.removeItemFromActive(itemId);
        if (!item) {
          return false;
        }
        const success = this.warehouse.addItem(item, targetSlotIndex);
        if (success) {
          this.syncWarehouseViews();
        }
        return success;
      }
      if (sourceBucket === "warehouse" && targetBucket === "active") {
        if (targetSlotIndex !== void 0 && !this.inventory.canPlaceItemInBucket("active", targetSlotIndex, itemId)) {
          return false;
        }
        const item = this.warehouse.removeItem(itemId);
        if (!item) {
          return false;
        }
        if (targetSlotIndex !== void 0) {
          const success = this.inventory.placeItemInBucket("active", targetSlotIndex, item);
          if (success) {
            this.syncWarehouseViews();
            this.refreshQuickSlotViews();
          }
          return success;
        }
        this.inventory.addItemToActive(item.itemId || itemId, item.name, item.count, item.icon);
        this.syncWarehouseViews();
        this.refreshQuickSlotViews();
        return true;
      }
      return false;
    }
    transferLooseItemToActive(item, targetSlotIndex) {
      if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
        return false;
      }
      const resolvedItems = this.resolveWarehouseGrantItems([{
        itemId: item.itemId,
        name: item.name,
        count: item.count,
        icon: item.icon
      }]);
      const resolvedItem = resolvedItems[0] || null;
      if (!resolvedItem) {
        return false;
      }
      if (targetSlotIndex !== void 0) {
        if (!this.inventory.canPlaceItemInBucket("active", targetSlotIndex, resolvedItem.itemId)) {
          return false;
        }
        const success = this.inventory.placeItemInBucket("active", targetSlotIndex, resolvedItem);
        if (success) {
          this.refreshQuickSlotViews();
        }
        return success;
      }
      if (!this.inventory.canAddItems([resolvedItem])) {
        return false;
      }
      this.inventory.addItemToActive(resolvedItem.itemId, resolvedItem.name, resolvedItem.count, resolvedItem.icon);
      this.refreshQuickSlotViews();
      return true;
    }
    moveActiveInventorySlot(sourceSlotIndex, targetSlotIndex) {
      return this.inventory.moveActiveSlot(sourceSlotIndex, targetSlotIndex);
    }
    moveWarehouseSlot(sourceSlotIndex, targetSlotIndex) {
      const moved = this.warehouse.moveSlot(sourceSlotIndex, targetSlotIndex);
      if (moved) {
        this.syncWarehouseViews();
      }
      return moved;
    }
    waitForLoadComplete() {
      return __async(this, null, function* () {
        while (this.loading) {
          yield new Promise((resolve) => setTimeout(resolve, 20));
        }
      });
    }
    loadJson(url, fallbackUrl) {
      return __async(this, null, function* () {
        try {
          const raw = yield Laya.loader.load(url, void 0, void 0, Laya.Loader.JSON);
          const data = this.normalizeLoadedJson(raw, url);
          return data;
        } catch (error) {
          if (!fallbackUrl) {
            throw error;
          }
          const raw = yield Laya.loader.load(fallbackUrl, void 0, void 0, Laya.Loader.JSON);
          const data = this.normalizeLoadedJson(raw, fallbackUrl);
          return data;
        }
      });
    }
    resetDevelopmentSaveOnStartup() {
      if (!_DataManager.RESET_SAVE_ON_STARTUP || _DataManager.saveResetApplied) {
        return;
      }
      _DataManager.saveResetApplied = true;
      this.save.removeItems([
        InventoryManager.BASE_STORAGE_KEY,
        WarehouseManager.STORAGE_KEY,
        WarehouseManager.META_STORAGE_KEY,
        _DataManager.EQUIPMENT_STORAGE_KEY,
        _DataManager.PLAYER_STATS_STORAGE_KEY,
        "laya_test_sign_in_v1",
        "laya_test_mail_v1"
      ]);
    }
    normalizeLoadedJson(raw, url) {
      if (typeof raw === "string") {
        return JSON.parse(raw);
      }
      if (raw && typeof raw === "object") {
        const data = raw.data;
        if (typeof data === "string") {
          return JSON.parse(data);
        }
        if (data && typeof data === "object") {
          return data;
        }
        return raw;
      }
      throw new Error(`JSON load result is invalid: ${url}`);
    }
    resolveDisplayName(itemId, incomingName) {
      const rawName = String(incomingName || "").trim();
      const meta = this.resolveItemMeta(itemId);
      if (meta == null ? void 0 : meta.displayName) {
        return meta.displayName;
      }
      const fallbackName = this.items.resolveFallbackName(itemId);
      if (fallbackName) {
        return fallbackName;
      }
      return rawName && rawName !== itemId ? rawName : itemId;
    }
    resolveSignInRewardView(reward) {
      const meta = this.resolveItemMeta(reward.itemId);
      const icon = reward.icon || (meta == null ? void 0 : meta.icon) || this.resolveFallbackIcon(reward.itemId);
      return {
        day: reward.day,
        itemId: reward.itemId,
        name: this.resolveDisplayName(reward.itemId, reward.name),
        count: reward.count,
        icon,
        state: "locked"
      };
    }
    hasIngredientsInActiveAndWarehouse(ingredients) {
      const requirements = this.mergeCraftingIngredients(ingredients);
      for (let i = 0; i < requirements.length; i++) {
        const item = requirements[i];
        const available = this.getAvailableItemCount(item.itemId);
        if (available < item.count) {
          return false;
        }
      }
      return true;
    }
    consumeIngredientsFromActiveAndWarehouse(ingredients) {
      if (!this.hasIngredientsInActiveAndWarehouse(ingredients)) {
        return false;
      }
      const requirements = this.mergeCraftingIngredients(ingredients);
      for (let i = 0; i < requirements.length; i++) {
        const item = requirements[i];
        let remaining = item.count;
        remaining -= this.inventory.consumeItem(item.itemId, remaining);
        if (remaining > 0) {
          remaining -= this.warehouse.consumeItem(item.itemId, remaining);
        }
        if (remaining > 0) {
          return false;
        }
      }
      this.syncWarehouseViews();
      return true;
    }
    mergeCraftingIngredients(ingredients) {
      const merged = {};
      for (let i = 0; i < ingredients.length; i++) {
        const item = ingredients[i];
        const itemId = String((item == null ? void 0 : item.itemId) || "").trim();
        const count = Number.isFinite(item == null ? void 0 : item.count) ? Math.max(0, Math.floor(item.count)) : 0;
        if (!itemId || count <= 0) {
          continue;
        }
        if (!merged[itemId]) {
          merged[itemId] = __spreadProps(__spreadValues({}, item), { itemId, count: 0 });
        }
        merged[itemId].count += count;
      }
      return Object.keys(merged).map((itemId) => merged[itemId]);
    }
    resolveCraftingRecipe(recipe) {
      return __spreadProps(__spreadValues({}, recipe), {
        inputs: recipe.inputs.map((item) => this.resolveCraftingIngredient(item)),
        output: this.resolveCraftingOutput(recipe.output)
      });
    }
    resolveQuickMakeRecipe(recipe) {
      return __spreadProps(__spreadValues({}, recipe), {
        inputs: recipe.inputs.map((item) => this.resolveCraftingIngredient(item)),
        output: this.resolveCraftingOutput(recipe.output)
      });
    }
    resolveCraftingIngredient(item) {
      const meta = this.resolveItemMeta(item.itemId);
      return {
        itemId: item.itemId,
        name: this.resolveDisplayName(item.itemId, item.name),
        count: item.count,
        icon: item.icon || (meta == null ? void 0 : meta.icon) || this.resolveFallbackIcon(item.itemId)
      };
    }
    resolveCraftingOutput(item) {
      const meta = this.resolveItemMeta(item.itemId);
      return {
        itemId: item.itemId,
        name: this.resolveDisplayName(item.itemId, item.name),
        count: item.count,
        icon: item.icon || (meta == null ? void 0 : meta.icon) || this.resolveFallbackIcon(item.itemId)
      };
    }
    syncWarehouseViews() {
      this.warehouseViews.forEach((view) => view.refresh());
    }
    refreshQuickSlotViews() {
      this.quickSlots.refreshViews();
    }
    clearQuickSlots() {
      this.quickSlots.clearAll();
    }
    clearQuickSlotsForMissingItems() {
      this.quickSlots.clearMissingItems();
    }
    loadEquipment() {
      var _a;
      const stored = this.save.loadJson(_DataManager.EQUIPMENT_STORAGE_KEY) || {};
      const slots = ["insertPlate", "helmet", "weapon", "armor"];
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const item = stored[slot];
        this.equippedItems[slot] = item && item.itemId ? {
          itemId: item.itemId,
          name: this.resolveDisplayName(item.itemId, item.name),
          count: Math.max(1, Math.floor(item.count || 1)),
          icon: item.icon || ((_a = this.resolveItemMeta(item.itemId)) == null ? void 0 : _a.icon) || this.resolveFallbackIcon(item.itemId)
        } : null;
      }
    }
    saveEquipment() {
      this.save.saveJson(_DataManager.EQUIPMENT_STORAGE_KEY, this.equippedItems);
    }
    ensureStarterItems() {
      var _a;
      const starterItemIds = ["fal", "m16", "geluoke", "akm"];
      const missingItems = [];
      for (let i = 0; i < starterItemIds.length; i++) {
        const itemId = starterItemIds[i];
        if (this.hasActiveItem(itemId) || ((_a = this.equippedItems.weapon) == null ? void 0 : _a.itemId) === itemId) {
          continue;
        }
        const meta = this.resolveItemMeta(itemId);
        missingItems.push({
          itemId,
          name: (meta == null ? void 0 : meta.displayName) || this.resolveFallbackName(itemId) || itemId,
          count: 1,
          icon: (meta == null ? void 0 : meta.icon) || this.resolveFallbackIcon(itemId)
        });
      }
      if (missingItems.length > 0) {
        this.grantItemsToActive(missingItems);
      }
    }
    hasActiveItem(itemId) {
      var _a;
      const items = this.inventory.getInventorySnapshot();
      for (let i = 0; i < items.length; i++) {
        if (((_a = items[i]) == null ? void 0 : _a.itemId) === itemId) {
          return true;
        }
      }
      return false;
    }
  };
  __name(_DataManager, "DataManager");
  _DataManager.RESET_SAVE_ON_STARTUP = false;
  _DataManager.EQUIPMENT_STORAGE_KEY = "laya_test_equipment_v1";
  _DataManager.PLAYER_STATS_STORAGE_KEY = "laya_test_player_stats_v1";
  _DataManager.QUICK_SLOT_STORAGE_KEY = "laya_test_quick_slots_v1";
  _DataManager.saveResetApplied = false;
  _DataManager.instance = null;
  var DataManager = _DataManager;

  // src/Player/PlayerEquipmentVisualController.ts
  var _PlayerEquipmentVisualController = class _PlayerEquipmentVisualController {
    constructor(controller) {
      this.controller = controller;
      this.lastWeaponVisualSignature = "__init";
      this.lastRangedWeaponImageSignature = "__init";
      this.equipmentVisualInitAttempts = 0;
      this.lastEquipmentIconUrls = {
        insertPlate: "",
        helmet: "",
        weapon: "",
        armor: ""
      };
      this.lastEquipmentAttachmentNames = {
        insertPlate: "",
        helmet: "",
        weapon: "__init",
        armor: ""
      };
      this.tryInitializeEquipmentVisuals = /* @__PURE__ */ __name(() => {
        this.equipmentVisualInitAttempts += 1;
        if (this.refreshVisualsFromData()) {
          return;
        }
        if (this.equipmentVisualInitAttempts < 20) {
          Laya.timer.once(50, this, this.tryInitializeEquipmentVisuals);
        }
      }, "tryInitializeEquipmentVisuals");
    }
    onDestroy() {
      Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
    }
    syncWeaponSpineSlot(force = false) {
      const isRanged = this.isEquippedRangedWeapon();
      this.syncRangedWeaponImage(force);
      const activeSlotName = this.resolveActiveWeaponSpineSlotName();
      const meleeSlotName = String(this.controller.weaponMeleeSpineSlotName || "").trim();
      const rangedSlotName = String(this.controller.weaponRangedSpineSlotName || "").trim();
      const visualSignature = this.resolveWeaponVisualSignature(activeSlotName);
      const shouldForce = force || visualSignature !== this.lastWeaponVisualSignature;
      if (shouldForce) {
        let cleared = true;
        if (meleeSlotName) {
          cleared = this.clearSpineSlotAttachment(meleeSlotName) && cleared;
        }
        if (rangedSlotName) {
          cleared = this.clearSpineSlotAttachment(rangedSlotName) && cleared;
        }
        if (!cleared) {
          return false;
        }
      }
      if (isRanged) {
        const slotName = rangedSlotName || activeSlotName;
        if (!slotName) {
          this.lastWeaponVisualSignature = visualSignature;
          this.lastEquipmentAttachmentNames.weapon = "";
          this.lastEquipmentIconUrls.weapon = "";
          return true;
        }
        if (this.clearSpineSlotAttachment(slotName)) {
          this.lastWeaponVisualSignature = visualSignature;
          this.lastEquipmentAttachmentNames.weapon = "";
          this.lastEquipmentIconUrls.weapon = "";
          return true;
        }
        return false;
      }
      if (this.syncEquipmentSpineSlot("weapon", activeSlotName, shouldForce)) {
        this.lastWeaponVisualSignature = visualSignature;
        return true;
      }
      return false;
    }
    syncEquipmentSpineSlots(force = false) {
      let success = true;
      success = this.syncEquipmentSpineSlot("insertPlate", this.controller.insertPlateSpineSlotName, force) && success;
      success = this.syncEquipmentSpineSlot("helmet", this.controller.helmetSpineSlotName, force) && success;
      success = this.syncWeaponSpineSlot(force) && success;
      success = this.syncEquipmentSpineSlot("armor", this.controller.armorSpineSlotName, force) && success;
      return success;
    }
    refreshFromData() {
      this.lastWeaponVisualSignature = "__force";
      this.controller.invalidateEquipmentStats();
      this.controller.syncEquipmentStats();
      this.scheduleInitialization();
    }
    refreshVisualsFromData() {
      return this.syncEquipmentSpineSlots(true);
    }
    scheduleInitialization() {
      Laya.timer.clear(this, this.tryInitializeEquipmentVisuals);
      this.equipmentVisualInitAttempts = 0;
      this.tryInitializeEquipmentVisuals();
    }
    isEquippedRangedWeapon() {
      const weapon = DataManager.getInstance().getEquippedItem("weapon");
      if (!weapon || !weapon.itemId) {
        return false;
      }
      const meta = DataManager.getInstance().resolveItemMeta(weapon.itemId);
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      return subCategory.includes("ranged");
    }
    snapshot() {
      return {
        lastWeaponVisualSignature: this.lastWeaponVisualSignature,
        equipmentVisualInitAttempts: this.equipmentVisualInitAttempts,
        lastRangedWeaponImageSignature: this.lastRangedWeaponImageSignature,
        lastEquipmentIconUrls: __spreadValues({}, this.lastEquipmentIconUrls),
        lastEquipmentAttachmentNames: __spreadValues({}, this.lastEquipmentAttachmentNames)
      };
    }
    syncEquipmentSpineSlot(slot, spineSlotName, force) {
      const slotName = String(spineSlotName || "").trim();
      if (!slotName) {
        return true;
      }
      const attachmentName = this.resolveEquippedAttachmentName(slot);
      if (!attachmentName) {
        if (force || this.lastEquipmentAttachmentNames[slot]) {
          if (this.clearSpineSlotAttachment(slotName)) {
            this.lastEquipmentAttachmentNames[slot] = "";
            this.lastEquipmentIconUrls[slot] = "";
            return true;
          }
          return false;
        }
        return true;
      }
      if (!force && attachmentName === this.lastEquipmentAttachmentNames[slot]) {
        return true;
      }
      if (this.applySpineSlotAttachment(slotName, attachmentName)) {
        this.lastEquipmentAttachmentNames[slot] = attachmentName;
        this.lastEquipmentIconUrls[slot] = this.resolveEquippedItemIconUrl(slot);
        return true;
      }
      return false;
    }
    resolveEquippedItemIconUrl(slot) {
      const item = DataManager.getInstance().getEquippedItem(slot);
      if (!item || !item.icon) {
        return "";
      }
      return this.resolveAssetUrl(item.icon);
    }
    resolveEquippedAttachmentName(slot) {
      const item = DataManager.getInstance().getEquippedItem(slot);
      if (!item) {
        return "";
      }
      if (slot === "weapon") {
        return this.resolveWeaponAttachmentName(item.itemId);
      }
      if (slot === "armor") {
        return "cloth";
      }
      return "";
    }
    resolveWeaponAttachmentName(itemId) {
      const map = {
        wood_club: "weapon_slot7",
        baseket_bat: "basekat_bat",
        cleaver: "weapon_slot",
        knife: "weapon_slot2",
        long_knife: "weapon_slot5",
        machete: "weapon_slot6",
        fal: "weapon_ranged_FAL",
        m16: "weapon_ranged_M16",
        geluoke: "weapon_ranged_geluoke",
        akm: "weapon_ranged_AK47"
      };
      return map[itemId] || "";
    }
    resolveActiveWeaponSpineSlotName() {
      if (this.isEquippedRangedWeapon()) {
        return String(this.controller.weaponRangedSpineSlotName || this.controller.weaponSpineSlotName || "").trim();
      }
      return String(this.controller.weaponMeleeSpineSlotName || this.controller.weaponSpineSlotName || "").trim();
    }
    resolveWeaponVisualSignature(activeSlotName) {
      const weapon = DataManager.getInstance().getEquippedItem("weapon");
      const itemId = (weapon == null ? void 0 : weapon.itemId) || "";
      const attachmentName = itemId ? this.resolveWeaponAttachmentName(itemId) : "";
      const ranged = this.isEquippedRangedWeapon() ? "ranged" : "melee";
      return [
        ranged,
        itemId,
        attachmentName,
        activeSlotName,
        String(this.controller.weaponMeleeSpineSlotName || "").trim(),
        String(this.controller.weaponRangedSpineSlotName || "").trim()
      ].join("|");
    }
    applySpineSlotAttachment(slotName, attachmentName) {
      const spine = this.controller.spineNode ? this.controller.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
      if (!spine) {
        return false;
      }
      const anySpine = spine;
      if (typeof anySpine.setSlotAttachment === "function") {
        try {
          anySpine.setSlotAttachment(slotName, attachmentName);
          return true;
        } catch (error) {
          return false;
        }
      }
      if (typeof anySpine.setAttachment === "function") {
        try {
          anySpine.setAttachment(slotName, attachmentName);
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    }
    clearSpineSlotAttachment(slotName) {
      var _a, _b, _c;
      const spine = this.controller.spineNode ? this.controller.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
      if (!spine) {
        return false;
      }
      const anySpine = spine;
      let cleared = false;
      if (this.applySpineSlotAttachment(slotName, null)) {
        cleared = true;
      }
      if (typeof anySpine.setSlotAttachment === "function") {
        try {
          anySpine.setSlotAttachment(slotName, "");
          cleared = true;
        } catch (error) {
        }
      }
      try {
        const slot = typeof anySpine.findSlot === "function" ? anySpine.findSlot(slotName) : null;
        if (slot && typeof slot.setAttachment === "function") {
          slot.setAttachment(null);
          cleared = true;
        }
      } catch (error) {
      }
      try {
        const slot = typeof anySpine.getSlotByName === "function" ? anySpine.getSlotByName(slotName) : null;
        if (slot && typeof slot.setAttachment === "function") {
          slot.setAttachment(null);
          cleared = true;
        }
      } catch (error) {
      }
      try {
        const skeleton = this.resolveSpineSkeleton(anySpine);
        const slot = skeleton && typeof skeleton.findSlot === "function" ? skeleton.findSlot(slotName) : null;
        if (slot && typeof slot.setAttachment === "function") {
          slot.setAttachment(null);
          cleared = true;
        }
        if (skeleton && typeof skeleton.updateWorldTransform === "function") {
          const physics = (_c = (_b = (_a = globalThis.spine) == null ? void 0 : _a.Physics) == null ? void 0 : _b.update) != null ? _c : 2;
          skeleton.updateWorldTransform(physics);
        }
      } catch (error) {
      }
      this.markSpineRenderDirty(anySpine);
      return cleared;
    }
    syncRangedWeaponImage(force) {
      const root = this.resolveRangedWeaponRootNode();
      const image = this.resolveRangedWeaponImageNode(root);
      if (!root && !image) {
        return;
      }
      const weapon = DataManager.getInstance().getEquippedItem("weapon");
      const itemId = String((weapon == null ? void 0 : weapon.itemId) || "");
      const config = this.isEquippedRangedWeapon() ? _PlayerEquipmentVisualController.RANGED_WEAPON_VISUALS[itemId] : null;
      const signature = config ? `${itemId}|${config.src}|${config.x}|${config.y}|${config.width}|${config.height}|${config.scaleX}|${config.scaleY}|${config.rotation || 0}` : "hidden";
      if (!force && signature === this.lastRangedWeaponImageSignature) {
        return;
      }
      this.lastRangedWeaponImageSignature = signature;
      if (root) {
        this.setNodeVisible(root, !!config);
      }
      if (!image) {
        return;
      }
      this.hideSiblingRangedWeaponImages(root, image);
      this.setNodeVisible(image, !!config);
      if (!config) {
        return;
      }
      const anyImage = image;
      if ("autoSize" in anyImage) {
        anyImage.autoSize = false;
      }
      anyImage.src = config.src;
      anyImage.x = config.x;
      anyImage.y = config.y;
      anyImage.width = config.width;
      anyImage.height = config.height;
      anyImage.scaleX = config.scaleX;
      anyImage.scaleY = config.scaleY;
      anyImage.rotation = config.rotation || 0;
    }
    resolveRangedWeaponRootNode() {
      if (this.controller.rangedWeaponRootNode && !this.controller.rangedWeaponRootNode.destroyed) {
        return this.controller.rangedWeaponRootNode;
      }
      return this.findChildByName(this.controller.owner, "ranged");
    }
    resolveRangedWeaponImageNode(root) {
      if (this.controller.rangedWeaponImageNode && !this.controller.rangedWeaponImageNode.destroyed) {
        return this.controller.rangedWeaponImageNode;
      }
      if (!root) {
        return null;
      }
      const named = this.findChildByName(root, "ranged_weapon_image");
      if (named) {
        return named;
      }
      return this.findFirstGImage(root);
    }
    hideSiblingRangedWeaponImages(root, activeImage) {
      if (!root) {
        return;
      }
      this.visitNodes(root, (node) => {
        if (node !== activeImage && this.isGImageNode(node)) {
          this.setNodeVisible(node, false);
        }
      });
    }
    findFirstGImage(root) {
      let result = null;
      this.visitNodes(root, (node) => {
        if (!result && this.isGImageNode(node)) {
          result = node;
        }
      });
      return result;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const childCount = root.numChildren || 0;
      for (let i = 0; i < childCount; i++) {
        const found = this.findChildByName(root.getChildAt(i), name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    visitNodes(root, visitor) {
      if (!root) {
        return;
      }
      visitor(root);
      const childCount = root.numChildren || 0;
      for (let i = 0; i < childCount; i++) {
        this.visitNodes(root.getChildAt(i), visitor);
      }
    }
    isGImageNode(node) {
      var _a;
      return (node == null ? void 0 : node._$type) === "GImage" || typeof (node == null ? void 0 : node.src) === "string" || typeof ((_a = globalThis.Laya) == null ? void 0 : _a.GImage) === "function" && node instanceof globalThis.Laya.GImage;
    }
    setNodeVisible(node, visible) {
      const anyNode = node;
      anyNode.visible = visible;
      if ("active" in anyNode) {
        anyNode.active = visible;
      }
    }
    resolveSpineSkeleton(spine) {
      const render = spine == null ? void 0 : spine._spineRender;
      if (!render || typeof render.getSkeleton !== "function") {
        return null;
      }
      try {
        return render.getSkeleton();
      } catch (error) {
        return null;
      }
    }
    markSpineRenderDirty(spine) {
      if (!spine) {
        return;
      }
      try {
        if ("_needUpdate" in spine) {
          spine._needUpdate = true;
        }
      } catch (error) {
      }
    }
    resolveAssetUrl(path) {
      const normalized = String(path || "").trim().replace(/^assets\//, "");
      if (!normalized) {
        return "";
      }
      const url = Laya.URL;
      if (url && typeof url.formatURL === "function") {
        return String(url.formatURL(normalized) || normalized);
      }
      return normalized;
    }
  };
  __name(_PlayerEquipmentVisualController, "PlayerEquipmentVisualController");
  _PlayerEquipmentVisualController.RANGED_WEAPON_VISUALS = {
    akm: {
      src: "res://19ba1d62-1ade-4d0a-a31e-5604544de574",
      x: 59,
      y: -75,
      width: 128,
      height: 85,
      scaleX: -1.5,
      scaleY: 1.5
    },
    fal: {
      src: "res://07be8694-cf42-48e4-a1ab-f0d9b577c9db",
      x: -138,
      y: -79,
      width: 128,
      height: 85,
      scaleX: 1.5,
      scaleY: 1.5
    },
    m16: {
      src: "res://cbee195e-eed8-464a-8d9e-8d51e0946150",
      x: 55,
      y: -82,
      width: 128,
      height: 85,
      scaleX: -1.5,
      scaleY: 1.5
    },
    geluoke: {
      src: "res://52b8e2d2-8b2f-4547-98e5-fe2093e0bacb",
      x: -55,
      y: -50,
      width: 128,
      height: 128,
      scaleX: 0.5,
      scaleY: 0.5
    }
  };
  var PlayerEquipmentVisualController = _PlayerEquipmentVisualController;

  // src/Player/PlayerRangedController.ts
  var _PlayerRangedController = class _PlayerRangedController {
    constructor(controller) {
      this.controller = controller;
      this.aimActive = false;
      this.aimX = 1;
      this.aimY = 0;
      this.rangedWeaponBaseScaleX = null;
      this.rangedWeaponBaseScaleY = null;
    }
    setAimByDirection(x, y = 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude <= 1e-4) {
        return;
      }
      Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
      this.aimActive = true;
      this.aimX = x / magnitude;
      this.aimY = y / magnitude;
      this.syncAimRotation("input");
    }
    clearAim() {
      Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
      this.aimActive = false;
      this.syncRangedWeaponRotation();
    }
    onDestroy() {
      Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
      this.aimActive = false;
    }
    applyDamage(options = {}) {
      const target = this.resolveAttackTarget(options);
      if (!target) {
        return false;
      }
      target.receiver.takeDamage(this.resolveAttackDamage(options.chargeRatio));
      return true;
    }
    spawnBullet(options = {}) {
      const owner = this.controller.owner;
      const textureUrl = String(this.controller.rangedBulletTextureUrl || "").trim().replace(/^assets\//, "");
      if (!owner || !textureUrl) {
        return;
      }
      const parent = owner.parent;
      if (!parent || typeof parent.globalToLocal !== "function") {
        return;
      }
      const direction = this.resolveDirection(options);
      const baseAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
      const spreadAngle = Math.max(0, Number(options.spreadAngle) || 0);
      const bulletAngle = baseAngle + (Math.random() - 0.5) * spreadAngle;
      const radians = bulletAngle * Math.PI / 180;
      const range = Math.max(1, Number(this.controller.rangedAttackRange) || Number(this.controller.attackDamageRange) || 1);
      const speed = Math.max(1, Number(this.controller.rangedBulletSpeed) || 1) * _PlayerRangedController.BULLET_DISPLAY_SPEED_MULTIPLIER;
      const duration = Math.max(1, Math.floor(range / speed * 1e3));
      const globalStart = this.resolveBulletStartGlobalPoint(owner, direction);
      const localStart = parent.globalToLocal(globalStart, false);
      const bullet = new Laya.Sprite();
      const scale = Math.max(0.01, Number(this.controller.rangedBulletScale) || 1);
      bullet.mouseEnabled = false;
      bullet.loadImage(textureUrl, Laya.Handler.create(this, this.centerBulletPivot, [bullet]));
      bullet.pos(localStart.x, localStart.y);
      bullet.scale(scale, scale);
      bullet.rotation = bulletAngle + (Number(this.controller.rangedBulletRotationOffset) || 0);
      parent.addChild(bullet);
      Laya.Tween.to(
        bullet,
        {
          x: localStart.x + Math.cos(radians) * range,
          y: localStart.y + Math.sin(radians) * range
        },
        duration,
        void 0,
        Laya.Handler.create(this, this.destroyBullet, [bullet])
      );
    }
    resolveChargeRatio(heldMs, dragRatio) {
      const duration = Math.max(1, this.controller.rangedChargeDuration || 1);
      const timeRatio = Math.max(0, Math.min(1, heldMs / duration));
      const aimRatio = Math.max(0, Math.min(1, dragRatio));
      return Math.max(timeRatio, aimRatio);
    }
    syncAimRotation(phase = "update") {
      if (!this.aimActive || !this.controller.isEquippedRangedWeapon()) {
        this.syncRangedWeaponRotation();
        return;
      }
      this.controller.syncWeaponSpineSlot(false);
      this.syncRangedWeaponRotation();
    }
    snapshot() {
      const root = this.resolveRangedWeaponRoot();
      return {
        aimActive: this.aimActive,
        aimX: this.aimX,
        aimY: this.aimY,
        rangedWeaponRotation: root ? root.rotation : null
      };
    }
    syncRangedWeaponRotation() {
      const root = this.resolveRangedWeaponRoot();
      if (!root) {
        return;
      }
      this.captureRangedWeaponBaseScale(root);
      if (!this.controller.isEquippedRangedWeapon()) {
        this.applyRangedWeaponScale(root, 1);
        root.rotation = 0;
        return;
      }
      if (!this.aimActive) {
        this.applyRangedWeaponScale(root, 1);
        root.rotation = 0;
        return;
      }
      const direction = { x: this.aimX, y: this.aimY };
      this.applyRangedWeaponScale(root, 1);
      const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
      if (magnitude <= 1e-4) {
        root.rotation = 0;
        return;
      }
      const aimAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
      const ancestorScale = this.resolveAncestorScaleSign(root);
      const visualAngle = direction.x < 0 ? aimAngle + 180 : aimAngle;
      root.rotation = (ancestorScale.x < 0 ? -visualAngle : visualAngle) + (Number(this.controller.rangedWeaponAimRotationOffset) || 0);
    }
    resolveRangedWeaponRoot() {
      if (this.controller.rangedWeaponRootNode && !this.controller.rangedWeaponRootNode.destroyed) {
        return this.controller.rangedWeaponRootNode;
      }
      return this.findChildByName(this.controller.owner, "ranged");
    }
    captureRangedWeaponBaseScale(root) {
      if (this.rangedWeaponBaseScaleX !== null && this.rangedWeaponBaseScaleY !== null) {
        return;
      }
      this.rangedWeaponBaseScaleX = Math.abs(Number(root.scaleX) || 1);
      this.rangedWeaponBaseScaleY = Math.abs(Number(root.scaleY) || 1);
    }
    applyRangedWeaponScale(root, directionSign) {
      this.captureRangedWeaponBaseScale(root);
      const sign = directionSign >= 0 ? 1 : -1;
      root.scaleX = (this.rangedWeaponBaseScaleX || 1) * sign;
      root.scaleY = (this.rangedWeaponBaseScaleY || 1) * sign;
    }
    resolveAncestorScaleSign(node) {
      let scaleX = 1;
      let scaleY = 1;
      let current = node.parent;
      while (current) {
        if (typeof current.scaleX === "number" && current.scaleX !== 0) {
          scaleX *= current.scaleX;
        }
        if (typeof current.scaleY === "number" && current.scaleY !== 0) {
          scaleY *= current.scaleY;
        }
        current = current.parent;
      }
      return {
        x: scaleX >= 0 ? 1 : -1,
        y: scaleY >= 0 ? 1 : -1
      };
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const childCount = root.numChildren || 0;
      for (let i = 0; i < childCount; i++) {
        const found = this.findChildByName(root.getChildAt(i), name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    resolveAttackDamage(chargeRatio = 0) {
      const ratio = Math.max(0, Math.min(1, Number(chargeRatio) || 0));
      const minMultiplier = Math.max(0, Number(this.controller.rangedMinDamageMultiplier) || 0);
      const maxMultiplier = Math.max(minMultiplier, Number(this.controller.rangedMaxDamageMultiplier) || minMultiplier);
      const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * ratio;
      return Math.max(1, Math.floor((this.controller.attackPower || 0) * multiplier));
    }
    resolveAttackTarget(options) {
      const owner = this.controller.owner;
      if (!owner || !Laya.stage) {
        return null;
      }
      const origin = this.getGlobalPosition(owner);
      const direction = this.resolveDirection(options);
      const range = Math.max(1, this.controller.rangedAttackRange || this.controller.attackDamageRange || 1);
      const halfWidth = Math.max(1, (this.controller.rangedAttackWidth || 1) / 2);
      let best = null;
      this.visitNodes(Laya.stage, (node) => {
        if (node === this.controller.owner) {
          return;
        }
        const receiver = this.findDamageReceiver(node);
        if (!receiver || receiver.isDead && receiver.isDead()) {
          return;
        }
        const point = this.getGlobalPosition(node);
        const dx = point.x - origin.x;
        const dy = point.y - origin.y;
        const forward = dx * direction.x + dy * direction.y;
        if (forward <= 0 || forward > range) {
          return;
        }
        const side = Math.abs(dx * direction.y - dy * direction.x);
        if (side > halfWidth) {
          return;
        }
        if (!best || forward < best.distance) {
          best = { receiver, distance: forward };
        }
      });
      return best;
    }
    resolveDirection(options) {
      var _a;
      let x = Number(options.directionX) || 0;
      let y = Number(options.directionY) || 0;
      const magnitude = Math.sqrt(x * x + y * y);
      if (magnitude > 1e-4) {
        return { x: x / magnitude, y: y / magnitude };
      }
      x = ((_a = this.controller.movement) == null ? void 0 : _a.getAttackDirection()) || 1;
      return { x: x >= 0 ? 1 : -1, y: 0 };
    }
    resolveBulletStartGlobalPoint(owner, direction) {
      const localStart = new Laya.Point(
        direction.x * (Number(this.controller.rangedBulletSpawnOffsetX) || 0),
        direction.y * (Number(this.controller.rangedBulletSpawnOffsetX) || 0) + (Number(this.controller.rangedBulletSpawnOffsetY) || 0)
      );
      return owner.localToGlobal(localStart, false);
    }
    destroyBullet(bullet) {
      Laya.Tween.clearAll(bullet);
      if (!bullet.destroyed) {
        bullet.destroy();
      }
    }
    centerBulletPivot(bullet) {
      if (!bullet || bullet.destroyed) {
        return;
      }
      const texture = bullet.texture;
      const width = Number(texture == null ? void 0 : texture.width) || Number(bullet.width) || 0;
      const height = Number(texture == null ? void 0 : texture.height) || Number(bullet.height) || 0;
      if (width > 0 && height > 0) {
        bullet.pivot(width * 0.5, height * 0.5);
      }
    }
    findDamageReceiver(node) {
      const components = (node == null ? void 0 : node._components) || (node == null ? void 0 : node.components) || [];
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component === this.controller || !component || typeof component.takeDamage !== "function") {
          continue;
        }
        if (typeof component.isDead === "function") {
          return component;
        }
      }
      return null;
    }
    visitNodes(root, visitor) {
      if (!root) {
        return;
      }
      visitor(root);
      const childCount = root.numChildren || 0;
      for (let i = 0; i < childCount; i++) {
        this.visitNodes(root.getChildAt(i), visitor);
      }
    }
    getGlobalPosition(node) {
      const point = new Laya.Point();
      if (node && typeof node.localToGlobal === "function") {
        node.localToGlobal(point, false);
      }
      return point;
    }
  };
  __name(_PlayerRangedController, "PlayerRangedController");
  _PlayerRangedController.BULLET_DISPLAY_SPEED_MULTIPLIER = 2;
  var PlayerRangedController = _PlayerRangedController;

  // src/runtime/SpineRuntimeGuard.ts
  var PATCH_FLAG = "__spineRuntimeGuardPatched";
  var LOGGED_FLAG = "__spineRuntimeGuardLogged";
  var GLOBAL_DUMP_NAME = "dumpSpineRuntimeDiagnostics";
  var INSTALL_STATE_NAME = "__spineRuntimeGuardInstallState";
  function installSpineRuntimeGuard(attempt = 0) {
    installGlobalDump();
    const spineCtor = Laya && Laya.Spine2DRenderNode;
    const proto = spineCtor && spineCtor.prototype;
    if (proto && proto[PATCH_FLAG]) {
      return;
    }
    if (!proto) {
      scheduleInstallRetry(attempt);
      return;
    }
    const originalUpdate = proto._update;
    const originalPlay = proto.play;
    const currentTimeDescriptor = findPropertyDescriptor(proto, "currentTime");
    if (currentTimeDescriptor && currentTimeDescriptor.get) {
      Object.defineProperty(proto, "currentTime", {
        configurable: true,
        enumerable: currentTimeDescriptor.enumerable,
        get: /* @__PURE__ */ __name(function() {
          if (!this._templet || !this._spineRender || !this._spineRender.trackEntry) {
            return 0;
          }
          try {
            return Number(currentTimeDescriptor.get.call(this)) || 0;
          } catch (error) {
            return 0;
          }
        }, "get"),
        set: /* @__PURE__ */ __name(function(value) {
          if (!this._templet || !this._spineRender || !currentTimeDescriptor.set) {
            return;
          }
          currentTimeDescriptor.set.call(this, value);
        }, "set")
      });
    }
    if (typeof originalPlay === "function") {
      proto.play = function(animationName, loop, trackIndexOrForce, start, end) {
        const force = typeof trackIndexOrForce === "boolean" ? trackIndexOrForce : true;
        if (typeof trackIndexOrForce === "number") {
          this.trackIndex = Math.max(0, Math.floor(trackIndexOrForce || 0));
        }
        try {
          originalPlay.call(this, animationName, loop, force, start, end);
        } catch (error) {
          const message = error && error.message ? error.message : String(error);
          if (message.indexOf("currentTime") >= 0 || message.indexOf("trackEntry") >= 0) {
            logSpineProblem("play", this, error);
            this._needUpdate = false;
            return;
          }
          throw error;
        }
      };
    }
    if (typeof originalUpdate === "function") {
      proto._update = function() {
        const render = this && this._spineRender;
        if (!this || !this._templet || !render) {
          return;
        }
        if (!render || !render.trackEntry) {
          logSpineProblem("update-missing-track", this);
          this._needUpdate = false;
          return;
        }
        try {
          originalUpdate.apply(this, arguments);
        } catch (error) {
          const message = error && error.message ? error.message : String(error);
          if (message.indexOf("currentTime") >= 0 || message.indexOf("trackEntry") >= 0) {
            logSpineProblem("update", this, error);
            this._needUpdate = false;
            return;
          }
          throw error;
        }
      };
    }
    proto[PATCH_FLAG] = true;
    console.info("[SpineRuntimeGuard] installed", stringifyDetails({
      hasPlay: typeof originalPlay === "function",
      hasUpdate: typeof originalUpdate === "function",
      hasCurrentTime: !!currentTimeDescriptor
    }));
  }
  __name(installSpineRuntimeGuard, "installSpineRuntimeGuard");
  function findPropertyDescriptor(proto, propertyName) {
    let current = proto;
    while (current) {
      const descriptor = Object.getOwnPropertyDescriptor(current, propertyName);
      if (descriptor) {
        return descriptor;
      }
      current = Object.getPrototypeOf(current);
    }
    return void 0;
  }
  __name(findPropertyDescriptor, "findPropertyDescriptor");
  function installGlobalDump() {
    const scope = globalThis;
    if (typeof scope[GLOBAL_DUMP_NAME] === "function") {
      return;
    }
    scope[GLOBAL_DUMP_NAME] = () => {
      const spines = collectSpineStates();
      console.group(`[SpineRuntimeGuard] spine count=${spines.length}`);
      for (let i = 0; i < spines.length; i++) {
        console.log(`[SpineRuntimeGuard] spine[${i}]`, stringifyDetails(spines[i]));
      }
      console.groupEnd();
      return spines;
    };
  }
  __name(installGlobalDump, "installGlobalDump");
  function scheduleInstallRetry(attempt) {
    const scope = globalThis;
    const state = scope[INSTALL_STATE_NAME] || { scheduled: false };
    scope[INSTALL_STATE_NAME] = state;
    if (state.scheduled || attempt >= 120) {
      return;
    }
    state.scheduled = true;
    const retry = /* @__PURE__ */ __name(() => {
      state.scheduled = false;
      installSpineRuntimeGuard(attempt + 1);
    }, "retry");
    try {
      if (Laya && typeof Laya.addAfterInitCallback === "function") {
        Laya.addAfterInitCallback(retry);
      }
    } catch (error) {
    }
    try {
      if (Laya && Laya.timer && typeof Laya.timer.once === "function") {
        Laya.timer.once(50, null, retry);
        return;
      }
    } catch (error) {
    }
    setTimeout(retry, 50);
  }
  __name(scheduleInstallRetry, "scheduleInstallRetry");
  function logSpineProblem(reason, spineComponent, error) {
    if (!spineComponent || spineComponent[LOGGED_FLAG]) {
      return;
    }
    spineComponent[LOGGED_FLAG] = true;
    const details = {
      reason,
      spine: describeSpineComponent(spineComponent),
      error: formatError(error)
    };
    const spine = details.spine;
    console.warn(
      `[SpineRuntimeGuard] blocked reason=${reason} node=${String(spine.nodePath || "")} anim=${String(spine.animationName || "")} source=${String(spine.source || "")}`,
      stringifyDetails(details)
    );
  }
  __name(logSpineProblem, "logSpineProblem");
  function collectSpineStates() {
    const result = [];
    const stage = Laya && Laya.stage;
    if (!stage) {
      return result;
    }
    const stack = [stage];
    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) {
        continue;
      }
      const spine = typeof node.getComponent === "function" && Laya.Spine2DRenderNode ? node.getComponent(Laya.Spine2DRenderNode) : null;
      if (spine) {
        result.push(describeSpineComponent(spine));
      }
      const children = node._children || node.children || [];
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
    return result;
  }
  __name(collectSpineStates, "collectSpineStates");
  function describeSpineComponent(spineComponent) {
    var _a, _b, _c, _d, _e;
    const render = spineComponent == null ? void 0 : spineComponent._spineRender;
    const owner = spineComponent == null ? void 0 : spineComponent.owner;
    return {
      nodePath: getNodePath(owner),
      nodeName: (owner == null ? void 0 : owner.name) || null,
      nodeUrl: (owner == null ? void 0 : owner.url) || null,
      source: (spineComponent == null ? void 0 : spineComponent._source) || (spineComponent == null ? void 0 : spineComponent.source) || null,
      skinName: (spineComponent == null ? void 0 : spineComponent._skinName) || (spineComponent == null ? void 0 : spineComponent.skinName) || null,
      animationName: (spineComponent == null ? void 0 : spineComponent._animationName) || (spineComponent == null ? void 0 : spineComponent.animationName) || null,
      loop: spineComponent == null ? void 0 : spineComponent._loop,
      pause: spineComponent == null ? void 0 : spineComponent._pause,
      needUpdate: spineComponent == null ? void 0 : spineComponent._needUpdate,
      trackIndex: spineComponent == null ? void 0 : spineComponent.trackIndex,
      hasTemplet: !!(spineComponent == null ? void 0 : spineComponent._templet),
      hasSpineRender: !!render,
      hasTrackEntry: !!(render == null ? void 0 : render.trackEntry),
      renderCurrentTime: safeReadNumber(render, "currentTime"),
      trackAnimationName: ((_b = (_a = render == null ? void 0 : render.trackEntry) == null ? void 0 : _a.animation) == null ? void 0 : _b.name) || null,
      trackAnimationDuration: (_e = (_d = (_c = render == null ? void 0 : render.trackEntry) == null ? void 0 : _c.animation) == null ? void 0 : _d.duration) != null ? _e : null
    };
  }
  __name(describeSpineComponent, "describeSpineComponent");
  function getNodePath(node) {
    var _a;
    const names = [];
    let current = node;
    while (current) {
      names.push(String(current.name || current.url || ((_a = current.constructor) == null ? void 0 : _a.name) || "(unnamed)"));
      current = current.parent;
    }
    return names.reverse().join("/");
  }
  __name(getNodePath, "getNodePath");
  function safeReadNumber(target, propertyName) {
    if (!target) {
      return null;
    }
    try {
      const value = target[propertyName];
      return typeof value === "number" ? value : null;
    } catch (error) {
      return null;
    }
  }
  __name(safeReadNumber, "safeReadNumber");
  function formatError(error) {
    if (!error) {
      return null;
    }
    if (error instanceof Error) {
      return error.stack || error.message;
    }
    return String(error);
  }
  __name(formatError, "formatError");
  function stringifyDetails(details) {
    try {
      return JSON.stringify(details);
    } catch (error) {
      return String(details);
    }
  }
  __name(stringifyDetails, "stringifyDetails");

  // src/Player/PlayerController.ts
  var { regClass: regClass4, property: property4 } = Laya;
  installSpineRuntimeGuard();
  var PlayerController = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.walkSpeed = 200;
      this.runSpeed = 320;
      this.moveSpeed = 0;
      this.tileBlockHalfWidth = 30;
      this.tileBlockFootOffsetY = 80;
      this.footstepSoundEnabled = true;
      this.cunzhuangWalkSoundUrl = "sound/sfx/walk/walk_wood.mp3";
      this.cunzhuangRunSoundUrl = "sound/sfx/run/run_wood.mp3";
      this.forestWalkSoundUrl = "sound/sfx/walk/walk_grass.mp3";
      this.forestRunSoundUrl = "sound/sfx/run/run_grass.mp3";
      this.mineWalkSoundUrl = "sound/sfx/walk/walk_floor.wav";
      this.mineRunSoundUrl = "sound/sfx/run/run_inside_floor.mp3";
      this.walkFootstepInterval = 420;
      this.runFootstepInterval = 300;
      this.walkFootstepPlaybackRate = 1;
      this.runFootstepPlaybackRate = 1;
      this.footstepPlaybackRateVariance = 0;
      this.isRunning = false;
      this.joystickNode = null;
      this.spineNode = null;
      this.attackNode = null;
      this.detectNode = null;
      this.stateText = null;
      this.itemText = null;
      this.hpFillNode = null;
      this.hpBarNode = null;
      this.staminaFillNode = null;
      this.staminaBarNode = null;
      this.weaponSlotNode = null;
      this.weaponIconNode = null;
      this.rangedWeaponRootNode = null;
      this.rangedWeaponImageNode = null;
      this.weaponSpineSlotName = "";
      this.weaponMeleeSpineSlotName = "weapon_melee_slot";
      this.weaponRangedSpineSlotName = "weapon_ranged_slot";
      this.insertPlateSpineSlotName = "";
      this.helmetSpineSlotName = "";
      this.armorSpineSlotName = "";
      this.currentHp = 100;
      this.maxHp = 100;
      this.hpFillFullWidth = 70;
      this.currentStamina = 100;
      this.maxStamina = 100;
      this.runRecoverStaminaThreshold = 30;
      this.staminaFillFullWidth = 70;
      this.hpBarRightX = -35;
      this.hpBarLeftX = 35;
      this.staminaBarRightX = -35;
      this.staminaBarLeftX = 35;
      this.deathReturnSceneUrl = "scenes/cunzhuang.ls";
      this.initialFacingSign = 1;
      this.attackAreaRightX = -100;
      this.attackAreaLeftX = 0;
      this.attackCooldown = 300;
      this.attackPower = 10;
      this.baseAttackPower = 10;
      this.attackSpeed = 1;
      this.attackDamageRange = 120;
      this.attackHitboxShowDelay = 0;
      this.attackHitboxVisibleDuration = 200;
      this.rangedAttackRange = 520;
      this.rangedAttackWidth = 90;
      this.rangedAttackHitDelay = 220;
      this.rangedAttackSoundUrl = "sound/sfx/weapon/ranged/akm/akm_singleshot.mp3";
      this.rangedWeaponAimRotationOffset = 0;
      this.rangedChargeDuration = 900;
      this.rangedMinDamageMultiplier = 0.75;
      this.rangedMaxDamageMultiplier = 2;
      this.rangedBulletTextureUrl = "atlas/picture/ui/zidan.png";
      this.rangedBulletSpeed = 900;
      this.rangedBulletScale = 1;
      this.rangedBulletRotationOffset = 0;
      this.rangedBulletSpawnOffsetX = 0;
      this.rangedBulletSpawnOffsetY = 0;
      this.idleAnimation = "idle/idle_melee_swing";
      this.walkAnimation = "walk/walk_body_lower";
      this.runAnimation = "run/run_body_lower";
      this.runAnimationPlaybackRate = 1.3;
      this.attackAnimation = "attack/attack_melee_swing";
      this.rangedAttackAnimation = "attack/attack_ranged_firearm";
      this.layeredSpineAnimationEnabled = true;
      this.upperIdleAnimation = "idle/idle_melee_swing";
      this.upperWalkAnimation = "walk/walk_body_upper_melee_swing";
      this.upperRunAnimation = "run/run_body_upper_melee_swing";
      this.rangedUpperIdleAnimation = "idle/idle_ranged_firearm";
      this.rangedUpperWalkAnimation = "walk/walk_body_upper_ranged_firearm";
      this.rangedUpperRunAnimation = "run/run_body_upper_ranged_firearm";
      this.attackAnimationDuration = 1067;
      this.attackToken = 0;
      this.staminaTickElapsed = 0;
      this.runStaminaLocked = false;
      this.deathReturnTriggered = false;
      this.lastEquipmentSignature = "__init";
      this.defaultRangedBulletSpeed = 0;
    }
    onAwake() {
      PlayerController.activeInstance = this;
      this.movement = new PlayerMovementController(this);
      this.ui = new PlayerUIHints(this);
      this.combat = new PlayerCombatController(this);
      this.animation = new PlayerAnimationController(this);
      this.equipment = new PlayerEquipmentVisualController(this);
      this.ranged = new PlayerRangedController(this);
      this.defaultRangedBulletSpeed = Math.max(1, Number(this.rangedBulletSpeed) || 1);
      this.movement.onAwake();
      this.ui.onAwake();
      this.setRunningState(this.isRunning);
      this.combat.setAttackNodeVisible(false);
      this.syncHpFromData();
      this.syncStaminaFromData();
      this.refreshHpBar();
      this.refreshStaminaBar();
      this.syncEquipmentStats();
      this.animation.onAwake();
      this.equipment.scheduleInitialization();
    }
    onStart() {
      PlayerController.activeInstance = this;
      this.movement.onStart();
      this.ui.onStart();
      this.setRunningState(this.isRunning);
      this.combat.setAttackNodeVisible(false);
      this.syncHpFromData();
      this.syncStaminaFromData();
      this.refreshHpBar();
      this.refreshStaminaBar();
      this.syncEquipmentStats();
      this.animation.onStart();
      this.equipment.scheduleInitialization();
    }
    onUpdate() {
      this.movement.onUpdate();
      this.updateStamina();
      this.syncEquipmentStats();
      this.animation.onUpdate();
      this.syncRangedWeaponSpineSlotHidden();
      this.ranged.syncAimRotation("update");
    }
    onLateUpdate() {
      this.ranged.syncAimRotation("late");
    }
    onDestroy() {
      var _a, _b, _c, _d, _e;
      if (PlayerController.activeInstance === this) {
        PlayerController.activeInstance = null;
      }
      (_a = this.ranged) == null ? void 0 : _a.onDestroy();
      (_b = this.equipment) == null ? void 0 : _b.onDestroy();
      (_c = this.animation) == null ? void 0 : _c.onDestroy();
      (_d = this.combat) == null ? void 0 : _d.onDestroy();
      (_e = this.ui) == null ? void 0 : _e.onDestroy();
    }
    playAttack(queueIfBusy = false, options = {}) {
      return this.combat.playAttack(queueIfBusy, options);
    }
    clearQueuedAttack() {
      this.combat.clearQueuedAttack();
    }
    setAttackFacingByDirection(x, y = 0) {
      return this.movement.setAttackFacingByDirection(x, y);
    }
    clearAttackFacingOverride() {
      this.movement.clearAttackFacingOverride();
    }
    setRangedWeaponAimByDirection(x, y = 0) {
      this.ranged.setAimByDirection(x, y);
    }
    clearRangedWeaponAim() {
      this.ranged.clearAim();
    }
    beginAttackHit() {
      this.attackToken += 1;
      return this.attackToken;
    }
    endAttackHit() {
      this.attackToken = 0;
    }
    getAttackToken() {
      return this.attackToken;
    }
    syncEquipmentStats() {
      var _a;
      const dataManager = DataManager.getInstance();
      const weapon = dataManager.getEquippedItem("weapon");
      const nextBulletSpeed = dataManager.getEquipmentBulletSpeed(this.defaultRangedBulletSpeed || this.rangedBulletSpeed);
      const signature = `${this.baseAttackPower}:${nextBulletSpeed}:${weapon ? `${weapon.itemId}:${weapon.count}` : ""}`;
      if (this.lastEquipmentSignature === signature) {
        return;
      }
      this.lastEquipmentSignature = signature;
      this.attackPower = Math.max(0, Math.floor((this.baseAttackPower || 0) + dataManager.getEquipmentAttackBonus()));
      this.attackSpeed = Math.max(0.1, dataManager.getEquipmentAttackSpeed());
      this.rangedBulletSpeed = nextBulletSpeed;
      (_a = this.animation) == null ? void 0 : _a.invalidateLocomotion();
      this.equipment.scheduleInitialization();
    }
    setRunningState(value) {
      this.updateRunStaminaLock();
      this.isRunning = value && this.canStartRunning();
      this.moveSpeed = this.isRunning ? this.runSpeed : 0;
    }
    setRunning(value) {
      this.setRunningState(value);
    }
    toggleRunning() {
      this.setRunningState(!this.isRunning);
    }
    canStartRunning() {
      return this.currentStamina > 0 && !this.runStaminaLocked;
    }
    isRunStaminaLocked() {
      return this.runStaminaLocked;
    }
    showState(text, duration = 1200) {
      this.ui.showState(text, duration);
    }
    showItem(text, duration = 1500) {
      this.ui.showItem(text, duration);
    }
    hideStateText() {
      this.ui.hideStateText();
    }
    hideItemText() {
      this.ui.hideItemText();
    }
    setHp(currentHp, maxHp = this.maxHp) {
      this.maxHp = Math.max(1, Math.floor(maxHp));
      this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
      DataManager.getInstance().setPlayerHp(this.currentHp, this.maxHp);
      this.refreshHpBar();
      if (this.currentHp <= 0) {
        this.returnToDeathScene();
      }
    }
    takeDamage(amount) {
      const damage = Math.max(0, Math.floor(amount));
      if (damage <= 0 || this.currentHp <= 0) {
        return;
      }
      this.setHp(this.currentHp - damage, this.maxHp);
    }
    refreshHpBar() {
      const fill = this.hpFillNode;
      if (!fill) {
        return;
      }
      const ratio = this.currentHp / Math.max(1, this.maxHp);
      this.applyHpFillWidth(fill, Math.max(0, this.hpFillFullWidth * ratio));
      this.syncStatusBarTransform();
    }
    syncHpFromData() {
      const stats = DataManager.getInstance().getPlayerStats();
      this.maxHp = Math.max(1, Math.floor(stats.maxHp || 100));
      const currentHp = Number.isFinite(stats.currentHp) ? stats.currentHp : this.maxHp;
      this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
      this.refreshHpBar();
    }
    setStamina(currentStamina, maxStamina = this.maxStamina) {
      this.maxStamina = Math.max(1, Math.floor(maxStamina));
      this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
      this.updateRunStaminaLock();
      DataManager.getInstance().setPlayerStamina(this.currentStamina, this.maxStamina);
      if (!this.canStartRunning() && this.isRunning) {
        this.setRunningState(false);
      }
      this.refreshStaminaBar();
    }
    consumeStaminaForCompletedAttack() {
      this.setStamina(this.currentStamina - 10, this.maxStamina);
    }
    syncStaminaFromData() {
      const stats = DataManager.getInstance().getPlayerStats();
      this.maxStamina = Math.max(1, Math.floor(stats.maxStamina || 100));
      const currentStamina = Number.isFinite(stats.currentStamina) ? stats.currentStamina : this.maxStamina;
      this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
      this.updateRunStaminaLock();
      if (!this.canStartRunning() && this.isRunning) {
        this.setRunningState(false);
      }
      this.refreshStaminaBar();
    }
    refreshStaminaBar() {
      const fill = this.staminaFillNode;
      if (!fill) {
        return;
      }
      const ratio = this.currentStamina / Math.max(1, this.maxStamina);
      this.applyHpFillWidth(fill, Math.max(0, this.staminaFillFullWidth * ratio));
      this.syncStatusBarTransform();
    }
    syncStatusBarTransform() {
      var _a, _b;
      const facingSign = this.movement ? this.movement.getFacingSign() : this.initialFacingSign >= 0 ? 1 : -1;
      this.applyCounterTransform(this.hpBarNode || ((_a = this.hpFillNode) == null ? void 0 : _a.parent) || null, facingSign, this.hpBarRightX, this.hpBarLeftX);
      this.applyCounterTransform(this.staminaBarNode || ((_b = this.staminaFillNode) == null ? void 0 : _b.parent) || null, facingSign, this.staminaBarRightX, this.staminaBarLeftX);
    }
    updateStamina() {
      this.staminaTickElapsed += Math.max(0, Laya.timer.delta || 0);
      while (this.staminaTickElapsed >= 500) {
        this.staminaTickElapsed -= 500;
        if (this.isRunning && this.movement.getIsMovingNow()) {
          this.setStamina(this.currentStamina - 10, this.maxStamina);
        } else {
          this.setStamina(this.currentStamina + 3, this.maxStamina);
        }
      }
    }
    updateRunStaminaLock() {
      if (this.currentStamina <= 0) {
        this.runStaminaLocked = true;
        return;
      }
      const recoverThreshold = Math.max(1, Math.min(this.maxStamina, Math.floor(this.runRecoverStaminaThreshold || 30)));
      if (this.currentStamina >= recoverThreshold) {
        this.runStaminaLocked = false;
      }
    }
    returnToDeathScene() {
      if (this.deathReturnTriggered) {
        return;
      }
      const url = String(this.deathReturnSceneUrl || "scenes/cunzhuang.ls").trim();
      if (!url) {
        return;
      }
      this.deathReturnTriggered = true;
      Laya.timer.once(0, null, () => {
        DataManager.getInstance().returnToBaseAfterDeath(url);
        Laya.Scene.open(url);
      });
    }
    applyHpFillWidth(fill, width) {
      fill.width = width;
      const commands = fill._gcmds;
      if (!Array.isArray(commands)) {
        return;
      }
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command && "width" in command) {
          command.width = width;
        }
      }
    }
    applyCounterTransform(node, facingSign, rightX, leftX) {
      const sprite = node;
      if (!sprite) {
        return;
      }
      const facingRight = facingSign === (this.initialFacingSign >= 0 ? 1 : -1);
      sprite.x = facingRight ? leftX : rightX;
      sprite.scaleX = facingRight ? -1 : 1;
    }
    syncWeaponSpineSlot(force = false) {
      return this.equipment.syncWeaponSpineSlot(force);
    }
    resolveUpperLocomotionAnimation(lowerAnimation) {
      const ranged = this.isEquippedRangedWeapon();
      const idle = ranged ? this.rangedUpperIdleAnimation || this.upperIdleAnimation : this.upperIdleAnimation;
      if (lowerAnimation === this.runAnimation) {
        return ranged ? this.rangedUpperRunAnimation || idle || lowerAnimation : this.upperRunAnimation || idle || lowerAnimation;
      }
      if (lowerAnimation === this.walkAnimation) {
        return ranged ? this.rangedUpperWalkAnimation || idle || lowerAnimation : this.upperWalkAnimation || idle || lowerAnimation;
      }
      return idle || lowerAnimation;
    }
    resolveAttackAnimation() {
      if (this.isEquippedRangedWeapon()) {
        return this.rangedAttackAnimation || this.attackAnimation;
      }
      return this.attackAnimation;
    }
    syncEquipmentSpineSlots(force = false) {
      return this.equipment.syncEquipmentSpineSlots(force);
    }
    refreshEquipmentFromData() {
      this.equipment.refreshFromData();
    }
    refreshEquipmentVisualsFromData() {
      return this.equipment.refreshVisualsFromData();
    }
    invalidateEquipmentStats() {
      this.lastEquipmentSignature = "__force";
    }
    isEquippedRangedWeapon() {
      return this.equipment.isEquippedRangedWeapon();
    }
    syncRangedWeaponSpineSlotHidden() {
      if (!this.equipment || !this.isEquippedRangedWeapon()) {
        return;
      }
      this.equipment.syncWeaponSpineSlot(false);
    }
    applyRangedAttackDamage(options = {}) {
      return this.ranged.applyDamage(options);
    }
    spawnRangedBullet(options = {}) {
      this.ranged.spawnBullet(options);
    }
    resolveRangedChargeRatio(heldMs, dragRatio) {
      return this.ranged.resolveChargeRatio(heldMs, dragRatio);
    }
    snapshot() {
      return {
        walkSpeed: this.walkSpeed,
        runSpeed: this.runSpeed,
        moveSpeed: this.moveSpeed,
        tileBlockHalfWidth: this.tileBlockHalfWidth,
        tileBlockFootOffsetY: this.tileBlockFootOffsetY,
        footstepSoundEnabled: this.footstepSoundEnabled,
        cunzhuangWalkSoundUrl: this.cunzhuangWalkSoundUrl,
        cunzhuangRunSoundUrl: this.cunzhuangRunSoundUrl,
        forestWalkSoundUrl: this.forestWalkSoundUrl,
        forestRunSoundUrl: this.forestRunSoundUrl,
        mineWalkSoundUrl: this.mineWalkSoundUrl,
        mineRunSoundUrl: this.mineRunSoundUrl,
        walkFootstepInterval: this.walkFootstepInterval,
        runFootstepInterval: this.runFootstepInterval,
        walkFootstepPlaybackRate: this.walkFootstepPlaybackRate,
        runFootstepPlaybackRate: this.runFootstepPlaybackRate,
        footstepPlaybackRateVariance: this.footstepPlaybackRateVariance,
        isRunning: this.isRunning,
        idleAnimation: this.idleAnimation,
        walkAnimation: this.walkAnimation,
        runAnimation: this.runAnimation,
        runAnimationPlaybackRate: this.runAnimationPlaybackRate,
        attackAnimation: this.attackAnimation,
        attackAnimationDuration: this.attackAnimationDuration,
        joystickNode: this.joystickNode ? this.joystickNode.name : null,
        spineNode: this.spineNode ? this.spineNode.name : null,
        attackNode: this.attackNode ? this.attackNode.name : null,
        detectNode: this.detectNode ? this.detectNode.name : null,
        stateText: this.stateText ? this.stateText.name : null,
        itemText: this.itemText ? this.itemText.name : null,
        hpFillNode: this.hpFillNode ? this.hpFillNode.name : null,
        hpBarNode: this.hpBarNode ? this.hpBarNode.name : null,
        staminaFillNode: this.staminaFillNode ? this.staminaFillNode.name : null,
        staminaBarNode: this.staminaBarNode ? this.staminaBarNode.name : null,
        weaponSlotNode: this.weaponSlotNode ? this.weaponSlotNode.name : null,
        weaponIconNode: this.weaponIconNode ? this.weaponIconNode.name : null,
        rangedWeaponRootNode: this.rangedWeaponRootNode ? this.rangedWeaponRootNode.name : null,
        rangedWeaponImageNode: this.rangedWeaponImageNode ? this.rangedWeaponImageNode.name : null,
        weaponSpineSlotName: this.weaponSpineSlotName,
        weaponMeleeSpineSlotName: this.weaponMeleeSpineSlotName,
        weaponRangedSpineSlotName: this.weaponRangedSpineSlotName,
        insertPlateSpineSlotName: this.insertPlateSpineSlotName,
        helmetSpineSlotName: this.helmetSpineSlotName,
        armorSpineSlotName: this.armorSpineSlotName,
        equipment: this.equipment ? this.equipment.snapshot() : null,
        currentHp: this.currentHp,
        maxHp: this.maxHp,
        hpFillFullWidth: this.hpFillFullWidth,
        currentStamina: this.currentStamina,
        maxStamina: this.maxStamina,
        staminaFillFullWidth: this.staminaFillFullWidth,
        hpBarRightX: this.hpBarRightX,
        hpBarLeftX: this.hpBarLeftX,
        staminaBarRightX: this.staminaBarRightX,
        staminaBarLeftX: this.staminaBarLeftX,
        deathReturnSceneUrl: this.deathReturnSceneUrl,
        owner: this.owner ? this.owner.name : null,
        scaleX: this.owner ? this.owner.scaleX : null,
        initialFacingSign: this.initialFacingSign,
        attackAreaRightX: this.attackAreaRightX,
        attackAreaLeftX: this.attackAreaLeftX,
        attackCooldown: this.attackCooldown,
        attackPower: this.attackPower,
        baseAttackPower: this.baseAttackPower,
        attackSpeed: this.attackSpeed,
        attackDamageRange: this.attackDamageRange,
        attackHitboxShowDelay: this.attackHitboxShowDelay,
        attackHitboxVisibleDuration: this.attackHitboxVisibleDuration,
        rangedAttackRange: this.rangedAttackRange,
        rangedAttackWidth: this.rangedAttackWidth,
        rangedAttackHitDelay: this.rangedAttackHitDelay,
        rangedAttackSoundUrl: this.rangedAttackSoundUrl,
        rangedWeaponAimRotationOffset: this.rangedWeaponAimRotationOffset,
        rangedChargeDuration: this.rangedChargeDuration,
        rangedMinDamageMultiplier: this.rangedMinDamageMultiplier,
        rangedMaxDamageMultiplier: this.rangedMaxDamageMultiplier,
        rangedBulletTextureUrl: this.rangedBulletTextureUrl,
        rangedBulletSpeed: this.rangedBulletSpeed,
        rangedBulletScale: this.rangedBulletScale,
        rangedBulletRotationOffset: this.rangedBulletRotationOffset,
        rangedBulletSpawnOffsetX: this.rangedBulletSpawnOffsetX,
        rangedBulletSpawnOffsetY: this.rangedBulletSpawnOffsetY,
        movement: this.movement ? this.movement.snapshot() : null,
        ui: this.ui ? this.ui.snapshot() : null,
        combat: this.combat ? this.combat.snapshot() : null,
        animation: this.animation ? this.animation.snapshot() : null,
        ranged: this.ranged ? this.ranged.snapshot() : null
      };
    }
  };
  __name(PlayerController, "PlayerController");
  PlayerController.activeInstance = null;
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "walkSpeed", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "runSpeed", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "moveSpeed", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "tileBlockHalfWidth", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "tileBlockFootOffsetY", 2);
  __decorateClass([
    property4(Boolean)
  ], PlayerController.prototype, "footstepSoundEnabled", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "cunzhuangWalkSoundUrl", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "cunzhuangRunSoundUrl", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "forestWalkSoundUrl", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "forestRunSoundUrl", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "mineWalkSoundUrl", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "mineRunSoundUrl", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "walkFootstepInterval", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "runFootstepInterval", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "walkFootstepPlaybackRate", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "runFootstepPlaybackRate", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "footstepPlaybackRateVariance", 2);
  __decorateClass([
    property4(Boolean)
  ], PlayerController.prototype, "isRunning", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "joystickNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "spineNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "attackNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "detectNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "stateText", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "itemText", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "hpFillNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "hpBarNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "staminaFillNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "staminaBarNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "weaponSlotNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "weaponIconNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "rangedWeaponRootNode", 2);
  __decorateClass([
    property4(Laya.Node)
  ], PlayerController.prototype, "rangedWeaponImageNode", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "weaponSpineSlotName", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "weaponMeleeSpineSlotName", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "weaponRangedSpineSlotName", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "insertPlateSpineSlotName", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "helmetSpineSlotName", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "armorSpineSlotName", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "currentHp", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "maxHp", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "hpFillFullWidth", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "currentStamina", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "maxStamina", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "runRecoverStaminaThreshold", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "staminaFillFullWidth", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "hpBarRightX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "hpBarLeftX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "staminaBarRightX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "staminaBarLeftX", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "deathReturnSceneUrl", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "initialFacingSign", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackAreaRightX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackAreaLeftX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackCooldown", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackPower", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "baseAttackPower", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackSpeed", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackDamageRange", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackHitboxShowDelay", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackHitboxVisibleDuration", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedAttackRange", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedAttackWidth", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedAttackHitDelay", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedAttackSoundUrl", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedWeaponAimRotationOffset", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedChargeDuration", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedMinDamageMultiplier", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedMaxDamageMultiplier", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedBulletTextureUrl", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedBulletSpeed", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedBulletScale", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedBulletRotationOffset", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedBulletSpawnOffsetX", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "rangedBulletSpawnOffsetY", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "idleAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "walkAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "runAnimation", 2);
  __decorateClass([
    property4({ type: Number, caption: "Run Animation Rate", tips: "Playback rate used only by the player run Spine locomotion animation." })
  ], PlayerController.prototype, "runAnimationPlaybackRate", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "attackAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedAttackAnimation", 2);
  __decorateClass([
    property4(Boolean)
  ], PlayerController.prototype, "layeredSpineAnimationEnabled", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "upperIdleAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "upperWalkAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "upperRunAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedUpperIdleAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedUpperWalkAnimation", 2);
  __decorateClass([
    property4(String)
  ], PlayerController.prototype, "rangedUpperRunAnimation", 2);
  __decorateClass([
    property4(Number)
  ], PlayerController.prototype, "attackAnimationDuration", 2);
  PlayerController = __decorateClass([
    regClass4("76db1d2e-7130-4636-8470-c6615ed7950b", "../src/Player/PlayerController.ts")
  ], PlayerController);

  // src/Enemy/ZombieHealthController.ts
  var _ZombieHealthController = class _ZombieHealthController {
    constructor(controller) {
      this.controller = controller;
      this.dropGranted = false;
    }
    setHp(currentHp, maxHp = this.controller.maxHp) {
      this.controller.maxHp = Math.max(1, Math.floor(maxHp));
      this.controller.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.controller.maxHp));
      this.setHpBarVisible(this.controller.currentHp > 0);
      this.refreshHpBar();
      if (this.controller.currentHp <= 0) {
        this.die();
      }
    }
    takeDamage(amount) {
      const damage = Math.max(0, Math.floor(amount));
      if (damage <= 0 || this.controller.isDead()) {
        return;
      }
      this.setHp(this.controller.currentHp - damage, this.controller.maxHp);
    }
    refreshHpBar() {
      const fill = this.controller.hpFillNode;
      if (!fill) {
        return;
      }
      const ratio = this.controller.currentHp / Math.max(1, this.controller.maxHp);
      this.applyHpFillWidth(fill, Math.max(0, this.controller.hpFillFullWidth * ratio));
    }
    reset() {
      this.dropGranted = false;
      this.controller.setDeadState(false);
      this.setHp(this.controller.maxHp, this.controller.maxHp);
    }
    snapshot() {
      return {
        dropGranted: this.dropGranted
      };
    }
    die() {
      var _a;
      if (this.controller.isDead()) {
        return;
      }
      this.controller.setDeadState(true);
      this.setHpBarVisible(false);
      this.grantDropsToPlayer();
      DataManager.getInstance().grantEnemyDefeatExperience();
      (_a = PlayerController.activeInstance) == null ? void 0 : _a.syncHpFromData();
      this.controller.movement.resetAggro();
      this.controller.combat.reset();
      this.controller.view.setAttackNodeVisible(false);
      this.controller.view.playDeathAnimation(() => {
        Laya.timer.clear(this.controller, this.controller.recycleToPool);
        Laya.timer.once(Math.max(0, this.controller.deathRecycleDelay || 0), this.controller, this.controller.recycleToPool);
      });
    }
    grantDropsToPlayer() {
      if (this.dropGranted) {
        return;
      }
      this.dropGranted = true;
      const itemId = String(this.controller.dropItemId || "").trim();
      const count = Math.max(0, Math.floor(this.controller.dropCount || 0));
      if (!itemId || count <= 0) {
        return;
      }
      const dataManager = DataManager.getInstance();
      const meta = dataManager.resolveItemMeta(itemId);
      const icon = (meta == null ? void 0 : meta.icon) || dataManager.resolveFallbackIcon(itemId);
      const name = (meta == null ? void 0 : meta.displayName) || dataManager.resolveFallbackName(itemId) || itemId;
      dataManager.grantItemsToActive([
        {
          itemId,
          name,
          count,
          icon
        }
      ]);
    }
    applyHpFillWidth(fill, width) {
      const nextWidth = Math.max(0, width);
      const height = this.resolveHpFillHeight(fill);
      const color = this.resolveHpFillColor(fill);
      fill.width = nextWidth;
      fill.height = height;
      const commands = fill._gcmds;
      if (Array.isArray(commands)) {
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command && "width" in command) {
            command.width = nextWidth;
          }
        }
      }
      if (fill.graphics && typeof fill.graphics.clear === "function" && typeof fill.graphics.drawRect === "function") {
        fill.graphics.clear();
        if (nextWidth > 0) {
          fill.graphics.drawRect(0, 0, nextWidth, height, color);
        }
      }
    }
    setHpBarVisible(visible) {
      var _a;
      const hpBarNode = this.controller.hpBarNode || ((_a = this.controller.hpFillNode) == null ? void 0 : _a.parent) || null;
      if (!hpBarNode) {
        return;
      }
      hpBarNode.visible = visible;
      if ("active" in hpBarNode) {
        hpBarNode.active = visible;
      }
    }
    resolveHpFillHeight(fill) {
      if (Number.isFinite(fill == null ? void 0 : fill.height) && fill.height > 0) {
        return fill.height;
      }
      const commands = fill == null ? void 0 : fill._gcmds;
      if (Array.isArray(commands)) {
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command && Number.isFinite(command.height) && command.height > 0) {
            return command.height;
          }
        }
      }
      return 10;
    }
    resolveHpFillColor(fill) {
      const commands = fill == null ? void 0 : fill._gcmds;
      if (Array.isArray(commands)) {
        for (let i = 0; i < commands.length; i++) {
          const command = commands[i];
          if (command && typeof command.fillColor === "string" && command.fillColor) {
            return command.fillColor;
          }
        }
      }
      return "#c93826";
    }
  };
  __name(_ZombieHealthController, "ZombieHealthController");
  var ZombieHealthController = _ZombieHealthController;

  // src/Enemy/ZombieMovementController.ts
  var _ZombieMovementController = class _ZombieMovementController {
    constructor(controller) {
      this.controller = controller;
      this.hasAggro = false;
      this.spawnIdleUntil = 0;
      this.tileBlockMovement = new TileBlockMovement();
    }
    onAwake() {
      this.resetSpawnIdle();
      this.tileBlockMovement.getBlockLayerName(this.controller.ownerSprite);
    }
    onStart() {
      if (this.spawnIdleUntil <= 0) {
        this.resetSpawnIdle();
      }
      this.tileBlockMovement.getBlockLayerName(this.controller.ownerSprite);
    }
    onUpdate() {
      if (Date.now() < this.spawnIdleUntil) {
        this.controller.view.playLocomotion(this.controller.idleAnimation);
        return;
      }
      const target = this.resolveTargetNode();
      if (!target) {
        this.controller.view.playLocomotion(this.controller.idleAnimation);
        return;
      }
      const owner = this.controller.ownerSprite;
      const targetPos = this.getGlobalPosition(target);
      const ownerPos = this.getGlobalPosition(owner);
      const deltaX = targetPos.x - ownerPos.x;
      const deltaY = targetPos.y - ownerPos.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (!this.hasAggro) {
        if (distance > this.controller.aggroDistance) {
          this.controller.view.playLocomotion(this.controller.idleAnimation);
          return;
        }
        this.hasAggro = true;
      }
      if (this.controller.combat.isAttackLocked()) {
        return;
      }
      if (distance <= this.controller.attackDistance) {
        this.controller.view.updateFacing(deltaX);
        this.controller.combat.startAttack();
        return;
      }
      const moveSpeed = this.controller.runSpeed;
      const dt = Laya.timer.delta / 1e3;
      const nx = distance > 0 ? deltaX / distance : 0;
      const ny = distance > 0 ? deltaY / distance : 0;
      const moveResult = this.tileBlockMovement.move(owner, nx * moveSpeed * dt, ny * moveSpeed * dt, {
        halfWidth: this.controller.tileBlockHalfWidth,
        footOffsetY: this.controller.tileBlockFootOffsetY
      });
      this.controller.view.updateFacing(nx);
      this.controller.view.playLocomotion(moveResult.moved ? this.controller.runAnimation : this.controller.idleAnimation);
    }
    resetAggro() {
      this.hasAggro = false;
    }
    resetSpawnIdle() {
      this.spawnIdleUntil = Date.now() + Math.max(0, this.controller.spawnIdleDuration || 0);
    }
    snapshot() {
      return {
        hasAggro: this.hasAggro,
        spawnIdleUntil: this.spawnIdleUntil,
        blockLayer: this.tileBlockMovement.getBlockLayerName(this.controller.ownerSprite)
      };
    }
    resolveTargetNode() {
      if (this.controller.playerNode) {
        return this.controller.playerNode;
      }
      const activePlayer = PlayerController.activeInstance;
      if (activePlayer && activePlayer.owner) {
        return activePlayer.owner;
      }
      return this.findPlayerNode(Laya.stage);
    }
    findPlayerNode(root) {
      if (!root) {
        return null;
      }
      if (root.getComponent(PlayerController)) {
        return root;
      }
      const childCount = root.numChildren || 0;
      for (let i = 0; i < childCount; i += 1) {
        const child = root.getChildAt(i);
        const found = this.findPlayerNode(child);
        if (found) {
          return found;
        }
      }
      return null;
    }
    getGlobalPosition(node) {
      const point = new Laya.Point();
      const sprite = node;
      if (sprite && typeof sprite.localToGlobal === "function") {
        sprite.localToGlobal(point, false);
      }
      return point;
    }
  };
  __name(_ZombieMovementController, "ZombieMovementController");
  var ZombieMovementController = _ZombieMovementController;

  // src/Enemy/ZombieViewController.ts
  var _ZombieViewController = class _ZombieViewController {
    constructor(controller) {
      this.controller = controller;
      this.spine = null;
      this.currentAnimation = "";
      this.baseScaleX = 1;
      this.facingSign = 1;
      this.deathAnimationStarted = false;
    }
    onAwake() {
      this.captureBaseScale();
      this.syncDetectNodeX();
      this.setAttackNodeVisible(false);
      this.resolveSpine();
      this.playLocomotion(this.controller.idleAnimation);
    }
    onStart() {
      this.captureBaseScale();
      this.syncDetectNodeX();
      this.setAttackNodeVisible(false);
      this.resolveSpine();
      this.playLocomotion(this.controller.idleAnimation);
    }
    onDestroy() {
      Laya.timer.clear(this, this.playDeathAnimation);
      this.setAttackNodeVisible(false);
      this.spine = null;
      this.currentAnimation = "";
    }
    reset() {
      this.currentAnimation = "";
      this.deathAnimationStarted = false;
      this.captureBaseScale();
      this.setAttackNodeVisible(false);
      this.resolveSpine();
      this.playLocomotion(this.controller.idleAnimation);
    }
    playLocomotion(animationName) {
      const nextAnimation = animationName || this.controller.idleAnimation || "idle";
      if (!this.spine || !this.isReady()) {
        return;
      }
      if (this.currentAnimation === nextAnimation) {
        return;
      }
      this.spine.play(nextAnimation, true, true);
      this.currentAnimation = nextAnimation;
    }
    playOneShot(animationName) {
      const nextAnimation = animationName || this.controller.attackAnimation || "attack";
      if (!this.spine) {
        return;
      }
      this.spine.play(nextAnimation, false, true);
      this.currentAnimation = nextAnimation;
    }
    playDeathAnimation(onStarted) {
      if (this.deathAnimationStarted) {
        return;
      }
      this.resolveSpine();
      if (!this.spine || !this.isReady()) {
        Laya.timer.once(0, this, this.playDeathAnimation, [onStarted]);
        return;
      }
      const animationName = this.controller.deathAnimation || "death";
      try {
        this.spine.play(animationName, false, true);
        this.currentAnimation = animationName;
      } catch (error) {
        if (animationName !== "death") {
          this.spine.play("death", false, true);
          this.currentAnimation = "death";
        } else {
          throw error;
        }
      }
      this.deathAnimationStarted = true;
      if (typeof onStarted === "function") {
        onStarted();
      }
    }
    setAttackNodeVisible(visible) {
      const attackNode = this.controller.attackNode;
      if (!attackNode) {
        return;
      }
      attackNode.visible = visible;
      if ("active" in attackNode) {
        attackNode.active = visible;
      }
    }
    updateFacing(moveX) {
      const owner = this.controller.ownerSprite;
      if (!owner) {
        return;
      }
      const desiredSign = moveX >= 0 ? -1 : 1;
      if (this.facingSign === desiredSign) {
        return;
      }
      this.facingSign = desiredSign;
      owner.scaleX = this.baseScaleX * this.facingSign;
      this.syncDetectNodeX();
      this.syncAttackNodeX();
      this.syncHpBarTransform();
    }
    isReady() {
      if (!this.spine) {
        return false;
      }
      const anySpine = this.spine;
      if (!anySpine.templet) {
        return false;
      }
      if (typeof anySpine.getAnimNum !== "function") {
        return true;
      }
      try {
        return Number(anySpine.getAnimNum()) > 0;
      } catch (error) {
        return false;
      }
    }
    snapshot() {
      return {
        currentAnimation: this.currentAnimation,
        facingSign: this.facingSign,
        deathAnimationStarted: this.deathAnimationStarted,
        hasSpine: !!this.spine,
        ready: this.isReady()
      };
    }
    resolveSpine() {
      if (this.spine || !this.controller.spineNode) {
        return;
      }
      this.spine = this.controller.spineNode.getComponent(Laya.Spine2DRenderNode);
    }
    captureBaseScale() {
      const owner = this.controller.ownerSprite;
      if (!owner) {
        return;
      }
      this.baseScaleX = Math.abs(owner.scaleX || 1);
      if (this.baseScaleX === 0) {
        this.baseScaleX = 1;
      }
      if (this.facingSign === 0) {
        this.facingSign = 1;
      }
      owner.scaleX = this.baseScaleX * this.facingSign;
      this.syncDetectNodeX();
      this.syncAttackNodeX();
      this.syncHpBarTransform();
    }
    syncDetectNodeX() {
      const detectNode = this.controller.detectNode;
      if (!detectNode) {
        return;
      }
      detectNode.x = this.facingSign < 0 ? this.controller.detectRightX : this.controller.detectLeftX;
    }
    syncAttackNodeX() {
      const attackNode = this.controller.attackNode;
      if (!attackNode) {
        return;
      }
      attackNode.x = this.facingSign < 0 ? this.controller.attackRightX : this.controller.attackLeftX;
    }
    syncHpBarTransform() {
      var _a;
      const hpBarNode = this.controller.hpBarNode || ((_a = this.controller.hpFillNode) == null ? void 0 : _a.parent) || null;
      if (!hpBarNode) {
        return;
      }
      const facingRight = this.facingSign < 0;
      hpBarNode.x = facingRight ? this.controller.hpBarRightX : this.controller.hpBarLeftX;
      hpBarNode.scaleX = facingRight ? -1 : 1;
    }
  };
  __name(_ZombieViewController, "ZombieViewController");
  var ZombieViewController = _ZombieViewController;

  // src/Enemy/ZombieController.ts
  var { regClass: regClass5, property: property5 } = Laya;
  var ZombieController = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.spineNode = null;
      this.playerNode = null;
      this.detectNode = null;
      this.attackNode = null;
      this.hpBarNode = null;
      this.hpFillNode = null;
      this.walkSpeed = 120;
      this.runSpeed = 240;
      this.tileBlockHalfWidth = 30;
      this.tileBlockFootOffsetY = 80;
      this.attackDistance = 20;
      this.aggroDistance = 400;
      this.spawnIdleDuration = 300;
      this.attackNodeShowDelay = 250;
      this.attackInterval = 700;
      this.attackPower = 8;
      this.attackLeftX = -70;
      this.attackRightX = -20;
      this.detectLeftX = -38;
      this.detectRightX = 38;
      this.hpBarRightX = -35;
      this.hpBarLeftX = 35;
      this.currentHp = 100;
      this.maxHp = 100;
      this.hpFillFullWidth = 70;
      this.idleAnimation = "idle";
      this.walkAnimation = "walk";
      this.runAnimation = "run";
      this.attackAnimation = "attack";
      this.deathAnimation = "death";
      this.deathRecycleDelay = 1500;
      this.dropItemId = "";
      this.dropCount = 1;
      this.dead = false;
      this.recycleToPool = /* @__PURE__ */ __name(() => {
        const owner = this.owner;
        if (!owner) {
          return;
        }
        Laya.timer.clear(this, this.recycleToPool);
        this.combat.reset();
        this.view.setAttackNodeVisible(false);
        if ("visible" in owner) {
          owner.visible = false;
        }
        if ("active" in owner) {
          owner.active = false;
        }
        if (ZombieController.pool.indexOf(this) < 0) {
          ZombieController.pool.push(this);
        }
      }, "recycleToPool");
    }
    static acquireFromPool(x, y) {
      const zombie = ZombieController.pool.pop() || null;
      if (!zombie) {
        return null;
      }
      zombie.resetFromPool(x, y);
      return zombie;
    }
    onAwake() {
      this.ensureControllers();
      this.view.onAwake();
      this.combat.reset();
      this.health.refreshHpBar();
      this.movement.onAwake();
    }
    onStart() {
      this.ensureControllers();
      this.view.onStart();
      this.combat.reset();
      this.health.refreshHpBar();
      this.movement.onStart();
    }
    onUpdate() {
      if (this.dead) {
        return;
      }
      this.movement.onUpdate();
    }
    onDestroy() {
      var _a, _b;
      Laya.timer.clear(this, this.recycleToPool);
      (_a = this.combat) == null ? void 0 : _a.onDestroy();
      (_b = this.view) == null ? void 0 : _b.onDestroy();
    }
    get ownerSprite() {
      return this.owner;
    }
    setHp(currentHp, maxHp = this.maxHp) {
      this.health.setHp(currentHp, maxHp);
    }
    takeDamage(amount) {
      this.health.takeDamage(amount);
    }
    isDead() {
      return this.dead;
    }
    setDeadState(value) {
      this.dead = value;
    }
    getAttackToken() {
      return this.combat.getAttackToken();
    }
    refreshHpBar() {
      this.health.refreshHpBar();
    }
    resetFromPool(x, y) {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.ensureControllers();
      Laya.timer.clear(this, this.recycleToPool);
      this.dead = false;
      this.health.reset();
      this.combat.reset();
      this.movement.resetAggro();
      this.movement.resetSpawnIdle();
      if (Number.isFinite(x)) {
        owner.x = x;
      }
      if (Number.isFinite(y)) {
        owner.y = y;
      }
      if ("visible" in owner) {
        owner.visible = true;
      }
      if ("active" in owner) {
        owner.active = true;
      }
      this.view.reset();
    }
    snapshot() {
      return {
        walkSpeed: this.walkSpeed,
        runSpeed: this.runSpeed,
        tileBlockHalfWidth: this.tileBlockHalfWidth,
        tileBlockFootOffsetY: this.tileBlockFootOffsetY,
        attackDistance: this.attackDistance,
        aggroDistance: this.aggroDistance,
        spawnIdleDuration: this.spawnIdleDuration,
        attackNodeShowDelay: this.attackNodeShowDelay,
        attackInterval: this.attackInterval,
        attackPower: this.attackPower,
        attackLeftX: this.attackLeftX,
        attackRightX: this.attackRightX,
        detectLeftX: this.detectLeftX,
        detectRightX: this.detectRightX,
        hpBarRightX: this.hpBarRightX,
        hpBarLeftX: this.hpBarLeftX,
        currentHp: this.currentHp,
        maxHp: this.maxHp,
        hpFillFullWidth: this.hpFillFullWidth,
        idleAnimation: this.idleAnimation,
        walkAnimation: this.walkAnimation,
        runAnimation: this.runAnimation,
        attackAnimation: this.attackAnimation,
        deathAnimation: this.deathAnimation,
        deathRecycleDelay: this.deathRecycleDelay,
        dropItemId: this.dropItemId,
        dropCount: this.dropCount,
        spineNode: this.spineNode ? this.spineNode.name : null,
        playerNode: this.playerNode ? this.playerNode.name : null,
        detectNode: this.detectNode ? this.detectNode.name : null,
        attackNode: this.attackNode ? this.attackNode.name : null,
        hpBarNode: this.hpBarNode ? this.hpBarNode.name : null,
        hpFillNode: this.hpFillNode ? this.hpFillNode.name : null,
        dead: this.dead,
        view: this.view ? this.view.snapshot() : null,
        combat: this.combat ? this.combat.snapshot() : null,
        health: this.health ? this.health.snapshot() : null,
        movement: this.movement ? this.movement.snapshot() : null
      };
    }
    ensureControllers() {
      if (!this.view) {
        this.view = new ZombieViewController(this);
      }
      if (!this.combat) {
        this.combat = new ZombieCombatController(this);
      }
      if (!this.health) {
        this.health = new ZombieHealthController(this);
      }
      if (!this.movement) {
        this.movement = new ZombieMovementController(this);
      }
    }
  };
  __name(ZombieController, "ZombieController");
  ZombieController.pool = [];
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "spineNode", 2);
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "playerNode", 2);
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "detectNode", 2);
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "attackNode", 2);
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "hpBarNode", 2);
  __decorateClass([
    property5(Laya.Node)
  ], ZombieController.prototype, "hpFillNode", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "walkSpeed", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "runSpeed", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "tileBlockHalfWidth", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "tileBlockFootOffsetY", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackDistance", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "aggroDistance", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "spawnIdleDuration", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackNodeShowDelay", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackInterval", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackPower", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackLeftX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "attackRightX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "detectLeftX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "detectRightX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "hpBarRightX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "hpBarLeftX", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "currentHp", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "maxHp", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "hpFillFullWidth", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "idleAnimation", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "walkAnimation", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "runAnimation", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "attackAnimation", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "deathAnimation", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "deathRecycleDelay", 2);
  __decorateClass([
    property5(String)
  ], ZombieController.prototype, "dropItemId", 2);
  __decorateClass([
    property5(Number)
  ], ZombieController.prototype, "dropCount", 2);
  ZombieController = __decorateClass([
    regClass5("d8d0b0e8-83ce-4c82-89bf-6f1e5a1d3e17", "../src/Enemy/ZombieController.ts")
  ], ZombieController);

  // src/JumpToScene.ts
  var { regClass: regClass6, property: property6 } = Laya;
  var JumpToScene = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.sceneUrl = "";
      this.boundOwner = null;
    }
    onAwake() {
      this.bindClickTarget();
    }
    onEnable() {
      this.bindClickTarget();
    }
    onDisable() {
      this.unbindClickTarget();
    }
    onDestroy() {
      this.unbindClickTarget();
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onJumpClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onJumpClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onJumpClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onJumpClick);
      }
      this.boundOwner = null;
    }
    onJumpClick() {
      const url = this.sceneUrl.trim();
      if (!url) {
        return;
      }
      Laya.timer.once(0, null, () => {
        DataManager.getInstance().enterScene(url);
        Laya.Scene.open(url);
      });
    }
  };
  __name(JumpToScene, "JumpToScene");
  __decorateClass([
    property6(String)
  ], JumpToScene.prototype, "sceneUrl", 2);
  JumpToScene = __decorateClass([
    regClass6("efc1b234-4347-4332-bdef-e97122381b78", "../src/JumpToScene.ts")
  ], JumpToScene);

  // src/platform/douyin/DouyinLogin.ts
  var DEFAULT_CONFIG = {
    loginEndpoint: "",
    privacyText: "Privacy Policy",
    tokenStorageKey: "douyin_login_token_v1",
    sessionStorageKey: "douyin_login_session_v1",
    postLoginSceneUrl: "scenes/cunzhuang.ls"
  };
  var ENDPOINT_STORAGE_KEY = "douyin_login_endpoint_v1";
  var _DouyinLogin = class _DouyinLogin {
    static configure(config) {
      this.config = {
        loginEndpoint: String(config.loginEndpoint || this.config.loginEndpoint || "").trim(),
        privacyText: String(config.privacyText || this.config.privacyText || DEFAULT_CONFIG.privacyText),
        tokenStorageKey: String(config.tokenStorageKey || this.config.tokenStorageKey || DEFAULT_CONFIG.tokenStorageKey),
        sessionStorageKey: String(config.sessionStorageKey || this.config.sessionStorageKey || DEFAULT_CONFIG.sessionStorageKey),
        postLoginSceneUrl: String(config.postLoginSceneUrl || this.config.postLoginSceneUrl || DEFAULT_CONFIG.postLoginSceneUrl).trim()
      };
      this.postLoginSceneUrl = this.config.postLoginSceneUrl;
    }
    static getSession() {
      const storage = this.getStorage();
      if (!storage) {
        return null;
      }
      const raw = storage.getItem(this.config.sessionStorageKey);
      if (!raw) {
        return null;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.token !== "string" || typeof parsed.openid !== "string") {
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    static isLoggedIn() {
      const session = this.getSession();
      return !!session && !!session.token && !!session.openid;
    }
    static openLoginPanel() {
      this.ensurePanel();
    }
    static ensureLogin() {
      return __async(this, null, function* () {
        const existing = this.getSession();
        if (existing) {
          return existing;
        }
        if (this.loginPromise) {
          return this.loginPromise;
        }
        if (!Laya.stage) {
          const devSession = this.createDevSession();
          this.saveSession(devSession);
          return devSession;
        }
        if (!this.hasInteractiveApi()) {
          const devSession = this.createDevSession();
          this.saveSession(devSession);
          return devSession;
        }
        this.loginPromise = new Promise((resolve) => {
          this.resolveLogin = resolve;
          this.ensurePanel();
        });
        return this.loginPromise;
      });
    }
    static logout() {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(this.config.sessionStorageKey);
        storage.removeItem(this.config.tokenStorageKey);
      }
      this.agreedPrivacy = false;
      this.busy = false;
      this.renderPanel();
    }
    static ensurePanel() {
      const stage = Laya.stage;
      if (!stage) {
        return;
      }
      if (this.panel && this.panel.overlay && !this.panel.overlay.destroyed) {
        this.renderPanel();
        return;
      }
      this.panel = this.createPanel();
      stage.addChild(this.panel.overlay);
      this.panel.endpointInput.text = this.resolveLoginEndpoint();
      this.renderPanel();
    }
    static createPanel() {
      var _a, _b;
      const stageWidth = Math.max(1, Number(((_a = Laya.stage) == null ? void 0 : _a.width) || 1334));
      const stageHeight = Math.max(1, Number(((_b = Laya.stage) == null ? void 0 : _b.height) || 750));
      const overlay = new Laya.Sprite();
      overlay.size(stageWidth, stageHeight);
      overlay.mouseEnabled = true;
      const mask = new Laya.Sprite();
      mask.size(stageWidth, stageHeight);
      mask.graphics.drawRect(0, 0, stageWidth, stageHeight, "#07111f");
      mask.alpha = 0.8;
      mask.mouseEnabled = true;
      overlay.addChild(mask);
      const panelWidth = 780;
      const panelHeight = 540;
      const panel = new Laya.Sprite();
      panel.size(panelWidth, panelHeight);
      panel.pos((stageWidth - panelWidth) / 2, (stageHeight - panelHeight) / 2);
      panel.graphics.drawRect(0, 0, panelWidth, panelHeight, "#111826");
      panel.mouseEnabled = true;
      overlay.addChild(panel);
      const accent = new Laya.Sprite();
      accent.size(panelWidth, 10);
      accent.graphics.drawRect(0, 0, panelWidth, 10, "#2d7cff");
      panel.addChild(accent);
      const title = this.createText("抖音账号登录", 34, "#f4f7fb", true, 420);
      title.pos(34, 24);
      panel.addChild(title);
      const subtitle = this.createText("点击菜单里的登录按钮打开此面板。所有登录 UI 都是这里动态新建的。", 18, "#97a6ba", false, 700);
      subtitle.wordWrap = true;
      subtitle.pos(34, 70);
      subtitle.height = 52;
      panel.addChild(subtitle);
      const sessionCard = this.createCard(34, 132, 712, 90, "#0e1522");
      panel.addChild(sessionCard);
      const sessionTitle = this.createText("当前会话", 20, "#cbd5e1", true, 160);
      sessionTitle.pos(18, 14);
      sessionCard.addChild(sessionTitle);
      const sessionText = this.createText("", 18, "#e2e8f0", false, 660);
      sessionText.wordWrap = true;
      sessionText.pos(18, 42);
      sessionText.height = 34;
      sessionCard.addChild(sessionText);
      const endpointCard = this.createCard(34, 236, 712, 132, "#0e1522");
      panel.addChild(endpointCard);
      const endpointTitle = this.createText("登录后端地址", 20, "#cbd5e1", true, 220);
      endpointTitle.pos(18, 14);
      endpointCard.addChild(endpointTitle);
      const endpointDesc = this.createText("一键登录需要一个后端接口，用来把抖音登录 code 换成你自己的 token。这个地址会保存到本地。", 16, "#94a3b8", false, 660);
      endpointDesc.wordWrap = true;
      endpointDesc.pos(18, 42);
      endpointDesc.height = 36;
      endpointCard.addChild(endpointDesc);
      const endpointFrame = this.createCard(18, 82, 540, 36, "#111827");
      endpointCard.addChild(endpointFrame);
      const endpointInput = this.createEndpointInput(520, 34);
      endpointInput.pos(8, 1);
      endpointFrame.addChild(endpointInput);
      const endpointHint = this.createText("空地址只会在开发环境创建本地会话，正式环境请填写真实后端。", 15, "#64748b", false, 660);
      endpointHint.wordWrap = true;
      endpointHint.pos(18, 104);
      endpointHint.height = 22;
      endpointCard.addChild(endpointHint);
      const privacyCard = this.createCard(34, 382, 712, 58, "#0e1522");
      panel.addChild(privacyCard);
      const privacyCheck = this.createCheckBox();
      privacyCheck.pos(18, 18);
      privacyCard.addChild(privacyCheck);
      const privacyText = this.createText("我已阅读并同意", 18, "#cbd5e1", false, 140);
      privacyText.pos(52, 17);
      privacyCard.addChild(privacyText);
      const privacyLink = this.createLinkText(this.config.privacyText);
      privacyLink.pos(176, 17);
      privacyLink.on(Laya.Event.CLICK, this, () => {
        this.openPrivacyContract();
      });
      privacyCard.addChild(privacyLink);
      const statusText = this.createText("", 18, "#fca5a5", false, 712);
      statusText.wordWrap = true;
      statusText.pos(34, 452);
      statusText.height = 28;
      panel.addChild(statusText);
      const loginButton = this.createButton("一键登录", "#2d7cff", "#ffffff", 170);
      loginButton.pos(34, 480);
      panel.addChild(loginButton);
      const logoutButton = this.createButton("退出登录", "#4b1f24", "#fecaca", 170);
      logoutButton.pos(222, 480);
      panel.addChild(logoutButton);
      const continueButton = this.createButton("进入游戏", "#166534", "#dcfce7", 170);
      continueButton.pos(410, 480);
      panel.addChild(continueButton);
      const closeButton = this.createButton("关闭", "#162033", "#dbeafe", 124);
      closeButton.pos(598, 480);
      panel.addChild(closeButton);
      const footer = this.createText("登录成功后会自动保存 token 与 session，然后可以直接进入游戏。", 15, "#8190a5", false, 720);
      footer.wordWrap = true;
      footer.pos(34, 520);
      footer.height = 20;
      panel.addChild(footer);
      mask.on(Laya.Event.CLICK, this, () => {
      });
      loginButton.on(Laya.Event.CLICK, this, () => {
        void this.beginLogin();
      });
      logoutButton.on(Laya.Event.CLICK, this, () => {
        this.logout();
      });
      continueButton.on(Laya.Event.CLICK, this, () => {
        this.enterPostLoginScene();
      });
      closeButton.on(Laya.Event.CLICK, this, () => {
        this.closePanel(true);
      });
      return {
        overlay,
        statusText,
        sessionText,
        endpointInput,
        privacyCheck,
        loginButton,
        logoutButton,
        continueButton,
        closeButton,
        endpointHint,
        loginButtonLabel: loginButton.getChildByName("label"),
        continueButtonLabel: continueButton.getChildByName("label")
      };
    }
    static renderPanel() {
      const panel = this.panel;
      if (!panel) {
        return;
      }
      const session = this.getSession();
      const endpoint = this.resolveLoginEndpoint();
      const hasApi = this.hasInteractiveApi();
      if (session) {
        panel.sessionText.text = [
          "已登录",
          `openid: ${this.maskValue(session.openid, 4)}`,
          session.unionid ? `unionid: ${this.maskValue(session.unionid, 4)}` : "",
          `created: ${session.created ? "yes" : "no"}`,
          `lastLoginAt: ${new Date(session.lastLoginAt).toLocaleString()}`
        ].filter(Boolean).join("    ");
      } else {
        panel.sessionText.text = "未登录。输入后端地址并同意隐私协议后，点击一键登录。";
      }
      panel.endpointHint.text = endpoint ? `当前保存的后端地址：${endpoint}` : "空地址只会在开发环境创建本地会话，正式环境请填写真实后端。";
      if (session) {
        panel.loginButtonLabel.text = "重新登录";
      } else if (!hasApi) {
        panel.loginButtonLabel.text = "开发会话";
      } else {
        panel.loginButtonLabel.text = "一键登录";
      }
      panel.continueButtonLabel.text = "进入游戏";
      panel.logoutButton.visible = !!session;
      panel.logoutButton.mouseEnabled = !!session && !this.busy;
      panel.continueButton.visible = !!session;
      panel.continueButton.mouseEnabled = !!session && !this.busy;
      panel.closeButton.mouseEnabled = !this.busy;
      this.setButtonEnabled(panel.loginButton, !this.busy);
      if (!hasApi) {
        panel.statusText.color = "#fbbf24";
        panel.statusText.text = "当前环境未提供 tt.login / tt.request，点击登录会创建本地开发会话。";
      } else if (!endpoint) {
        panel.statusText.color = "#fca5a5";
        panel.statusText.text = "请先填写登录后端地址。";
      } else if (!this.agreedPrivacy) {
        panel.statusText.color = "#fca5a5";
        panel.statusText.text = "请先勾选隐私协议。";
      } else if (this.busy) {
        panel.statusText.color = "#93c5fd";
        panel.statusText.text = "正在登录，请稍候...";
      } else if (session) {
        panel.statusText.color = "#86efac";
        panel.statusText.text = "登录成功，下一步可以进入游戏。";
      } else {
        panel.statusText.color = "#cbd5e1";
        panel.statusText.text = "填写完成后点击一键登录。";
      }
      this.renderPrivacy(panel);
    }
    static renderPrivacy(panel) {
      const tick = panel.privacyCheck.getChildByName("tick");
      if (tick) {
        tick.text = this.agreedPrivacy ? "✓" : "";
      }
    }
    static beginLogin() {
      return __async(this, null, function* () {
        var _a;
        if (!this.panel || this.busy) {
          return;
        }
        const endpoint = this.normalizeEndpoint(String(((_a = this.panel.endpointInput) == null ? void 0 : _a.text) || ""));
        this.saveLoginEndpoint(endpoint);
        if (!this.agreedPrivacy) {
          this.renderPanel();
          if (this.panel) {
            this.panel.statusText.color = "#fca5a5";
            this.panel.statusText.text = "请先勾选隐私协议。";
          }
          return;
        }
        const api = this.getApi();
        const canRealLogin = !!api && typeof api.login === "function" && typeof api.request === "function" && !!endpoint;
        this.busy = true;
        this.renderPanel();
        try {
          if (!api) {
            const devSession = this.createDevSession();
            this.saveSession(devSession);
            this.finishLogin(devSession);
            return;
          }
          if (!canRealLogin) {
            throw new Error("请先填写登录后端地址，然后再点击一键登录。");
          }
          const code = yield this.requestLoginCode();
          const session = yield this.exchangeCode(code, endpoint);
          this.saveSession(session);
          this.finishLogin(session);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error || "Login failed");
          this.busy = false;
          this.renderPanel();
          if (this.panel) {
            this.panel.statusText.color = "#fca5a5";
            this.panel.statusText.text = message;
          }
        }
      });
    }
    static finishLogin(session) {
      const resolve = this.resolveLogin;
      this.resolveLogin = null;
      this.loginPromise = null;
      this.busy = false;
      if (resolve) {
        resolve(session);
      }
      this.renderPanel();
    }
    static closePanel(resolvePending) {
      if (resolvePending && this.resolveLogin) {
        const resolve = this.resolveLogin;
        this.resolveLogin = null;
        this.loginPromise = null;
        resolve(null);
      }
      this.busy = false;
      this.destroyPanel();
    }
    static enterPostLoginScene() {
      const url = this.normalizeEndpoint(this.postLoginSceneUrl || DEFAULT_CONFIG.postLoginSceneUrl);
      if (!url) {
        this.closePanel(false);
        return;
      }
      this.closePanel(false);
      DataManager.getInstance().enterScene(url);
      Laya.Scene.open(url);
    }
    static destroyPanel() {
      var _a;
      const overlay = ((_a = this.panel) == null ? void 0 : _a.overlay) || null;
      this.panel = null;
      if (!overlay || overlay.destroyed) {
        return;
      }
      Laya.timer.once(0, null, () => {
        if (!overlay.destroyed) {
          if (overlay.parent) {
            overlay.removeSelf();
          }
          overlay.destroy(true);
        }
      });
    }
    static requestLoginCode() {
      const api = this.getApi();
      if (!api || typeof api.login !== "function") {
        return Promise.reject(new Error("tt.login unavailable"));
      }
      return new Promise((resolve, reject) => {
        var _a;
        (_a = api.login) == null ? void 0 : _a.call(api, {
          success: /* @__PURE__ */ __name((res) => {
            const code = String((res == null ? void 0 : res.code) || (res == null ? void 0 : res.anonymous_code) || "").trim();
            if (!code) {
              reject(new Error("登录接口没有返回 code"));
              return;
            }
            resolve(code);
          }, "success"),
          fail: /* @__PURE__ */ __name((err) => {
            reject(new Error((err == null ? void 0 : err.errMsg) || (err == null ? void 0 : err.message) || "tt.login failed"));
          }, "fail")
        });
      });
    }
    static exchangeCode(code, endpoint) {
      const api = this.getApi();
      if (!api || typeof api.request !== "function") {
        return Promise.reject(new Error("tt.request unavailable"));
      }
      const normalizedEndpoint = this.normalizeEndpoint(endpoint);
      if (!normalizedEndpoint) {
        return Promise.reject(new Error("登录后端地址未配置"));
      }
      return new Promise((resolve, reject) => {
        var _a;
        (_a = api.request) == null ? void 0 : _a.call(api, {
          url: normalizedEndpoint,
          method: "POST",
          header: {
            "content-type": "application/json"
          },
          data: {
            code
          },
          success: /* @__PURE__ */ __name((res) => {
            var _a2, _b;
            const body = (res == null ? void 0 : res.data) || {};
            const errno = Number((_b = (_a2 = body == null ? void 0 : body.err_no) != null ? _a2 : body == null ? void 0 : body.errno) != null ? _b : -1);
            if (errno !== 0) {
              reject(new Error((body == null ? void 0 : body.err_msg) || (body == null ? void 0 : body.err_tips) || (body == null ? void 0 : body.message) || "登录后端返回错误"));
              return;
            }
            const data = (body == null ? void 0 : body.data) || {};
            const token = String((data == null ? void 0 : data.token) || "").trim();
            const openid = String((data == null ? void 0 : data.openid) || "").trim();
            if (!token || !openid) {
              reject(new Error("登录后端没有返回完整的 token / openid"));
              return;
            }
            resolve({
              token,
              openid,
              unionid: String((data == null ? void 0 : data.unionid) || "").trim() || void 0,
              created: !!(data == null ? void 0 : data.created),
              createdAt: Number((data == null ? void 0 : data.createdAt) || Date.now()),
              lastLoginAt: Number((data == null ? void 0 : data.lastLoginAt) || Date.now())
            });
          }, "success"),
          fail: /* @__PURE__ */ __name((err) => {
            reject(new Error((err == null ? void 0 : err.errMsg) || (err == null ? void 0 : err.message) || "Login request failed"));
          }, "fail")
        });
      });
    }
    static saveSession(session) {
      const storage = this.getStorage();
      if (!storage) {
        return;
      }
      storage.setItem(this.config.tokenStorageKey, session.token);
      storage.setItem(this.config.sessionStorageKey, JSON.stringify(session));
    }
    static saveLoginEndpoint(endpoint) {
      const normalized = this.normalizeEndpoint(endpoint);
      this.config.loginEndpoint = normalized;
      const storage = this.getStorage();
      if (!storage) {
        return;
      }
      if (normalized) {
        storage.setItem(ENDPOINT_STORAGE_KEY, normalized);
      } else {
        storage.removeItem(ENDPOINT_STORAGE_KEY);
      }
    }
    static resolveLoginEndpoint() {
      const storage = this.getStorage();
      const stored = storage ? String(storage.getItem(ENDPOINT_STORAGE_KEY) || "").trim() : "";
      const globalEndpoint = this.normalizeEndpoint(String(globalThis.__DOUYIN_LOGIN_ENDPOINT__ || ""));
      return this.normalizeEndpoint(this.config.loginEndpoint || stored || globalEndpoint);
    }
    static createDevSession() {
      const now = Date.now();
      return {
        token: `dev_${now}`,
        openid: "dev-openid",
        unionid: "dev-unionid",
        created: true,
        createdAt: now,
        lastLoginAt: now
      };
    }
    static openPrivacyContract() {
      const api = this.getApi();
      if (!api || typeof api.openPrivacyContract !== "function") {
        return;
      }
      api.openPrivacyContract({
        fail: /* @__PURE__ */ __name(() => {
        }, "fail")
      });
    }
    static createText(text, fontSize, color, bold, width) {
      const label = new Laya.Text();
      label.text = text;
      label.fontSize = fontSize;
      label.color = color;
      label.bold = bold;
      label.width = width || 0;
      label.wordWrap = !!width;
      label.leading = 6;
      label.align = "left";
      return label;
    }
    static createLinkText(text) {
      const label = this.createText(text, 18, "#60a5fa", false);
      label.underline = true;
      label.mouseEnabled = true;
      return label;
    }
    static createButton(text, backgroundColor, color, width) {
      const button = new Laya.Sprite();
      button.size(width, 48);
      button.graphics.drawRect(0, 0, width, 48, backgroundColor);
      button.mouseEnabled = true;
      const label = this.createText(text, 20, color, true, width);
      label.name = "label";
      label.align = "center";
      label.valign = "middle";
      label.height = 48;
      button.addChild(label);
      return button;
    }
    static createCard(x, y, width, height, color) {
      const card = new Laya.Sprite();
      card.pos(x, y);
      card.size(width, height);
      card.graphics.drawRect(0, 0, width, height, color);
      return card;
    }
    static createCheckBox() {
      const box = new Laya.Sprite();
      box.size(22, 22);
      box.graphics.drawRect(0, 0, 22, 22, "#111827", "#94a3b8", 1);
      box.mouseEnabled = true;
      const tick = this.createText("", 16, "#60a5fa", true, 22);
      tick.name = "tick";
      tick.align = "center";
      tick.valign = "middle";
      tick.height = 22;
      box.addChild(tick);
      box.on(Laya.Event.CLICK, this, () => {
        this.agreedPrivacy = !this.agreedPrivacy;
        this.renderPanel();
      });
      return box;
    }
    static createEndpointInput(width, height) {
      const runtime = Laya;
      const InputCtor = typeof runtime.Input === "function" ? runtime.Input : typeof runtime.TextInput === "function" ? runtime.TextInput : null;
      if (InputCtor) {
        const input = new InputCtor();
        input.size(width, height);
        input.prompt = "https://example.com/api/douyin/login";
        input.editable = true;
        input.fontSize = 18;
        input.color = "#f8fafc";
        input.bold = false;
        input.padding = [8, 12, 8, 12];
        input.maxLength = 512;
        return input;
      }
      const fallback = new Laya.Sprite();
      fallback.size(width, height);
      fallback.graphics.drawRect(0, 0, width, height, "#111827", "#334155", 1);
      const label = this.createText("输入框不可用", 18, "#94a3b8", false, width - 16);
      label.pos(8, 6);
      fallback.addChild(label);
      return fallback;
    }
    static setButtonEnabled(button, enabled) {
      const owner = button;
      owner.mouseEnabled = enabled;
      button.alpha = enabled ? 1 : 0.58;
    }
    static hasInteractiveApi() {
      const api = this.getApi();
      return !!api && typeof api.login === "function" && typeof api.request === "function";
    }
    static normalizeEndpoint(value) {
      return String(value || "").trim();
    }
    static maskValue(value, visibleCount) {
      const raw = String(value || "").trim();
      if (raw.length <= visibleCount) {
        return raw;
      }
      return `${raw.slice(0, visibleCount)}...${raw.slice(-visibleCount)}`;
    }
    static getApi() {
      const scope = globalThis;
      return scope && scope.tt ? scope.tt : null;
    }
    static getStorage() {
      const scope = globalThis;
      if (!scope || !scope.localStorage) {
        return null;
      }
      return scope.localStorage;
    }
  };
  __name(_DouyinLogin, "DouyinLogin");
  _DouyinLogin.config = __spreadValues({}, DEFAULT_CONFIG);
  _DouyinLogin.panel = null;
  _DouyinLogin.loginPromise = null;
  _DouyinLogin.resolveLogin = null;
  _DouyinLogin.agreedPrivacy = false;
  _DouyinLogin.busy = false;
  _DouyinLogin.postLoginSceneUrl = DEFAULT_CONFIG.postLoginSceneUrl;
  var DouyinLogin = _DouyinLogin;

  // src/platform/douyin/DouyinCloudSaveManager.ts
  var _DouyinCloudSaveManager = class _DouyinCloudSaveManager {
    static getPlayerId() {
      return this.playerId;
    }
    static getDisplayId() {
      return this.displayId;
    }
    static isReady() {
      return this.ready;
    }
    static bootstrap() {
      return __async(this, null, function* () {
        if (this.ready) {
          return;
        }
        if (this.bootstrapPromise) {
          return this.bootstrapPromise;
        }
        this.bootstrapPromise = this.runBootstrap();
        return this.bootstrapPromise;
      });
    }
    static runBootstrap() {
      return __async(this, null, function* () {
        var _a, _b;
        if (this.bootstrapping || this.ready) {
          return;
        }
        this.bootstrapping = true;
        console.log("[DouyinCloudSave] bootstrap cloud save");
        try {
          const loginResult = yield DouyinCloudManager.login();
          const playerId = String(((_a = loginResult.data) == null ? void 0 : _a.playerId) || "").trim();
          if (!playerId) {
            throw new Error("cloud login success but playerId is empty");
          }
          this.playerId = playerId;
          this.displayId = Number((_b = loginResult.data) == null ? void 0 : _b.displayId) || 0;
          console.log("[DouyinCloudSave] login success:", playerId);
          yield this.loadCloudSave();
          this.installAutoUploadHooks();
          this.ready = true;
          if (this.dirty) {
            this.scheduleUpload();
          }
        } catch (error) {
          if (this.isCloudUserAuthError(error)) {
            console.warn(
              "[DouyinCloudSave] cloud user auth unavailable, keep local save only.",
              error
            );
          } else {
            console.error("[DouyinCloudSave] bootstrap failed:", error);
          }
        } finally {
          this.bootstrapping = false;
          this.bootstrapPromise = null;
        }
      });
    }
    static scheduleUpload(delayMs = 1500) {
      if (this.applyingCloudSave) {
        return;
      }
      this.dirty = true;
      if (!this.ready || !this.playerId) {
        return;
      }
      if (this.uploadTimer) {
        clearTimeout(this.uploadTimer);
      }
      this.uploadTimer = setTimeout(() => {
        this.uploadTimer = 0;
        void this.uploadNow();
      }, Math.max(100, Math.floor(delayMs)));
    }
    static uploadNow() {
      return __async(this, null, function* () {
        if (!this.ready || !this.playerId || this.applyingCloudSave) {
          return;
        }
        this.dirty = false;
        const saveData = this.collectLocalSaveData();
        try {
          yield DouyinCloudManager.saveGame(saveData);
          console.log("[DouyinCloudSave] cloud save uploaded");
        } catch (error) {
          this.dirty = true;
          console.error("[DouyinCloudSave] cloud save upload failed:", error);
        }
      });
    }
    static loadCloudSave() {
      return __async(this, null, function* () {
        var _a;
        const result = yield DouyinCloudManager.loadSave();
        const saveData = ((_a = result.data) == null ? void 0 : _a.saveData) || null;
        if (!this.isValidSaveData(saveData)) {
          console.log("[DouyinCloudSave] no cloud save, keep local save");
          this.scheduleUpload(100);
          return;
        }
        this.applyCloudSaveData(saveData);
        yield DataManager.getInstance().loadAll();
        console.log("[DouyinCloudSave] cloud save applied to local storage");
      });
    }
    static collectLocalSaveData() {
      const records = {};
      const storage = this.getStorage();
      for (let i = 0; i < this.SAVE_KEYS.length; i++) {
        const key = this.SAVE_KEYS[i];
        const value = storage.getItem(key);
        if (typeof value === "string") {
          records[key] = value;
        }
      }
      return {
        version: this.SAVE_VERSION,
        updatedAt: Date.now(),
        records
      };
    }
    static applyCloudSaveData(saveData) {
      const storage = this.getStorage();
      const records = saveData.records || {};
      this.applyingCloudSave = true;
      try {
        for (let i = 0; i < this.SAVE_KEYS.length; i++) {
          const key = this.SAVE_KEYS[i];
          if (Object.prototype.hasOwnProperty.call(records, key)) {
            storage.setItem(key, String(records[key]));
          }
        }
      } finally {
        this.applyingCloudSave = false;
      }
    }
    static installAutoUploadHooks() {
      const scope = globalThis;
      scope.__scheduleDouyinCloudSave = () => {
        _DouyinCloudSaveManager.scheduleUpload();
      };
      const api = typeof tt !== "undefined" ? tt : null;
      if (api && typeof api.onHide === "function") {
        api.onHide(() => {
          void _DouyinCloudSaveManager.uploadNow();
        });
      }
    }
    static isValidSaveData(value) {
      const saveData = value;
      return !!saveData && typeof saveData === "object" && typeof saveData.records === "object" && !!saveData.records;
    }
    static isCloudUserAuthError(error) {
      const value = error;
      const errNo = Number(value && value.errNo);
      const message = String(
        value && (value.errMsg || value.message) || error || ""
      ).toLowerCase();
      return errNo === 24001013 || message.indexOf("auth") >= 0 || message.indexOf("login") >= 0 || message.indexOf("user") >= 0;
    }
    static getStorage() {
      const scope = globalThis;
      if (!scope || !scope.localStorage) {
        throw new Error("localStorage is unavailable.");
      }
      return scope.localStorage;
    }
  };
  __name(_DouyinCloudSaveManager, "DouyinCloudSaveManager");
  _DouyinCloudSaveManager.SAVE_VERSION = 1;
  _DouyinCloudSaveManager.SAVE_KEYS = [
    "laya_test_base_inventory_v1",
    "laya_test_warehouse_inventory_v1",
    "laya_test_warehouse_meta_v1",
    "laya_test_equipment_v1",
    "laya_test_player_stats_v1",
    "laya_test_quick_slots_v1",
    "laya_test_sign_in_v1",
    "laya_test_mail_v1"
  ];
  _DouyinCloudSaveManager.bootstrapping = false;
  _DouyinCloudSaveManager.bootstrapPromise = null;
  _DouyinCloudSaveManager.ready = false;
  _DouyinCloudSaveManager.applyingCloudSave = false;
  _DouyinCloudSaveManager.dirty = false;
  _DouyinCloudSaveManager.uploadTimer = 0;
  _DouyinCloudSaveManager.playerId = "";
  _DouyinCloudSaveManager.displayId = 0;
  var DouyinCloudSaveManager = _DouyinCloudSaveManager;

  // src/platform/douyin/DouyinUserProfileManager.ts
  var PROFILE_STORAGE_KEY = "douyin_user_profile_v1";
  var USER_INFO_SCOPE = "scope.userInfo";
  var _DouyinUserProfileManager = class _DouyinUserProfileManager {
    static getLocalProfile() {
      const storage = this.getStorage();
      if (!storage) {
        return null;
      }
      const raw = storage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      try {
        return this.normalizeProfile(JSON.parse(raw));
      } catch (e) {
        return null;
      }
    }
    static loadCloudProfile() {
      return __async(this, null, function* () {
        var _a;
        try {
          const result = yield DouyinCloudManager.getProfile();
          const profile = this.normalizeProfile(((_a = result.data) == null ? void 0 : _a.profile) || null);
          if (profile) {
            this.saveLocalProfile(profile);
          }
          return profile;
        } catch (error) {
          console.warn("[DouyinUserProfile] load cloud profile failed:", error);
          return this.getLocalProfile();
        }
      });
    }
    static requestAndSaveProfile(desc = "show player avatar and nickname") {
      return __async(this, null, function* () {
        const profile = yield this.requestProfile(desc);
        this.saveLocalProfile(profile);
        try {
          yield DouyinCloudManager.updateProfile(profile);
        } catch (error) {
          console.warn("[DouyinUserProfile] upload profile failed:", error);
        }
        return profile;
      });
    }
    static saveLocalProfile(profile) {
      const normalized = this.normalizeProfile(profile);
      const storage = this.getStorage();
      if (!normalized || !storage) {
        return;
      }
      storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
      const laya = globalThis.Laya;
      if (laya && laya.stage) {
        laya.stage.event(this.PROFILE_CHANGED_EVENT, normalized);
      }
    }
    static requestProfile(desc) {
      const api = this.getApi();
      if (!api) {
        return Promise.reject(new Error("tt is unavailable."));
      }
      if (typeof api.getUserInfo === "function") {
        return this.requestMiniGameProfile(api);
      }
      if (typeof api.getUserProfile === "function") {
        return this.requestMiniAppProfile(api, desc);
      }
      return Promise.reject(new Error("tt.getUserInfo is unavailable."));
    }
    static requestMiniGameProfile(api) {
      return __async(this, null, function* () {
        yield this.ensureLoginSession(api);
        yield this.ensureUserInfoAuthorized(api);
        return this.getUserInfo(api);
      });
    }
    static requestMiniAppProfile(api, desc) {
      return new Promise((resolve, reject) => {
        var _a;
        (_a = api.getUserProfile) == null ? void 0 : _a.call(api, {
          desc,
          success: /* @__PURE__ */ __name((res) => {
            const profile = this.normalizeProfile(res && res.userInfo);
            if (!profile) {
              reject(new Error("tt.getUserProfile returned empty userInfo."));
              return;
            }
            resolve(profile);
          }, "success"),
          fail: /* @__PURE__ */ __name((err) => {
            reject(new Error(
              err && (err.errMsg || err.message) || "tt.getUserProfile failed."
            ));
          }, "fail")
        });
      });
    }
    static ensureLoginSession(api) {
      if (typeof api.login !== "function") {
        return Promise.resolve();
      }
      return new Promise((resolve, reject) => {
        var _a;
        (_a = api.login) == null ? void 0 : _a.call(api, {
          force: false,
          success: /* @__PURE__ */ __name(() => resolve(), "success"),
          fail: /* @__PURE__ */ __name((err) => reject(this.createApiError(err, "tt.login failed.")), "fail")
        });
      });
    }
    static ensureUserInfoAuthorized(api) {
      return __async(this, null, function* () {
        const setting = yield this.getSetting(api);
        if (setting && setting[USER_INFO_SCOPE]) {
          return;
        }
        const authError = yield this.tryShowDouyinOpenAuth(api);
        if (!authError) {
          return;
        }
        if (typeof api.authorize !== "function") {
          throw authError;
        }
        yield new Promise((resolve, reject) => {
          var _a;
          (_a = api.authorize) == null ? void 0 : _a.call(api, {
            scope: USER_INFO_SCOPE,
            success: /* @__PURE__ */ __name(() => resolve(), "success"),
            fail: /* @__PURE__ */ __name((err) => reject(this.createApiError(err, "tt.authorize failed.")), "fail")
          });
        });
      });
    }
    static getSetting(api) {
      if (typeof api.getSetting !== "function") {
        return Promise.resolve(null);
      }
      return new Promise((resolve) => {
        var _a;
        (_a = api.getSetting) == null ? void 0 : _a.call(api, {
          success: /* @__PURE__ */ __name((res) => resolve(res && res.authSetting || null), "success"),
          fail: /* @__PURE__ */ __name(() => resolve(null), "fail")
        });
      });
    }
    static tryShowDouyinOpenAuth(api) {
      if (typeof api.showDouyinOpenAuth !== "function") {
        return Promise.resolve(new Error("tt.showDouyinOpenAuth is unavailable."));
      }
      return new Promise((resolve) => {
        var _a;
        (_a = api.showDouyinOpenAuth) == null ? void 0 : _a.call(api, {
          scope: USER_INFO_SCOPE,
          success: /* @__PURE__ */ __name(() => resolve(null), "success"),
          fail: /* @__PURE__ */ __name((err) => resolve(this.createApiError(err, "tt.showDouyinOpenAuth failed.")), "fail")
        });
      });
    }
    static getUserInfo(api) {
      return new Promise((resolve, reject) => {
        var _a;
        (_a = api.getUserInfo) == null ? void 0 : _a.call(api, {
          withCredentials: false,
          success: /* @__PURE__ */ __name((res) => {
            const profile = this.normalizeProfile(res && res.userInfo);
            if (!profile) {
              reject(new Error("tt.getUserInfo returned empty userInfo."));
              return;
            }
            resolve(profile);
          }, "success"),
          fail: /* @__PURE__ */ __name((err) => reject(this.createApiError(err, "tt.getUserInfo failed.")), "fail")
        });
      });
    }
    static normalizeProfile(value) {
      if (!value || typeof value !== "object") {
        return null;
      }
      const nickName = String(value.nickName || value.nickname || "").trim();
      const avatarUrl = String(value.avatarUrl || value.avatar || "").trim();
      if (!nickName && !avatarUrl) {
        return null;
      }
      return {
        nickName,
        avatarUrl,
        gender: this.optionalNumber(value.gender),
        city: this.optionalString(value.city),
        province: this.optionalString(value.province),
        country: this.optionalString(value.country),
        language: this.optionalString(value.language),
        updatedAt: Number(value.updatedAt) || Date.now()
      };
    }
    static optionalString(value) {
      const text = String(value || "").trim();
      return text || void 0;
    }
    static optionalNumber(value) {
      const num = Number(value);
      return Number.isFinite(num) ? num : void 0;
    }
    static createApiError(err, fallback) {
      return new Error(
        err && (err.errMsg || err.message) || fallback
      );
    }
    static getApi() {
      const scope = globalThis;
      return scope && scope.tt ? scope.tt : null;
    }
    static getStorage() {
      const scope = globalThis;
      if (!scope || !scope.localStorage) {
        return null;
      }
      return scope.localStorage;
    }
  };
  __name(_DouyinUserProfileManager, "DouyinUserProfileManager");
  _DouyinUserProfileManager.PROFILE_CHANGED_EVENT = "douyin_user_profile_changed";
  var DouyinUserProfileManager = _DouyinUserProfileManager;

  // src/PlayUI/playerui/PlayerProfileView.ts
  var { regClass: regClass7 } = Laya;
  var PlayerProfileView = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.avatarNode = null;
      this.nameText = null;
      this.idText = null;
      this.requestingProfile = false;
    }
    onAwake() {
      this.bindNodes();
      this.bindClick();
      this.render(DouyinUserProfileManager.getLocalProfile());
    }
    onEnable() {
      this.bindNodes();
      this.bindClick();
      if (Laya.stage) {
        Laya.stage.on(
          DouyinUserProfileManager.PROFILE_CHANGED_EVENT,
          this,
          this.onProfileChanged
        );
      }
      void this.refreshFromCloud();
    }
    onDisable() {
      const owner = this.owner;
      if (owner) {
        owner.off(Laya.Event.CLICK, this, this.requestProfile);
      }
      if (Laya.stage) {
        Laya.stage.off(
          DouyinUserProfileManager.PROFILE_CHANGED_EVENT,
          this,
          this.onProfileChanged
        );
      }
    }
    refresh() {
      this.bindNodes();
      this.bindClick();
      this.render(DouyinUserProfileManager.getLocalProfile());
      void this.refreshFromCloud();
    }
    refreshFromCloud() {
      return __async(this, null, function* () {
        try {
          yield DouyinCloudSaveManager.bootstrap();
          const profile = yield DouyinUserProfileManager.loadCloudProfile();
          this.render(profile);
        } catch (error) {
          console.warn("[PlayerProfileView] refresh failed:", error);
          this.render(DouyinUserProfileManager.getLocalProfile());
        }
      });
    }
    requestProfile() {
      return __async(this, null, function* () {
        if (this.requestingProfile) {
          return;
        }
        this.requestingProfile = true;
        if (this.nameText) {
          this.nameText.text = "Authorizing";
        }
        try {
          const profile = yield DouyinUserProfileManager.requestAndSaveProfile();
          this.render(profile);
        } catch (error) {
          console.warn("[PlayerProfileView] request profile failed:", error);
          this.render(DouyinUserProfileManager.getLocalProfile());
        } finally {
          this.requestingProfile = false;
        }
      });
    }
    onProfileChanged(profile) {
      this.render(profile);
    }
    bindNodes() {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.avatarNode = owner.getChildByName("img");
      this.nameText = owner.getChildByName("name");
      this.idText = owner.getChildByName("id");
    }
    bindClick() {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      owner.off(Laya.Event.CLICK, this, this.requestProfile);
      owner.on(Laya.Event.CLICK, this, this.requestProfile);
    }
    render(profile) {
      const playerId = DouyinCloudSaveManager.getPlayerId();
      const displayId = DouyinCloudSaveManager.getDisplayId();
      if (this.nameText) {
        this.nameText.text = profile && profile.nickName ? profile.nickName : "Tap to authorize";
      }
      if (this.idText) {
        this.idText.text = displayId > 0 ? "ID: " + displayId : playerId ? "ID: " + playerId : "ID: not logged in";
      }
      if (profile && profile.avatarUrl) {
        this.setAvatar(profile.avatarUrl);
      }
    }
    setAvatar(url) {
      const avatar = this.avatarNode;
      if (!avatar) {
        return;
      }
      if ("src" in avatar) {
        avatar.src = url;
      }
      if ("skin" in avatar) {
        avatar.skin = url;
      }
      if (typeof avatar.loadImage === "function") {
        avatar.loadImage(url);
      }
    }
  };
  __name(PlayerProfileView, "PlayerProfileView");
  PlayerProfileView = __decorateClass([
    regClass7("3f1f81ab-21ef-42ec-9163-9e72d3395b4a", "../src/PlayUI/playerui/PlayerProfileView.ts")
  ], PlayerProfileView);

  // src/OpenSprite.ts
  var { regClass: regClass8, property: property7 } = Laya;
  var OpenSprite = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.targetNode = null;
      this.actionId = "";
      this.boundOwner = null;
    }
    onAwake() {
      OpenSprite.startCloudLoginOnce();
      OpenSprite.bindPlayerProfileViewOnce();
      this.bindClickTarget();
    }
    onEnable() {
      this.bindClickTarget();
    }
    onDisable() {
      this.unbindClickTarget();
    }
    onDestroy() {
      this.unbindClickTarget();
    }
    static startCloudLoginOnce() {
      if (OpenSprite.cloudLoginStarted) {
        return;
      }
      OpenSprite.cloudLoginStarted = true;
      console.log("[DouyinCloud] 菜单启动，开始免登录");
      void DouyinCloudSaveManager.bootstrap();
    }
    static bindPlayerProfileViewOnce() {
      Laya.timer.once(0, null, () => {
        const stage = Laya.stage;
        if (!stage) {
          return;
        }
        const profileNode = OpenSprite.findNodeByName(stage, "touxiang");
        if (!profileNode || profileNode.destroyed) {
          return;
        }
        if (!profileNode.getComponent(PlayerProfileView)) {
          profileNode.addComponent(PlayerProfileView);
        }
      });
    }
    static findNodeByName(root, name) {
      if (root.name === name) {
        return root;
      }
      const count = root.numChildren;
      for (let i = 0; i < count; i++) {
        const child = root.getChildAt(i);
        const found = OpenSprite.findNodeByName(child, name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onOpenClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onOpenClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onOpenClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onOpenClick);
      }
      this.boundOwner = null;
    }
    onOpenClick() {
      const actionId = String(this.actionId || "").trim();
      if (actionId === "douyin-login") {
        DouyinLogin.openLoginPanel();
        return;
      }
      if (actionId === "douyin-profile") {
        void this.requestDouyinProfile();
        return;
      }
      if (this.targetNode) {
        this.targetNode.visible = true;
        this.refreshTargetNode(this.targetNode);
      }
    }
    requestDouyinProfile() {
      return __async(this, null, function* () {
        try {
          const profile = yield DouyinUserProfileManager.requestAndSaveProfile();
          console.log("[DouyinProfile] profile saved:", profile);
        } catch (error) {
          console.warn("[DouyinProfile] request profile failed:", error);
        }
      });
    }
    refreshTargetNode(node) {
      const components = node._components;
      if (!Array.isArray(components)) {
        return;
      }
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component && typeof component.onPanelOpened === "function") {
          component.onPanelOpened();
        } else if (component && typeof component.refresh === "function") {
          component.refresh();
        }
      }
    }
  };
  __name(OpenSprite, "OpenSprite");
  OpenSprite.cloudLoginStarted = false;
  __decorateClass([
    property7({ type: Laya.Node })
  ], OpenSprite.prototype, "targetNode", 2);
  __decorateClass([
    property7(String)
  ], OpenSprite.prototype, "actionId", 2);
  OpenSprite = __decorateClass([
    regClass8("2938a217-4272-4f6d-aaf2-984b61320b26", "../src/OpenSprite.ts")
  ], OpenSprite);

  // src/PlayUI/CommonUI/listTemplate.ts
  var { regClass: regClass9, property: property8 } = Laya;
  var listTemplate = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.templateSlot = null;
      this.gimg = null;
      this.nameText = null;
      this.countText = null;
      this.detailNode = null;
      this.detailTextNode = null;
      this.boundData = null;
      this.bindingsResolved = false;
      this.longPressToken = 0;
      this.longPressBound = false;
      this.suppressNextClick = false;
      this.detailOriginalParent = null;
      this.detailOriginalChildIndex = -1;
      this.detailOriginalX = 0;
      this.detailOriginalY = 0;
    }
    onAwake() {
      this.initializeIconSize();
      this.bindLongPressEvents();
      this.hideDetail();
    }
    onEnable() {
      this.initializeIconSize();
      this.bindLongPressEvents();
      this.hideDetail();
    }
    onDisable() {
      this.cancelLongPress();
      this.hideDetail();
    }
    onDestroy() {
      this.cancelLongPress();
      this.unbindLongPressEvents();
    }
    bindData(data) {
      var _a;
      this.boundData = data ? __spreadValues({}, data) : null;
      this.resolveRuntimeBindings();
      this.hideDetail();
      const icon = this.gimg;
      const nameNode = this.nameText;
      const countNode = this.countText;
      const hasData = !!data;
      this.applyIconSize(icon);
      if (!hasData) {
        if (icon && "visible" in icon) {
          icon.visible = false;
        }
        if (nameNode) {
          nameNode.text = "";
        }
        if (countNode) {
          countNode.text = "";
        }
        return;
      }
      const itemId = String((data == null ? void 0 : data.itemId) || "");
      const itemName = this.resolveDisplayName(itemId, data == null ? void 0 : data.name);
      const countTextValue = (data == null ? void 0 : data.countText) !== void 0 ? String(data.countText) : String((_a = data == null ? void 0 : data.count) != null ? _a : 0);
      const iconInput = (data == null ? void 0 : data.icon) ? String(data.icon) : this.resolveFallbackIcon(itemId);
      const resolvedIconPath = this.resolveIconPath(iconInput, data);
      if (!iconInput) {
        throw new Error(`[listTemplate] missing icon path for item: ${String((data == null ? void 0 : data.itemId) || (data == null ? void 0 : data.name) || "unknown")}`);
      }
      if (!resolvedIconPath) {
        throw new Error(`[listTemplate] icon path resolve failed for item: ${String((data == null ? void 0 : data.itemId) || (data == null ? void 0 : data.name) || "unknown")}`);
      }
      if (icon) {
        if ("visible" in icon) {
          icon.visible = true;
        }
        this.applyIconSize(icon);
        if ("skin" in icon) {
          icon.skin = resolvedIconPath;
        }
        if ("src" in icon) {
          icon.src = resolvedIconPath;
        }
        this.applyIconSize(icon);
        Laya.timer.callLater(this, () => this.applyIconSize(icon));
      }
      if (nameNode) {
        nameNode.text = itemName;
      }
      if (countNode) {
        countNode.text = countTextValue;
      }
    }
    initializeIconSize() {
      this.resolveRuntimeBindings();
      this.applyIconSize(this.gimg);
      Laya.timer.callLater(this, () => {
        this.resolveRuntimeBindings();
        this.applyIconSize(this.gimg);
      });
    }
    applyIconSize(icon) {
      if (!icon) {
        return;
      }
      if ("width" in icon) {
        icon.width = 55;
      }
      if ("height" in icon) {
        icon.height = 55;
      }
      if ("autoSize" in icon) {
        icon.autoSize = false;
      }
    }
    getBoundData() {
      return this.boundData ? __spreadValues({}, this.boundData) : null;
    }
    setSelected(selected) {
      const owner = this.owner;
      if (owner && "alpha" in owner) {
        owner.alpha = selected ? 0.75 : 1;
      }
    }
    resolveRuntimeBindings() {
      if (this.bindingsResolved) {
        return;
      }
      const owner = this.owner;
      const children = owner && Array.isArray(owner.children) ? owner.children : null;
      if (!children) {
        return;
      }
      if (!this.templateSlot) {
        this.templateSlot = this.findChildByName(this.owner, "item") || children[0] || null;
      }
      if (!this.gimg) {
        this.gimg = this.findChildByName(this.owner, "icon") || children[1] || null;
      }
      if (!this.nameText) {
        this.nameText = this.findChildByName(this.owner, "name") || children[2] || null;
      }
      if (!this.countText) {
        this.countText = this.findChildByName(this.owner, "amount") || this.findChildByName(this.owner, "count") || children[3] || null;
      }
      if (!this.detailNode) {
        this.detailNode = this.findChildByName(this.owner, "detail");
      }
      if (!this.detailTextNode && this.detailNode) {
        this.detailTextNode = this.findFirstTextChild(this.detailNode);
      }
      this.bindingsResolved = !!(this.templateSlot && this.gimg && this.nameText && this.countText);
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (String(root.name || "") === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findFirstTextChild(root) {
      if (!root) {
        return null;
      }
      const node = root;
      if ("text" in node) {
        return root;
      }
      const children = node.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findFirstTextChild(children[i]);
        if (found) {
          return found;
        }
      }
      return null;
    }
    bindLongPressEvents() {
      if (this.longPressBound || !this.owner) {
        return;
      }
      const owner = this.owner;
      owner.mouseEnabled = true;
      owner.on("mousedown", this, this.startLongPress);
      owner.on("touchstart", this, this.startLongPress);
      owner.on("mouseup", this, this.cancelLongPress);
      owner.on("mouseout", this, this.cancelLongPress);
      owner.on("touchend", this, this.cancelLongPress);
      this.longPressBound = true;
    }
    unbindLongPressEvents() {
      if (!this.longPressBound || !this.owner) {
        return;
      }
      const owner = this.owner;
      owner.off("mousedown", this, this.startLongPress);
      owner.off("touchstart", this, this.startLongPress);
      owner.off("mouseup", this, this.cancelLongPress);
      owner.off("mouseout", this, this.cancelLongPress);
      owner.off("touchend", this, this.cancelLongPress);
      this.longPressBound = false;
    }
    startLongPress() {
      var _a;
      if (!((_a = this.boundData) == null ? void 0 : _a.itemId)) {
        this.hideDetail();
        return;
      }
      this.suppressNextClick = false;
      this.longPressToken++;
      const token = this.longPressToken;
      Laya.timer.clear(this, this.showDetailAfterLongPress);
      Laya.timer.once(1e3, this, this.showDetailAfterLongPress, [token]);
    }
    cancelLongPress() {
      this.longPressToken++;
      Laya.timer.clear(this, this.showDetailAfterLongPress);
      this.hideDetail();
    }
    showDetailAfterLongPress(token) {
      var _a;
      if (token !== this.longPressToken || !((_a = this.boundData) == null ? void 0 : _a.itemId)) {
        return;
      }
      this.suppressNextClick = true;
      this.showDetail();
    }
    consumeSuppressNextClick() {
      const shouldSuppress = this.suppressNextClick;
      this.suppressNextClick = false;
      return shouldSuppress;
    }
    showDetail() {
      var _a;
      this.resolveRuntimeBindings();
      if (!this.detailNode || !this.detailTextNode || !((_a = this.boundData) == null ? void 0 : _a.itemId)) {
        return;
      }
      const textNode = this.detailTextNode;
      const detailText = listTemplate.formatItemDetailText(this.boundData);
      textNode.text = detailText;
      textNode.visible = true;
      this.resizeDetailToText(detailText);
      this.moveDetailToOverlay();
      const detail = this.detailNode;
      detail.visible = true;
    }
    hideDetail() {
      this.resolveRuntimeBindings();
      if (this.detailNode && "visible" in this.detailNode) {
        this.detailNode.visible = false;
      }
      if (this.detailTextNode && "visible" in this.detailTextNode) {
        this.detailTextNode.visible = false;
      }
      this.restoreDetailParent();
    }
    resizeDetailToText(text) {
      const detail = this.detailNode;
      const textNode = this.detailTextNode;
      if (!detail || !textNode) {
        return;
      }
      const paddingX = 12;
      const paddingY = 10;
      const minWidth = 80;
      const minHeight = 40;
      const maxWidth = 240;
      const fontSize = Math.max(1, Number(textNode.fontSize) || 15);
      const leading = Math.max(0, Number(textNode.leading) || 0);
      const lines = String(text || "").split(/\r?\n/);
      const longestLineLength = lines.reduce((max, line) => Math.max(max, this.getDisplayTextLength(line)), 0);
      const textWidth = Math.min(maxWidth - paddingX * 2, Math.max(1, longestLineLength * fontSize));
      const textHeight = Math.max(1, lines.length * fontSize + Math.max(0, lines.length - 1) * leading);
      const detailWidth = Math.max(minWidth, Math.ceil(textWidth + paddingX * 2));
      const detailHeight = Math.max(minHeight, Math.ceil(textHeight + paddingY * 2));
      detail.width = detailWidth;
      detail.height = detailHeight;
      if (typeof detail.size === "function") {
        detail.size(detailWidth, detailHeight);
      }
      textNode.x = paddingX;
      textNode.y = paddingY;
      textNode.width = detailWidth - paddingX * 2;
      textNode.height = detailHeight - paddingY * 2;
      if ("wordWrap" in textNode) {
        textNode.wordWrap = false;
      }
      if ("overflow" in textNode) {
        textNode.overflow = "visible";
      }
      this.redrawDetailBackground(detail, detailWidth, detailHeight);
    }
    getDisplayTextLength(text) {
      let length = 0;
      for (let i = 0; i < text.length; i++) {
        length += text.charCodeAt(i) > 255 ? 1 : 0.55;
      }
      return length;
    }
    redrawDetailBackground(detail, width, height) {
      const graphics = detail.graphics;
      if (graphics && typeof graphics.clear === "function" && typeof graphics.drawRect === "function") {
        graphics.clear();
        graphics.drawRect(0, 0, width, height, "#939322", "#000000");
      }
      const commands = detail._gcmds;
      if (Array.isArray(commands) && commands[0]) {
        commands[0].width = width;
        commands[0].height = height;
      }
    }
    moveDetailToOverlay() {
      var _a;
      const owner = this.owner;
      const detail = this.detailNode;
      const overlayParent = (_a = owner == null ? void 0 : owner.parent) == null ? void 0 : _a.parent;
      if (!owner || !detail || !overlayParent || detail.parent === overlayParent || typeof overlayParent.addChild !== "function") {
        return;
      }
      const currentParent = detail.parent;
      if (!currentParent) {
        return;
      }
      this.detailOriginalParent = currentParent;
      this.detailOriginalChildIndex = typeof currentParent.getChildIndex === "function" ? currentParent.getChildIndex(detail) : -1;
      this.detailOriginalX = Number.isFinite(detail.x) ? detail.x : 0;
      this.detailOriginalY = Number.isFinite(detail.y) ? detail.y : 0;
      const globalPoint = typeof owner.localToGlobal === "function" ? owner.localToGlobal(new Laya.Point(this.detailOriginalX, this.detailOriginalY), true) : new Laya.Point((owner.x || 0) + this.detailOriginalX, (owner.y || 0) + this.detailOriginalY);
      const overlayPoint = typeof overlayParent.globalToLocal === "function" ? overlayParent.globalToLocal(globalPoint, true) : globalPoint;
      overlayParent.addChild(detail);
      if (typeof detail.pos === "function") {
        detail.pos(overlayPoint.x, overlayPoint.y);
      } else {
        detail.x = overlayPoint.x;
        detail.y = overlayPoint.y;
      }
    }
    restoreDetailParent() {
      const detail = this.detailNode;
      const parent = this.detailOriginalParent;
      const originalIndex = this.detailOriginalChildIndex;
      const originalX = this.detailOriginalX;
      const originalY = this.detailOriginalY;
      this.detailOriginalParent = null;
      this.detailOriginalChildIndex = -1;
      if (!detail || !parent || detail.parent === parent || typeof parent.addChild !== "function") {
        return;
      }
      if (originalIndex >= 0 && typeof parent.addChildAt === "function") {
        const maxIndex = Math.max(0, parent.numChildren || 0);
        parent.addChildAt(detail, Math.min(originalIndex, maxIndex));
      } else {
        parent.addChild(detail);
      }
      if (typeof detail.pos === "function") {
        detail.pos(originalX, originalY);
      } else {
        detail.x = originalX;
        detail.y = originalY;
      }
    }
    static formatItemDetailText(data) {
      const itemId = String((data == null ? void 0 : data.itemId) || "").trim();
      const meta = itemId ? DataManager.getInstance().resolveItemMeta(itemId) : null;
      const rawName = String((data == null ? void 0 : data.name) || "").trim();
      const name = (meta == null ? void 0 : meta.displayName) || (meta == null ? void 0 : meta.nameZh) || (rawName && rawName !== itemId ? rawName : itemId);
      const lines = [name || "未知物品"];
      if (!meta) {
        lines.push("暂无详情");
        return lines.join("\n");
      }
      lines.push(`类型：${listTemplate.resolveStaticTypeName(meta)}`);
      if (listTemplate.isStaticWeapon(meta)) {
        lines.push(`攻击力：${listTemplate.formatStaticOptionalNumber(meta.attackPower)}`);
        lines.push(`攻速：${listTemplate.formatStaticOptionalNumber(meta.attackSpeed)}`);
        lines.push(`弹速：${listTemplate.formatStaticOptionalNumber(meta.bulletSpeed)}`);
        lines.push(`耐久：${listTemplate.formatStaticOptionalNumber(meta.durability)}`);
        return listTemplate.appendStaticDescription(lines, meta);
      }
      if (listTemplate.isStaticEquipment(meta)) {
        lines.push(`防御：${listTemplate.formatStaticOptionalNumber(meta.defense)}`);
        lines.push(`耐久：${listTemplate.formatStaticOptionalNumber(meta.durability)}`);
        return listTemplate.appendStaticDescription(lines, meta);
      }
      if (listTemplate.isStaticFood(meta) || listTemplate.isStaticMedicine(meta)) {
        if (Number.isFinite(meta.satiety)) {
          lines.push(`饱食度：${meta.satiety}`);
        }
        if (Number.isFinite(meta.hydration)) {
          lines.push(`水分值：${meta.hydration}`);
        }
        const useEffect = listTemplate.formatStaticUseEffect(meta);
        if (useEffect) {
          lines.push(useEffect);
        }
      }
      return listTemplate.appendStaticDescription(lines, meta);
    }
    static appendStaticDescription(lines, meta) {
      const description = String(meta.description || "").trim();
      if (description) {
        lines.push(description);
      }
      return lines.join("\n");
    }
    static formatStaticUseEffect(meta) {
      const effect = meta.useEffect;
      if (!effect) {
        return "";
      }
      const amount = Number.isFinite(effect.amount) ? effect.amount : "-";
      if (effect.type === "healHp") {
        return `恢复生命：${amount}`;
      }
      return `效果：${effect.type} ${amount}`;
    }
    static resolveStaticTypeName(meta) {
      if (listTemplate.isStaticWeapon(meta)) {
        return "武器";
      }
      if (listTemplate.isStaticEquipment(meta)) {
        return "装备";
      }
      if (listTemplate.isStaticFood(meta)) {
        return "食物";
      }
      if (listTemplate.isStaticMedicine(meta)) {
        return "药品";
      }
      const category = String(meta.category || "").toLowerCase();
      if (category === "materials") {
        return "材料";
      }
      if (category === "misc") {
        return "杂物";
      }
      return "物品";
    }
    static isStaticWeapon(meta) {
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      return category === "weapons" || subCategory.includes("weapon") || subCategory.includes("melee") || subCategory.includes("ranged") || Number.isFinite(meta.attackPower) || Number.isFinite(meta.attackSpeed);
    }
    static isStaticEquipment(meta) {
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      return category.includes("armor") || category.includes("helmet") || category.includes("plate") || subCategory.includes("armor") || subCategory.includes("helmet") || subCategory.includes("head") || subCategory.includes("plate") || subCategory.includes("insert") || subCategory.includes("body") || Number.isFinite(meta.defense);
    }
    static isStaticFood(meta) {
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      return category === "foods" || subCategory.includes("food");
    }
    static isStaticMedicine(meta) {
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      return category === "medicines" || subCategory.includes("medicine");
    }
    static formatStaticOptionalNumber(value) {
      return Number.isFinite(value) ? String(value) : "-";
    }
    resolveIconPath(iconPath, data) {
      const raw = (iconPath || "").trim();
      if (!raw) {
        return "";
      }
      const normalized = raw.replace(/^assets\//, "");
      const url = Laya.URL;
      if (url && typeof url.formatURL === "function") {
        try {
          const formatted = String(url.formatURL(normalized) || "");
          if (formatted) {
            return formatted;
          }
        } catch (error) {
          throw new Error(`[listTemplate] icon URL format failed for item: ${String((data == null ? void 0 : data.itemId) || (data == null ? void 0 : data.name) || "unknown")}`);
        }
      }
      throw new Error(`[listTemplate] icon path unavailable for item: ${String((data == null ? void 0 : data.itemId) || (data == null ? void 0 : data.name) || "unknown")}, path: ${normalized}`);
    }
    resolveFallbackIcon(itemId) {
      const fallbackIconMap = {
        mutant_blood_1: "atlas/picture/items/misc/flood_1.png",
        mutant_blood_2: "atlas/picture/items/misc/flood_2.png",
        mutant_blood_3: "atlas/picture/items/misc/flood_3.png"
      };
      return fallbackIconMap[itemId] || "";
    }
    resolveDisplayName(itemId, name) {
      const rawName = String(name || "").trim();
      const fallbackNameMap = {
        mutant_blood_1: "一阶变异血",
        mutant_blood_2: "二阶变异血",
        mutant_blood_3: "三阶变异血"
      };
      return rawName && rawName !== itemId ? rawName : fallbackNameMap[itemId] || rawName;
    }
  };
  __name(listTemplate, "listTemplate");
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "templateSlot", 2);
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "gimg", 2);
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "nameText", 2);
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "countText", 2);
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "detailNode", 2);
  __decorateClass([
    property8(Laya.Node)
  ], listTemplate.prototype, "detailTextNode", 2);
  listTemplate = __decorateClass([
    regClass9("2847192a-1f1b-4cc0-b66a-3325ac9107f7", "../src/PlayUI/CommonUI/listTemplate.ts")
  ], listTemplate);

  // src/PlayUI/CommonUI/glist.ts
  var { regClass: regClass10, property: property9 } = Laya;
  var glist = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.listNode = null;
      this.templateNode = null;
      this.slotCount = 0;
      this.selectionEnabled = true;
      this.listKey = "";
      this.onSlotClick = null;
      this.items = [];
      this.appliedSlotCount = -1;
      this.selectedItemId = "";
      this.selectedSlotIndex = -1;
    }
    onAwake() {
      this.applySlotCount(true);
      this.refresh();
    }
    onEnable() {
      this.applySlotCount();
      this.refresh();
    }
    setItems(items) {
      this.items = Array.isArray(items) ? items.slice() : [];
      this.refresh();
    }
    clearItems() {
      this.items = [];
      this.refresh();
    }
    setSlotCount(count) {
      this.slotCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
      this.applySlotCount(true);
      this.refresh();
    }
    setSelectedItemId(itemId) {
      this.selectedItemId = itemId ? String(itemId) : "";
      this.selectedSlotIndex = -1;
      this.refresh();
    }
    setSelectedSlotIndex(slotIndex) {
      this.selectedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
      this.selectedItemId = "";
      this.refresh();
    }
    refresh() {
      this.applySlotCount();
      const listRoot = this.getListRoot();
      if (!listRoot) {
        return;
      }
      this.hideTemplateNode();
      this.renderSlots();
      Laya.timer.callLater(this, this.renderSlots);
    }
    renderSlots() {
      const listRoot = this.getListRoot();
      if (!listRoot) {
        return;
      }
      const children = listRoot.children || [];
      const maxSlots = Math.max(0, Math.floor(this.slotCount));
      const bindLimit = maxSlots > 0 ? Math.min(maxSlots, children.length) : children.length;
      let dataIndex = 0;
      for (let i = 0; i < bindLimit; i++) {
        const slotNode = children[i];
        if (!slotNode || slotNode === this.templateNode) {
          continue;
        }
        let slot = slotNode.getComponent(listTemplate);
        if (!slot) {
          slot = slotNode.addComponent(listTemplate);
        }
        const item = this.items[dataIndex] || null;
        slot.bindData(item);
        if (this.selectionEnabled) {
          const selected = this.selectedSlotIndex >= 0 ? i === this.selectedSlotIndex && !!item : !!item && !!item.itemId && item.itemId === this.selectedItemId;
          slot.setSelected(selected);
        }
        this.bindSlotClick(slotNode, i);
        dataIndex++;
      }
    }
    bindSlotClick(slotNode, slotIndex) {
      const target = slotNode;
      if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
        return;
      }
      target.off(Laya.Event.CLICK, this, this.onSlotNodeClick);
      target.on(Laya.Event.CLICK, this, this.onSlotNodeClick, [slotIndex]);
    }
    onSlotNodeClick(slotIndex, event) {
      const listRoot = this.getListRoot();
      if (!listRoot) {
        return;
      }
      const children = listRoot.children || [];
      const slotNode = children[slotIndex];
      if (!slotNode) {
        return;
      }
      const slot = slotNode.getComponent(listTemplate);
      if (!slot) {
        return;
      }
      if (slot.consumeSuppressNextClick()) {
        return;
      }
      const data = slot.getBoundData();
      if (this.onSlotClick) {
        this.onSlotClick(data, this.listKey, slotIndex);
      }
    }
    applySlotCount(force = false) {
      const listRoot = this.getListRoot();
      if (!listRoot) {
        return;
      }
      const nextCount = Math.max(0, Math.floor(this.slotCount));
      if (!force && this.appliedSlotCount === nextCount) {
        return;
      }
      this.appliedSlotCount = nextCount;
      if ("numItems" in listRoot) {
        listRoot.numItems = nextCount;
      }
      if (typeof listRoot.refresh === "function") {
        listRoot.refresh(true);
      }
    }
    getListRoot() {
      return this.listNode || this.owner || null;
    }
    hideTemplateNode() {
      const template = this.templateNode;
      if (template && "visible" in template) {
        template.visible = false;
      }
    }
  };
  __name(glist, "glist");
  __decorateClass([
    property9(Laya.Node)
  ], glist.prototype, "listNode", 2);
  __decorateClass([
    property9(Laya.Node)
  ], glist.prototype, "templateNode", 2);
  __decorateClass([
    property9(Number)
  ], glist.prototype, "slotCount", 2);
  __decorateClass([
    property9(Boolean)
  ], glist.prototype, "selectionEnabled", 2);
  glist = __decorateClass([
    regClass10("0f3d3c58-9d25-4a96-a2b5-4dcf1c5f3f71", "../src/PlayUI/CommonUI/glist.ts")
  ], glist);

  // src/PlayUI/Bag/BagPreviewSpineController.ts
  var _BagPreviewSpineController = class _BagPreviewSpineController {
    constructor(panel) {
      this.panel = panel;
      this.lastWeaponAttachmentName = "__init";
      this.lastAnimationName = "__init";
    }
    refreshWeapon() {
      const slotName = this.resolveWeaponSpineSlotName();
      if (!slotName) {
        return;
      }
      const weapon = DataManager.getInstance().getEquippedItem("weapon");
      const attachmentName = weapon ? this.resolveWeaponAttachmentName(weapon.itemId) : "";
      this.refreshAnimation();
      if (!this.clearWeaponSlots()) {
        this.scheduleRefreshWeapon();
        return;
      }
      if (!attachmentName) {
        if (this.lastWeaponAttachmentName) {
          if (this.applySpineAttachment(slotName, null)) {
            this.lastWeaponAttachmentName = "";
          } else {
            this.scheduleRefreshWeapon();
          }
        }
        return;
      }
      if (this.applySpineAttachment(slotName, attachmentName)) {
        this.lastWeaponAttachmentName = attachmentName;
      } else {
        this.scheduleRefreshWeapon();
      }
    }
    scheduleRefreshWeapon() {
      Laya.timer.callLater(this.panel, this.panel.refreshPreviewSpineWeapon);
    }
    scheduleRefreshAnimation() {
      Laya.timer.callLater(this.panel, this.panel.refreshPreviewSpineWeapon);
    }
    resolveWeaponAttachmentName(itemId) {
      const map = {
        wood_club: "weapon_slot7",
        baseket_bat: "basekat_bat",
        cleaver: "weapon_slot",
        knife: "weapon_slot2",
        long_knife: "weapon_slot5",
        machete: "weapon_slot6",
        fal: "weapon_ranged_FAL",
        m16: "weapon_ranged_M16",
        geluoke: "weapon_ranged_geluoke",
        akm: "weapon_ranged_AK47"
      };
      return map[itemId] || "";
    }
    resolveWeaponSpineSlotName() {
      if (this.isPreviewRangedWeapon()) {
        return String(this.panel.previewWeaponRangedSpineSlotName || this.panel.previewWeaponSpineSlotName || "").trim();
      }
      return String(this.panel.previewWeaponMeleeSpineSlotName || this.panel.previewWeaponSpineSlotName || "").trim();
    }
    isPreviewRangedWeapon() {
      const weapon = DataManager.getInstance().getEquippedItem("weapon");
      if (!weapon || !weapon.itemId) {
        return false;
      }
      const meta = DataManager.getInstance().resolveItemMeta(weapon.itemId);
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      return subCategory.includes("ranged");
    }
    refreshAnimation() {
      const animationName = this.resolveAnimationName();
      if (!animationName || animationName === this.lastAnimationName) {
        return;
      }
      const spine = this.getPreviewSpine();
      if (!spine) {
        this.scheduleRefreshAnimation();
        return;
      }
      if (!this.isSpineReady(spine)) {
        this.scheduleRefreshAnimation();
        return;
      }
      if (!this.hasAnimation(spine, animationName)) {
        return;
      }
      try {
        spine.play(animationName, true, true);
        this.lastAnimationName = animationName;
      } catch (error) {
        this.scheduleRefreshAnimation();
      }
    }
    resolveAnimationName() {
      return this.isPreviewRangedWeapon() ? String(this.panel.previewRangedAnimation || this.panel.previewMeleeAnimation || "").trim() : String(this.panel.previewMeleeAnimation || "").trim();
    }
    hasAnimation(spine, animationName) {
      const templet = spine.templet;
      if (templet && typeof templet.hasAnimation === "function") {
        return !!templet.hasAnimation(animationName);
      }
      const anySpine = spine;
      if (templet && typeof anySpine.getAnimNum === "function" && typeof anySpine.getAniNameByIndex === "function") {
        const count = Math.max(0, Number(anySpine.getAnimNum()) || 0);
        for (let i = 0; i < count; i++) {
          if (anySpine.getAniNameByIndex(i) === animationName) {
            return true;
          }
        }
        return false;
      }
      return true;
    }
    isSpineReady(spine) {
      const anySpine = spine;
      const templet = anySpine.templet;
      if (!templet) {
        return false;
      }
      if (typeof templet.getAnimationCount === "function") {
        try {
          return Number(templet.getAnimationCount()) > 0;
        } catch (error) {
          return false;
        }
      }
      return true;
    }
    clearWeaponSlots() {
      const meleeSlotName = String(this.panel.previewWeaponMeleeSpineSlotName || "").trim();
      const rangedSlotName = String(this.panel.previewWeaponRangedSpineSlotName || "").trim();
      let cleared = true;
      if (meleeSlotName) {
        cleared = this.clearSpineAttachment(meleeSlotName) && cleared;
      }
      if (rangedSlotName) {
        cleared = this.clearSpineAttachment(rangedSlotName) && cleared;
      }
      return cleared;
    }
    clearSpineAttachment(slotName) {
      const spine = this.getPreviewSpine();
      if (!spine) {
        return false;
      }
      const anySpine = spine;
      try {
        const slot = typeof anySpine.findSlot === "function" ? anySpine.findSlot(slotName) : null;
        if (slot && typeof slot.setAttachment === "function") {
          slot.setAttachment(null);
          return true;
        }
      } catch (error) {
      }
      return this.applySpineAttachment(slotName, null);
    }
    applySpineAttachment(slotName, attachmentName) {
      const spine = this.getPreviewSpine();
      if (!spine) {
        return false;
      }
      const anySpine = spine;
      if (typeof anySpine.setSlotAttachment === "function") {
        try {
          anySpine.setSlotAttachment(slotName, attachmentName);
          return true;
        } catch (error) {
          return false;
        }
      }
      if (typeof anySpine.setAttachment === "function") {
        try {
          anySpine.setAttachment(slotName, attachmentName);
          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    }
    getPreviewSpine() {
      const spineNode = this.panel.previewSpineNode || this.findChildByName(this.panel.personPageNode, "Sprite");
      return spineNode ? spineNode.getComponent(Laya.Spine2DRenderNode) : null;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(_BagPreviewSpineController, "BagPreviewSpineController");
  var BagPreviewSpineController = _BagPreviewSpineController;

  // src/PlayUI/Bag/BagBuffStateController.ts
  var _BagBuffStateController = class _BagBuffStateController {
    constructor(getStateListNode, setStateListNode, getRootNode) {
      this.getStateListNode = getStateListNode;
      this.setStateListNode = setStateListNode;
      this.getRootNode = getRootNode;
    }
    refresh() {
      this.resolveBuffStateNodes();
      this.renderStateList(this.getPreviewBuffStates());
    }
    resolveBuffStateNodes() {
      if (!this.getStateListNode()) {
        this.setStateListNode(this.findChildByName(this.getRootNode(), "statelist"));
      }
    }
    getPreviewBuffStates() {
      return [];
    }
    renderStateList(buffs) {
      const list = this.getStateListNode();
      if (!list) {
        return;
      }
      if ("itemRenderer" in list) {
        list.itemRenderer = (index, item) => {
          this.renderBuffStateItem(buffs[index] || null, item);
        };
      }
      if ("numItems" in list) {
        list.numItems = buffs.length;
      }
      if (typeof list.refresh === "function") {
        list.refresh(true);
      }
      this.hideUnusedBuffStateItems(buffs.length);
      Laya.timer.callLater(this, () => {
        this.renderVisibleBuffStateItems(buffs);
        this.hideUnusedBuffStateItems(buffs.length);
      });
    }
    renderVisibleBuffStateItems(buffs) {
      const list = this.getStateListNode();
      const children = list && Array.isArray(list.children) ? list.children : [];
      const templateNode = this.getTemplateNode(this.getStateListNode());
      let dataIndex = 0;
      for (let i = 0; i < children.length && dataIndex < buffs.length; i++) {
        const child = children[i];
        if (!child || child === templateNode) {
          continue;
        }
        this.renderBuffStateItem(buffs[dataIndex] || null, child);
        dataIndex++;
      }
    }
    hideUnusedBuffStateItems(visibleCount) {
      const list = this.getStateListNode();
      const children = list && Array.isArray(list.children) ? list.children : [];
      const templateNode = this.getTemplateNode(this.getStateListNode());
      let dataIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || child === templateNode) {
          this.setNodeVisible(child, false);
          continue;
        }
        this.setNodeVisible(child, dataIndex < visibleCount);
        dataIndex++;
      }
    }
    renderBuffStateItem(buff, node) {
      this.setNodeVisible(node, !!buff);
      if (!buff) {
        return;
      }
      const backgroundNode = this.findChildByName(node, "Sprite");
      this.setSpriteFillColor(backgroundNode, buff.color);
      const textNode = this.findChildByName(node, "Text");
      if (textNode) {
        textNode.text = buff.shortName;
      }
      const maskNode = this.findChildByName(node, "mask");
      if (maskNode) {
        const ratio = Math.max(0, Math.min(1, buff.remainingSeconds / Math.max(1, buff.durationSeconds)));
        const height = Math.round(50 * ratio);
        maskNode.visible = ratio > 0;
        this.setNodeDrawHeight(maskNode, height);
        maskNode.y = 50;
      }
    }
    setSpriteFillColor(node, fillColor) {
      if (!node || !Array.isArray(node._gcmds)) {
        return;
      }
      for (let i = 0; i < node._gcmds.length; i++) {
        const command = node._gcmds[i];
        if (command && "fillColor" in command) {
          command.fillColor = fillColor;
        }
      }
    }
    setNodeDrawHeight(node, height) {
      const nextHeight = Math.max(0, height);
      if ("height" in node) {
        node.height = nextHeight;
      }
      if (!Array.isArray(node._gcmds)) {
        return;
      }
      for (let i = 0; i < node._gcmds.length; i++) {
        const command = node._gcmds[i];
        if (command && "height" in command) {
          command.height = nextHeight;
        }
      }
    }
    getTemplateNode(listNode) {
      const list = listNode;
      return list && "templateNode" in list ? list.templateNode : null;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      const rootAny = root;
      if (rootAny.name === name) {
        return root;
      }
      const children = rootAny.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
  };
  __name(_BagBuffStateController, "BagBuffStateController");
  var BagBuffStateController = _BagBuffStateController;

  // src/PlayUI/Bag/BagPopupController.ts
  var _BagPopupController = class _BagPopupController {
    constructor(panel) {
      this.panel = panel;
      this.actions = [];
      this.onPopupActionClick = /* @__PURE__ */ __name((action, event) => {
        var _a;
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        const dataManager = DataManager.getInstance();
        if (action.type === "discard" && Number.isFinite(action.slotIndex)) {
          dataManager.discardActiveSlot(action.slotIndex);
        } else if (action.type === "split" && Number.isFinite(action.slotIndex)) {
          dataManager.splitActiveSlot(action.slotIndex);
        } else if (action.type === "use" && Number.isFinite(action.slotIndex)) {
          if (dataManager.useActiveItemAtSlot(action.slotIndex)) {
            const stats = dataManager.getPlayerStats();
            (_a = PlayerController.activeInstance) == null ? void 0 : _a.setHp(stats.currentHp, stats.maxHp);
          }
        }
        this.hide();
        this.panel.clearBagSelection();
        this.panel.refresh();
      }, "onPopupActionClick");
    }
    getBagItemActions(item, slotIndex) {
      const itemId = String(item.itemId || "");
      const dataManager = DataManager.getInstance();
      const actions = [];
      if (dataManager.canUseItem(itemId)) {
        actions.push({ type: "use", label: "使用", itemId, slotIndex });
      }
      if (dataManager.canSplitActiveSlot(slotIndex)) {
        actions.push({ type: "split", label: "对半拆分", itemId, slotIndex });
      }
      actions.push({ type: "discard", label: "丢弃", itemId, slotIndex });
      return actions;
    }
    show(actions) {
      this.resolvePopupListNode();
      const popup = this.panel.popupListNode;
      if (!popup || actions.length <= 0) {
        return;
      }
      this.actions = actions.slice();
      this.setNodeVisible(this.panel.popupListNode, true);
      popup.mouseEnabled = true;
      if ("itemRenderer" in popup) {
        popup.itemRenderer = (index, node) => {
          this.renderPopupActionItem(node, this.actions[index] || null);
        };
      }
      if ("numItems" in popup) {
        popup.numItems = this.actions.length;
      }
      if (typeof popup.refresh === "function") {
        popup.refresh(true);
      }
      this.renderVisiblePopupActionItems();
      Laya.timer.callLater(this, this.renderVisiblePopupActionItems);
    }
    hide() {
      this.resolvePopupListNode();
      const popup = this.panel.popupListNode;
      if (!popup) {
        return;
      }
      if (Array.isArray(popup.children)) {
        for (let i = 0; i < popup.children.length; i++) {
          const child = popup.children[i];
          if (child && typeof child.off === "function") {
            child.off(Laya.Event.CLICK, this, this.onPopupActionClick);
          }
        }
      }
      this.setNodeVisible(this.panel.popupListNode, false);
      this.actions = [];
    }
    renderVisiblePopupActionItems() {
      const popup = this.panel.popupListNode;
      if (!popup || !Array.isArray(popup.children)) {
        return;
      }
      const children = popup.children;
      const templateNode = this.getTemplateNode(this.panel.popupListNode);
      let actionIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || child === templateNode) {
          continue;
        }
        this.renderPopupActionItem(child, this.actions[actionIndex] || null);
        actionIndex++;
      }
    }
    renderPopupActionItem(node, action) {
      const child = node;
      if (!child) {
        return;
      }
      this.setNodeVisible(node, !!action);
      if (typeof child.off === "function") {
        child.off(Laya.Event.CLICK, this, this.onPopupActionClick);
      }
      if (!action) {
        return;
      }
      child.mouseEnabled = true;
      this.writePopupLabelRecursive(node, action.label);
      if (typeof child.on === "function") {
        child.on(Laya.Event.CLICK, this, this.onPopupActionClick, [action]);
      }
    }
    writePopupLabelRecursive(node, label) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = true;
      }
      if ("active" in target) {
        target.active = true;
      }
      if ("text" in target) {
        target.text = label;
      }
      if ("title" in target) {
        target.title = label;
      }
      if ("label" in target) {
        target.label = label;
      }
      const children = target.children;
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        this.writePopupLabelRecursive(children[i], label);
      }
    }
    resolvePopupListNode() {
      if (!this.panel.popupListNode) {
        this.panel.popupListNode = this.findChildByNameInsensitive(this.panel.owner, "popuplist");
      }
    }
    getTemplateNode(listNode) {
      const list = listNode;
      return list && "templateNode" in list ? list.templateNode : null;
    }
    findChildByNameInsensitive(root, name) {
      if (!root) {
        return null;
      }
      const rootAny = root;
      const targetName = String(name || "").toLowerCase();
      if (String(rootAny.name || "").toLowerCase() === targetName) {
        return root;
      }
      const children = rootAny.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByNameInsensitive(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
  };
  __name(_BagPopupController, "BagPopupController");
  var BagPopupController = _BagPopupController;

  // src/PlayUI/Bag/BagPanel.ts
  var { regClass: regClass11, property: property10 } = Laya;
  var BagPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.containerNode = null;
      this.bagNode = null;
      this.containerGlistNode = null;
      this.bagGlistNode = null;
      this.personPageNode = null;
      this.quickEquipNode = null;
      this.insertPlateSlotNode = null;
      this.helmetSlotNode = null;
      this.weaponSlotNode = null;
      this.armorSlotNode = null;
      this.gradeNode = null;
      this.gradeTextNode = null;
      this.experienceTextNode = null;
      this.satietyTextNode = null;
      this.hydrationTextNode = null;
      this.attackTextNode = null;
      this.defendTextNode = null;
      this.stateListNode = null;
      this.popupListNode = null;
      this.organizeButtonNode = null;
      this.previewWeaponSpineSlotName = "";
      this.previewWeaponMeleeSpineSlotName = "weapon_melee_slot";
      this.previewWeaponRangedSpineSlotName = "weapon_ranged_slot";
      this.previewMeleeAnimation = "default/default_melee_swing";
      this.previewRangedAnimation = "default/default_ranged_firearm";
      this.defaultState = 0;
      this.currentState = -1;
      this.bagGlist = null;
      this.containerGlist = null;
      this.selectedBagSlot = null;
      this.selectedQuickSlot = null;
      this.selectedContainerSlot = null;
      this.previewSpineNode = null;
      this.previewSpine = new BagPreviewSpineController(this);
      this.buffStates = new BagBuffStateController(
        () => this.stateListNode,
        (node) => {
          this.stateListNode = node;
        },
        () => this.owner
      );
      this.quickEquipInitialVisible = null;
      this.quickSlotItems = [];
      this.containerItems = [];
      this.popup = new BagPopupController(this);
      this.onOrganizeButtonClick = /* @__PURE__ */ __name((event) => {
        if (event && typeof event.stopPropagation === "function") {
          event.stopPropagation();
        }
        this.hidePopupList();
        this.clearBagSelection();
        this.clearQuickSelection();
        DataManager.getInstance().organizeActiveInventory();
        this.refresh();
      }, "onOrganizeButtonClick");
      this.handleContainerSlotClick = /* @__PURE__ */ __name((item, listKey, slotIndex) => {
        const normalizedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        if (normalizedSlotIndex < 0 || !item || !item.itemId) {
          this.clearContainerSelection();
          return;
        }
        const sourceItem = this.containerItems[normalizedSlotIndex] || null;
        if (!sourceItem || !sourceItem.itemId) {
          this.clearContainerSelection();
          return;
        }
        if (this.selectedContainerSlot && this.selectedContainerSlot.slotIndex === normalizedSlotIndex) {
          this.clearContainerSelection();
          return;
        }
        this.hidePopupList();
        this.clearBagSelection();
        this.clearQuickSelection();
        this.selectedContainerSlot = { slotIndex: normalizedSlotIndex };
        this.bindContainerList();
      }, "handleContainerSlotClick");
      this.handleBagSlotClick = /* @__PURE__ */ __name((item, listKey, slotIndex) => {
        var _a;
        const normalizedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        if (normalizedSlotIndex < 0) {
          this.hidePopupList();
          this.clearQuickSelection();
          this.clearBagSelection();
          this.clearContainerSelection();
          return;
        }
        if (this.selectedContainerSlot) {
          const sourceSlotIndex = this.selectedContainerSlot.slotIndex;
          const sourceItem = this.containerItems[sourceSlotIndex] || null;
          const moved = DataManager.getInstance().transferLooseItemToActive(sourceItem, normalizedSlotIndex);
          this.hidePopupList();
          this.clearQuickSelection();
          this.clearBagSelection();
          this.clearContainerSelection();
          if (moved) {
            this.containerItems[sourceSlotIndex] = null;
            this.refresh();
            return;
          }
          (_a = PlayerController.activeInstance) == null ? void 0 : _a.showState("背包空间不足");
          this.refresh();
          return;
        }
        if (this.selectedQuickSlot) {
          if (DataManager.getInstance().moveQuickSlotToActiveSlot(this.selectedQuickSlot.slotIndex, normalizedSlotIndex)) {
            this.hidePopupList();
            this.clearQuickSelection();
            this.refresh();
            return;
          }
          this.hidePopupList();
          this.clearQuickSelection();
          return;
        }
        if (this.selectedBagSlot && this.selectedBagSlot.slotIndex !== normalizedSlotIndex) {
          if (DataManager.getInstance().moveActiveInventorySlot(this.selectedBagSlot.slotIndex, normalizedSlotIndex)) {
            this.hidePopupList();
            this.clearBagSelection();
            this.refresh();
            return;
          }
          this.hidePopupList();
          this.clearBagSelection();
          return;
        }
        if (!item || !item.itemId) {
          this.hidePopupList();
          this.clearBagSelection();
          return;
        }
        if (this.selectedBagSlot && this.selectedBagSlot.slotIndex === normalizedSlotIndex) {
          this.hidePopupList();
          this.clearBagSelection();
          return;
        }
        this.setBagSelection(item, normalizedSlotIndex);
        this.showPopupList(this.getBagItemActions(item, normalizedSlotIndex));
      }, "handleBagSlotClick");
    }
    onAwake() {
      this.captureInitialVisibility();
      this.bindControllers();
      this.bindOrganizeButton();
      this.bindEquipSlots();
      this.bindQuickSlots();
      DataManager.getInstance().registerBagView(this);
      DataManager.getInstance().registerQuickSlotView(this);
      this.openDefault();
      this.refreshEquipSlots();
      this.refreshPlayerStats();
      this.refreshBuffStates();
      this.hidePopupList();
      Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }
    onEnable() {
      this.captureInitialVisibility();
      this.bindControllers();
      this.bindOrganizeButton();
      this.bindEquipSlots();
      this.bindQuickSlots();
      DataManager.getInstance().registerBagView(this);
      DataManager.getInstance().registerQuickSlotView(this);
      this.syncVisibleState();
      this.refreshEquipSlots();
      this.refreshPlayerStats();
      this.refreshBuffStates();
      this.hidePopupList();
      Laya.timer.callLater(this, this.refreshPreviewSpineWeapon);
    }
    onDisable() {
      this.hidePopupList();
      this.unbindOrganizeButton();
      Laya.timer.clear(this, this.refreshPreviewSpineWeapon);
      DataManager.getInstance().unregisterBagView(this);
      DataManager.getInstance().unregisterQuickSlotView(this);
    }
    onDestroy() {
      this.hidePopupList();
      this.unbindOrganizeButton();
      Laya.timer.clear(this, this.refreshPreviewSpineWeapon);
      DataManager.getInstance().unregisterBagView(this);
      DataManager.getInstance().unregisterQuickSlotView(this);
    }
    setItems(items) {
      this.bindControllers();
      this.bindBagList(items);
      this.refreshEquipSlots();
      this.refreshPlayerStats();
      this.refreshBuffStates();
    }
    refreshQuickSlots(items) {
      this.quickSlotItems = Array.isArray(items) ? items.map((item) => item ? __spreadValues({}, item) : null) : [];
      this.bindQuickSlots();
      this.renderQuickSlots();
    }
    openDefault() {
      this.currentState = 0;
      this.syncVisibleState();
    }
    openContainerSearch() {
      this.currentState = 1;
      this.syncVisibleState();
      this.bindContainerList();
    }
    openContainerSearchWithItems(items) {
      this.containerItems = Array.isArray(items) ? items.map((item) => item ? __spreadValues({}, item) : null) : [];
      this.selectedContainerSlot = null;
      this.openContainerSearch();
    }
    closePanel() {
      this.currentState = 0;
      this.containerItems = [];
      this.selectedContainerSlot = null;
      this.setNodeVisible(this.personPageNode, false);
      this.setNodeVisible(this.quickEquipNode, false);
      this.setNodeVisible(this.containerNode, false);
      this.setNodeVisible(this.containerGlistNode, false);
      this.setNodeVisible(this.bagNode, false);
      this.setNodeVisible(this.bagGlistNode, false);
      this.hidePopupList();
    }
    showDefaultState() {
      this.openDefault();
    }
    showContainerSearchState() {
      this.openContainerSearch();
    }
    showState(stateIndex) {
      this.currentState = this.normalizeState(stateIndex);
      this.syncVisibleState();
    }
    refresh() {
      this.bindControllers();
      this.bindEquipSlots();
      this.bindQuickSlots();
      this.syncVisibleState();
      const snapshot = DataManager.getInstance().getInventorySnapshot();
      this.bindBagList(snapshot);
      this.bindContainerList();
      this.refreshEquipSlots();
      this.refreshPlayerStats();
      this.refreshBuffStates();
      this.renderQuickSlots();
    }
    refreshBuffStates() {
      this.buffStates.refresh();
    }
    refreshPlayerStats() {
      var _a, _b;
      this.resolvePlayerStatsNodes();
      const dataManager = DataManager.getInstance();
      const stats = dataManager.getPlayerStats();
      if (this.gradeNode) {
        this.gradeNode.text = String(stats.level);
      }
      if (this.gradeTextNode) {
        this.gradeTextNode.text = `${stats.currentHp}/${stats.maxHp}`;
      }
      if (this.experienceTextNode) {
        this.experienceTextNode.text = `${stats.experience}/${stats.nextLevelExperience}`;
      }
      if (this.satietyTextNode) {
        this.satietyTextNode.text = `${this.formatStatValue(stats.currentSatiety)}/${this.formatStatValue(stats.maxSatiety || 100)}`;
      }
      if (this.hydrationTextNode) {
        this.hydrationTextNode.text = `${this.formatStatValue(stats.currentHydration)}/${this.formatStatValue(stats.maxHydration || 100)}`;
      }
      if (this.attackTextNode) {
        const attackPower = (_b = (_a = PlayerController.activeInstance) == null ? void 0 : _a.attackPower) != null ? _b : 10 + dataManager.getEquipmentAttackBonus();
        this.attackTextNode.text = this.formatStatValue(attackPower);
      }
      if (this.defendTextNode) {
        this.defendTextNode.text = this.formatStatValue(dataManager.getEquipmentDefenseBonus());
      }
    }
    bindControllers() {
      this.bagGlist = this.resolveGlistController(this.bagGlistNode, "bagGlistNode");
      this.containerGlist = this.resolveGlistController(this.containerGlistNode, "containerGlistNode");
    }
    bindOrganizeButton() {
      this.resolveOrganizeButtonNode();
      const button = this.organizeButtonNode;
      if (!button || typeof button.on !== "function" || typeof button.off !== "function") {
        return;
      }
      button.mouseEnabled = true;
      button.off(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
      button.on(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
    }
    unbindOrganizeButton() {
      const button = this.organizeButtonNode;
      if (button && typeof button.off === "function") {
        button.off(Laya.Event.CLICK, this, this.onOrganizeButtonClick);
      }
    }
    bindBagList(items) {
      if (!this.bagGlist) {
        return;
      }
      this.bagGlist.listKey = "bag";
      this.bagGlist.onSlotClick = this.handleBagSlotClick;
      this.bagGlist.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
      this.bagGlist.setItems(this.toListData(items));
      this.bagGlist.setSelectedSlotIndex(this.selectedBagSlot ? this.selectedBagSlot.slotIndex : -1);
    }
    bindContainerList() {
      if (!this.containerGlist) {
        return;
      }
      this.containerGlist.listKey = "container";
      this.containerGlist.onSlotClick = this.handleContainerSlotClick;
      this.containerGlist.setSlotCount(Math.max(9, this.containerItems.length));
      this.containerGlist.setItems(this.toListData(this.containerItems));
      this.containerGlist.setSelectedSlotIndex(this.selectedContainerSlot ? this.selectedContainerSlot.slotIndex : -1);
    }
    setBagSelection(item, slotIndex) {
      this.clearQuickSelection();
      this.clearContainerSelection();
      this.selectedBagSlot = { item, slotIndex };
      if (this.bagGlist) {
        this.bagGlist.setSelectedSlotIndex(slotIndex);
      }
      this.refreshEquipSlots();
    }
    clearBagSelection() {
      this.selectedBagSlot = null;
      if (this.bagGlist) {
        this.bagGlist.setSelectedSlotIndex(-1);
      }
      this.refreshEquipSlots();
    }
    bindEquipSlots() {
      this.resolveDefaultEquipSlotNodes();
      const slots = this.getEquipSlotBindings();
      for (let i = 0; i < slots.length; i++) {
        const binding = slots[i];
        const node = binding.node;
        if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
          continue;
        }
        node.mouseEnabled = true;
        node.off(Laya.Event.CLICK, this, this.onEquipSlotClick);
        node.on(Laya.Event.CLICK, this, this.onEquipSlotClick, [binding.slot]);
      }
    }
    bindQuickSlots() {
      this.resolveQuickEquipNode();
      const slots = this.getQuickSlotNodes();
      for (let i = 0; i < slots.length; i++) {
        const node = slots[i];
        if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
          continue;
        }
        node.mouseEnabled = true;
        node.off(Laya.Event.CLICK, this, this.onQuickSlotClick);
        node.on(Laya.Event.CLICK, this, this.onQuickSlotClick, [i]);
      }
    }
    onQuickSlotClick(quickSlotIndex) {
      var _a;
      const sourceBagSlotIndex = (_a = this.selectedBagSlot) == null ? void 0 : _a.slotIndex;
      if (!Number.isFinite(sourceBagSlotIndex)) {
        this.handleQuickSlotSelection(quickSlotIndex);
        return;
      }
      const dataManager = DataManager.getInstance();
      if (dataManager.assignActiveSlotToQuickSlot(quickSlotIndex, sourceBagSlotIndex)) {
        this.hidePopupList();
        this.clearQuickSelection();
        this.clearBagSelection();
        this.refresh();
        this.renderQuickSlots();
        return;
      }
    }
    handleQuickSlotSelection(quickSlotIndex) {
      const dataManager = DataManager.getInstance();
      const index = Number.isFinite(quickSlotIndex) ? Math.floor(quickSlotIndex) : -1;
      if (index < 0) {
        this.hidePopupList();
        this.clearQuickSelection();
        return;
      }
      if (this.selectedQuickSlot) {
        if (this.selectedQuickSlot.slotIndex === index) {
          this.hidePopupList();
          this.clearQuickSelection();
          return;
        }
        if (dataManager.moveQuickSlot(this.selectedQuickSlot.slotIndex, index)) {
          this.hidePopupList();
          this.clearQuickSelection();
          return;
        }
      }
      const item = this.quickSlotItems[index] || null;
      if (!item || !item.itemId) {
        this.hidePopupList();
        this.clearQuickSelection();
        return;
      }
      this.hidePopupList();
      this.setQuickSelection(index);
    }
    setQuickSelection(slotIndex) {
      this.clearBagSelection();
      this.clearContainerSelection();
      this.selectedQuickSlot = { slotIndex };
      this.renderQuickSlots();
    }
    clearQuickSelection() {
      if (this.selectedQuickSlot) {
        this.selectedQuickSlot = null;
        this.renderQuickSlots();
      }
    }
    clearContainerSelection() {
      this.selectedContainerSlot = null;
      if (this.containerGlist) {
        this.containerGlist.setSelectedSlotIndex(-1);
      }
    }
    renderQuickSlots() {
      var _a;
      const slots = this.getQuickSlotNodes();
      for (let i = 0; i < slots.length; i++) {
        const node = slots[i];
        if (!node) {
          continue;
        }
        let template = node.getComponent(listTemplate);
        if (!template) {
          template = node.addComponent(listTemplate);
        }
        const item = this.quickSlotItems[i] || null;
        template.bindData(item ? this.toListData([item])[0] : null);
        template.setSelected(!!item && ((_a = this.selectedQuickSlot) == null ? void 0 : _a.slotIndex) === i);
      }
    }
    getQuickSlotNodes() {
      this.resolveQuickEquipNode();
      const nodes = [];
      for (let i = 1; i <= 4; i++) {
        nodes.push(this.findDirectChildByName(this.quickEquipNode, String(i)));
      }
      return nodes;
    }
    onEquipSlotClick(slot) {
      var _a;
      const dataManager = DataManager.getInstance();
      if (this.selectedQuickSlot) {
        if (dataManager.moveQuickSlotToEquipment(this.selectedQuickSlot.slotIndex, slot)) {
          this.hidePopupList();
          this.clearQuickSelection();
          this.refreshEquipSlots();
          this.renderQuickSlots();
          this.notifyPlayerEquipmentChanged();
        }
        return;
      }
      if ((_a = this.selectedBagSlot) == null ? void 0 : _a.item.itemId) {
        if (dataManager.equipItemFromActive(slot, this.selectedBagSlot.item.itemId)) {
          this.hidePopupList();
          this.clearBagSelection();
          this.refreshEquipSlots();
          this.renderQuickSlots();
          this.notifyPlayerEquipmentChanged();
        }
        return;
      }
      if (dataManager.unequipItemToActive(slot)) {
        this.hidePopupList();
        this.clearBagSelection();
        this.refreshEquipSlots();
        this.renderQuickSlots();
        this.notifyPlayerEquipmentChanged();
        return;
      }
      this.hidePopupList();
    }
    getBagItemActions(item, slotIndex) {
      return this.popup.getBagItemActions(item, slotIndex);
    }
    showPopupList(actions) {
      this.popup.show(actions);
    }
    hidePopupList() {
      this.popup.hide();
    }
    refreshEquipSlots() {
      var _a;
      const dataManager = DataManager.getInstance();
      const slots = this.getEquipSlotBindings();
      for (let i = 0; i < slots.length; i++) {
        const binding = slots[i];
        const item = dataManager.getEquippedItem(binding.slot);
        const selectedItemId = ((_a = this.selectedBagSlot) == null ? void 0 : _a.item.itemId) || "";
        const highlighted = !!selectedItemId && dataManager.canEquipItemToSlot(selectedItemId, binding.slot);
        this.renderEquipSlot(binding.node, item, binding.emptyLabel, highlighted);
      }
      this.refreshPreviewSpineWeapon();
    }
    syncVisibleState() {
      const showDefault = this.currentState === 0;
      const showContainer = this.currentState === 1;
      this.setNodeVisible(this.personPageNode, showDefault);
      this.setNodeVisible(this.quickEquipNode, showDefault && this.shouldShowQuickEquipNode());
      this.setNodeVisible(this.containerNode, showContainer);
      this.setNodeVisible(this.containerGlistNode, showContainer);
      this.setNodeVisible(this.bagNode, true);
      this.setNodeVisible(this.bagGlistNode, true);
    }
    captureInitialVisibility() {
      if (this.quickEquipInitialVisible !== null || !this.quickEquipNode) {
        return;
      }
      const target = this.quickEquipNode;
      const visible = "visible" in target ? target.visible !== false : true;
      const active = "active" in target ? target.active !== false : true;
      this.quickEquipInitialVisible = visible && active;
    }
    shouldShowQuickEquipNode() {
      return this.quickEquipInitialVisible !== false;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    toListData(items) {
      return (Array.isArray(items) ? items : []).map(
        (item) => item ? {
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        } : null
      );
    }
    getEquipSlotBindings() {
      return [
        { slot: "insertPlate", node: this.insertPlateSlotNode, emptyLabel: "插板" },
        { slot: "helmet", node: this.helmetSlotNode, emptyLabel: "头部" },
        { slot: "weapon", node: this.weaponSlotNode, emptyLabel: "武器" },
        { slot: "armor", node: this.armorSlotNode, emptyLabel: "身体" }
      ];
    }
    renderEquipSlot(node, item, emptyLabel, highlighted) {
      const target = node;
      if (!target) {
        return;
      }
      target.alpha = highlighted ? 0.78 : 1;
      const iconNode = this.findChildByName(node, "icon");
      const nameNode = this.findChildByName(node, "name");
      const amountNode = this.findChildByName(node, "amount");
      if (iconNode) {
        const iconPath = (item == null ? void 0 : item.icon) ? this.resolveIconPath(item.icon) : "";
        if ("visible" in iconNode) {
          iconNode.visible = !!iconPath;
        }
        if ("skin" in iconNode) {
          iconNode.skin = iconPath;
        }
        if ("src" in iconNode) {
          iconNode.src = iconPath;
        }
        if ("width" in iconNode) {
          iconNode.width = 55;
        }
        if ("height" in iconNode) {
          iconNode.height = 55;
        }
      }
      if (nameNode) {
        nameNode.text = item ? item.name : emptyLabel;
        if ("color" in nameNode) {
          nameNode.color = highlighted ? "#20c96b" : "#000000";
        }
      }
      if (amountNode) {
        amountNode.text = item && item.count > 1 ? String(item.count) : "";
        if ("color" in amountNode) {
          amountNode.color = highlighted ? "#20c96b" : "#000000";
        }
      }
    }
    resolveDefaultEquipSlotNodes() {
      if (!this.weaponSlotNode) {
        this.weaponSlotNode = this.findChildByName(this.personPageNode, "boxmodule_5");
      }
      if (!this.insertPlateSlotNode) {
        this.insertPlateSlotNode = this.findChildByName(this.personPageNode, "boxmodule_1");
      }
      if (!this.helmetSlotNode) {
        this.helmetSlotNode = this.findChildByName(this.personPageNode, "head");
      }
      if (!this.armorSlotNode) {
        this.armorSlotNode = this.findChildByName(this.personPageNode, "boxmodule_2");
      }
      if (!this.previewSpineNode) {
        this.previewSpineNode = this.findChildByName(this.personPageNode, "Sprite");
      }
    }
    resolveQuickEquipNode() {
      if (!this.quickEquipNode) {
        this.quickEquipNode = this.findChildByNameInsensitive(this.owner, "quickbox");
      }
    }
    resolveOrganizeButtonNode() {
      if (this.organizeButtonNode) {
        return;
      }
      const root = this.owner;
      this.organizeButtonNode = this.findChildByNameInsensitive(root, "organizebutton") || this.findChildByNameInsensitive(root, "sortbutton") || this.findChildByName(root, "整理按钮");
    }
    resolvePlayerStatsNodes() {
      const root = this.owner;
      if (!this.gradeNode) {
        this.gradeNode = this.findChildByName(root, "grade");
      }
      if (!this.gradeTextNode) {
        this.gradeTextNode = this.findChildByName(root, "hptext") || this.findChildByName(root, "gradetext");
      }
      if (!this.experienceTextNode) {
        this.experienceTextNode = this.findChildByName(root, "experiencetext");
      }
      if (!this.satietyTextNode) {
        this.satietyTextNode = this.findChildByName(root, "baoshidu");
      }
      if (!this.hydrationTextNode) {
        this.hydrationTextNode = this.findChildByName(root, "shuifenzhi");
      }
      if (!this.attackTextNode) {
        this.attackTextNode = this.findChildByName(root, "attack");
      }
      if (!this.defendTextNode) {
        this.defendTextNode = this.findChildByName(root, "defend");
      }
    }
    formatStatValue(value) {
      return String(Number.isFinite(value) ? Math.floor(value) : 0);
    }
    getTemplateNode(listNode) {
      const list = listNode;
      return (list == null ? void 0 : list._templateNode) || (list == null ? void 0 : list.templateNode) || null;
    }
    refreshPreviewSpineWeapon() {
      this.previewSpine.refreshWeapon();
    }
    notifyPlayerEquipmentChanged() {
      var _a;
      (_a = PlayerController.activeInstance) == null ? void 0 : _a.refreshEquipmentFromData();
      Laya.timer.callLater(this, () => {
        var _a2;
        (_a2 = PlayerController.activeInstance) == null ? void 0 : _a2.refreshEquipmentFromData();
      });
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    resolveIconPath(iconPath) {
      const raw = String(iconPath || "").trim();
      if (!raw) {
        return "";
      }
      const normalized = raw.replace(/^assets\//, "");
      const url = Laya.URL;
      if (url && typeof url.formatURL === "function") {
        return String(url.formatURL(normalized) || normalized);
      }
      return normalized;
    }
    normalizeState(stateIndex) {
      const state = Number.isFinite(stateIndex) ? Math.floor(stateIndex) : 0;
      if (state === 1) {
        return 1;
      }
      return 0;
    }
    resolveGlistController(node, label) {
      const controller = this.findGlistController(node);
      return controller;
    }
    findGlistController(node) {
      if (!node) {
        return null;
      }
      const direct = node.getComponent(glist);
      if (direct) {
        return direct;
      }
      const children = node.children;
      if (!children || children.length === 0) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const nested = this.findGlistController(child);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    findChildByNameInsensitive(root, name) {
      if (!root) {
        return null;
      }
      const expected = String(name || "").toLowerCase();
      const nodeName = String(root.name || "").toLowerCase();
      if (nodeName === expected) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (const child of children) {
        const match = this.findChildByNameInsensitive(child, name);
        if (match) {
          return match;
        }
      }
      return null;
    }
    findDirectChildByName(root, name) {
      const children = root == null ? void 0 : root.children;
      if (!children) {
        return null;
      }
      for (const child of children) {
        if (String((child == null ? void 0 : child.name) || "") === name) {
          return child;
        }
      }
      return null;
    }
    findFirstTextNode(root) {
      if (!root) {
        return null;
      }
      if ("text" in root) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (const child of children) {
        const match = this.findFirstTextNode(child);
        if (match) {
          return match;
        }
      }
      return null;
    }
  };
  __name(BagPanel, "BagPanel");
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "containerNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "bagNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "containerGlistNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "bagGlistNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "personPageNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "quickEquipNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "insertPlateSlotNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "helmetSlotNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "weaponSlotNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "armorSlotNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "gradeNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "gradeTextNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "experienceTextNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "satietyTextNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "hydrationTextNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "attackTextNode", 2);
  __decorateClass([
    property10(Laya.Text)
  ], BagPanel.prototype, "defendTextNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "stateListNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "popupListNode", 2);
  __decorateClass([
    property10(Laya.Node)
  ], BagPanel.prototype, "organizeButtonNode", 2);
  __decorateClass([
    property10(String)
  ], BagPanel.prototype, "previewWeaponSpineSlotName", 2);
  __decorateClass([
    property10(String)
  ], BagPanel.prototype, "previewWeaponMeleeSpineSlotName", 2);
  __decorateClass([
    property10(String)
  ], BagPanel.prototype, "previewWeaponRangedSpineSlotName", 2);
  __decorateClass([
    property10(String)
  ], BagPanel.prototype, "previewMeleeAnimation", 2);
  __decorateClass([
    property10(String)
  ], BagPanel.prototype, "previewRangedAnimation", 2);
  __decorateClass([
    property10(Number)
  ], BagPanel.prototype, "defaultState", 2);
  BagPanel = __decorateClass([
    regClass11("cccc26aa-5d81-479b-9e05-9dc1ee8b8c83", "../src/PlayUI/Bag/BagPanel.ts")
  ], BagPanel);

  // src/PlayUI/BattlePass/BattlePassPanel.ts
  var { regClass: regClass12, property: property11 } = Laya;
  var BattlePassPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.timeListNode = null;
      this.taskListNode = null;
      this.gradeListNode = null;
      this.rewardListNode = null;
      this.experienceText = null;
      this.selectedWeek = 1;
      this.currentExperience = 0;
      this.nextLevelExperience = 200;
    }
    onAwake() {
      this.resolveBindings();
      this.scheduleRefresh();
    }
    onEnable() {
      this.resolveBindings();
      this.scheduleRefresh();
    }
    onPanelOpened() {
      this.selectedWeek = 1;
      this.scheduleRefresh();
    }
    scheduleRefresh() {
      Laya.timer.callLater(this, this.refresh);
    }
    refresh() {
      this.resolveBindings();
      this.renderExperienceText();
      this.renderWeekList();
      this.renderTaskList();
      this.renderGradeList();
      this.renderRewardList();
    }
    renderExperienceText() {
      if (this.experienceText) {
        this.experienceText.text = `${this.currentExperience}/${this.nextLevelExperience}`;
      }
    }
    renderWeekList() {
      this.renderList(
        this.timeListNode,
        7,
        (index, node) => this.renderWeekItem(index + 1, node)
      );
    }
    renderTaskList() {
      const tasks = this.getTasksForWeek(this.selectedWeek);
      this.renderList(
        this.taskListNode,
        tasks.length,
        (index, node) => this.renderTaskItem(tasks[index] || null, node)
      );
    }
    renderGradeList() {
      this.renderList(
        this.gradeListNode,
        60,
        (index, node) => this.renderGradeItem(index + 1, node)
      );
    }
    renderRewardList() {
      const rewards = this.getRewards();
      this.renderList(
        this.rewardListNode,
        rewards.length,
        (index, node) => this.renderRewardItem(rewards[index] || null, node)
      );
    }
    renderWeekItem(week, node) {
      this.setNodeVisible(node, true);
      this.setFirstText(node, `第${week}周`);
      this.setNodeAlpha(node, week === this.selectedWeek ? 1 : 0.6);
      const target = node;
      if (target && typeof target.off === "function" && typeof target.on === "function") {
        target.off(Laya.Event.CLICK, this, this.onWeekClick);
        target.on(Laya.Event.CLICK, this, this.onWeekClick, [week]);
      }
    }
    renderTaskItem(task, node) {
      this.setNodeVisible(node, !!task);
      if (!task) {
        return;
      }
      const titleText = this.findDirectText(node);
      if (titleText) {
        titleText.text = task.title;
      }
      const progressText = this.findChildByName(node, "progresstext");
      if (progressText) {
        progressText.text = `${task.currentProgress}/${task.requiredProgress}`;
      }
      const maskNode = this.findChildByName(node, "mask") || this.findChildByName(node, "mask_1");
      this.setNodeVisible(maskNode, task.completed);
    }
    renderGradeItem(level, node) {
      this.setNodeVisible(node, true);
      this.setFirstText(node, `${level}级`);
      this.setNodeVisible(this.findChildByName(node, "Sprite_1"), false);
    }
    renderRewardItem(reward, node) {
      this.setNodeVisible(node, !!reward);
      if (!reward) {
        return;
      }
      const gradeNode = this.findChildByName(node, "bt");
      this.setFirstText(gradeNode, `${reward.level}`);
      const iconNode = this.findChildByName(node, "icon");
      if (iconNode) {
        if ("visible" in iconNode) {
          iconNode.visible = true;
        }
        if ("width" in iconNode) {
          iconNode.width = 76;
        }
        if ("height" in iconNode) {
          iconNode.height = 76;
        }
        if ("autoSize" in iconNode) {
          iconNode.autoSize = false;
        }
        if ("skin" in iconNode) {
          iconNode.skin = reward.icon;
        }
        if ("src" in iconNode) {
          iconNode.src = reward.icon;
        }
      }
      const nameText = this.findChildByName(node, "name");
      if (nameText) {
        nameText.text = reward.name;
      }
      const amountText = this.findChildByName(node, "amount");
      if (amountText) {
        amountText.text = reward.count > 1 ? `${reward.count}` : "";
      }
      this.setNodeVisible(this.findChildByName(node, "mask_0"), !reward.unlocked);
      this.setNodeVisible(this.findChildByName(node, "mask_1"), reward.claimed);
    }
    onWeekClick(week) {
      this.selectedWeek = this.clampWeek(week);
      this.renderWeekList();
      this.renderTaskList();
    }
    renderList(listNode, count, renderer) {
      const list = listNode;
      if (!list) {
        return;
      }
      if (!this.getTemplateNode(listNode)) {
        Laya.timer.callLater(this, () => {
          this.renderList(listNode, count, renderer);
        });
        return;
      }
      if ("itemRenderer" in list) {
        list.itemRenderer = (index, item) => {
          renderer(index, item);
        };
      }
      if ("numItems" in list) {
        list.numItems = count;
      }
      if (typeof list.refresh === "function") {
        list.refresh(true);
      }
      Laya.timer.callLater(this, () => {
        this.renderVisibleListItems(listNode, count, renderer);
      });
    }
    renderVisibleListItems(listNode, count, renderer) {
      const children = listNode && Array.isArray(listNode.children) ? listNode.children : [];
      const templateNode = this.getTemplateNode(listNode);
      let dataIndex = 0;
      for (let i = 0; i < children.length && dataIndex < count; i++) {
        const node = children[i];
        if (!node || node === templateNode) {
          continue;
        }
        renderer(dataIndex, node);
        dataIndex++;
      }
    }
    resolveBindings() {
      const root = this.owner;
      this.timeListNode = this.timeListNode || this.findChildByName(root, "timelist");
      this.taskListNode = this.taskListNode || this.findChildByName(root, "tasklist");
      this.gradeListNode = this.isGListNode(this.gradeListNode) ? this.gradeListNode : this.findChildByNameAndType(root, "grade", "GList");
      this.rewardListNode = this.rewardListNode || this.findNamedChildUnder(root, "reward", "reward");
      this.experienceText = this.experienceText || this.findChildByName(root, "experience");
    }
    getTasksForWeek(week) {
      const baseTasks = [
        { prefix: "击杀", count: 20, suffix: "个敌人" },
        { prefix: "采集", count: 30, suffix: "个资源" },
        { prefix: "打开", count: 5, suffix: "个容器" },
        { prefix: "制作", count: 3, suffix: "件物品" },
        { prefix: "完成", count: 1, suffix: "次探索" },
        { prefix: "签到", count: 1, suffix: "天" }
      ];
      const taskGroups = [
        { multiplier: 1, experience: 240 },
        { multiplier: 3, experience: 720 },
        { multiplier: 5, experience: 1200 }
      ];
      const tasks = [];
      for (let i = 0; i < taskGroups.length; i++) {
        const taskGroup = taskGroups[i];
        for (let j = 0; j < baseTasks.length; j++) {
          const task = baseTasks[j];
          const requiredProgress = task.count * taskGroup.multiplier;
          const currentProgress = 0;
          tasks.push({
            title: `${task.prefix}${requiredProgress}${task.suffix}`,
            currentProgress,
            requiredProgress,
            experience: taskGroup.experience,
            completed: currentProgress >= requiredProgress
          });
        }
      }
      return tasks;
    }
    getRewards() {
      const rewardCycle = [
        {
          name: "石头",
          count: 20,
          icon: "atlas/picture/items/materials/basic_materials/shitou.png"
        },
        {
          name: "木头",
          count: 20,
          icon: "atlas/picture/items/materials/basic_materials/wood.png"
        },
        {
          name: "浆果",
          count: 20,
          icon: "atlas/picture/items/materials/food_materials/fruit.png"
        },
        {
          name: "草",
          count: 20,
          icon: "atlas/picture/items/materials/basic_materials/grass.png"
        },
        {
          name: "棒球棍",
          count: 1,
          icon: "atlas/picture/items/weapons/melees/baseket_bat.png"
        }
      ];
      const rewards = [];
      for (let level = 1; level <= 60; level++) {
        const reward = rewardCycle[(level - 1) % rewardCycle.length];
        rewards.push({
          level,
          name: reward.name,
          count: reward.count,
          icon: reward.icon,
          unlocked: false,
          claimed: false
        });
      }
      return rewards;
    }
    clampWeek(week) {
      if (!Number.isFinite(week)) {
        return 1;
      }
      return Math.min(7, Math.max(1, Math.floor(week)));
    }
    getTemplateNode(listNode) {
      const list = listNode;
      return (list == null ? void 0 : list._templateNode) || (list == null ? void 0 : list.templateNode) || null;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findNamedChildUnder(root, parentName, childName) {
      const parent = this.findChildByName(root, parentName);
      if (!parent) {
        return null;
      }
      const children = parent.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.name === childName) {
          return child;
        }
      }
      return null;
    }
    findDirectText(root) {
      var _a;
      const children = root && Array.isArray(root.children) ? root.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && ((_a = child.constructor) == null ? void 0 : _a.name) === "Text") {
          return child;
        }
      }
      return null;
    }
    setFirstText(root, text) {
      const textNode = this.findChildByType(root, "Text");
      if (textNode) {
        textNode.text = text;
      }
    }
    findChildByType(root, typeName) {
      var _a;
      if (!root) {
        return null;
      }
      if (((_a = root.constructor) == null ? void 0 : _a.name) === typeName || root._$type === typeName) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByType(children[i], typeName);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findChildByNameAndType(root, name, typeName) {
      if (!root) {
        return null;
      }
      if (root.name === name && this.isNodeType(root, typeName)) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByNameAndType(children[i], name, typeName);
        if (found) {
          return found;
        }
      }
      return null;
    }
    isGListNode(node) {
      return this.isNodeType(node, "GList");
    }
    isNodeType(node, typeName) {
      var _a;
      return !!node && (((_a = node.constructor) == null ? void 0 : _a.name) === typeName || node._$type === typeName);
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    setNodeAlpha(node, alpha) {
      const target = node;
      if (target && "alpha" in target) {
        target.alpha = alpha;
      }
    }
  };
  __name(BattlePassPanel, "BattlePassPanel");
  __decorateClass([
    property11(Laya.Node)
  ], BattlePassPanel.prototype, "timeListNode", 2);
  __decorateClass([
    property11(Laya.Node)
  ], BattlePassPanel.prototype, "taskListNode", 2);
  __decorateClass([
    property11(Laya.Node)
  ], BattlePassPanel.prototype, "gradeListNode", 2);
  __decorateClass([
    property11(Laya.Node)
  ], BattlePassPanel.prototype, "rewardListNode", 2);
  __decorateClass([
    property11(Laya.Text)
  ], BattlePassPanel.prototype, "experienceText", 2);
  BattlePassPanel = __decorateClass([
    regClass12("81f56768-a9fa-49b5-a965-a5c7d2664a10", "../src/PlayUI/BattlePass/BattlePassPanel.ts")
  ], BattlePassPanel);

  // src/PlayUI/Crafting/CraftingItemBox.ts
  var { regClass: regClass13 } = Laya;
  var CraftingItemBox = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.template = null;
    }
    bind(item) {
      this.resolveTemplate();
      if (this.template) {
        this.template.bindData(item);
      }
    }
    resolveTemplate() {
      if (this.template && this.template.owner) {
        return;
      }
      const owner = this.owner;
      this.template = owner.getComponent(listTemplate);
      if (!this.template) {
        this.template = owner.addComponent(listTemplate);
      }
    }
  };
  __name(CraftingItemBox, "CraftingItemBox");
  CraftingItemBox = __decorateClass([
    regClass13("d95d4da9-f038-4e38-baae-7ae1bfa82b26", "../src/PlayUI/Crafting/CraftingItemBox.ts")
  ], CraftingItemBox);

  // src/PlayUI/Crafting/CraftingItemList.ts
  var { regClass: regClass14, property: property12 } = Laya;
  var CraftingItemList = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.listNode = null;
      this.templateNode = null;
      this.items = [];
    }
    onAwake() {
      this.resolveBindings();
    }
    setItems(items) {
      this.resolveBindings();
      this.items = Array.isArray(items) ? items.map((item) => __spreadValues({}, item)) : [];
      this.refresh();
    }
    refresh() {
      const list = this.getListRoot();
      if (!list) {
        return;
      }
      if ("itemRenderer" in list) {
        list.itemRenderer = (index, item) => {
          this.renderItem(index, item);
        };
      }
      if ("numItems" in list) {
        list.numItems = this.items.length;
      }
      if (typeof list.refresh === "function") {
        list.refresh(true);
      }
      Laya.timer.callLater(this, this.renderVisibleItems);
    }
    renderVisibleItems() {
      const list = this.getListRoot();
      const children = list && Array.isArray(list.children) ? list.children : [];
      let dataIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (!node || node === this.getTemplateNode()) {
          continue;
        }
        this.renderItem(dataIndex, node);
        dataIndex++;
      }
    }
    renderItem(index, node) {
      if (!node) {
        return;
      }
      const item = this.items[index] || null;
      this.setNodeVisible(node, !!item);
      let box = node.getComponent(CraftingItemBox);
      if (!box) {
        box = node.addComponent(CraftingItemBox);
      }
      box.bind(item);
    }
    resolveBindings() {
      const list = this.getListRoot();
      if (!this.templateNode && list) {
        this.templateNode = list._templateNode || list.templateNode || null;
      }
    }
    getListRoot() {
      return this.listNode || this.owner || null;
    }
    getTemplateNode() {
      const list = this.getListRoot();
      return this.templateNode || (list == null ? void 0 : list._templateNode) || (list == null ? void 0 : list.templateNode) || null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
  };
  __name(CraftingItemList, "CraftingItemList");
  __decorateClass([
    property12(Laya.Node)
  ], CraftingItemList.prototype, "listNode", 2);
  __decorateClass([
    property12(Laya.Node)
  ], CraftingItemList.prototype, "templateNode", 2);
  CraftingItemList = __decorateClass([
    regClass14("72132ef4-6b9b-4d44-96fa-b5808dac7d6b", "../src/PlayUI/Crafting/CraftingItemList.ts")
  ], CraftingItemList);

  // src/PlayUI/Crafting/CraftingRecipeItem.ts
  var { regClass: regClass15, property: property13 } = Laya;
  var CraftingRecipeItem = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.nameText = null;
      this.maskNode = null;
      this.recipeId = "";
      this.onClickHandler = null;
      this.bindingsResolved = false;
    }
    onDisable() {
      this.unbindClick();
    }
    onDestroy() {
      this.unbindClick();
      this.onClickHandler = null;
    }
    bind(recipe, onClick, selected = false) {
      this.resolveBindings();
      this.recipeId = recipe.id;
      this.onClickHandler = onClick;
      if (this.nameText) {
        this.nameText.text = recipe.name;
      }
      this.setSelected(selected);
      this.bindClick();
    }
    clear() {
      this.recipeId = "";
      if (this.nameText) {
        this.nameText.text = "";
      }
      this.setSelected(false);
      this.unbindClick();
    }
    setSelected(selected) {
      this.resolveBindings();
      const mask = this.maskNode;
      if (!mask) {
        return;
      }
      mask.visible = !selected;
      if ("active" in mask) {
        mask.active = !selected;
      }
      if ("mouseEnabled" in mask) {
        mask.mouseEnabled = false;
      }
      if ("touchable" in mask) {
        mask.touchable = false;
      }
    }
    bindClick() {
      const target = this.owner;
      if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
        return;
      }
      target.mouseEnabled = true;
      target.off(Laya.Event.CLICK, this, this.handleClick);
      target.on(Laya.Event.CLICK, this, this.handleClick);
    }
    unbindClick() {
      const target = this.owner;
      if (target && typeof target.off === "function") {
        target.off(Laya.Event.CLICK, this, this.handleClick);
      }
    }
    handleClick() {
      if (this.recipeId && this.onClickHandler) {
        this.onClickHandler(this.recipeId);
      }
    }
    resolveBindings() {
      if (this.bindingsResolved) {
        return;
      }
      this.nameText = this.nameText || this.findFirstTextNode(this.owner);
      this.maskNode = this.maskNode || this.findDirectChildByName(this.owner, "mask");
      this.bindingsResolved = true;
    }
    findDirectChildByName(root, name) {
      const children = root && Array.isArray(root.children) ? root.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.name === name) {
          return child;
        }
      }
      return null;
    }
    findFirstTextNode(root) {
      if (!root) {
        return null;
      }
      if (root.text !== void 0) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findFirstTextNode(children[i]);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(CraftingRecipeItem, "CraftingRecipeItem");
  __decorateClass([
    property13(Laya.Text)
  ], CraftingRecipeItem.prototype, "nameText", 2);
  __decorateClass([
    property13(Laya.Node)
  ], CraftingRecipeItem.prototype, "maskNode", 2);
  CraftingRecipeItem = __decorateClass([
    regClass15("59e2b6ba-d181-4c83-846e-b77f759d0755", "../src/PlayUI/Crafting/CraftingRecipeItem.ts")
  ], CraftingRecipeItem);

  // src/PlayUI/Crafting/CraftingRecipeList.ts
  var { regClass: regClass16, property: property14 } = Laya;
  var CraftingRecipeList = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.listNode = null;
      this.templateNode = null;
      this.onRecipeClick = null;
      this.recipes = [];
      this.selectedRecipeId = "";
      this.shouldScrollTop = false;
      this.virtualListEnabled = false;
    }
    onAwake() {
      this.resolveBindings();
    }
    setRecipes(recipes) {
      this.resolveBindings();
      this.recipes = Array.isArray(recipes) ? recipes.map((recipe) => __spreadValues({}, recipe)) : [];
      this.selectedRecipeId = this.recipes.length > 0 ? this.recipes[0].id : "";
      this.shouldScrollTop = true;
      this.refresh();
    }
    refresh() {
      const list = this.getListRoot();
      if (!list) {
        return;
      }
      list.itemRenderer = (index, item) => {
        this.renderItem(index, item);
      };
      this.ensureVirtualList(list);
      if ("numItems" in list) {
        list.numItems = this.recipes.length;
      }
      if (typeof list.refresh === "function") {
        list.refresh(true);
      }
      if (this.shouldScrollTop && typeof list.scrollTop === "function") {
        list.scrollTop(false);
      }
      this.shouldScrollTop = false;
    }
    ensureVirtualList(list) {
      if (this.virtualListEnabled) {
        return;
      }
      if (list && typeof list.setVirtual === "function") {
        list.setVirtual();
        this.virtualListEnabled = true;
      }
    }
    renderItem(index, node) {
      const recipe = this.recipes[index] || null;
      if (!node || !recipe) {
        this.setNodeVisible(node, false);
        return;
      }
      this.setNodeVisible(node, true);
      let item = node.getComponent(CraftingRecipeItem);
      if (!item) {
        item = node.addComponent(CraftingRecipeItem);
      }
      item.bind(recipe, (recipeId) => {
        this.selectRecipe(recipeId);
      }, recipe.id === this.selectedRecipeId);
    }
    selectRecipe(recipeId) {
      if (!recipeId || recipeId === this.selectedRecipeId) {
        return;
      }
      this.selectedRecipeId = recipeId;
      this.refresh();
      if (this.onRecipeClick) {
        this.onRecipeClick(recipeId);
      }
    }
    resolveBindings() {
      const list = this.getListRoot();
      if (!this.templateNode && list) {
        this.templateNode = list._templateNode || list.templateNode || null;
      }
    }
    getListRoot() {
      return this.listNode || this.owner || null;
    }
    getTemplateNode() {
      const list = this.getListRoot();
      return this.templateNode || (list == null ? void 0 : list._templateNode) || (list == null ? void 0 : list.templateNode) || null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
  };
  __name(CraftingRecipeList, "CraftingRecipeList");
  __decorateClass([
    property14(Laya.Node)
  ], CraftingRecipeList.prototype, "listNode", 2);
  __decorateClass([
    property14(Laya.Node)
  ], CraftingRecipeList.prototype, "templateNode", 2);
  CraftingRecipeList = __decorateClass([
    regClass16("781cd7c0-aa6b-4e92-9268-f5eb16e95a95", "../src/PlayUI/Crafting/CraftingRecipeList.ts")
  ], CraftingRecipeList);

  // src/PlayUI/Crafting/CraftingPanel.ts
  var { regClass: regClass17, property: property15 } = Laya;
  var CraftingPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.stationPanelNode = null;
      this.recipeListNode = null;
      this.inputListNode = null;
      this.outputBoxNode = null;
      this.recipeNameText = null;
      this.shuxingText = null;
      this.campfireButton = null;
      this.pengrenjiButton = null;
      this.processingButton = null;
      this.equipmentButton = null;
      this.manufactureButton = null;
      this.medicineButton = null;
      this.advanceButton = null;
      this.defaultStation = "campfire";
      this.currentStation = "campfire";
      this.currentRecipes = [];
      this.selectedRecipeId = "";
      this.recipeList = null;
      this.inputList = null;
      this.outputBox = null;
      this.stationOpenStates = {
        campfire: true,
        pengrenji: false,
        processing: false,
        equipment: false,
        manufacture: false,
        medicine: false,
        advance: false
      };
      this.onRecipeClick = /* @__PURE__ */ __name((recipeId) => {
        this.selectedRecipeId = recipeId;
        this.refreshSelectedRecipe();
      }, "onRecipeClick");
    }
    onAwake() {
      this.resolveBindings();
      this.configurePointerHandling();
      this.bindStationButtons();
      this.selectStation(this.normalizeStation(this.defaultStation));
      void this.refreshAfterDataLoad();
    }
    onEnable() {
      this.resolveBindings();
      this.configurePointerHandling();
      this.bindStationButtons();
      this.selectStation(this.normalizeStation(this.defaultStation));
      void this.refreshAfterDataLoad();
    }
    onDisable() {
      this.unbindStationButtons();
    }
    onDestroy() {
      this.unbindStationButtons();
    }
    refreshAfterDataLoad() {
      return __async(this, null, function* () {
        yield DataManager.getInstance().loadAll();
        this.currentRecipes = DataManager.getInstance().getCraftingRecipes(this.currentStation);
        if (!this.selectedRecipeId && this.currentRecipes.length > 0) {
          this.selectedRecipeId = this.currentRecipes[0].id;
        }
        this.refreshRecipeList();
        this.refreshSelectedRecipe();
      });
    }
    selectStation(station) {
      this.closeStation(this.currentStation);
      this.openStation(station);
      this.applyStationMaskVisibility();
      this.currentStation = station;
      this.currentRecipes = DataManager.getInstance().getCraftingRecipes(station);
      this.selectedRecipeId = this.currentRecipes.length > 0 ? this.currentRecipes[0].id : "";
      this.refreshRecipeList();
      this.refreshSelectedRecipe();
    }
    onPanelOpened() {
      this.selectStation(this.normalizeStation(this.defaultStation));
    }
    refreshRecipeList() {
      if (!this.recipeList) {
        return;
      }
      this.recipeList.onRecipeClick = this.onRecipeClick;
      this.recipeList.setRecipes(this.currentRecipes);
    }
    refreshSelectedRecipe() {
      const recipe = this.currentRecipes.find((item) => item.id === this.selectedRecipeId) || null;
      if (!recipe) {
        if (this.recipeNameText) {
          this.recipeNameText.text = "请选择配方";
        }
        this.renderInputList([]);
        this.renderOutputBox(null);
        this.updateShuxingText(null);
        return;
      }
      if (this.recipeNameText) {
        this.recipeNameText.text = recipe.name;
      }
      this.renderInputList(recipe.inputs.map((item) => this.toInputListData(item)));
      this.renderOutputBox(this.toOutputListData(recipe));
      this.updateShuxingText(recipe);
    }
    updateShuxingText(recipe) {
      if (!this.shuxingText) {
        return;
      }
      if (!recipe) {
        this.shuxingText.text = "";
        return;
      }
      const output = recipe.output;
      const meta = DataManager.getInstance().resolveItemMeta(output.itemId);
      this.shuxingText.text = this.formatItemInfo(output.name || output.itemId, output.icon || "", meta);
    }
    formatItemInfo(fallbackName, fallbackIcon, meta) {
      const name = (meta == null ? void 0 : meta.displayName) || (meta == null ? void 0 : meta.nameZh) || fallbackName;
      const type = this.formatItemType(meta, fallbackIcon);
      if (this.isMeleeWeaponMeta(meta, fallbackIcon)) {
        return [
          name,
          type,
          `攻击力：${this.formatOptionalNumber(meta == null ? void 0 : meta.attackPower)}`,
          `攻速：${this.formatOptionalNumber(meta == null ? void 0 : meta.attackSpeed)}`,
          `耐久度：${this.formatOptionalNumber(meta == null ? void 0 : meta.durability)}`
        ].join("\n");
      }
      if (this.isArmorMeta(meta, fallbackIcon)) {
        return [
          name,
          type,
          `防御：${this.formatOptionalNumber(meta == null ? void 0 : meta.defense)}`,
          `耐久度：${this.formatOptionalNumber(meta == null ? void 0 : meta.durability)}`
        ].join("\n");
      }
      const effect = this.formatItemEffect(meta, fallbackIcon);
      return [name, type, effect].filter((line) => line !== "").join("\n");
    }
    isMeleeWeaponMeta(meta, icon = "") {
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      const iconPath = String(icon || (meta == null ? void 0 : meta.icon) || "").toLowerCase();
      return category === "weapons" && (subCategory.includes("melee") || iconPath.includes("/weapons/melees/"));
    }
    isArmorMeta(meta, icon = "") {
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      const iconPath = String(icon || (meta == null ? void 0 : meta.icon) || "").toLowerCase();
      return category.includes("armor") || category.includes("helmet") || category.includes("plate") || subCategory.includes("armor") || subCategory.includes("helmet") || subCategory.includes("head") || subCategory.includes("plate") || subCategory.includes("insert") || iconPath.includes("/armors/");
    }
    formatOptionalNumber(value) {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? String(numeric) : "";
    }
    formatItemType(meta, icon = "") {
      const category = String((meta == null ? void 0 : meta.category) || "").toLowerCase();
      const subCategory = String((meta == null ? void 0 : meta.subCategory) || "").toLowerCase();
      const iconPath = String(icon || (meta == null ? void 0 : meta.icon) || "").toLowerCase();
      if (category === "weapons" || subCategory.includes("melee") || iconPath.includes("/weapons/") || Number.isFinite(meta == null ? void 0 : meta.attackPower) || Number.isFinite(meta == null ? void 0 : meta.attackSpeed)) {
        return "武器";
      }
      if (category.includes("helmet") || subCategory.includes("helmet") || subCategory.includes("head") || iconPath.includes("/armors/heads/")) {
        return "头盔";
      }
      if (category.includes("plate") || subCategory.includes("plate") || subCategory.includes("insert") || iconPath.includes("/armors/bodies/")) {
        return "插板";
      }
      if (category.includes("armor") || subCategory.includes("armor") || subCategory.includes("body")) {
        return "防具";
      }
      if (category === "foods" || subCategory.includes("food") || iconPath.includes("/foods/")) {
        return "食物";
      }
      if (category === "medicines" || subCategory.includes("medicine")) {
        return "药品";
      }
      if (subCategory === "basic_materials") {
        return "基础材料";
      }
      if (subCategory === "advanced_materials") {
        return "高级材料";
      }
      if (category === "materials" || subCategory.includes("material")) {
        return "材料";
      }
      if (category === "misc") {
        return "杂项";
      }
      return "未知";
    }
    isFoodMeta(meta) {
      const category = String(meta.category || "").toLowerCase();
      const subCategory = String(meta.subCategory || "").toLowerCase();
      return category === "foods" || subCategory.includes("food");
    }
    formatFoodEffect(meta) {
      const lines = [];
      if (Number.isFinite(meta.satiety)) {
        lines.push(`饱食度：${meta.satiety}`);
      }
      if (Number.isFinite(meta.hydration)) {
        lines.push(`水分值：${meta.hydration}`);
      }
      return lines.join("\n");
    }
    formatItemEffect(meta, icon = "") {
      if (!meta) {
        return "";
      }
      if (this.isFoodMeta(meta)) {
        return this.formatFoodEffect(meta);
      }
      if (meta.useEffect) {
        const amount = Number.isFinite(meta.useEffect.amount) ? ` ${meta.useEffect.amount}` : "";
        if (meta.useEffect.type === "healHp") {
          return `恢复生命${amount}`;
        }
        return `${meta.useEffect.type}${amount}`;
      }
      const effects = [];
      if (Number.isFinite(meta.attackPower)) {
        effects.push(`攻击 ${meta.attackPower}`);
      }
      if (Number.isFinite(meta.attackSpeed)) {
        effects.push(`攻速 ${meta.attackSpeed}`);
      }
      if (Number.isFinite(meta.defense)) {
        effects.push(`防御 ${meta.defense}`);
      }
      if (Number.isFinite(meta.durability)) {
        effects.push(`耐久 ${meta.durability}`);
      }
      if (effects.length > 0) {
        return effects.join(" / ");
      }
      return meta.description || "无";
    }
    toInputListData(item) {
      const required = this.normalizeCount(item.count);
      const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
      return __spreadProps(__spreadValues({}, item), {
        name: item.name || item.itemId,
        count: required,
        countText: `${available}/${required}`
      });
    }
    toOutputListData(recipe) {
      const output = recipe.output;
      const outputCount = this.normalizeCount(output.count);
      const craftableOutputCount = this.getCraftableRecipeCount(recipe.inputs) * outputCount;
      return __spreadProps(__spreadValues({}, output), {
        name: output.name || output.itemId,
        count: outputCount,
        countText: `${craftableOutputCount}/${outputCount}`
      });
    }
    getCraftableRecipeCount(inputs) {
      if (!inputs.length) {
        return 0;
      }
      let craftable = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < inputs.length; i++) {
        const item = inputs[i];
        const required = this.normalizeCount(item.count);
        if (!item.itemId || required <= 0) {
          return 0;
        }
        const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
        craftable = Math.min(craftable, Math.floor(available / required));
      }
      return craftable === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, craftable);
    }
    normalizeCount(count) {
      return Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
    }
    renderInputList(items) {
      var _a;
      (_a = this.inputList) == null ? void 0 : _a.setItems(items);
    }
    renderOutputBox(item) {
      var _a;
      (_a = this.outputBox) == null ? void 0 : _a.bind(item);
    }
    configurePointerHandling() {
      this.setNodeThrough(this.stationPanelNode, true);
      this.setNodeInteractive(this.recipeListNode, true);
      this.setNodeInteractive(this.inputListNode, true);
      this.setNodeInteractive(this.outputBoxNode, true);
      const buttons = this.getStationButtons();
      for (let i = 0; i < buttons.length; i++) {
        this.setNodeThrough(buttons[i].node, false);
        this.setNodeInteractive(buttons[i].node, true);
        this.setNodeInteractive(this.findDirectChildByName(buttons[i].node, "mask"), false);
      }
    }
    setNodeThrough(node, through) {
      const target = node;
      if (!target) {
        return;
      }
      if ("mouseThrough" in target) {
        target.mouseThrough = through;
      }
      if ("touchThrough" in target) {
        target.touchThrough = through;
      }
    }
    setNodeInteractive(node, enabled) {
      const target = node;
      if (!target) {
        return;
      }
      if ("mouseEnabled" in target) {
        target.mouseEnabled = enabled;
      }
      if ("touchable" in target) {
        target.touchable = enabled;
      }
    }
    bindStationButtons() {
      const buttons = this.getStationButtons();
      for (let i = 0; i < buttons.length; i++) {
        const entry = buttons[i];
        const target = entry.node;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
          continue;
        }
        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.onStationClick);
        target.on(Laya.Event.CLICK, this, this.onStationClick, [entry.station]);
      }
    }
    unbindStationButtons() {
      const buttons = this.getStationButtons();
      for (let i = 0; i < buttons.length; i++) {
        const target = buttons[i].node;
        if (target && typeof target.off === "function") {
          target.off(Laya.Event.CLICK, this, this.onStationClick);
        }
      }
    }
    onStationClick(station) {
      this.selectStation(station);
    }
    closeStation(station) {
      this.stationOpenStates[station] = false;
    }
    openStation(station) {
      this.stationOpenStates[station] = true;
    }
    applyStationMaskVisibility() {
      const buttons = this.getStationButtons();
      for (let i = 0; i < buttons.length; i++) {
        const entry = buttons[i];
        const mask = this.findDirectChildByName(entry.node, "mask");
        if (!mask || !("visible" in mask)) {
          continue;
        }
        mask.visible = !this.stationOpenStates[entry.station];
      }
    }
    getStationButtons() {
      return [
        { station: "campfire", node: this.campfireButton },
        { station: "pengrenji", node: this.pengrenjiButton },
        { station: "processing", node: this.processingButton },
        { station: "equipment", node: this.equipmentButton },
        { station: "manufacture", node: this.manufactureButton },
        { station: "medicine", node: this.medicineButton },
        { station: "advance", node: this.advanceButton }
      ];
    }
    resolveBindings() {
      const root = this.owner;
      this.stationPanelNode = this.stationPanelNode || this.findChildByName(root, "panel");
      this.recipeNameText = this.recipeNameText || this.findChildByName(root, "recipeName");
      this.shuxingText = this.shuxingText || this.findChildByName(root, "shuxing");
      this.outputBoxNode = this.outputBoxNode || this.findChildByName(root, "outputbox");
      const detailPanel = this.findChildByName(root, "detailPanel");
      const lists = this.findChildrenByType(detailPanel, "GList");
      this.inputListNode = this.inputListNode || lists[0] || null;
      this.recipeListNode = this.recipeListNode || lists[1] || null;
      this.recipeList = this.resolveRecipeList(this.recipeListNode);
      this.inputList = this.resolveItemList(this.inputListNode);
      this.outputBox = this.resolveItemBox(this.outputBoxNode);
      this.campfireButton = this.campfireButton || this.findChildByName(this.stationPanelNode, "campfire");
      this.pengrenjiButton = this.pengrenjiButton || this.findChildByName(this.stationPanelNode, "pengrenji");
      this.processingButton = this.processingButton || this.findChildByName(this.stationPanelNode, "processing");
      this.equipmentButton = this.equipmentButton || this.findChildByName(this.stationPanelNode, "equipment");
      this.manufactureButton = this.manufactureButton || this.findChildByName(this.stationPanelNode, "manufacture");
      this.medicineButton = this.medicineButton || this.findChildByName(this.stationPanelNode, "medicine");
      this.advanceButton = this.advanceButton || this.findChildByName(this.stationPanelNode, "advance");
    }
    resolveRecipeList(node) {
      if (!node) {
        return null;
      }
      let list = node.getComponent(CraftingRecipeList);
      if (!list) {
        list = node.addComponent(CraftingRecipeList);
      }
      return list;
    }
    resolveItemList(node) {
      if (!node) {
        return null;
      }
      let list = node.getComponent(CraftingItemList);
      if (!list) {
        list = node.addComponent(CraftingItemList);
      }
      return list;
    }
    resolveItemBox(node) {
      if (!node) {
        return null;
      }
      let box = node.getComponent(CraftingItemBox);
      if (!box) {
        box = node.addComponent(CraftingItemBox);
      }
      return box;
    }
    normalizeStation(value) {
      const station = String(value || "").trim();
      const valid = ["campfire", "pengrenji", "processing", "equipment", "manufacture", "medicine", "advance"];
      return valid.indexOf(station) >= 0 ? station : "campfire";
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findDirectChildByName(root, name) {
      const children = root && Array.isArray(root.children) ? root.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.name === name) {
          return child;
        }
      }
      return null;
    }
    findChildrenByType(root, type) {
      const found = [];
      this.collectChildrenByType(root, type, found);
      return found;
    }
    collectChildrenByType(root, type, found) {
      var _a;
      if (!root) {
        return;
      }
      if (((_a = root.constructor) == null ? void 0 : _a.name) === type || root._$type === type) {
        found.push(root);
      }
      const children = root.children;
      if (!children) {
        return;
      }
      for (let i = 0; i < children.length; i++) {
        this.collectChildrenByType(children[i], type, found);
      }
    }
  };
  __name(CraftingPanel, "CraftingPanel");
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "stationPanelNode", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "recipeListNode", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "inputListNode", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "outputBoxNode", 2);
  __decorateClass([
    property15(Laya.Text)
  ], CraftingPanel.prototype, "recipeNameText", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "campfireButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "pengrenjiButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "processingButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "equipmentButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "manufactureButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "medicineButton", 2);
  __decorateClass([
    property15(Laya.Node)
  ], CraftingPanel.prototype, "advanceButton", 2);
  __decorateClass([
    property15(String)
  ], CraftingPanel.prototype, "defaultStation", 2);
  CraftingPanel = __decorateClass([
    regClass17("0cf8b546-fb6f-4449-bef8-7e884849f1d5", "../src/PlayUI/Crafting/CraftingPanel.ts")
  ], CraftingPanel);

  // src/PlayUI/Mail/MailTemplate.ts
  var { regClass: regClass18, property: property16 } = Laya;
  var MailTemplate = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.titleText = null;
      this.timeText = null;
      this.targetNode = null;
      this.boundData = null;
    }
    onAwake() {
      this.owner.on(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    onDestroy() {
      this.owner.off(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    bindData(data) {
      this.boundData = data ? __spreadValues({}, data) : null;
      const title = this.titleText;
      const time = this.timeText;
      if (!data) {
        if (title) {
          title.text = "";
        }
        if (time) {
          time.text = "";
        }
        this.setTargetNodeShown(false);
        return;
      }
      if (title) {
        title.text = data.title;
      }
      if (time) {
        time.text = this.formatDate(
          data.createdAt
        );
      }
      this.setTargetNodeShown(
        !!data.isRead
      );
    }
    getBoundData() {
      return this.boundData ? __spreadValues({}, this.boundData) : null;
    }
    onClick() {
      if (!this.boundData) {
        return;
      }
      this.setTargetNodeShown(true);
    }
    setTargetNodeShown(shown) {
      if (!this.targetNode) {
        return;
      }
      const target = this.targetNode;
      if ("visible" in target) {
        target.visible = shown;
      }
      if ("active" in target) {
        target.active = shown;
      }
    }
    formatDate(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}/${month}/${day}`;
    }
  };
  __name(MailTemplate, "MailTemplate");
  __decorateClass([
    property16(Laya.Node)
  ], MailTemplate.prototype, "titleText", 2);
  __decorateClass([
    property16(Laya.Node)
  ], MailTemplate.prototype, "timeText", 2);
  __decorateClass([
    property16(Laya.Node)
  ], MailTemplate.prototype, "targetNode", 2);
  MailTemplate = __decorateClass([
    regClass18("e9b896f7-3773-4c57-9cf1-0e13c09838da", "../src/PlayUI/Mail/MailTemplate.ts")
  ], MailTemplate);

  // src/PlayUI/Mail/MailList.ts
  var { regClass: regClass19, property: property17 } = Laya;
  var MailList = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.listNode = null;
      this.templateNode = null;
      this.slotCount = 10;
      this.onMailClick = null;
      this.items = [];
      this.appliedSlotCount = -1;
    }
    onAwake() {
      this.applySlotCount(true);
      this.refresh();
    }
    onEnable() {
      this.applySlotCount();
      this.refresh();
    }
    // =========================
    // 设置邮件列表
    // =========================
    setItems(items) {
      this.items = Array.isArray(items) ? items.slice() : [];
      this.refresh();
    }
    // =========================
    // 设置格子数量
    // =========================
    setSlotCount(count) {
      this.slotCount = Number.isFinite(count) ? Math.max(
        0,
        Math.floor(count)
      ) : 0;
      this.applySlotCount(true);
      this.refresh();
    }
    // =========================
    // 刷新列表
    // =========================
    refresh() {
      this.applySlotCount();
      this.hideTemplateNode();
      const root = this.getListRoot();
      if (!root) {
        return;
      }
      const children = root.children || [];
      let dataIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (!node || node === this.templateNode) {
          continue;
        }
        const template = node.getComponent(
          MailTemplate
        );
        if (!template) {
          continue;
        }
        const item = this.items[dataIndex] || null;
        template.bindData(item);
        const target = node;
        target.off(
          Laya.Event.CLICK,
          this,
          this.onSlotClick
        );
        if (item) {
          target.on(
            Laya.Event.CLICK,
            this,
            this.onSlotClick,
            [dataIndex]
          );
        }
        dataIndex++;
      }
    }
    // =========================
    // 点击邮件
    // =========================
    onSlotClick(dataIndex) {
      const item = this.items[dataIndex];
      if (!item) {
        return;
      }
      if (this.onMailClick) {
        this.onMailClick(
          item
        );
      }
    }
    getListRoot() {
      return this.listNode || this.owner || null;
    }
    applySlotCount(force = false) {
      const root = this.getListRoot();
      if (!root) {
        return;
      }
      const nextCount = Math.max(
        0,
        Math.floor(
          this.slotCount
        )
      );
      if (!force && this.appliedSlotCount === nextCount) {
        return;
      }
      this.appliedSlotCount = nextCount;
      if ("numItems" in root) {
        root.numItems = nextCount;
      }
      if (typeof root.refresh === "function") {
        root.refresh(true);
      }
    }
    hideTemplateNode() {
      const template = this.templateNode;
      if (template && "visible" in template) {
        template.visible = false;
      }
    }
  };
  __name(MailList, "MailList");
  __decorateClass([
    property17(Laya.Node)
  ], MailList.prototype, "listNode", 2);
  __decorateClass([
    property17(Laya.Node)
  ], MailList.prototype, "templateNode", 2);
  __decorateClass([
    property17(Number)
  ], MailList.prototype, "slotCount", 2);
  MailList = __decorateClass([
    regClass19("080df137-6a67-4706-8c99-3c2ec24808fa", "../src/PlayUI/Mail/MailList.ts")
  ], MailList);

  // src/PlayUI/Mail/MailMessageController.ts
  var _MailMessageController = class _MailMessageController {
    constructor(getMessageText, setNodeShown) {
      this.getMessageText = getMessageText;
      this.setNodeShown = setNodeShown;
      this.fadeToken = 0;
    }
    show(message) {
      const targetText = this.getMessageText();
      if (!targetText) {
        return;
      }
      this.fadeToken += 1;
      const token = this.fadeToken;
      targetText.text = String(message || "");
      targetText.alpha = 1;
      this.setNodeShown(targetText, true);
      Laya.timer.clear(this, this.fade);
      Laya.timer.once(1e3, this, this.fade, [token]);
    }
    hide() {
      this.fadeToken += 1;
      this.clearTimers();
      const targetText = this.getMessageText();
      if (!targetText) {
        return;
      }
      targetText.text = "";
      this.setNodeShown(targetText, false);
      targetText.alpha = 1;
    }
    clearTimers() {
      Laya.timer.clear(this, this.fade);
      Laya.timer.clear(this, this.finishFade);
      const targetText = this.getMessageText();
      if (targetText) {
        Laya.Tween.clearAll(targetText);
      }
    }
    fade(token) {
      const targetText = this.getMessageText();
      if (token !== this.fadeToken || !targetText) {
        return;
      }
      Laya.Tween.clearAll(targetText);
      Laya.Tween.to(
        targetText,
        { alpha: 0 },
        450,
        null,
        Laya.Handler.create(this, this.finishFade, [token])
      );
    }
    finishFade(token) {
      const targetText = this.getMessageText();
      if (token !== this.fadeToken || !targetText) {
        return;
      }
      targetText.text = "";
      this.setNodeShown(targetText, false);
      targetText.alpha = 1;
    }
  };
  __name(_MailMessageController, "MailMessageController");
  var MailMessageController = _MailMessageController;

  // src/PlayUI/Mail/MailPanel.ts
  var { regClass: regClass20, property: property18 } = Laya;
  var MailPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.mailListNode = null;
      this.rewardListNode = null;
      this.detailText = null;
      this.getRewardButton = null;
      this.rewardTargetNode = null;
      this.messageText = null;
      this.mailList = null;
      this.rewardList = null;
      this.currentMailId = "";
      this.messageController = new MailMessageController(
        () => this.messageText,
        (node, shown) => this.setNodeShown(node, shown)
      );
      this.onMailChanged = /* @__PURE__ */ __name(() => {
        this.refreshMailList();
      }, "onMailChanged");
      // =========================
      // 点击左边某封邮件
      // =========================
      this.onMailClick = /* @__PURE__ */ __name((item) => {
        if (!item.mailId) {
          return;
        }
        this.openMail(
          item.mailId
        );
      }, "onMailClick");
    }
    onAwake() {
      this.bindControllers();
      this.bindButtons();
      MailManager.getInstance().addChangeListener(
        this.onMailChanged
      );
      MailManager.getInstance().ensureDefaultMails();
      this.refreshMailList();
      this.clearDetail();
    }
    onEnable() {
      this.bindControllers();
      this.bindButtons();
      MailManager.getInstance().addChangeListener(
        this.onMailChanged
      );
      this.refreshMailList();
      if (this.currentMailId) {
        this.openMail(
          this.currentMailId
        );
      }
    }
    onDisable() {
      this.messageController.clearTimers();
      MailManager.getInstance().removeChangeListener(
        this.onMailChanged
      );
      this.unbindButtons();
    }
    onDestroy() {
      this.messageController.clearTimers();
      MailManager.getInstance().removeChangeListener(
        this.onMailChanged
      );
      this.unbindButtons();
      if (this.mailList) {
        this.mailList.onMailClick = null;
      }
      this.mailList = null;
      this.rewardList = null;
    }
    // =========================
    // 找到两个 List
    // =========================
    bindControllers() {
      this.mailList = this.mailListNode ? this.mailListNode.getComponent(
        MailList
      ) : null;
      this.rewardList = this.rewardListNode ? this.rewardListNode.getComponent(
        glist
      ) : null;
      if (this.mailList) {
        this.mailList.onMailClick = this.onMailClick;
      }
    }
    // =========================
    // 绑定领取按钮
    // =========================
    bindButtons() {
      if (!this.getRewardButton) {
        return;
      }
      this.getRewardButton.off(
        Laya.Event.CLICK,
        this,
        this.onGetRewardClick
      );
      this.getRewardButton.on(
        Laya.Event.CLICK,
        this,
        this.onGetRewardClick
      );
    }
    unbindButtons() {
      if (!this.getRewardButton) {
        return;
      }
      this.getRewardButton.off(
        Laya.Event.CLICK,
        this,
        this.onGetRewardClick
      );
    }
    // =========================
    // 刷新左边邮件列表
    // =========================
    refreshMailList() {
      if (!this.mailList) {
        return;
      }
      const mails = MailManager.getInstance().getMails();
      const listData = mails.map((mail) => {
        const hasReward = Array.isArray(
          mail.attachments
        ) && mail.attachments.length > 0;
        return {
          mailId: mail.id,
          title: mail.title,
          createdAt: mail.createdAt,
          isRead: mail.isRead,
          isClaimed: mail.isClaimed,
          hasReward
        };
      });
      this.mailList.setSlotCount(
        Math.max(
          10,
          listData.length
        )
      );
      this.mailList.setItems(
        listData
      );
    }
    // =========================
    // 打开邮件
    // =========================
    openMail(mailId) {
      const manager = MailManager.getInstance();
      const mail = manager.getMail(
        mailId
      );
      if (!mail) {
        this.clearDetail();
        return;
      }
      this.currentMailId = mail.id;
      manager.markRead(
        mail.id
      );
      this.showDetailText(
        mail.content
      );
      this.showRewards(
        mail.attachments
      );
      this.hideMessageText();
      this.renderMailState(
        mail
      );
      this.refreshMailList();
    }
    // =========================
    // 判断右边状态
    // =========================
    renderMailState(mail) {
      const hasReward = Array.isArray(
        mail.attachments
      ) && mail.attachments.length > 0;
      if (!hasReward) {
        if (this.getRewardButton) {
          this.setNodeShown(
            this.getRewardButton,
            false
          );
        }
        if (this.rewardTargetNode) {
          this.setNodeShown(
            this.rewardTargetNode,
            false
          );
        }
        this.setRewardClaimedShown(
          false
        );
        return;
      }
      if (mail.isClaimed) {
        if (this.getRewardButton) {
          this.setNodeShown(
            this.getRewardButton,
            false
          );
        }
        if (this.rewardTargetNode) {
          this.setNodeShown(
            this.rewardTargetNode,
            true
          );
        }
        this.setRewardClaimedShown(
          true
        );
        return;
      }
      if (this.getRewardButton) {
        this.setNodeShown(
          this.getRewardButton,
          true
        );
      }
      if (this.rewardTargetNode) {
        this.setNodeShown(
          this.rewardTargetNode,
          false
        );
      }
      this.setRewardClaimedShown(
        false
      );
    }
    // =========================
    // 点击领取奖励
    // =========================
    onGetRewardClick() {
      if (!this.currentMailId) {
        return;
      }
      const manager = MailManager.getInstance();
      const mail = manager.getMail(
        this.currentMailId
      );
      if (!mail) {
        return;
      }
      if (mail.isClaimed) {
        return;
      }
      if (!mail.attachments || mail.attachments.length === 0) {
        return;
      }
      const dataManager = DataManager.getInstance();
      if (!dataManager.canGrantItemsToWarehouse(
        mail.attachments
      )) {
        this.showMessageText(
          "仓库已满，请清理仓库"
        );
        return;
      }
      if (!dataManager.grantItemsToWarehouse(
        mail.attachments
      )) {
        this.showMessageText(
          "仓库已满，请清理仓库"
        );
        return;
      }
      const rewardMessage = this.buildRewardClaimMessage(
        mail.attachments
      );
      const success = manager.markClaimed(
        mail.id
      );
      if (!success) {
        return;
      }
      this.showMessageText(
        rewardMessage
      );
      const updatedMail = manager.getMail(
        mail.id
      );
      if (!updatedMail) {
        return;
      }
      this.renderMailState(
        updatedMail
      );
      this.refreshMailList();
    }
    // =========================
    // 显示邮件正文
    // =========================
    showDetailText(value) {
      if (!this.detailText) {
        return;
      }
      this.detailText.text = String(
        value || ""
      );
    }
    // =========================
    // 显示奖励物品
    // =========================
    showRewards(attachments) {
      if (!this.rewardList) {
        return;
      }
      const listData = (attachments || []).map(
        (item) => ({
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        })
      );
      this.rewardList.setSlotCount(
        listData.length
      );
      this.rewardList.setItems(
        listData
      );
    }
    buildRewardClaimMessage(attachments) {
      const rewardText = (attachments || []).filter(
        (item) => !!item && !!item.itemId && Number.isFinite(
          item.count
        ) && item.count > 0
      ).map(
        (item) => `${item.name || item.itemId}*${Math.max(
          1,
          Math.floor(
            item.count
          )
        )}`
      ).join(
        "，"
      );
      return rewardText ? `获得${rewardText}` : "获得奖励";
    }
    // =========================
    // 没选中邮件
    // =========================
    clearDetail() {
      this.currentMailId = "";
      this.showDetailText(
        ""
      );
      if (this.rewardList) {
        this.rewardList.setItems(
          []
        );
      }
      if (this.getRewardButton) {
        this.setNodeShown(
          this.getRewardButton,
          false
        );
      }
      if (this.rewardTargetNode) {
        this.setNodeShown(
          this.rewardTargetNode,
          false
        );
      }
      this.setRewardClaimedShown(
        false
      );
      this.hideMessageText();
    }
    showMessageText(message) {
      this.messageController.show(
        message
      );
    }
    hideMessageText() {
      this.messageController.hide();
    }
    setRewardClaimedShown(shown) {
      this.applyRewardClaimedShown(
        shown
      );
      Laya.timer.callLater(
        this,
        () => this.applyRewardClaimedShown(
          shown
        )
      );
    }
    applyRewardClaimedShown(shown) {
      var _a, _b, _c;
      const rewardRoot = this.rewardListNode || ((_a = this.rewardList) == null ? void 0 : _a.listNode) || ((_b = this.rewardList) == null ? void 0 : _b.owner) || null;
      const children = rewardRoot && Array.isArray(rewardRoot.children) ? rewardRoot.children : [];
      const templateNode = (_c = this.rewardList) == null ? void 0 : _c.templateNode;
      for (let i = 0; i < children.length; i++) {
        const slotNode = children[i];
        if (!slotNode || slotNode === templateNode) {
          continue;
        }
        const template = slotNode.getComponent(
          listTemplate
        );
        const data = template ? template.getBoundData() : null;
        const claimedNode = this.findDirectChildByName(
          slotNode,
          "Sprite"
        );
        this.setNodeShown(
          claimedNode,
          shown && !!data
        );
      }
    }
    findDirectChildByName(node, name) {
      const children = node && Array.isArray(node.children) ? node.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.name === name) {
          return child;
        }
      }
      return null;
    }
    setNodeShown(node, shown) {
      const target = node;
      if (!target) {
        return;
      }
      if ("active" in target) {
        target.active = shown;
      }
      if ("visible" in target) {
        target.visible = shown;
      }
    }
  };
  __name(MailPanel, "MailPanel");
  __decorateClass([
    property18(Laya.Node)
  ], MailPanel.prototype, "mailListNode", 2);
  __decorateClass([
    property18(Laya.Node)
  ], MailPanel.prototype, "rewardListNode", 2);
  __decorateClass([
    property18(Laya.Text)
  ], MailPanel.prototype, "detailText", 2);
  __decorateClass([
    property18(Laya.Node)
  ], MailPanel.prototype, "getRewardButton", 2);
  __decorateClass([
    property18(Laya.Node)
  ], MailPanel.prototype, "rewardTargetNode", 2);
  __decorateClass([
    property18(Laya.Text)
  ], MailPanel.prototype, "messageText", 2);
  MailPanel = __decorateClass([
    regClass20("7f7b2a1a-0d2d-4f07-8b2d-2df6fef0a4a1", "../src/PlayUI/Mail/MailPanel.ts")
  ], MailPanel);

  // src/PlayUI/Make/MakePanel.ts
  var { regClass: regClass21, property: property19 } = Laya;
  var MakePanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.outputListNode = null;
      this.outputTemplateNode = null;
      this.inputListNode = null;
      this.inputTemplateNode = null;
      this.makeButtonNode = null;
      this.makeButtonMaskNode = null;
      this.messageTextNode = null;
      this.outputList = null;
      this.inputList = null;
      this.recipes = [];
      this.selectedRecipeId = "";
      this.messageFadeToken = 0;
      this.onOutputSlotClick = /* @__PURE__ */ __name((_item, _listKey, slotIndex) => {
        const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        const recipe = index >= 0 ? this.recipes[index] : null;
        if (!recipe) {
          return;
        }
        this.selectedRecipeId = recipe.id;
        this.renderOutputList();
        this.refreshSelectedRecipe();
      }, "onOutputSlotClick");
      this.onMakeButtonClick = /* @__PURE__ */ __name(() => {
        if (!this.selectedRecipeId) {
          this.showMessage("请选择配方");
          return;
        }
        const result = DataManager.getInstance().quickMakeToWarehouse(this.selectedRecipeId);
        this.showMessage(result.message);
        this.refreshRecipes();
      }, "onMakeButtonClick");
    }
    onAwake() {
      this.resolveBindings();
      this.bindMakeButton();
      this.refreshRecipes();
    }
    onEnable() {
      this.resolveBindings();
      this.bindMakeButton();
      this.refreshRecipes();
    }
    onDisable() {
      this.clearMessageTimers();
      this.unbindMakeButton();
    }
    onDestroy() {
      this.clearMessageTimers();
      this.unbindMakeButton();
    }
    refresh() {
      this.refreshRecipes();
    }
    refreshRecipes() {
      this.resolveBindings();
      this.recipes = this.resolveRecipes();
      if (!this.selectedRecipeId || !this.recipes.some((recipe) => recipe.id === this.selectedRecipeId)) {
        this.selectedRecipeId = this.recipes.length > 0 ? this.recipes[0].id : "";
      }
      this.renderOutputList();
      this.refreshSelectedRecipe();
    }
    renderOutputList() {
      if (!this.outputList) {
        return;
      }
      this.outputList.listKey = "make-output";
      this.outputList.onSlotClick = this.onOutputSlotClick;
      this.outputList.selectionEnabled = false;
      this.outputList.setSlotCount(this.recipes.length);
      this.outputList.setItems(this.recipes.map((recipe) => this.toListData(recipe.output)));
    }
    refreshSelectedRecipe() {
      const recipe = this.getSelectedRecipe();
      if (!recipe) {
        this.renderInputList([]);
        this.setMakeMaskVisible(true);
        return;
      }
      this.renderInputList(recipe.inputs.map((item) => this.toInputListData(item)));
      this.refreshMakeButtonState();
    }
    renderInputList(items) {
      if (!this.inputList) {
        return;
      }
      this.inputList.listKey = "make-input";
      this.inputList.onSlotClick = null;
      this.inputList.selectionEnabled = false;
      this.inputList.setSlotCount(items.length);
      this.inputList.setItems(items);
    }
    refreshMakeButtonState() {
      const canMake = this.selectedRecipeId ? DataManager.getInstance().canQuickMakeToWarehouse(this.selectedRecipeId) : false;
      this.setMakeMaskVisible(!canMake);
    }
    bindMakeButton() {
      const target = this.makeButtonNode;
      if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
        return;
      }
      target.mouseEnabled = true;
      target.off(Laya.Event.CLICK, this, this.onMakeButtonClick);
      target.on(Laya.Event.CLICK, this, this.onMakeButtonClick);
    }
    unbindMakeButton() {
      const target = this.makeButtonNode;
      if (target && typeof target.off === "function") {
        target.off(Laya.Event.CLICK, this, this.onMakeButtonClick);
      }
    }
    setMakeMaskVisible(visible) {
      const mask = this.makeButtonMaskNode;
      if (!mask) {
        return;
      }
      if ("visible" in mask) {
        mask.visible = visible;
      }
      if ("active" in mask) {
        mask.active = visible;
      }
      if ("mouseEnabled" in mask) {
        mask.mouseEnabled = false;
      }
    }
    showMessage(text) {
      if (this.messageTextNode) {
        this.messageFadeToken += 1;
        const token = this.messageFadeToken;
        this.messageTextNode.text = text;
        this.messageTextNode.alpha = 1;
        this.setNodeVisible(this.messageTextNode, !!text);
        Laya.timer.clear(this, this.fadeMessage);
        Laya.timer.clear(this, this.finishMessageFade);
        Laya.Tween.clearAll(this.messageTextNode);
        Laya.timer.once(1200, this, this.fadeMessage, [token]);
      }
    }
    clearMessageTimers() {
      Laya.timer.clear(this, this.fadeMessage);
      Laya.timer.clear(this, this.finishMessageFade);
      if (this.messageTextNode) {
        Laya.Tween.clearAll(this.messageTextNode);
      }
    }
    fadeMessage(token) {
      if (token !== this.messageFadeToken || !this.messageTextNode) {
        return;
      }
      Laya.Tween.clearAll(this.messageTextNode);
      Laya.Tween.to(
        this.messageTextNode,
        { alpha: 0 },
        450,
        void 0,
        Laya.Handler.create(this, this.finishMessageFade, [token])
      );
    }
    finishMessageFade(token) {
      if (token !== this.messageFadeToken || !this.messageTextNode) {
        return;
      }
      this.messageTextNode.text = "";
      this.messageTextNode.alpha = 1;
      this.setNodeVisible(this.messageTextNode, false);
    }
    resolveRecipes() {
      return DataManager.getInstance().getQuickMakeRecipes();
    }
    getSelectedRecipe() {
      return this.recipes.find((recipe) => recipe.id === this.selectedRecipeId) || null;
    }
    toListData(item) {
      return {
        itemId: item.itemId,
        name: item.name || item.itemId,
        count: Math.max(0, Math.floor(item.count || 0)),
        icon: item.icon
      };
    }
    toInputListData(item) {
      const required = Math.max(0, Math.floor(item.count || 0));
      const available = DataManager.getInstance().getAvailableItemCount(item.itemId);
      return {
        itemId: item.itemId,
        name: item.name || item.itemId,
        count: required,
        countText: `${available}/${required}`,
        icon: item.icon
      };
    }
    resolveBindings() {
      const root = this.owner;
      this.outputListNode = this.outputListNode || this.findChildByName(root, "outputlist");
      this.inputListNode = this.inputListNode || this.findChildByName(root, "inputlist");
      this.makeButtonNode = this.makeButtonNode || this.findChildByName(root, "makebutton");
      this.makeButtonMaskNode = this.makeButtonMaskNode || this.findChildByName(this.makeButtonNode, "mask");
      this.messageTextNode = this.messageTextNode || this.findChildByName(root, "messageText");
      this.outputList = this.resolveGlist(this.outputListNode, this.outputTemplateNode);
      this.inputList = this.resolveGlist(this.inputListNode, this.inputTemplateNode);
    }
    resolveGlist(node, templateNode) {
      if (!node) {
        return null;
      }
      let list = node.getComponent(glist);
      if (!list) {
        list = node.addComponent(glist);
      }
      list.listNode = node;
      if (templateNode) {
        list.templateNode = templateNode;
      }
      return list;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children || root._children || [];
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
  };
  __name(MakePanel, "MakePanel");
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "outputListNode", 2);
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "outputTemplateNode", 2);
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "inputListNode", 2);
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "inputTemplateNode", 2);
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "makeButtonNode", 2);
  __decorateClass([
    property19(Laya.Node)
  ], MakePanel.prototype, "makeButtonMaskNode", 2);
  __decorateClass([
    property19(Laya.Text)
  ], MakePanel.prototype, "messageTextNode", 2);
  MakePanel = __decorateClass([
    regClass21("e7a82e0d-ec39-4ac1-9518-f70baf987b54", "../src/PlayUI/Make/MakePanel.ts")
  ], MakePanel);

  // src/PlayUI/SideBar/SidebarNavigateButton.ts
  var { regClass: regClass22, property: property20 } = Laya;
  var SidebarNavigateButton = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.scene = "sidebar";
      this.boundOwner = null;
    }
    onAwake() {
      this.bindClickTarget();
    }
    onEnable() {
      this.bindClickTarget();
    }
    onDisable() {
      this.unbindClickTarget();
    }
    onDestroy() {
      this.unbindClickTarget();
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onButtonClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onButtonClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onButtonClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onButtonClick);
      }
      this.boundOwner = null;
    }
    onButtonClick() {
      const tt2 = globalThis.tt;
      if (!tt2 || typeof tt2.navigateToScene !== "function") {
        return;
      }
      const targetScene = String(this.scene || "").trim() || "sidebar";
      if (typeof tt2.checkScene === "function") {
        tt2.checkScene({
          scene: targetScene,
          success: /* @__PURE__ */ __name(() => {
            this.navigateToSidebar(tt2, targetScene);
          }, "success"),
          fail: /* @__PURE__ */ __name(() => {
          }, "fail")
        });
        return;
      }
      this.navigateToSidebar(tt2, targetScene);
    }
    navigateToSidebar(tt2, targetScene) {
      tt2.navigateToScene({
        scene: targetScene,
        success: /* @__PURE__ */ __name(() => {
        }, "success"),
        fail: /* @__PURE__ */ __name(() => {
        }, "fail"),
        complete: /* @__PURE__ */ __name(() => {
        }, "complete")
      });
    }
  };
  __name(SidebarNavigateButton, "SidebarNavigateButton");
  __decorateClass([
    property20(String)
  ], SidebarNavigateButton.prototype, "scene", 2);
  SidebarNavigateButton = __decorateClass([
    regClass22("7cc0db92-6e8d-4a9f-9d4f-8f1e3d0f4f21", "../src/PlayUI/SideBar/SidebarNavigateButton.ts")
  ], SidebarNavigateButton);

  // src/PlayUI/SignIn/SignInDayItem.ts
  var { regClass: regClass23, property: property21 } = Laya;
  var SignInDayItem = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.iconNode = null;
      this.nameTextNode = null;
      this.amountTextNode = null;
      this.claimedMaskNode = null;
      this.lockedMaskNode = null;
      this.dayButtonNode = null;
      this.data = null;
      this.bindingsResolved = false;
    }
    bind(data) {
      this.data = __spreadValues({}, data);
      this.resolveBindings();
      this.setImageSource(this.iconNode, data.icon || "");
      this.setText(this.nameTextNode, data.name);
      this.setText(this.amountTextNode, String(data.count));
      this.setButtonText(this.dayButtonNode, `第${data.day}天`);
      this.setNodeVisible(this.claimedMaskNode, data.state === "claimed");
      this.setNodeVisible(this.lockedMaskNode, data.state === "locked");
      const owner = this.owner;
      if (owner) {
        owner.mouseEnabled = data.state === "claimable";
        owner.alpha = data.state === "claimable" ? 1 : 0.92;
      }
    }
    getDay() {
      var _a;
      return ((_a = this.data) == null ? void 0 : _a.day) || 0;
    }
    getState() {
      var _a;
      return ((_a = this.data) == null ? void 0 : _a.state) || "locked";
    }
    resolveBindings() {
      if (this.bindingsResolved) {
        return;
      }
      const root = this.owner;
      this.iconNode = this.iconNode || this.findChildByName(root, "icon");
      this.nameTextNode = this.nameTextNode || this.findChildByName(root, "name");
      this.amountTextNode = this.amountTextNode || this.findChildByName(root, "amount");
      this.claimedMaskNode = this.claimedMaskNode || this.findChildByName(root, "mask_1");
      this.lockedMaskNode = this.lockedMaskNode || this.findChildByName(root, "mask_0");
      this.dayButtonNode = this.dayButtonNode || this.findChildByName(root, "bt");
      this.bindingsResolved = true;
    }
    setImageSource(node, path) {
      const target = node;
      if (!target) {
        return;
      }
      const resolved = this.resolveIconPath(path);
      if ("visible" in target) {
        target.visible = !!resolved;
      }
      if ("skin" in target) {
        target.skin = resolved;
      }
      if ("src" in target) {
        target.src = resolved;
      }
      if ("width" in target) {
        target.width = 72;
      }
      if ("height" in target) {
        target.height = 72;
      }
    }
    setText(node, text) {
      const target = node;
      if (target && "text" in target) {
        target.text = text;
      }
    }
    setButtonText(node, text) {
      const textNode = this.findFirstTextNode(node);
      this.setText(textNode, text);
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    resolveIconPath(iconPath) {
      const raw = String(iconPath || "").trim();
      if (!raw) {
        return "";
      }
      const normalized = raw.replace(/^assets\//, "");
      const url = Laya.URL;
      if (url && typeof url.formatURL === "function") {
        return String(url.formatURL(normalized) || normalized);
      }
      return normalized;
    }
    findFirstTextNode(root) {
      if (!root) {
        return null;
      }
      if (root.text !== void 0) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findFirstTextNode(children[i]);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(SignInDayItem, "SignInDayItem");
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "iconNode", 2);
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "nameTextNode", 2);
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "amountTextNode", 2);
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "claimedMaskNode", 2);
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "lockedMaskNode", 2);
  __decorateClass([
    property21(Laya.Node)
  ], SignInDayItem.prototype, "dayButtonNode", 2);
  SignInDayItem = __decorateClass([
    regClass23("253fef41-3bfb-4528-b0e7-2709ee13721f", "../src/PlayUI/SignIn/SignInDayItem.ts")
  ], SignInDayItem);

  // src/PlayUI/SignIn/SignInPanel.ts
  var { regClass: regClass24, property: property22 } = Laya;
  var SignInPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.listNode = null;
      this.templateNode = null;
      this.dayCount = 31;
      this.rewards = [];
      this.refreshToken = 0;
    }
    onAwake() {
      this.resolveBindings();
      this.refresh();
    }
    onEnable() {
      this.resolveBindings();
      this.refresh();
    }
    refresh() {
      void this.refreshAsync();
    }
    refreshAsync() {
      return __async(this, null, function* () {
        const token = ++this.refreshToken;
        yield DataManager.getInstance().syncSignInTimeSource();
        if (token !== this.refreshToken) {
          return;
        }
        const list = this.listNode;
        if (!list) {
          return;
        }
        this.rewards = DataManager.getInstance().getSignInRewards();
        const count = Math.max(0, Math.floor(this.dayCount || this.rewards.length));
        if ("itemRenderer" in list) {
          list.itemRenderer = (index, item) => {
            this.renderItem(index, item);
          };
        }
        if ("numItems" in list) {
          list.numItems = count;
        }
        if (typeof list.refresh === "function") {
          list.refresh(true);
        }
        Laya.timer.callLater(this, this.bindVisibleItems);
      });
    }
    renderItem(index, slotNode) {
      const reward = this.rewards[index] || null;
      if (!slotNode || !reward) {
        this.setNodeVisible(slotNode, false);
        return;
      }
      this.setNodeVisible(slotNode, true);
      let item = slotNode.getComponent(SignInDayItem);
      if (!item) {
        item = slotNode.addComponent(SignInDayItem);
      }
      item.bind(reward);
      this.bindItemClick(slotNode);
    }
    bindVisibleItems() {
      const list = this.listNode;
      const children = list && Array.isArray(list.children) ? list.children : [];
      if (!children.length) {
        return;
      }
      const template = this.templateNode;
      let dataIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const slotNode = children[i];
        if (!slotNode || slotNode === template) {
          continue;
        }
        this.renderItem(dataIndex, slotNode);
        dataIndex++;
      }
    }
    bindItemClick(slotNode) {
      const target = slotNode;
      if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
        return;
      }
      target.off(Laya.Event.CLICK, this, this.onItemClick);
      target.on(Laya.Event.CLICK, this, this.onItemClick, [slotNode]);
    }
    onItemClick(slotNode) {
      return __async(this, null, function* () {
        const item = slotNode.getComponent(SignInDayItem);
        if (!item || item.getState() !== "claimable") {
          return;
        }
        yield DataManager.getInstance().syncSignInTimeSource();
        if (DataManager.getInstance().claimSignInReward(item.getDay())) {
          this.refresh();
        }
      });
    }
    resolveBindings() {
      const root = this.owner;
      this.listNode = this.listNode || this.findChildByName(root, "list");
      if (!this.templateNode && this.listNode) {
        const children = this.listNode.children;
        this.templateNode = children && children.length > 0 ? children[0] : null;
      }
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(SignInPanel, "SignInPanel");
  __decorateClass([
    property22(Laya.Node)
  ], SignInPanel.prototype, "listNode", 2);
  __decorateClass([
    property22(Laya.Node)
  ], SignInPanel.prototype, "templateNode", 2);
  __decorateClass([
    property22(Number)
  ], SignInPanel.prototype, "dayCount", 2);
  SignInPanel = __decorateClass([
    regClass24("3e222049-733b-4ee2-a4d1-0a3ded8326da", "../src/PlayUI/SignIn/SignInPanel.ts")
  ], SignInPanel);

  // src/PlayUI/Warehouse/WarehousePanel.ts
  var { regClass: regClass25, property: property23 } = Laya;
  var WarehousePanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.bagGlistNode = null;
      this.warehouseGlistNode = null;
      this.warehousePageButton1 = null;
      this.warehousePageButton2 = null;
      this.warehousePageButton3 = null;
      this.warehousePageButton4 = null;
      this.warehousePageButton5 = null;
      this.warehousePageButton6 = null;
      this.warehousePageButton7 = null;
      this.detailNode = null;
      this.detailTextNode = null;
      this.bagGlist = null;
      this.warehouseGlist = null;
      this.warehousePageButtons = [];
      this.warehousePageOpenStates = [true, false, false, false, false, false, false];
      this.currentWarehousePage = 0;
      this.selectedSlot = null;
      this.handleBagSlotClick = /* @__PURE__ */ __name((item, listKey, slotIndex) => {
        this.hideWarehouseDetail();
        this.handleSlotClick("active", item, listKey, slotIndex);
      }, "handleBagSlotClick");
      this.handleWarehouseSlotClick = /* @__PURE__ */ __name((item, listKey, slotIndex) => {
        this.showWarehouseDetail(item);
        this.handleSlotClick("warehouse", item, listKey, slotIndex);
      }, "handleWarehouseSlotClick");
    }
    onAwake() {
      this.bindControllers();
      this.resolveDetailBindings();
      this.hideWarehouseDetail();
      this.resetWarehousePageState();
      this.bindPageButtons();
      DataManager.getInstance().registerBagView(this);
      DataManager.getInstance().registerWarehouseView(this);
      this.refresh();
    }
    onEnable() {
      this.bindControllers();
      this.resolveDetailBindings();
      this.hideWarehouseDetail();
      this.resetWarehousePageState();
      this.bindPageButtons();
      DataManager.getInstance().registerBagView(this);
      DataManager.getInstance().registerWarehouseView(this);
      this.refresh();
    }
    onDisable() {
      DataManager.getInstance().unregisterBagView(this);
      DataManager.getInstance().unregisterWarehouseView(this);
      this.unbindPageButtons();
      this.clearSelection();
      this.hideWarehouseDetail();
    }
    onDestroy() {
      DataManager.getInstance().unregisterBagView(this);
      DataManager.getInstance().unregisterWarehouseView(this);
      this.unbindPageButtons();
      this.hideWarehouseDetail();
    }
    setItems(items) {
      this.bindControllers();
      this.bindBagList(items);
    }
    refresh() {
      this.bindControllers();
      this.bindPageButtons();
      this.bindWarehouseList();
      this.applySelectionState();
    }
    onPanelOpened() {
      this.resetWarehousePageState();
      this.refresh();
    }
    bindControllers() {
      this.bagGlist = this.bagGlistNode ? this.bagGlistNode.getComponent(glist) : null;
      this.warehouseGlist = this.warehouseGlistNode ? this.warehouseGlistNode.getComponent(glist) : null;
    }
    bindBagList(items) {
      if (!this.bagGlist) {
        return;
      }
      this.bagGlist.listKey = "bag";
      this.bagGlist.onSlotClick = this.handleBagSlotClick;
      this.bagGlist.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
      this.bagGlist.setItems(this.toListData(items));
      this.bagGlist.setSelectedSlotIndex(this.getSelectedSlotIndex("active"));
    }
    bindWarehouseList() {
      if (!this.warehouseGlist) {
        return;
      }
      const pageCount = this.getWarehousePageCount();
      this.currentWarehousePage = this.clampWarehousePage(this.currentWarehousePage, pageCount);
      this.warehouseGlist.listKey = "warehouse";
      this.warehouseGlist.onSlotClick = this.handleWarehouseSlotClick;
      this.warehouseGlist.setSlotCount(WarehouseManager.PAGE_SIZE);
      this.warehouseGlist.setItems(this.toWarehousePageData(DataManager.getInstance().getWarehouseSnapshot()));
      this.warehouseGlist.setSelectedSlotIndex(this.getWarehousePageSelectedSlotIndex());
      this.updateWarehousePageButtonState();
    }
    handleSlotClick(sourceBucket, item, listKey, slotIndex) {
      const itemId = item && item.itemId ? String(item.itemId) : "";
      const targetBucket = listKey === "warehouse" ? "warehouse" : "active";
      const targetSlotIndex = targetBucket === "warehouse" ? this.toWarehouseSlotIndex(slotIndex) : Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
      if (!this.selectedSlot) {
        if (itemId) {
          this.setSelection(sourceBucket, itemId, targetSlotIndex);
        }
        return;
      }
      if (this.selectedSlot.bucket === targetBucket && this.selectedSlot.slotIndex === targetSlotIndex) {
        this.clearSelection();
        return;
      }
      if (this.selectedSlot.bucket === targetBucket) {
        const moved = targetBucket === "warehouse" ? DataManager.getInstance().moveWarehouseSlot(this.selectedSlot.slotIndex, targetSlotIndex) : DataManager.getInstance().moveActiveInventorySlot(this.selectedSlot.slotIndex, targetSlotIndex);
        this.clearSelection();
        if (moved) {
          this.refresh();
        }
        return;
      }
      if (!itemId) {
        if (this.selectedSlot.bucket !== targetBucket && DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId, targetSlotIndex)) {
          this.clearSelection();
          this.refresh();
          return;
        }
        this.clearSelection();
        return;
      }
      if (DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId, targetSlotIndex)) {
        this.clearSelection();
        this.refresh();
        return;
      }
      this.clearSelection();
    }
    setSelection(bucket, itemId, slotIndex) {
      this.selectedSlot = { bucket, itemId, slotIndex };
      this.applySelectionState();
    }
    clearSelection() {
      this.selectedSlot = null;
      this.applySelectionState();
    }
    applySelectionState() {
      if (this.bagGlist) {
        this.bagGlist.setSelectedSlotIndex(this.getSelectedSlotIndex("active"));
      }
      if (this.warehouseGlist) {
        this.warehouseGlist.setSelectedSlotIndex(this.getWarehousePageSelectedSlotIndex());
      }
      this.updateWarehousePageButtonState();
    }
    showWarehouseDetail(item) {
      this.resolveDetailBindings();
      if (!(item == null ? void 0 : item.itemId)) {
        this.hideWarehouseDetail();
        return;
      }
      if (this.detailTextNode && "text" in this.detailTextNode) {
        this.detailTextNode.text = listTemplate.formatItemDetailText(item);
      }
      if (this.detailTextNode && "visible" in this.detailTextNode) {
        this.detailTextNode.visible = true;
      }
      if (this.detailNode && "visible" in this.detailNode) {
        this.detailNode.visible = true;
      }
      if (this.detailNode && "zOrder" in this.detailNode) {
        this.detailNode.zOrder = 1e3;
      }
    }
    hideWarehouseDetail() {
      this.resolveDetailBindings();
      if (this.detailNode && "visible" in this.detailNode) {
        this.detailNode.visible = false;
      }
      if (this.detailTextNode && "visible" in this.detailTextNode) {
        this.detailTextNode.visible = false;
      }
    }
    getSelectedSlotIndex(bucket) {
      return this.selectedSlot && this.selectedSlot.bucket === bucket ? this.selectedSlot.slotIndex : -1;
    }
    getWarehousePageSelectedSlotIndex() {
      const selectedIndex = this.getSelectedSlotIndex("warehouse");
      if (selectedIndex < 0) {
        return -1;
      }
      const pageStart = this.currentWarehousePage * WarehouseManager.PAGE_SIZE;
      const pageEnd = pageStart + WarehouseManager.PAGE_SIZE;
      return selectedIndex >= pageStart && selectedIndex < pageEnd ? selectedIndex - pageStart : -1;
    }
    toListData(items) {
      return (Array.isArray(items) ? items : []).map(
        (item) => item ? {
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        } : null
      );
    }
    toWarehousePageData(items) {
      const startIndex = this.currentWarehousePage * WarehouseManager.PAGE_SIZE;
      const pageItems = Array.isArray(items) ? items.slice(startIndex, startIndex + WarehouseManager.PAGE_SIZE) : [];
      return this.toListData(pageItems);
    }
    toWarehouseSlotIndex(slotIndex) {
      if (!Number.isFinite(slotIndex)) {
        return -1;
      }
      return this.currentWarehousePage * WarehouseManager.PAGE_SIZE + Math.floor(slotIndex);
    }
    getWarehousePageCount() {
      return WarehouseManager.PAGE_COUNT;
    }
    clampWarehousePage(pageIndex, pageCount = this.getWarehousePageCount()) {
      const maxPage = Math.max(0, Math.floor(pageCount) - 1);
      if (!Number.isFinite(pageIndex)) {
        return 0;
      }
      return Math.min(maxPage, Math.max(0, Math.floor(pageIndex)));
    }
    bindPageButtons() {
      this.resolvePageButtonBindings();
      const nextButtons = [
        this.warehousePageButton1,
        this.warehousePageButton2,
        this.warehousePageButton3,
        this.warehousePageButton4,
        this.warehousePageButton5,
        this.warehousePageButton6,
        this.warehousePageButton7
      ];
      this.unbindPageButtons();
      this.warehousePageButtons = nextButtons;
      for (let i = 0; i < this.warehousePageButtons.length; i++) {
        const button = this.warehousePageButtons[i];
        if (!button || typeof button.on !== "function" || typeof button.off !== "function") {
          continue;
        }
        button.off(Laya.Event.CLICK, this, this.onWarehousePageButtonClick);
        button.on(Laya.Event.CLICK, this, this.onWarehousePageButtonClick, [i]);
      }
      this.updateWarehousePageButtonState();
    }
    unbindPageButtons() {
      for (let i = 0; i < this.warehousePageButtons.length; i++) {
        const button = this.warehousePageButtons[i];
        if (button && typeof button.off === "function") {
          button.off(Laya.Event.CLICK, this, this.onWarehousePageButtonClick);
        }
      }
      this.warehousePageButtons = [];
    }
    onWarehousePageButtonClick(pageIndex) {
      const nextPage = this.clampWarehousePage(pageIndex);
      const previousPage = this.clampWarehousePage(this.currentWarehousePage);
      this.closeWarehousePage(previousPage);
      this.openWarehousePage(nextPage);
      this.applyWarehousePageButtonMasks();
      if (previousPage === nextPage) {
        return;
      }
      this.currentWarehousePage = nextPage;
      this.hideWarehouseDetail();
      this.bindWarehouseList();
      this.applySelectionState();
    }
    updateWarehousePageButtonState() {
      for (let i = 0; i < this.warehousePageButtons.length; i++) {
        const button = this.warehousePageButtons[i];
        if (!button) {
          continue;
        }
        if ("alpha" in button) {
          button.alpha = 1;
        }
        if ("mouseEnabled" in button) {
          button.mouseEnabled = true;
        }
      }
      this.applyWarehousePageButtonMasks();
    }
    resetWarehousePageState() {
      this.currentWarehousePage = 0;
      this.warehousePageOpenStates = [true, false, false, false, false, false, false];
      this.applyWarehousePageButtonMasks();
    }
    closeWarehousePage(pageIndex) {
      if (pageIndex >= 0 && pageIndex < this.warehousePageOpenStates.length) {
        this.warehousePageOpenStates[pageIndex] = false;
      }
    }
    openWarehousePage(pageIndex) {
      if (pageIndex >= 0 && pageIndex < this.warehousePageOpenStates.length) {
        this.warehousePageOpenStates[pageIndex] = true;
      }
    }
    applyWarehousePageButtonMasks() {
      for (let i = 0; i < this.warehousePageButtons.length; i++) {
        const mask = this.findChildByName(this.warehousePageButtons[i], "mask");
        if (!mask || !("visible" in mask)) {
          continue;
        }
        mask.visible = !this.warehousePageOpenStates[i];
      }
    }
    resolveDetailBindings() {
      const root = this.owner;
      if (!this.detailNode) {
        const warehouseRoot = this.findChildByName(root, "warehouse_list");
        this.detailNode = this.findDirectChildByName(warehouseRoot, "detail") || this.findChildByName(warehouseRoot, "detail");
      }
      if (!this.detailTextNode && this.detailNode) {
        this.detailTextNode = this.findFirstTextChild(this.detailNode);
      }
    }
    resolvePageButtonBindings() {
      const root = this.owner;
      const buttonContainer = this.findChildByName(root, "button");
      if (!buttonContainer) {
        return;
      }
      this.warehousePageButton1 = this.warehousePageButton1 || this.findDirectChildByName(buttonContainer, "1");
      this.warehousePageButton2 = this.warehousePageButton2 || this.findDirectChildByName(buttonContainer, "2");
      this.warehousePageButton3 = this.warehousePageButton3 || this.findDirectChildByName(buttonContainer, "3");
      this.warehousePageButton4 = this.warehousePageButton4 || this.findDirectChildByName(buttonContainer, "4");
      this.warehousePageButton5 = this.warehousePageButton5 || this.findDirectChildByName(buttonContainer, "5");
      this.warehousePageButton6 = this.warehousePageButton6 || this.findDirectChildByName(buttonContainer, "6");
      this.warehousePageButton7 = this.warehousePageButton7 || this.findDirectChildByName(buttonContainer, "7");
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findFirstTextChild(root) {
      if (!root) {
        return null;
      }
      const node = root;
      if ("text" in node) {
        return root;
      }
      const children = node.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findFirstTextChild(children[i]);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findDirectChildByName(root, name) {
      const children = root && Array.isArray(root.children) ? root.children : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && child.name === name) {
          return child;
        }
      }
      return null;
    }
  };
  __name(WarehousePanel, "WarehousePanel");
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "bagGlistNode", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehouseGlistNode", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton1", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton2", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton3", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton4", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton5", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton6", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "warehousePageButton7", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "detailNode", 2);
  __decorateClass([
    property23(Laya.Node)
  ], WarehousePanel.prototype, "detailTextNode", 2);
  WarehousePanel = __decorateClass([
    regClass25("2d7d1f64-9d2a-4b5c-a2ed-3e6a1e0f4cf0", "../src/PlayUI/Warehouse/WarehousePanel.ts")
  ], WarehousePanel);

  // src/PlayUI/playerui/QuickEquipContainer.ts
  var { regClass: regClass26, property: property24 } = Laya;
  var QuickEquipContainer = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.quickSlot1 = null;
      this.quickSlot2 = null;
      this.quickSlot3 = null;
      this.quickSlot4 = null;
      this.weaponSlot = null;
      this.plateSlot = null;
      this.armorSlot = null;
      this.quickSlotItems = [];
    }
    onAwake() {
      this.resolveQuickSlotsByName();
      this.initializeQuickSlotIconSizes();
      this.bindQuickSlotClicks();
      DataManager.getInstance().registerQuickSlotView(this);
      Laya.timer.callLater(this, this.renderQuickSlots);
    }
    onEnable() {
      this.resolveQuickSlotsByName();
      this.initializeQuickSlotIconSizes();
      this.bindQuickSlotClicks();
      DataManager.getInstance().registerQuickSlotView(this);
      this.renderQuickSlots();
      Laya.timer.callLater(this, this.renderQuickSlots);
    }
    onDisable() {
      DataManager.getInstance().unregisterQuickSlotView(this);
    }
    onDestroy() {
      DataManager.getInstance().unregisterQuickSlotView(this);
    }
    refreshQuickSlots(items) {
      this.quickSlotItems = Array.isArray(items) ? items.map((item) => item ? __spreadValues({}, item) : null) : [];
      this.resolveQuickSlotsByName();
      this.bindQuickSlotClicks();
      this.renderQuickSlots();
    }
    setVisible(visible) {
      this.setNodeVisible(this.quickSlot1, visible);
      this.setNodeVisible(this.quickSlot2, visible);
      this.setNodeVisible(this.quickSlot3, visible);
      this.setNodeVisible(this.quickSlot4, visible);
      this.setNodeVisible(this.weaponSlot, visible);
      this.setNodeVisible(this.plateSlot, visible);
      this.setNodeVisible(this.armorSlot, visible);
    }
    getQuickSlots() {
      return [this.quickSlot1, this.quickSlot2, this.quickSlot3, this.quickSlot4];
    }
    getEquipSlots() {
      return [this.weaponSlot, this.plateSlot, this.armorSlot];
    }
    renderQuickSlots() {
      const slots = this.getQuickSlots();
      for (let i = 0; i < slots.length; i++) {
        const node = slots[i];
        if (!node) {
          continue;
        }
        let template = node.getComponent(listTemplate);
        if (!template) {
          template = node.addComponent(listTemplate);
        }
        const item = this.quickSlotItems[i] || null;
        template.bindData(item ? {
          itemId: item.itemId,
          name: item.name,
          count: item.count,
          icon: item.icon
        } : null);
        this.applySlotIconSize(node);
      }
    }
    bindQuickSlotClicks() {
      const slots = this.getQuickSlots();
      for (let i = 0; i < slots.length; i++) {
        const node = slots[i];
        if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
          continue;
        }
        node.mouseEnabled = true;
        node.off(Laya.Event.CLICK, this, this.onQuickSlotClick);
        node.on(Laya.Event.CLICK, this, this.onQuickSlotClick, [i]);
      }
    }
    onQuickSlotClick(quickSlotIndex, event) {
      var _a, _b;
      if (event && typeof event.stopPropagation === "function") {
        event.stopPropagation();
      }
      const result = DataManager.getInstance().activateQuickSlot(quickSlotIndex);
      if (!result.success) {
        return;
      }
      if (result.usedItem) {
        const stats = DataManager.getInstance().getPlayerStats();
        (_a = PlayerController.activeInstance) == null ? void 0 : _a.setHp(stats.currentHp, stats.maxHp);
      }
      if (result.switchedWeapon) {
        (_b = PlayerController.activeInstance) == null ? void 0 : _b.refreshEquipmentFromData();
        Laya.timer.callLater(this, () => {
          var _a2;
          (_a2 = PlayerController.activeInstance) == null ? void 0 : _a2.refreshEquipmentFromData();
        });
      }
    }
    resolveQuickSlotsByName() {
      if (!this.quickSlot1) {
        this.quickSlot1 = this.findDirectChildByName("1");
      }
      if (!this.quickSlot2) {
        this.quickSlot2 = this.findDirectChildByName("2");
      }
      if (!this.quickSlot3) {
        this.quickSlot3 = this.findDirectChildByName("3");
      }
      if (!this.quickSlot4) {
        this.quickSlot4 = this.findDirectChildByName("4");
      }
    }
    findDirectChildByName(name) {
      var _a;
      const children = (_a = this.owner) == null ? void 0 : _a.children;
      if (!children) {
        return null;
      }
      for (const child of children) {
        if (String((child == null ? void 0 : child.name) || "") === name) {
          return child;
        }
      }
      return null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    initializeQuickSlotIconSizes() {
      const slots = this.getQuickSlots();
      for (let i = 0; i < slots.length; i++) {
        this.applySlotIconSize(slots[i]);
      }
      Laya.timer.callLater(this, () => {
        this.resolveQuickSlotsByName();
        const delayedSlots = this.getQuickSlots();
        for (let i = 0; i < delayedSlots.length; i++) {
          this.applySlotIconSize(delayedSlots[i]);
        }
      });
    }
    applySlotIconSize(slotNode) {
      const icon = slotNode ? this.findChildByName(slotNode, "icon") : null;
      if (!icon) {
        return;
      }
      if ("width" in icon) {
        icon.width = 55;
      }
      if ("height" in icon) {
        icon.height = 55;
      }
      if ("autoSize" in icon) {
        icon.autoSize = false;
      }
      if ("scaleX" in icon) {
        icon.scaleX = 1;
      }
      if ("scaleY" in icon) {
        icon.scaleY = 1;
      }
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (String(root.name || "") === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
  };
  __name(QuickEquipContainer, "QuickEquipContainer");
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "quickSlot1", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "quickSlot2", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "quickSlot3", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "quickSlot4", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "weaponSlot", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "plateSlot", 2);
  __decorateClass([
    property24(Laya.Node)
  ], QuickEquipContainer.prototype, "armorSlot", 2);
  QuickEquipContainer = __decorateClass([
    regClass26("c50e856c-df34-4d80-9452-b4fbbf5a3425", "../src/PlayUI/playerui/QuickEquipContainer.ts")
  ], QuickEquipContainer);

  // src/PlayUI/playerui/attack.ts
  var { regClass: regClass27, property: property25 } = Laya;
  var attack = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.playerNode = null;
      this.attackBase = null;
      this.attackHandle = null;
      this.weaponIconNode = null;
      this.radius = 48;
      this.dragThreshold = 16;
      this.tapMaxDistance = 14;
      this.meleeAutoAttackEnabled = true;
      this.rangedChargeStartAngle = 60;
      this.rangedChargeEndAngle = 20;
      this.rangedChargeVisualDuration = 1e3;
      this.rangedChargeSegments = 18;
      this.rangedChargeFillColor = "#000000";
      this.rangedChargeLineColor = "#000000";
      this.boundTarget = null;
      this.handleStartX = 0;
      this.handleStartY = 0;
      this.centerX = 0;
      this.centerY = 0;
      this.pressing = false;
      this.dragging = false;
      this.activePointerId = -1;
      this.pointerStartX = 0;
      this.pointerStartY = 0;
      this.maxDragDistance = 0;
      this.lastAimX = 0;
      this.lastAimY = 0;
      this.lastDragRatio = 0;
      this.pressStartedAt = 0;
      this.autoAttackStarted = false;
      this.rangedChargeVisible = false;
      this.rangedIndicatorNode = null;
      this.defaultIconSrc = "";
      this.lastWeaponIconSignature = "__init";
    }
    onAwake() {
      this.resolveParts();
      this.captureDefaultIconSrc();
      this.refreshWeaponIcon(true);
      this.captureLayout();
      this.bindInputTarget();
    }
    onEnable() {
      this.resolveParts();
      this.captureDefaultIconSrc();
      this.refreshWeaponIcon(true);
      this.captureLayout();
      this.bindInputTarget();
    }
    onUpdate() {
      this.refreshWeaponIcon();
      this.updateRangedChargeIndicator();
    }
    onDisable() {
      this.stopInput();
      this.unbindInputTarget();
    }
    onDestroy() {
      this.stopInput();
      this.unbindInputTarget();
    }
    bindInputTarget() {
      this.unbindInputTarget();
      const target = this.attackBase || this.owner;
      if (!target) {
        return;
      }
      this.boundTarget = target;
      target.mouseEnabled = true;
      if ("mouseThrough" in target) {
        target.mouseThrough = false;
      }
      target.on("mousedown", this, this.onPointerDown);
      target.on("touchstart", this, this.onPointerDown);
    }
    unbindInputTarget() {
      if (!this.boundTarget) {
        return;
      }
      this.boundTarget.offAllCaller(this);
      this.boundTarget = null;
    }
    onPointerDown(e) {
      this.resolveParts();
      this.captureLayout();
      this.pressing = true;
      this.dragging = false;
      this.maxDragDistance = 0;
      this.lastAimX = 0;
      this.lastAimY = 0;
      this.lastDragRatio = 0;
      this.pressStartedAt = Date.now();
      this.autoAttackStarted = false;
      this.activePointerId = this.getPointerId(e);
      const pointer = this.getStagePointer();
      this.pointerStartX = pointer.x;
      this.pointerStartY = pointer.y;
      Laya.stage.on("mousemove", this, this.onPointerMove);
      Laya.stage.on("mouseup", this, this.onPointerUp);
      Laya.stage.on("mouseout", this, this.onPointerUp);
      Laya.stage.on("touchmove", this, this.onPointerMove);
      Laya.stage.on("touchend", this, this.onPointerUp);
    }
    onPointerMove(e) {
      if (!this.pressing || !this.attackBase || !this.attackHandle) {
        return;
      }
      const pointerId = this.getPointerId(e);
      if (this.activePointerId !== -1 && pointerId !== -1 && pointerId !== this.activePointerId) {
        return;
      }
      const offset = this.resolveClampedOffset();
      const pointer = this.getStagePointer();
      const dragX = pointer.x - this.pointerStartX;
      const dragY = pointer.y - this.pointerStartY;
      const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
      this.maxDragDistance = Math.max(this.maxDragDistance, dragDistance);
      this.attackHandle.pos(this.handleStartX + offset.x, this.handleStartY + offset.y);
      this.lastAimX = offset.x;
      this.lastAimY = offset.y;
      this.lastDragRatio = Math.max(0, Math.min(1, Math.sqrt(offset.x * offset.x + offset.y * offset.y) / Math.max(1, this.radius || 1)));
      if (dragDistance < this.dragThreshold) {
        return;
      }
      this.dragging = true;
      const controller = this.resolvePlayerController();
      if (!controller) {
        return;
      }
      controller.setAttackFacingByDirection(offset.x, offset.y);
      if (!controller.isEquippedRangedWeapon() && this.meleeAutoAttackEnabled) {
        this.ensureMeleeAutoAttack(controller);
      } else if (controller.isEquippedRangedWeapon()) {
        controller.setRangedWeaponAimByDirection(offset.x, offset.y);
        this.showRangedChargeIndicator(controller, offset.x, offset.y);
      }
    }
    onPointerUp(e) {
      const pointerId = this.getPointerId(e);
      if (this.activePointerId !== -1 && pointerId !== -1 && pointerId !== this.activePointerId) {
        return;
      }
      const controller = this.resolvePlayerController();
      const shouldTapAttack = !this.dragging || this.maxDragDistance <= this.tapMaxDistance;
      const shouldReleaseRangedAttack = !!controller && this.dragging && controller.isEquippedRangedWeapon();
      const rangedAttackOptions = controller && shouldReleaseRangedAttack ? {
        chargeRatio: controller.resolveRangedChargeRatio(Date.now() - this.pressStartedAt, this.lastDragRatio),
        directionX: this.lastAimX,
        directionY: this.lastAimY,
        spreadAngle: this.resolveRangedChargeConeAngle()
      } : void 0;
      this.stopInput();
      if (controller && shouldReleaseRangedAttack && rangedAttackOptions) {
        controller.setRangedWeaponAimByDirection(rangedAttackOptions.directionX, rangedAttackOptions.directionY);
        controller.playAttack(false, rangedAttackOptions);
        Laya.timer.once(Math.max(80, (controller.rangedAttackHitDelay || 0) + 50), controller, controller.clearRangedWeaponAim);
      } else if (controller && shouldTapAttack) {
        controller.playAttack();
      }
      controller == null ? void 0 : controller.clearAttackFacingOverride();
    }
    ensureMeleeAutoAttack(controller) {
      if (this.autoAttackStarted) {
        return;
      }
      this.autoAttackStarted = true;
      controller.playAttack(true);
      Laya.timer.loop(this.resolveAutoAttackInterval(controller), this, this.onAutoAttackTick);
    }
    onAutoAttackTick() {
      if (!this.pressing || !this.dragging) {
        return;
      }
      const controller = this.resolvePlayerController();
      if (!controller || controller.isEquippedRangedWeapon()) {
        return;
      }
      controller.playAttack(true);
    }
    stopInput() {
      const wasPressing = this.pressing;
      this.pressing = false;
      this.dragging = false;
      this.activePointerId = -1;
      this.lastAimX = 0;
      this.lastAimY = 0;
      this.lastDragRatio = 0;
      this.pressStartedAt = 0;
      this.autoAttackStarted = false;
      Laya.timer.clear(this, this.onAutoAttackTick);
      Laya.stage.off("mousemove", this, this.onPointerMove);
      Laya.stage.off("mouseup", this, this.onPointerUp);
      Laya.stage.off("mouseout", this, this.onPointerUp);
      Laya.stage.off("touchmove", this, this.onPointerMove);
      Laya.stage.off("touchend", this, this.onPointerUp);
      this.resetHandle();
      this.hideRangedChargeIndicator();
      if (wasPressing) {
        const controller = this.resolvePlayerController();
        controller == null ? void 0 : controller.clearQueuedAttack();
        controller == null ? void 0 : controller.clearAttackFacingOverride();
        controller == null ? void 0 : controller.clearRangedWeaponAim();
      }
    }
    resetHandle() {
      if (!this.attackHandle) {
        return;
      }
      this.attackHandle.pos(this.handleStartX, this.handleStartY);
    }
    resolveAutoAttackInterval(controller) {
      const attackSpeed = Math.max(0.1, controller.attackSpeed || 1);
      return Math.max(80, Math.floor((controller.attackCooldown || 300) / attackSpeed));
    }
    showRangedChargeIndicator(controller, aimX, aimY) {
      const indicator = this.resolveRangedIndicator(controller);
      if (!indicator) {
        return;
      }
      this.rangedChargeVisible = true;
      indicator.visible = true;
      if ("active" in indicator) {
        indicator.active = true;
      }
      this.drawRangedChargeIndicator(controller, aimX, aimY);
    }
    updateRangedChargeIndicator() {
      if (!this.rangedChargeVisible || !this.pressing || !this.dragging) {
        return;
      }
      const controller = this.resolvePlayerController();
      if (!controller || !controller.isEquippedRangedWeapon()) {
        this.hideRangedChargeIndicator();
        return;
      }
      this.drawRangedChargeIndicator(controller, this.lastAimX, this.lastAimY);
    }
    hideRangedChargeIndicator() {
      var _a;
      this.rangedChargeVisible = false;
      const indicator = this.rangedIndicatorNode;
      if (!indicator) {
        return;
      }
      indicator.visible = false;
      (_a = indicator.graphics) == null ? void 0 : _a.clear();
      if ("active" in indicator) {
        indicator.active = false;
      }
    }
    drawRangedChargeIndicator(controller, aimX, aimY) {
      const indicator = this.resolveRangedIndicator(controller);
      if (!indicator || !indicator.graphics) {
        return;
      }
      const range = Math.max(1, Number(controller.rangedAttackRange) || 1);
      const coneAngle = this.resolveRangedChargeConeAngle();
      const direction = this.resolveAimAngle(aimX, aimY, controller, indicator);
      const half = coneAngle * 0.5;
      const segments = Math.max(2, Math.floor(this.rangedChargeSegments || 18));
      const points = [0, 0];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const degrees = direction - half + coneAngle * t;
        const radians = degrees * Math.PI / 180;
        points.push(Math.cos(radians) * range, Math.sin(radians) * range);
      }
      indicator.graphics.clear();
      indicator.graphics.drawPoly(0, 0, points, this.rangedChargeFillColor, this.rangedChargeLineColor, 1);
    }
    resolveRangedChargeConeAngle() {
      const elapsed = Math.max(0, Date.now() - this.pressStartedAt);
      const duration = Math.max(1, Number(this.rangedChargeVisualDuration) || 1);
      const ratio = Math.max(0, Math.min(1, elapsed / duration));
      const startAngle = Number(this.rangedChargeStartAngle) || 60;
      const endAngle = Number(this.rangedChargeEndAngle) || 20;
      return startAngle + (endAngle - startAngle) * ratio;
    }
    resolveAimAngle(aimX, aimY, controller, indicator) {
      const scaleSign = this.resolveWorldScaleSign(indicator);
      const localAimX = scaleSign.x < 0 ? -aimX : aimX;
      const localAimY = scaleSign.y < 0 ? -aimY : aimY;
      const localFacing = scaleSign.x < 0 ? -controller.movement.getAttackDirection() : controller.movement.getAttackDirection();
      const magnitude = Math.sqrt(localAimX * localAimX + localAimY * localAimY);
      if (magnitude > 1e-4) {
        return Math.atan2(localAimY, localAimX) * 180 / Math.PI;
      }
      return localFacing >= 0 ? 0 : 180;
    }
    resolveWorldScaleSign(node) {
      let scaleX = 1;
      let scaleY = 1;
      let current = node;
      while (current) {
        if (typeof current.scaleX === "number" && current.scaleX !== 0) {
          scaleX *= current.scaleX;
        }
        if (typeof current.scaleY === "number" && current.scaleY !== 0) {
          scaleY *= current.scaleY;
        }
        current = current.parent;
      }
      return {
        x: scaleX >= 0 ? 1 : -1,
        y: scaleY >= 0 ? 1 : -1
      };
    }
    resolveRangedIndicator(controller) {
      if (this.rangedIndicatorNode && !this.rangedIndicatorNode.destroyed) {
        return this.rangedIndicatorNode;
      }
      this.rangedIndicatorNode = this.findChildByName(controller.owner, "attack_ranged");
      if (this.rangedIndicatorNode) {
        this.rangedIndicatorNode.mouseEnabled = false;
        this.hideRangedChargeIndicator();
      }
      return this.rangedIndicatorNode;
    }
    resolveClampedOffset() {
      const pointer = this.getStagePointer();
      const localPoint = this.attackBase.globalToLocal(new Laya.Point(pointer.x, pointer.y));
      let offsetX = localPoint.x - this.centerX;
      let offsetY = localPoint.y - this.centerY;
      const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
      const maxRadius = Math.max(1, this.radius || 1);
      if (distance > maxRadius) {
        offsetX = offsetX / distance * maxRadius;
        offsetY = offsetY / distance * maxRadius;
      }
      return { x: offsetX, y: offsetY };
    }
    getStagePointer() {
      const mouseX = typeof Laya.stage.mouseX === "number" ? Laya.stage.mouseX : Laya.stage.touchX;
      const mouseY = typeof Laya.stage.mouseY === "number" ? Laya.stage.mouseY : Laya.stage.touchY;
      return { x: Number(mouseX) || 0, y: Number(mouseY) || 0 };
    }
    captureLayout() {
      if (!this.attackBase || !this.attackHandle) {
        return;
      }
      this.centerX = this.attackBase.width / 2;
      this.centerY = this.attackBase.height / 2;
      this.handleStartX = this.attackHandle.x;
      this.handleStartY = this.attackHandle.y;
    }
    resolveParts() {
      if (!this.attackBase) {
        this.attackBase = this.findChildByName(this.owner, "base");
      }
      if (!this.attackHandle) {
        this.attackHandle = this.findChildByName(this.owner, "handle");
      }
      if (!this.weaponIconNode) {
        this.weaponIconNode = this.findChildByName(this.owner, "gimg") || this.findChildByName(this.owner, "img");
      }
    }
    captureDefaultIconSrc() {
      if (this.defaultIconSrc || !this.weaponIconNode) {
        return;
      }
      const icon = this.weaponIconNode;
      this.defaultIconSrc = String(icon.src || icon.skin || "");
    }
    refreshWeaponIcon(force = false) {
      this.resolveParts();
      if (!this.weaponIconNode) {
        return;
      }
      const dataManager = DataManager.getInstance();
      const weapon = dataManager.getEquippedItem("weapon");
      const meta = (weapon == null ? void 0 : weapon.itemId) ? dataManager.resolveItemMeta(weapon.itemId) : null;
      const iconPath = (weapon == null ? void 0 : weapon.icon) || (meta == null ? void 0 : meta.icon) || "";
      const resolvedIconPath = iconPath ? this.resolveIconPath(iconPath) : this.defaultIconSrc;
      const signature = `${(weapon == null ? void 0 : weapon.itemId) || ""}|${resolvedIconPath}`;
      if (!force && signature === this.lastWeaponIconSignature) {
        return;
      }
      this.lastWeaponIconSignature = signature;
      this.setImageSource(this.weaponIconNode, resolvedIconPath);
    }
    setImageSource(node, path) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = !!path;
      }
      if ("skin" in target) {
        target.skin = path;
      }
      if ("src" in target) {
        target.src = path;
      }
    }
    resolveIconPath(iconPath) {
      const raw = String(iconPath || "").trim();
      if (!raw) {
        return "";
      }
      if (raw.startsWith("res://")) {
        return raw;
      }
      const normalized = raw.replace(/^assets\//, "");
      const url = Laya.URL;
      if (url && typeof url.formatURL === "function") {
        return String(url.formatURL(normalized) || normalized);
      }
      return normalized;
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children || root._children || [];
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    getPointerId(e) {
      return e && typeof e.touchId === "number" ? e.touchId : -1;
    }
    resolvePlayerController() {
      if (this.playerNode) {
        const controller = this.playerNode.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
      }
      return PlayerController.activeInstance;
    }
  };
  __name(attack, "attack");
  __decorateClass([
    property25(Laya.Node)
  ], attack.prototype, "playerNode", 2);
  __decorateClass([
    property25(Laya.Sprite)
  ], attack.prototype, "attackBase", 2);
  __decorateClass([
    property25(Laya.Sprite)
  ], attack.prototype, "attackHandle", 2);
  __decorateClass([
    property25(Laya.Node)
  ], attack.prototype, "weaponIconNode", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "radius", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "dragThreshold", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "tapMaxDistance", 2);
  __decorateClass([
    property25(Boolean)
  ], attack.prototype, "meleeAutoAttackEnabled", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "rangedChargeStartAngle", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "rangedChargeEndAngle", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "rangedChargeVisualDuration", 2);
  __decorateClass([
    property25(Number)
  ], attack.prototype, "rangedChargeSegments", 2);
  __decorateClass([
    property25(String)
  ], attack.prototype, "rangedChargeFillColor", 2);
  __decorateClass([
    property25(String)
  ], attack.prototype, "rangedChargeLineColor", 2);
  attack = __decorateClass([
    regClass27("3db5f4f4-1d50-4b5c-a876-7bc6f7a7eb10", "../src/PlayUI/playerui/attack.ts")
  ], attack);

  // src/PlayUI/playerui/bag.ts
  var { regClass: regClass28, property: property26 } = Laya;
  var bag = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.glistNode = null;
      this.templateSlot = null;
      this.items = [];
      this.glistController = null;
    }
    onAwake() {
      this.resolveGlistController(true);
      DataManager.getInstance().registerBagView(this);
      this.refresh();
    }
    onEnable() {
      this.resolveGlistController(true);
      DataManager.getInstance().registerBagView(this);
      this.refresh();
    }
    onDisable() {
      DataManager.getInstance().unregisterBagView(this);
    }
    onDestroy() {
      DataManager.getInstance().unregisterBagView(this);
    }
    setItems(items) {
      this.items = Array.isArray(items) ? items.slice() : [];
      this.refresh();
    }
    refresh() {
      this.hideTemplateSlot();
      const controller = this.resolveGlistController();
      if (controller) {
        controller.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
        controller.setItems(this.items);
        return;
      }
      this.fallbackRefresh();
    }
    resolveGlistController(force = false) {
      if (!force && this.glistController && this.glistController.owner) {
        return this.glistController;
      }
      const listNode = this.glistNode || this.owner || null;
      this.glistController = listNode ? listNode.getComponent(glist) : null;
      return this.glistController;
    }
    fallbackRefresh() {
      const listNode = this.glistNode;
      if (!listNode) {
        return;
      }
      const children = listNode.children || [];
      for (let i = 0; i < children.length; i++) {
        const slotNode = children[i];
        if (!slotNode) {
          continue;
        }
        const slot = slotNode.getComponent(listTemplate);
        if (slot) {
          slot.bindData(this.items[i] || null);
        }
      }
    }
    hideTemplateSlot() {
      const template = this.templateSlot;
      if (template && "visible" in template) {
        template.visible = false;
      }
    }
  };
  __name(bag, "bag");
  __decorateClass([
    property26(Laya.Node)
  ], bag.prototype, "glistNode", 2);
  __decorateClass([
    property26(Laya.Node)
  ], bag.prototype, "templateSlot", 2);
  bag = __decorateClass([
    regClass28("0e604480-23d0-4be0-a650-5b34dbba5808", "../src/PlayUI/playerui/bag.ts")
  ], bag);

  // src/harvestable/HarvestableBase.ts
  var { regClass: regClass29, property: property27 } = Laya;
  var HarvestableBase = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.resourceId = "";
      this.instanceId = "";
      this.text = "";
      this.harvested = false;
      this.busy = false;
    }
    onAwake() {
      const owner = this.owner;
      owner.mouseEnabled = true;
      this.ensureIdentifiers();
    }
    onEnable() {
      this.registerSelf();
    }
    onDisable() {
      this.unregisterSelf();
    }
    onDestroy() {
      this.unregisterSelf();
    }
    static resolveByInstanceId(instanceId) {
      if (!instanceId) {
        return null;
      }
      return HarvestableBase.instanceRegistry.get(instanceId) || null;
    }
    static destroyByInstanceId(instanceId) {
      const target = HarvestableBase.resolveByInstanceId(instanceId);
      if (!target) {
        return false;
      }
      target.destroySelf();
      return true;
    }
    static getFocusedTarget(action) {
      return HarvestableBase.focusedTargets[action];
    }
    static setFocusedTarget(action, target) {
      HarvestableBase.focusedTargets[action] = target;
    }
    static clearFocusedTarget(action, target) {
      const currentTarget = HarvestableBase.focusedTargets[action];
      if (!currentTarget) {
        return;
      }
      if (!target || target === currentTarget) {
        HarvestableBase.focusedTargets[action] = null;
      }
    }
    static getFocusedChopTarget() {
      return HarvestableBase.getFocusedTarget("chop");
    }
    static getFocusedDigTarget() {
      return HarvestableBase.getFocusedTarget("dig");
    }
    static setFocusedChopTarget(target) {
      HarvestableBase.setFocusedTarget("chop", target);
    }
    static setFocusedDigTarget(target) {
      HarvestableBase.setFocusedTarget("dig", target);
    }
    static clearFocusedChopTarget(target) {
      HarvestableBase.clearFocusedTarget("chop", target);
    }
    static clearFocusedDigTarget(target) {
      HarvestableBase.clearFocusedTarget("dig", target);
    }
    getAction() {
      return this.getConfig().action;
    }
    getDisplayName() {
      return this.getConfig().displayName;
    }
    getRange() {
      return this.getConfig().range;
    }
    isAvailableFor(action) {
      return !this.harvested && !this.busy && this.getAction() === action;
    }
    isBusy() {
      return this.busy;
    }
    isHarvested() {
      return this.harvested;
    }
    getWorldPosition() {
      const point = new Laya.Point();
      const owner = this.owner;
      owner.localToGlobal(point, false);
      return point;
    }
    harvest(player) {
      const config = this.getConfig();
      if (this.harvested || this.busy) {
        return false;
      }
      if (player && player.animation.isBusy()) {
        return false;
      }
      this.busy = true;
      const sequence = config.sequence && config.sequence.length > 0 ? config.sequence.slice() : null;
      const totalDuration = sequence ? this.getSequenceDuration(sequence) : Math.max(100, config.interactTime);
      const finishHarvest = /* @__PURE__ */ __name(() => {
        this.busy = false;
        const drops = DataManager.getInstance().grantHarvestDrops(config.id, config.drops);
        DataManager.getInstance().grantGatherExperience();
        const dropText = DataManager.getInstance().formatHarvestResults(drops);
        if (config.once) {
          this.harvested = true;
          this.destroySelf();
        }
        if (player) {
          player.showItem(dropText);
        }
      }, "finishHarvest");
      if (player && sequence && typeof player.animation.playActionSequence === "function") {
        player.animation.playActionSequence(sequence, player.idleAnimation, finishHarvest);
        return true;
      }
      Laya.timer.once(Math.max(100, totalDuration), this, finishHarvest);
      return true;
    }
    onTriggerEnter(other) {
      const action = this.getAction();
      if (!this.isInteractionAction(action)) {
        return;
      }
      if (!this.isPlayerContact(other)) {
        return;
      }
      HarvestableBase.setFocusedTarget(action, this);
    }
    onTriggerExit(other) {
      const action = this.getAction();
      if (!this.isInteractionAction(action)) {
        return;
      }
      if (!this.isPlayerContact(other)) {
        return;
      }
      HarvestableBase.clearFocusedTarget(action, this);
    }
    isInteractionAction(action) {
      return action === "chop" || action === "search" || action === "dig";
    }
    getSequenceDuration(sequence) {
      let total = 0;
      for (let i = 0; i < sequence.length; i++) {
        total += Math.max(0, sequence[i].duration || 0);
      }
      return total;
    }
    ensureIdentifiers() {
      const config = this.getConfig();
      if (!this.resourceId) {
        this.resourceId = config.name;
      }
    }
    registerSelf() {
      this.ensureIdentifiers();
      if (!this.instanceId) {
        return;
      }
      HarvestableBase.instanceRegistry.set(this.instanceId, this);
    }
    unregisterSelf() {
      if (this.instanceId && HarvestableBase.instanceRegistry.get(this.instanceId) === this) {
        HarvestableBase.instanceRegistry.delete(this.instanceId);
      }
      for (const action of ["chop", "search", "dig"]) {
        if (HarvestableBase.focusedTargets[action] === this) {
          HarvestableBase.focusedTargets[action] = null;
        }
      }
    }
    isPlayerContact(other) {
      const node = this.resolveOtherNode(other);
      return !!this.resolvePlayerControllerFromNode(node);
    }
    resolveOtherNode(other) {
      if (!other) {
        return null;
      }
      const node = other.owner || other.node || other.colliderOwner || null;
      return node instanceof Laya.Node ? node : null;
    }
    resolvePlayerControllerFromNode(node) {
      let current = node;
      while (current) {
        const controller = current.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
        current = current.parent;
      }
      return null;
    }
    destroySelf() {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.busy = false;
      this.harvested = true;
      this.unregisterSelf();
      Laya.timer.clearAll(this);
      owner.visible = false;
      owner.mouseEnabled = false;
      owner.active = false;
      Laya.timer.once(0, null, () => {
        if (!owner.destroyed) {
          if (owner.parent) {
            owner.removeSelf();
          }
          owner.destroy();
        }
      });
    }
  };
  __name(HarvestableBase, "HarvestableBase");
  HarvestableBase.instanceRegistry = /* @__PURE__ */ new Map();
  HarvestableBase.focusedTargets = {
    chop: null,
    search: null,
    dig: null
  };
  __decorateClass([
    property27(String)
  ], HarvestableBase.prototype, "resourceId", 2);
  __decorateClass([
    property27(String)
  ], HarvestableBase.prototype, "instanceId", 2);
  __decorateClass([
    property27(String)
  ], HarvestableBase.prototype, "text", 2);
  HarvestableBase = __decorateClass([
    regClass29("ff581052-ecee-440f-ad24-663ab6029885", "../src/harvestable/HarvestableBase.ts")
  ], HarvestableBase);

  // src/PlayUI/playerui/chop.ts
  var { regClass: regClass30, property: property28 } = Laya;
  var chop = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.playerNode = null;
      this.boundOwner = null;
      this.currentTarget = null;
    }
    onAwake() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onEnable() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onUpdate() {
      this.refreshTarget();
    }
    onDisable() {
      this.unbindClickTarget();
      this.currentTarget = null;
      this.setVisible(false);
    }
    onDestroy() {
      this.unbindClickTarget();
      this.currentTarget = null;
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onChopClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onChopClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onChopClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onChopClick);
      }
      this.boundOwner = null;
    }
    onChopClick() {
      const controller = this.resolvePlayerController();
      const target = this.currentTarget || HarvestableBase.getFocusedChopTarget();
      if (!controller || !target) {
        return;
      }
      if (!target.harvest(controller)) {
        this.refreshTarget();
        return;
      }
      this.setVisible(false);
    }
    refreshTarget() {
      const target = HarvestableBase.getFocusedChopTarget();
      this.currentTarget = target;
      if (!target) {
        this.setVisible(false);
        return;
      }
      this.setVisible(true);
    }
    resolvePlayerController() {
      if (this.playerNode) {
        const controller = this.playerNode.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
      }
      return PlayerController.activeInstance;
    }
    setVisible(visible) {
      const owner = this.owner;
      if (owner) {
        owner.visible = visible;
      }
    }
  };
  __name(chop, "chop");
  __decorateClass([
    property28(Laya.Node)
  ], chop.prototype, "playerNode", 2);
  chop = __decorateClass([
    regClass30("f29af7cf-09c7-4141-901d-e18b0064f813", "../src/PlayUI/playerui/chop.ts")
  ], chop);

  // src/PlayUI/playerui/dig.ts
  var { regClass: regClass31, property: property29 } = Laya;
  var dig = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.playerNode = null;
      this.boundOwner = null;
      this.currentTarget = null;
    }
    onAwake() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onEnable() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onUpdate() {
      this.refreshTarget();
    }
    onDisable() {
      this.unbindClickTarget();
      this.currentTarget = null;
      this.setVisible(false);
    }
    onDestroy() {
      this.unbindClickTarget();
      this.currentTarget = null;
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onDigClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onDigClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onDigClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onDigClick);
      }
      this.boundOwner = null;
    }
    onDigClick() {
      const controller = this.resolvePlayerController();
      const target = this.currentTarget || HarvestableBase.getFocusedDigTarget();
      if (!controller || !target) {
        return;
      }
      if (!target.harvest(controller)) {
        this.refreshTarget();
        return;
      }
      this.setVisible(false);
    }
    refreshTarget() {
      const target = HarvestableBase.getFocusedDigTarget();
      this.currentTarget = target;
      if (!target) {
        this.setVisible(false);
        return;
      }
      this.setVisible(true);
    }
    resolvePlayerController() {
      if (this.playerNode) {
        const controller = this.playerNode.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
      }
      return PlayerController.activeInstance;
    }
    setVisible(visible) {
      const owner = this.owner;
      if (owner) {
        owner.visible = visible;
      }
    }
  };
  __name(dig, "dig");
  __decorateClass([
    property29(Laya.Node)
  ], dig.prototype, "playerNode", 2);
  dig = __decorateClass([
    regClass31("10034fdc-629a-4e30-8bc7-32dc80a0683f", "../src/PlayUI/playerui/dig.ts")
  ], dig);

  // src/PlayUI/playerui/run.ts
  var { regClass: regClass32, property: property30 } = Laya;
  var run = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.playerNode = null;
      this.targetNode = null;
      this.boundOwner = null;
    }
    onAwake() {
      this.bindClickTarget();
      this.syncVisualState();
    }
    onEnable() {
      this.bindClickTarget();
      this.syncVisualState();
    }
    onUpdate() {
      this.syncVisualState();
    }
    onDisable() {
      this.unbindClickTarget();
    }
    onDestroy() {
      this.unbindClickTarget();
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onRunClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onRunClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onRunClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onRunClick);
      }
      this.boundOwner = null;
    }
    onRunClick() {
      const controller = this.resolvePlayerController();
      if (!controller) {
        return;
      }
      if (!controller.isRunning && !controller.canStartRunning()) {
        this.syncVisualState();
        return;
      }
      controller.setRunningState(!controller.isRunning);
      this.syncVisualState();
    }
    syncVisualState() {
      const controller = this.resolvePlayerController();
      const owner = this.owner;
      const target = this.targetNode;
      if (!owner || !target) {
        return;
      }
      const running = !!controller && controller.isRunning;
      owner.alpha = running ? 0.55 : 1;
      target.visible = !running;
    }
    resolvePlayerController() {
      if (this.playerNode) {
        const controller = this.playerNode.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
      }
      return PlayerController.activeInstance;
    }
  };
  __name(run, "run");
  __decorateClass([
    property30(Laya.Node)
  ], run.prototype, "playerNode", 2);
  __decorateClass([
    property30(Laya.Node)
  ], run.prototype, "targetNode", 2);
  run = __decorateClass([
    regClass32("3e46d646-50d0-4380-9afa-0544eff22c4e", "../src/PlayUI/playerui/run.ts")
  ], run);

  // src/container/ContainerBase.ts
  var { regClass: regClass33, property: property31 } = Laya;
  var ContainerBase = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.containerId = "";
      this.instanceId = "";
      this.displayName = "";
      this.contentsJson = "";
      this.once = true;
      this.destroyAfterOpen = false;
      this.opened = false;
      this.busy = false;
    }
    onAwake() {
      const owner = this.owner;
      if (owner) {
        owner.mouseEnabled = true;
      }
      this.ensureDefaults();
    }
    onEnable() {
      this.registerSelf();
    }
    onDisable() {
      this.unregisterSelf();
    }
    onDestroy() {
      this.unregisterSelf();
    }
    static getFocusedTarget() {
      return ContainerBase.focusedTarget;
    }
    static resolveByInstanceId(instanceId) {
      const id = String(instanceId || "").trim();
      return id ? ContainerBase.instanceRegistry.get(id) || null : null;
    }
    isAvailable() {
      return !this.busy && (!this.once || !this.opened);
    }
    open(player) {
      if (!this.isAvailable()) {
        player == null ? void 0 : player.showState(`${this.getResolvedDisplayName()}已经空了`);
        return false;
      }
      if (player && player.animation.isBusy()) {
        return false;
      }
      this.busy = true;
      const finishOpen = /* @__PURE__ */ __name(() => {
        const contents = this.rollContents();
        if (contents.length > 0) {
          this.openBagPanelContainerState(contents);
          player == null ? void 0 : player.showItem(this.formatContents(contents));
        } else {
          this.openBagPanelContainerState([]);
          player == null ? void 0 : player.showState(`${this.getResolvedDisplayName()}是空的`);
        }
        this.opened = true;
        this.busy = false;
        if (this.destroyAfterOpen) {
          this.destroySelf();
        }
      }, "finishOpen");
      Laya.timer.once(this.getOpenPanelDelay(), this, this.openBagPanelContainerState);
      if (player && typeof player.animation.playActionSequence === "function") {
        player.animation.playActionSequence(this.getOpenSequence(), player.idleAnimation, finishOpen);
      } else {
        Laya.timer.once(this.getOpenSequenceDuration(), this, finishOpen);
      }
      return true;
    }
    onTriggerEnter(other) {
      if (!this.isPlayerContact(other)) {
        return;
      }
      ContainerBase.focusedTarget = this;
    }
    onTriggerExit(other) {
      if (!this.isPlayerContact(other)) {
        return;
      }
      if (ContainerBase.focusedTarget === this) {
        ContainerBase.focusedTarget = null;
      }
    }
    ensureDefaults() {
      if (!this.containerId) {
        this.containerId = this.getDefaultContainerId();
      }
      if (!this.displayName) {
        this.displayName = this.getDefaultDisplayName();
      }
    }
    registerSelf() {
      this.ensureDefaults();
      const id = String(this.instanceId || "").trim();
      if (id) {
        ContainerBase.instanceRegistry.set(id, this);
      }
    }
    unregisterSelf() {
      const id = String(this.instanceId || "").trim();
      if (id && ContainerBase.instanceRegistry.get(id) === this) {
        ContainerBase.instanceRegistry.delete(id);
      }
      if (ContainerBase.focusedTarget === this) {
        ContainerBase.focusedTarget = null;
      }
    }
    resolveContents() {
      const fromJson = this.parseContentsJson();
      return fromJson.length > 0 ? fromJson : this.getDefaultContents();
    }
    rollContents() {
      const contents = this.resolveContents();
      const results = [];
      const dataManager = DataManager.getInstance();
      for (let i = 0; i < contents.length; i++) {
        const item = contents[i];
        const probability = Number.isFinite(item.probability) ? Math.max(0, Math.min(1, item.probability)) : 1;
        if (Math.random() > probability) {
          continue;
        }
        const minCount = Number.isFinite(item.minCount) ? Math.max(0, Math.floor(item.minCount)) : Math.max(0, Math.floor(item.count || 0));
        const maxCount = Number.isFinite(item.maxCount) ? Math.max(minCount, Math.floor(item.maxCount)) : minCount;
        const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
        if (count <= 0) {
          continue;
        }
        const meta = dataManager.resolveItemMeta(item.itemId);
        results.push({
          itemId: item.itemId,
          name: item.name || (meta == null ? void 0 : meta.displayName) || (meta == null ? void 0 : meta.nameZh) || dataManager.resolveFallbackName(item.itemId) || item.itemId,
          count,
          icon: item.icon || (meta == null ? void 0 : meta.icon) || dataManager.resolveFallbackIcon(item.itemId)
        });
      }
      return results;
    }
    parseContentsJson() {
      const raw = String(this.contentsJson || "").trim();
      if (!raw) {
        return [];
      }
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
          return [];
        }
        return parsed.map((item) => ({
          itemId: String((item == null ? void 0 : item.itemId) || "").trim(),
          name: (item == null ? void 0 : item.name) ? String(item.name) : void 0,
          count: Number.isFinite(Number(item == null ? void 0 : item.count)) ? Math.floor(Number(item.count)) : 0,
          minCount: Number.isFinite(Number(item == null ? void 0 : item.minCount)) ? Math.floor(Number(item.minCount)) : void 0,
          maxCount: Number.isFinite(Number(item == null ? void 0 : item.maxCount)) ? Math.floor(Number(item.maxCount)) : void 0,
          probability: Number.isFinite(Number(item == null ? void 0 : item.probability)) ? Number(item.probability) : void 0,
          icon: (item == null ? void 0 : item.icon) ? String(item.icon) : void 0
        })).filter((item) => !!item.itemId && (item.count > 0 || (item.minCount || 0) > 0));
      } catch (error) {
        console.warn("[ContainerBase] invalid contentsJson", error);
        return [];
      }
    }
    openBagPanelContainerState(items) {
      const panel = this.findBagPanel(Laya.stage);
      if (!panel) {
        return;
      }
      const panelOwner = panel.owner;
      if (panelOwner) {
        panelOwner.visible = true;
        panelOwner.active = true;
      }
      if (items) {
        panel.openContainerSearchWithItems(items);
      } else {
        panel.openContainerSearch();
      }
      panel.refresh();
    }
    getOpenSequence() {
      return [
        { animation: "search/search_start", duration: 816, loop: false },
        { animation: "search/search_loop", duration: 2983, loop: true },
        { animation: "search/search_end", duration: 816, loop: false }
      ];
    }
    getOpenSequenceDuration() {
      const sequence = this.getOpenSequence();
      let total = 0;
      for (let i = 0; i < sequence.length; i++) {
        total += Math.max(0, sequence[i].duration || 0);
      }
      return Math.max(100, total);
    }
    getOpenPanelDelay() {
      const firstStep = this.getOpenSequence()[0];
      return Math.max(0, (firstStep == null ? void 0 : firstStep.duration) || 0);
    }
    findBagPanel(root) {
      if (!root) {
        return null;
      }
      const panel = root.getComponent(BagPanel);
      if (panel) {
        return panel;
      }
      const count = root.numChildren || 0;
      for (let i = 0; i < count; i++) {
        const found = this.findBagPanel(root.getChildAt(i));
        if (found) {
          return found;
        }
      }
      return null;
    }
    formatContents(contents) {
      return contents.map((item) => {
        const name = item.name || item.itemId;
        return `${name}x${item.count}`;
      }).join(" ");
    }
    getResolvedDisplayName() {
      return this.displayName || this.getDefaultDisplayName() || this.containerId || "容器";
    }
    isPlayerContact(other) {
      const node = this.resolveOtherNode(other);
      return !!this.resolvePlayerControllerFromNode(node);
    }
    resolveOtherNode(other) {
      if (!other) {
        return null;
      }
      const node = other.owner || other.node || other.colliderOwner || null;
      return node instanceof Laya.Node ? node : null;
    }
    resolvePlayerControllerFromNode(node) {
      let current = node;
      while (current) {
        const controller = current.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
        current = current.parent;
      }
      return null;
    }
    destroySelf() {
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.unregisterSelf();
      owner.visible = false;
      owner.mouseEnabled = false;
      owner.active = false;
      Laya.timer.once(0, null, () => {
        if (!owner.destroyed) {
          owner.removeSelf();
          owner.destroy();
        }
      });
    }
  };
  __name(ContainerBase, "ContainerBase");
  ContainerBase.focusedTarget = null;
  ContainerBase.instanceRegistry = /* @__PURE__ */ new Map();
  __decorateClass([
    property31(String)
  ], ContainerBase.prototype, "containerId", 2);
  __decorateClass([
    property31(String)
  ], ContainerBase.prototype, "instanceId", 2);
  __decorateClass([
    property31(String)
  ], ContainerBase.prototype, "displayName", 2);
  __decorateClass([
    property31(String)
  ], ContainerBase.prototype, "contentsJson", 2);
  __decorateClass([
    property31(Boolean)
  ], ContainerBase.prototype, "once", 2);
  __decorateClass([
    property31(Boolean)
  ], ContainerBase.prototype, "destroyAfterOpen", 2);
  ContainerBase = __decorateClass([
    regClass33("0c181a63-581e-4215-8b38-f0c1262b482a", "../src/container/ContainerBase.ts")
  ], ContainerBase);

  // src/PlayUI/playerui/search.ts
  var { regClass: regClass34, property: property32 } = Laya;
  var search = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.playerNode = null;
      this.boundOwner = null;
      this.currentHarvestTarget = null;
      this.currentContainerTarget = null;
    }
    onAwake() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onEnable() {
      this.bindClickTarget();
      this.refreshTarget();
    }
    onUpdate() {
      this.refreshTarget();
    }
    onDisable() {
      this.unbindClickTarget();
      this.currentHarvestTarget = null;
      this.currentContainerTarget = null;
      this.setVisible(false);
    }
    onDestroy() {
      this.unbindClickTarget();
      this.currentHarvestTarget = null;
      this.currentContainerTarget = null;
    }
    bindClickTarget() {
      this.unbindClickTarget();
      const owner = this.owner;
      if (!owner) {
        return;
      }
      this.boundOwner = owner;
      owner.mouseEnabled = true;
      if ("mouseThrough" in owner) {
        owner.mouseThrough = false;
      }
      if (typeof owner.onClick === "function") {
        owner.onClick(this, this.onSearchClick);
      } else {
        owner.on(Laya.Event.CLICK, this, this.onSearchClick);
      }
    }
    unbindClickTarget() {
      if (!this.boundOwner) {
        return;
      }
      const owner = this.boundOwner;
      if (typeof owner.offClick === "function") {
        owner.offClick(this, this.onSearchClick);
      } else {
        this.boundOwner.off(Laya.Event.CLICK, this, this.onSearchClick);
      }
      this.boundOwner = null;
    }
    onSearchClick() {
      const controller = this.resolvePlayerController();
      const container = this.currentContainerTarget || ContainerBase.getFocusedTarget();
      if (controller && container) {
        if (!container.open(controller)) {
          this.refreshTarget();
          return;
        }
        this.setVisible(false);
        return;
      }
      const target = this.currentHarvestTarget || HarvestableBase.getFocusedTarget("search");
      if (!controller || !target) {
        return;
      }
      if (!target.harvest(controller)) {
        this.refreshTarget();
        return;
      }
      this.setVisible(false);
    }
    refreshTarget() {
      const container = ContainerBase.getFocusedTarget();
      const target = HarvestableBase.getFocusedTarget("search");
      this.currentContainerTarget = container && container.isAvailable() ? container : null;
      this.currentHarvestTarget = target;
      if (!this.currentContainerTarget && !this.currentHarvestTarget) {
        this.setVisible(false);
        return;
      }
      this.setVisible(true);
    }
    resolvePlayerController() {
      if (this.playerNode) {
        const controller = this.playerNode.getComponent(PlayerController);
        if (controller) {
          return controller;
        }
      }
      return PlayerController.activeInstance;
    }
    setVisible(visible) {
      const owner = this.owner;
      if (owner) {
        owner.visible = visible;
      }
    }
  };
  __name(search, "search");
  __decorateClass([
    property32(Laya.Node)
  ], search.prototype, "playerNode", 2);
  search = __decorateClass([
    regClass34("8f0c1a2b-5d7e-4c6f-9a8b-1f2e3d4c5b6a", "../src/PlayUI/playerui/search.ts")
  ], search);

  // src/Player/PlayerCamera2D.ts
  var { regClass: regClass35 } = Laya;
  var PlayerCamera2D = class extends Laya.Script {
    onAwake() {
      this.applyCameraState();
    }
    onEnable() {
      this.applyCameraState();
    }
    onLateUpdate() {
      this.applyCameraState();
    }
    applyCameraState() {
      const camera = this.owner;
      if (!(camera instanceof Laya.Camera2D)) {
        return;
      }
      camera.isMain = true;
      camera.ignoreRotation = true;
      camera.positionSmooth = false;
      camera.positionSpeed = 0;
      camera.x = 0;
      camera.y = 0;
    }
  };
  __name(PlayerCamera2D, "PlayerCamera2D");
  PlayerCamera2D = __decorateClass([
    regClass35("6adc1bb5-9800-4111-9786-29ef2b1a31aa", "../src/Player/PlayerCamera2D.ts")
  ], PlayerCamera2D);

  // src/SceneJumpTrigger.ts
  var { regClass: regClass36, property: property33 } = Laya;
  var SceneJumpTrigger = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.triggerNode = null;
      this.sceneUrl = "";
      this.boundNode = null;
      this.jumped = false;
    }
    onAwake() {
      this.bindTriggerNode();
    }
    onEnable() {
      this.bindTriggerNode();
    }
    onDisable() {
      this.unbindTriggerNode();
    }
    onDestroy() {
      this.unbindTriggerNode();
    }
    bindTriggerNode() {
      this.unbindTriggerNode();
      const node = this.triggerNode || this.owner;
      if (!node) {
        return;
      }
      this.boundNode = node;
      const owner = node;
      if ("mouseEnabled" in owner) {
        owner.mouseEnabled = true;
      }
      if (typeof owner.on === "function") {
        owner.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
      }
    }
    unbindTriggerNode() {
      if (!this.boundNode) {
        return;
      }
      const node = this.boundNode;
      if (typeof node.off === "function") {
        node.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
      }
      this.boundNode = null;
    }
    onTriggerEnter(other) {
      if (this.jumped) {
        return;
      }
      if (!other) {
        return;
      }
      const url = this.sceneUrl.trim();
      if (!url) {
        return;
      }
      this.jumped = true;
      Laya.timer.once(0, null, () => {
        DataManager.getInstance().enterScene(url);
        Laya.Scene.open(url);
      });
    }
  };
  __name(SceneJumpTrigger, "SceneJumpTrigger");
  __decorateClass([
    property33(Laya.Node)
  ], SceneJumpTrigger.prototype, "triggerNode", 2);
  __decorateClass([
    property33(String)
  ], SceneJumpTrigger.prototype, "sceneUrl", 2);
  SceneJumpTrigger = __decorateClass([
    regClass36("c803dca4-3833-4ccf-ae56-54ed9e6001d5", "../src/SceneJumpTrigger.ts")
  ], SceneJumpTrigger);

  // src/combat/AttackHitbox.ts
  var { regClass: regClass37, property: property34 } = Laya;
  var AttackHitbox = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.attackerNode = null;
      this.targetKind = "enemy";
    }
    onAwake() {
      this.bind();
    }
    onEnable() {
      this.bind();
    }
    onDisable() {
      this.unbind();
    }
    onDestroy() {
      this.unbind();
    }
    bind() {
      const owner = this.owner;
      if (owner && typeof owner.off === "function") {
        owner.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
      }
      if (owner && typeof owner.on === "function") {
        owner.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
      }
    }
    unbind() {
      const owner = this.owner;
      if (owner && typeof owner.off === "function") {
        owner.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
      }
    }
    onTriggerEnter(other) {
      const attacker = this.resolveAttacker();
      if (!attacker) {
        return;
      }
      const targetNode = this.resolveOtherNode(other);
      const receiver = this.resolveReceiver(targetNode);
      if (!receiver) {
        return;
      }
      if (!this.matchesTargetKind(receiver)) {
        return;
      }
      if (receiver.isDead && receiver.isDead()) {
        return;
      }
      const token = attacker.getAttackToken();
      if (token <= 0) {
        return;
      }
      receiver.takeDamage(attacker.attackPower);
    }
    resolveAttacker() {
      const node = this.attackerNode || this.findControllerOwner(this.owner);
      return this.findComponentWithMethods(node, ["getAttackToken"], ["attackPower"]);
    }
    resolveReceiver(node) {
      return this.findComponentWithMethods(node, ["takeDamage"], []);
    }
    matchesTargetKind(receiver) {
      const kind = String(this.targetKind || "").toLowerCase();
      const candidate = receiver;
      if (kind === "enemy") {
        return typeof candidate.isDead === "function";
      }
      if (kind === "player") {
        return typeof candidate.setRunningState === "function";
      }
      return true;
    }
    resolveOtherNode(other) {
      if (!other) {
        return null;
      }
      const node = other.owner || other.node || other.colliderOwner || null;
      return node instanceof Laya.Node ? node : null;
    }
    findControllerOwner(node) {
      let current = node;
      while (current) {
        const attacker = this.findComponentWithMethods(current, ["getAttackToken"], ["attackPower"]);
        if (attacker) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }
    findComponentWithMethods(node, methods, fields) {
      let current = node;
      while (current) {
        const components = current._components || current.components || [];
        for (let i = 0; i < components.length; i++) {
          const component = components[i];
          if (!component) {
            continue;
          }
          let matches = true;
          for (let m = 0; m < methods.length; m++) {
            if (typeof component[methods[m]] !== "function") {
              matches = false;
              break;
            }
          }
          for (let f = 0; matches && f < fields.length; f++) {
            if (!(fields[f] in component)) {
              matches = false;
            }
          }
          if (matches) {
            return component;
          }
        }
        current = current.parent;
      }
      return null;
    }
  };
  __name(AttackHitbox, "AttackHitbox");
  __decorateClass([
    property34(Laya.Node)
  ], AttackHitbox.prototype, "attackerNode", 2);
  __decorateClass([
    property34(String)
  ], AttackHitbox.prototype, "targetKind", 2);
  AttackHitbox = __decorateClass([
    regClass37("85c8cc94-c77e-4333-b4cb-83803c909a33", "../src/combat/AttackHitbox.ts")
  ], AttackHitbox);

  // src/container/ironbox.ts
  var { regClass: regClass38 } = Laya;
  var ironbox = class extends ContainerBase {
    getDefaultContainerId() {
      return "container_ironbox";
    }
    getDefaultDisplayName() {
      return "ironbox";
    }
    getDefaultContents() {
      return [
        { itemId: "chenshuimu", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
        { itemId: "copper", count: 1, minCount: 1, maxCount: 3, probability: 0.12 },
        { itemId: "cotton", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
        { itemId: "feather", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "grass", count: 1, minCount: 1, maxCount: 4, probability: 0.08 },
        { itemId: "hide", count: 1, minCount: 1, maxCount: 2, probability: 0.08 },
        { itemId: "hua", count: 1, minCount: 1, maxCount: 3, probability: 0.06 },
        { itemId: "iron", count: 1, minCount: 1, maxCount: 4, probability: 0.18 },
        { itemId: "liuhuang", count: 1, minCount: 1, maxCount: 2, probability: 0.1 },
        { itemId: "mutan", count: 1, minCount: 1, maxCount: 3, probability: 0.1 },
        { itemId: "nail", count: 1, minCount: 1, maxCount: 3, probability: 0.12 },
        { itemId: "renshen", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "shougu", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "shucai", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "shupi", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
        { itemId: "shuzhi", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "tiaoliao", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "wood", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
        { itemId: "xiaoshi", count: 1, minCount: 1, maxCount: 2, probability: 0.08 },
        { itemId: "xiaoshuzhi", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
        { itemId: "xiyoujinshu", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "yaocao", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "corn", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "egg", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "fish", count: 1, minCount: 1, maxCount: 2, probability: 0.04 },
        { itemId: "fruit", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "meat", count: 1, minCount: 1, maxCount: 2, probability: 0.04 },
        { itemId: "mushroom", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "potato", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "rice_grain", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "seasoning", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "wheat", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "gongyejiao", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "gujiao", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "leather", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "shengzi", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "shikuai", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "muban", count: 1, minCount: 1, maxCount: 2, probability: 0.07 },
        { itemId: "tieding", count: 1, minCount: 1, maxCount: 2, probability: 0.07 },
        { itemId: "tongding", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
        { itemId: "Ti", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
        { itemId: "Wu", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
        { itemId: "yingmu", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
        { itemId: "common_material_02", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
        { itemId: "shitou", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
        { itemId: "food_material_01", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "base_material_10", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
        { itemId: "gaofenzicailiao", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
        { itemId: "tezhonghejin", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
        { itemId: "taihejin", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
        { itemId: "tezhonggang", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
        { itemId: "junyongcaoci", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
        { itemId: "huoyao", count: 1, minCount: 1, maxCount: 1, probability: 0.03 }
      ];
    }
  };
  __name(ironbox, "ironbox");
  ironbox = __decorateClass([
    regClass38("d742f9d7-34ba-4ae9-abdd-d9fe9fe306f6", "../src/container/ironbox.ts")
  ], ironbox);

  // src/container/kongtou.ts
  var { regClass: regClass39 } = Laya;
  var kongtou = class extends ContainerBase {
    getDefaultContainerId() {
      return "container_kongtou";
    }
    getDefaultDisplayName() {
      return "kongtou";
    }
    getDefaultContents() {
      return [
        { itemId: "wood_club", count: 1, minCount: 1, maxCount: 1, probability: 0.18 },
        { itemId: "knife", count: 1, minCount: 1, maxCount: 1, probability: 0.16 },
        { itemId: "cleaver", count: 1, minCount: 1, maxCount: 1, probability: 0.14 },
        { itemId: "baseket_bat", count: 1, minCount: 1, maxCount: 1, probability: 0.14 },
        { itemId: "qiaogun", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
        { itemId: "langyabang", count: 1, minCount: 1, maxCount: 1, probability: 0.08 },
        { itemId: "machete", count: 1, minCount: 1, maxCount: 1, probability: 0.06 },
        { itemId: "long_knife", count: 1, minCount: 1, maxCount: 1, probability: 0.05 }
      ];
    }
  };
  __name(kongtou, "kongtou");
  kongtou = __decorateClass([
    regClass39("1905b3f9-2516-45f7-8ad9-e250e9230b98", "../src/container/kongtou.ts")
  ], kongtou);

  // src/container/pobudai.ts
  var { regClass: regClass40 } = Laya;
  var pobudai = class extends ContainerBase {
    getDefaultContainerId() {
      return "container_pobudai";
    }
    getDefaultDisplayName() {
      return "破布袋";
    }
    getDefaultContents() {
      return [
        { itemId: "bandage", name: "绷带", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        { itemId: "egg", name: "鸡蛋", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        { itemId: "corn", name: "玉米", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        { itemId: "seasoning", name: "调料", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
        { itemId: "wheat", name: "小麦", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        { itemId: "hide", name: "皮革", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        { itemId: "grass", name: "草", count: 1, minCount: 1, maxCount: 3, probability: 0.3 },
        { itemId: "nail", name: "钉子", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
        { itemId: "muban", name: "木板", count: 1, minCount: 1, maxCount: 2, probability: 0.2 }
      ];
    }
  };
  __name(pobudai, "pobudai");
  pobudai = __decorateClass([
    regClass40("14f01483-b482-4199-a57f-d13f3907d80d", "../src/container/pobudai.ts")
  ], pobudai);

  // src/debug/DebugConfig.ts
  var _DebugConfig = class _DebugConfig {
  };
  __name(_DebugConfig, "DebugConfig");
  _DebugConfig.ENABLE_DEBUG_UI = false;
  _DebugConfig.DEBUG_PANEL_PREFAB_URL = "prefab/prefab_debug.lh";
  var DebugConfig = _DebugConfig;

  // src/systems/RuntimeDiagnostics.ts
  var SCENE_URLS = [
    "scenes/menu.ls",
    "scenes/cunzhuang.ls",
    "scenes/forest.ls",
    "scenes/mine.ls"
  ];
  var PREFAB_URLS = [
    "prefab/prefab_player.lh",
    "prefab/LayerPrefab/UILayer.lh",
    "prefab/prefab-ui/play_ui.lh",
    "prefab/prefab_interface/Common/HpBar.lh",
    "prefab/prefab_interface/Common/TlBar_1.lh",
    "prefab/prefab_interface/Bag/bag_panel.lh",
    "prefab/prefab_interface/Warehouse/warehouse_panel.lh",
    "prefab/prefab_interface/Mail/MailPanel.lh",
    "prefab/prefab_interface/Crafting/CraftingPanel.lh",
    "prefab/prefab_interface/panel/SidePanel.lh",
    "prefab/prefab_interface/panel/sign_in_panel.lh",
    "prefab/prefab_interface/MapChoose/mapchoose.lh"
  ];
  var CONFIG_URLS = [
    "config/items/materials.json",
    "config/items/foods.json",
    "config/items/weapons.json",
    "config/items/misc.json",
    "config/harvest/drops.json"
  ];
  var EQUIPMENT_SLOTS = ["insertPlate", "helmet", "weapon", "armor"];
  var CRAFTING_STATIONS = ["campfire", "pengrenji", "processing", "equipment", "manufacture", "medicine", "advance"];
  var _RuntimeDiagnostics = class _RuntimeDiagnostics {
    static install() {
      if (!_RuntimeDiagnostics.ENABLE_RUNTIME_DIAGNOSTICS) {
        return;
      }
      const scope = globalThis;
      scope.runFeatureIntegrityTest = (options) => _RuntimeDiagnostics.runAndLog(options);
      scope.FeatureIntegrityTest = _RuntimeDiagnostics;
    }
    static ensureButton() {
      if (!_RuntimeDiagnostics.ENABLE_RUNTIME_DIAGNOSTICS) {
        return;
      }
      const stage = Laya.stage;
      if (!stage) {
        return;
      }
      if (!_RuntimeDiagnostics.findDirectChild(stage, _RuntimeDiagnostics.TEST_BUTTON_NAME)) {
        _RuntimeDiagnostics.createTestButton(stage);
      }
    }
    static runAndLog() {
      return __async(this, arguments, function* (options = {}) {
        const report = yield _RuntimeDiagnostics.run(options);
        _RuntimeDiagnostics.logReport(report);
        return report;
      });
    }
    static run() {
      return __async(this, arguments, function* (options = {}) {
        const startedAtTime = Date.now();
        const checks = [];
        yield _RuntimeDiagnostics.checkDataManager(checks);
        _RuntimeDiagnostics.checkPlayerRuntime(checks);
        _RuntimeDiagnostics.checkCurrentStage(checks);
        _RuntimeDiagnostics.checkPlatformSurface(checks);
        if (options.includeResourceLoad !== false) {
          yield _RuntimeDiagnostics.checkResourceLoads(checks);
        }
        return _RuntimeDiagnostics.createReport(startedAtTime, checks);
      });
    }
    static runFromButton() {
      return __async(this, null, function* () {
        _RuntimeDiagnostics.showTestPanel("Running feature test...");
        const report = yield _RuntimeDiagnostics.runAndLog();
        _RuntimeDiagnostics.showTestPanel(_RuntimeDiagnostics.formatPanelText(report));
      });
    }
    static checkDataManager(checks) {
      return __async(this, null, function* () {
        const area = "DataManager";
        let dataManager;
        try {
          dataManager = DataManager.getInstance();
          yield dataManager.loadAll();
          _RuntimeDiagnostics.pass(checks, area, "loadAll", "DataManager.loadAll completed");
        } catch (error) {
          _RuntimeDiagnostics.fail(checks, area, "loadAll", "DataManager.loadAll failed", _RuntimeDiagnostics.formatError(error));
          return;
        }
        _RuntimeDiagnostics.checkNoThrow(checks, area, "inventorySnapshot", "Active inventory snapshot is readable", () => {
          const snapshot = dataManager.getInventorySnapshot();
          _RuntimeDiagnostics.assert(Array.isArray(snapshot), "Inventory snapshot is not an array");
          _RuntimeDiagnostics.assert(snapshot.length === dataManager.getPlayerBagSlotCount(), "Inventory slot count mismatch");
          return { slots: snapshot.length, scope: dataManager.getCurrentScope() };
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "warehouseSnapshot", "Warehouse snapshot is readable", () => {
          const snapshot = dataManager.getWarehouseSnapshot();
          _RuntimeDiagnostics.assert(Array.isArray(snapshot), "Warehouse snapshot is not an array");
          _RuntimeDiagnostics.assert(snapshot.length === dataManager.getWarehouseSlotCount(), "Warehouse slot count mismatch");
          return { slots: snapshot.length };
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "playerStats", "Player HP and stamina are valid", () => {
          const stats = dataManager.getPlayerStats();
          _RuntimeDiagnostics.assert(stats.maxHp > 0, "maxHp must be greater than 0");
          _RuntimeDiagnostics.assert(stats.currentHp >= 0 && stats.currentHp <= stats.maxHp, "currentHp is out of range");
          _RuntimeDiagnostics.assert(stats.maxStamina > 0, "maxStamina must be greater than 0");
          _RuntimeDiagnostics.assert(stats.currentStamina >= 0 && stats.currentStamina <= stats.maxStamina, "currentStamina is out of range");
          _RuntimeDiagnostics.assert(stats.level > 0, "level must be greater than 0");
          _RuntimeDiagnostics.assert(stats.nextLevelExperience > 0, "nextLevelExperience must be greater than 0");
          return stats;
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "items", "Common item metadata can be resolved", () => {
          const itemIds = ["wood_club", "wood", "water"];
          const resolved = itemIds.map((itemId) => ({
            itemId,
            exists: !!dataManager.resolveItemMeta(itemId),
            fallbackName: dataManager.resolveFallbackName(itemId),
            fallbackIcon: dataManager.resolveFallbackIcon(itemId)
          }));
          _RuntimeDiagnostics.assert(resolved.some((item) => item.exists), "No common test item metadata was resolved");
          return resolved;
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "harvest", "Harvest drop config is readable", () => {
          const drops = dataManager.getHarvestDrops("oak");
          _RuntimeDiagnostics.assert(Array.isArray(drops), "oak harvest drops are not an array");
          return { oakDropCount: drops.length };
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "crafting", "Crafting recipes are readable", () => {
          const result = {};
          for (let i = 0; i < CRAFTING_STATIONS.length; i++) {
            const station = CRAFTING_STATIONS[i];
            result[station] = dataManager.getCraftingRecipes(station).length;
          }
          return result;
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "signIn", "Sign-in rewards are readable", () => {
          const rewards = dataManager.getSignInRewards();
          _RuntimeDiagnostics.assert(Array.isArray(rewards), "Sign-in rewards are not an array");
          return { rewardCount: rewards.length };
        });
        _RuntimeDiagnostics.checkNoThrow(checks, area, "equipment", "Equipment slots are readable", () => {
          const result = {};
          for (let i = 0; i < EQUIPMENT_SLOTS.length; i++) {
            const slot = EQUIPMENT_SLOTS[i];
            result[slot] = dataManager.getEquippedItem(slot);
          }
          return result;
        });
      });
    }
    static checkPlayerRuntime(checks) {
      var _a;
      const area = "Player";
      const player = PlayerController.activeInstance;
      if (!player) {
        _RuntimeDiagnostics.warn(checks, area, "activeInstance", "No active player in this scene; run again inside a gameplay scene to check player bindings");
        return;
      }
      _RuntimeDiagnostics.pass(checks, area, "activeInstance", "Active player found", { owner: ((_a = player.owner) == null ? void 0 : _a.name) || null });
      _RuntimeDiagnostics.checkNoThrow(checks, area, "snapshot", "Player snapshot is readable", () => player.snapshot());
      _RuntimeDiagnostics.checkMethod(checks, area, player, "syncHpFromData");
      _RuntimeDiagnostics.checkMethod(checks, area, player, "syncStaminaFromData");
      _RuntimeDiagnostics.checkMethod(checks, area, player, "consumeStaminaForCompletedAttack");
      _RuntimeDiagnostics.checkMethod(checks, area, player, "syncStatusBarTransform");
      const requiredNodes = [
        ["spineNode", player.spineNode],
        ["attackNode", player.attackNode],
        ["detectNode", player.detectNode],
        ["hpFillNode", player.hpFillNode],
        ["staminaFillNode", player.staminaFillNode]
      ];
      for (let i = 0; i < requiredNodes.length; i++) {
        const item = requiredNodes[i];
        if (item[1]) {
          _RuntimeDiagnostics.pass(checks, area, item[0], `${item[0]} is bound`);
        } else {
          _RuntimeDiagnostics.fail(checks, area, item[0], `${item[0]} is not bound; drag the node onto the Player prefab`);
        }
      }
      _RuntimeDiagnostics.checkNumericRange(checks, area, "hp", player.currentHp, 0, player.maxHp);
      _RuntimeDiagnostics.checkNumericRange(checks, area, "stamina", player.currentStamina, 0, player.maxStamina);
      _RuntimeDiagnostics.checkNumericRange(checks, area, "attackPower", player.attackPower, 0, Number.POSITIVE_INFINITY);
      _RuntimeDiagnostics.checkNumericRange(checks, area, "attackSpeed", player.attackSpeed, 0.1, Number.POSITIVE_INFINITY);
    }
    static checkCurrentStage(checks) {
      const area = "Stage";
      const stage = Laya.stage;
      if (!stage) {
        _RuntimeDiagnostics.warn(checks, area, "stage", "Laya.stage is missing; start the game before checking scene state");
        return;
      }
      _RuntimeDiagnostics.pass(checks, area, "stage", "Stage is initialized", { width: stage.width, height: stage.height });
      const nodes = _RuntimeDiagnostics.collectNodes(stage);
      _RuntimeDiagnostics.pass(checks, area, "nodeTree", "Node tree can be traversed", { nodeCount: nodes.length });
      const loadingPanels = nodes.filter((node) => String((node == null ? void 0 : node.name) || "").toLowerCase().includes("loadingpanel"));
      if (loadingPanels.length > 1) {
        _RuntimeDiagnostics.fail(checks, area, "loadingPanelCount", "Multiple LoadingPanel nodes exist; duplicated creation or missing destroy is likely", _RuntimeDiagnostics.nodeNames(loadingPanels));
      } else {
        _RuntimeDiagnostics.pass(checks, area, "loadingPanelCount", "No stacked LoadingPanel nodes detected", { count: loadingPanels.length });
      }
      const sceneLikeNodes = nodes.filter((node) => {
        const url = String((node == null ? void 0 : node.url) || "");
        return url.endsWith(".ls");
      });
      if (sceneLikeNodes.length > 1) {
        _RuntimeDiagnostics.warn(checks, area, "sceneCount", "Multiple scene-like nodes are on stage; confirm whether this stacking is expected", _RuntimeDiagnostics.nodeNames(sceneLikeNodes));
      } else {
        _RuntimeDiagnostics.pass(checks, area, "sceneCount", "Stage scene count looks normal", { count: sceneLikeNodes.length });
      }
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "Joystick", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "attack", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "run", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "BagPanel", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "WarehousePanel", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "MailPanel", false);
      _RuntimeDiagnostics.checkComponentPresence(checks, nodes, "CraftingPanel", false);
    }
    static checkPlatformSurface(checks) {
      const area = "Platform";
      const scope = globalThis;
      if (scope.tt) {
        _RuntimeDiagnostics.pass(checks, area, "tt", "Douyin mini-game API object exists");
      } else {
        _RuntimeDiagnostics.warn(checks, area, "tt", "Not running in Douyin mini-game environment; tt API is missing");
      }
    }
    static checkResourceLoads(checks) {
      return __async(this, null, function* () {
        for (let i = 0; i < CONFIG_URLS.length; i++) {
          yield _RuntimeDiagnostics.checkLoad(checks, "Resource:Config", CONFIG_URLS[i], Laya.Loader.JSON);
        }
        for (let i = 0; i < SCENE_URLS.length; i++) {
          yield _RuntimeDiagnostics.checkLoad(checks, "Resource:Scene", SCENE_URLS[i]);
        }
        for (let i = 0; i < PREFAB_URLS.length; i++) {
          yield _RuntimeDiagnostics.checkLoad(checks, "Resource:Prefab", PREFAB_URLS[i]);
        }
      });
    }
    static checkLoad(checks, area, url, type) {
      return __async(this, null, function* () {
        try {
          const result = yield Laya.loader.load(url, null, null, type);
          if (result) {
            _RuntimeDiagnostics.pass(checks, area, url, "Resource loaded");
          } else {
            _RuntimeDiagnostics.warn(checks, area, url, "Loader returned no object; confirm packaging in the runtime environment");
          }
        } catch (error) {
          _RuntimeDiagnostics.fail(checks, area, url, "Resource load failed", _RuntimeDiagnostics.formatError(error));
        }
      });
    }
    static checkNoThrow(checks, area, name, successMessage, action) {
      try {
        const details = action();
        _RuntimeDiagnostics.pass(checks, area, name, successMessage, details);
      } catch (error) {
        _RuntimeDiagnostics.fail(checks, area, name, "Check threw an exception", _RuntimeDiagnostics.formatError(error));
      }
    }
    static checkMethod(checks, area, target, methodName) {
      const method = target[methodName];
      if (typeof method === "function") {
        _RuntimeDiagnostics.pass(checks, area, methodName, `${methodName} method exists`);
      } else {
        _RuntimeDiagnostics.fail(checks, area, methodName, `${methodName} method is missing`);
      }
    }
    static checkNumericRange(checks, area, name, value, min, max) {
      if (Number.isFinite(value) && value >= min && value <= max) {
        _RuntimeDiagnostics.pass(checks, area, name, `${name} value is valid`, { value, min, max });
      } else {
        _RuntimeDiagnostics.fail(checks, area, name, `${name} value is out of range`, { value, min, max });
      }
    }
    static checkComponentPresence(checks, nodes, componentName, required) {
      const matches = nodes.filter((node) => _RuntimeDiagnostics.hasComponentNamed(node, componentName));
      if (matches.length > 0) {
        _RuntimeDiagnostics.pass(checks, "Stage:Component", componentName, `${componentName} is mounted`, _RuntimeDiagnostics.nodeNames(matches));
      } else if (required) {
        _RuntimeDiagnostics.fail(checks, "Stage:Component", componentName, `${componentName} is missing`);
      } else {
        _RuntimeDiagnostics.warn(checks, "Stage:Component", componentName, `${componentName} was not found in this scene; ignore if this scene does not use it`);
      }
    }
    static collectNodes(root) {
      const result = [];
      const stack = [root];
      while (stack.length > 0) {
        const node = stack.pop();
        if (!node) {
          continue;
        }
        result.push(node);
        const children = node._children || node.children || [];
        for (let i = children.length - 1; i >= 0; i--) {
          stack.push(children[i]);
        }
      }
      return result;
    }
    static hasComponentNamed(node, componentName) {
      var _a;
      const components = (node == null ? void 0 : node._components) || [];
      for (let i = 0; i < components.length; i++) {
        const component = components[i];
        const ctorName = String(((_a = component == null ? void 0 : component.constructor) == null ? void 0 : _a.name) || "");
        const scriptName = String((component == null ? void 0 : component.name) || "");
        if (ctorName === componentName || scriptName === componentName) {
          return true;
        }
      }
      return false;
    }
    static nodeNames(nodes) {
      return nodes.map((node) => String((node == null ? void 0 : node.name) || (node == null ? void 0 : node.url) || "(unnamed)"));
    }
    static createReport(startedAtTime, checks) {
      let passed = 0;
      let warnings = 0;
      let failed = 0;
      for (let i = 0; i < checks.length; i++) {
        if (checks[i].status === "pass") {
          passed += 1;
        } else if (checks[i].status === "warn") {
          warnings += 1;
        } else {
          failed += 1;
        }
      }
      return {
        startedAt: new Date(startedAtTime).toISOString(),
        durationMs: Date.now() - startedAtTime,
        passed,
        warnings,
        failed,
        checks
      };
    }
    static logReport(report) {
      console.group(`[FeatureIntegrityTest] pass=${report.passed} warn=${report.warnings} fail=${report.failed} duration=${report.durationMs}ms`);
      for (let i = 0; i < report.checks.length; i++) {
        const check = report.checks[i];
        const details = check.details === void 0 ? "" : ` ${_RuntimeDiagnostics.stringifyDetails(check.details)}`;
        console.log(`${check.status.toUpperCase()} ${check.area}.${check.name}: ${check.message}${details}`);
      }
      console.log(_RuntimeDiagnostics.formatSummaryText(report));
      console.groupEnd();
    }
    static installButtonWhenStageReady() {
      if (_RuntimeDiagnostics.installingButton) {
        return;
      }
      _RuntimeDiagnostics.installingButton = true;
      const tryInstall = /* @__PURE__ */ __name(() => {
        const stage = Laya.stage;
        if (!stage) {
          return;
        }
        _RuntimeDiagnostics.ensureButton();
      }, "tryInstall");
      tryInstall();
      if (Laya.timer) {
        Laya.timer.loop(1e3, _RuntimeDiagnostics, tryInstall);
      }
    }
    static createTestButton(stage) {
      const button = new Laya.Sprite();
      button.name = _RuntimeDiagnostics.TEST_BUTTON_NAME;
      button.size(118, 42);
      button.pos(12, 12);
      button.zOrder = 999999;
      button.mouseEnabled = true;
      button.graphics.drawRect(0, 0, 118, 42, "#111827", "#60a5fa", 2);
      const label = new Laya.Text();
      label.text = "TEST";
      label.color = "#ffffff";
      label.fontSize = 20;
      label.bold = true;
      label.width = 118;
      label.height = 42;
      label.align = "center";
      label.valign = "middle";
      label.mouseEnabled = false;
      button.addChild(label);
      button.on(Laya.Event.CLICK, _RuntimeDiagnostics, _RuntimeDiagnostics.onTestButtonClick);
      stage.addChild(button);
      if (typeof stage.updateZOrder === "function") {
        stage.updateZOrder();
      }
    }
    static onTestButtonClick() {
      return __async(this, null, function* () {
        yield _RuntimeDiagnostics.runFromButton();
      });
    }
    static showTestPanel(text) {
      const stage = Laya.stage;
      if (!stage) {
        return;
      }
      let panel = _RuntimeDiagnostics.findDirectChild(stage, _RuntimeDiagnostics.TEST_PANEL_NAME);
      if (!panel) {
        panel = _RuntimeDiagnostics.createTestPanel();
        stage.addChild(panel);
      }
      panel.zOrder = 999998;
      if (typeof stage.updateZOrder === "function") {
        stage.updateZOrder();
      }
      const body = panel.getChildByName("body");
      if (body) {
        body.text = text;
      }
    }
    static createTestPanel() {
      const panel = new Laya.Sprite();
      panel.name = _RuntimeDiagnostics.TEST_PANEL_NAME;
      panel.size(560, 420);
      panel.pos(12, 62);
      panel.zOrder = 999998;
      panel.mouseEnabled = true;
      panel.graphics.drawRect(0, 0, 560, 420, "#0f172a", "#334155", 2);
      const title = new Laya.Text();
      title.text = "功能完整性测试";
      title.color = "#e5e7eb";
      title.fontSize = 22;
      title.bold = true;
      title.width = 450;
      title.height = 40;
      title.pos(14, 8);
      panel.addChild(title);
      const close = new Laya.Text();
      close.name = "close";
      close.text = "X";
      close.color = "#ffffff";
      close.fontSize = 22;
      close.bold = true;
      close.width = 42;
      close.height = 40;
      close.align = "center";
      close.valign = "middle";
      close.pos(506, 6);
      close.mouseEnabled = true;
      close.on(Laya.Event.CLICK, _RuntimeDiagnostics, () => {
        panel.removeSelf();
        panel.destroy(true);
      });
      panel.addChild(close);
      const body = new Laya.Text();
      body.name = "body";
      body.text = "";
      body.color = "#d1d5db";
      body.fontSize = 18;
      body.width = 532;
      body.height = 350;
      body.wordWrap = true;
      body.leading = 8;
      body.pos(14, 58);
      panel.addChild(body);
      return panel;
    }
    static formatPanelText(report) {
      const problemChecks = report.checks.filter((check) => check.status !== "pass").slice(0, 10);
      const lines = [
        _RuntimeDiagnostics.formatSummaryText(report),
        ""
      ];
      if (problemChecks.length === 0) {
        lines.push("No failed or warning checks.");
      } else {
        for (let i = 0; i < problemChecks.length; i++) {
          const check = problemChecks[i];
          lines.push(`${check.status.toUpperCase()} ${check.area}.${check.name}`);
          lines.push(check.message);
          if (check.details !== void 0) {
            lines.push(_RuntimeDiagnostics.stringifyDetails(check.details).slice(0, 180));
          }
          lines.push("");
        }
      }
      if (report.checks.length > problemChecks.length) {
        lines.push("Full result is also printed in dev console.");
      }
      return lines.join("\n");
    }
    static formatSummaryText(report) {
      const status = report.failed > 0 ? "未通过" : "通过";
      return `最终结论：${status}，错误=${report.failed}，警告=${report.warnings}，通过=${report.passed}，总数=${report.checks.length}，耗时=${report.durationMs}ms`;
    }
    static findDirectChild(parent, name) {
      if (!parent || typeof parent.getChildByName !== "function") {
        return null;
      }
      return parent.getChildByName(name);
    }
    static stringifyDetails(details) {
      if (typeof details === "string") {
        return details;
      }
      try {
        return JSON.stringify(details);
      } catch (e) {
        return String(details);
      }
    }
    static pass(checks, area, name, message, details) {
      checks.push({ area, name, status: "pass", message, details });
    }
    static warn(checks, area, name, message, details) {
      checks.push({ area, name, status: "warn", message, details });
    }
    static fail(checks, area, name, message, details) {
      checks.push({ area, name, status: "fail", message, details });
    }
    static assert(condition, message) {
      if (!condition) {
        throw new Error(message);
      }
    }
    static formatError(error) {
      if (error instanceof Error) {
        return error.stack || error.message;
      }
      return String(error);
    }
  };
  __name(_RuntimeDiagnostics, "RuntimeDiagnostics");
  _RuntimeDiagnostics.ENABLE_RUNTIME_DIAGNOSTICS = false;
  _RuntimeDiagnostics.TEST_BUTTON_NAME = "__FeatureIntegrityTestButton";
  _RuntimeDiagnostics.TEST_PANEL_NAME = "__FeatureIntegrityTestPanel";
  _RuntimeDiagnostics.installingButton = false;
  var RuntimeDiagnostics = _RuntimeDiagnostics;
  installSpineRuntimeGuard();
  RuntimeDiagnostics.install();

  // src/debug/DebugActionsController.ts
  var _DebugActionsController = class _DebugActionsController {
    getActions(selectedScopeId, selectedTypeId) {
      if (selectedScopeId !== "global") {
        return [
          {
            id: "scene.not_ready",
            label: "暂未配置",
            run: /* @__PURE__ */ __name(() => console.warn(`[DebugPanel] ${selectedScopeId}.${selectedTypeId} actions are not configured yet`), "run")
          }
        ];
      }
      const dataManager = DataManager.getInstance();
      const actionsByType = {
        player: [
          {
            id: "global.player.print",
            label: "打印玩家",
            run: /* @__PURE__ */ __name(() => console.info("[DebugPanel] player stats", dataManager.getPlayerStats(), this.getActivePlayerSnapshot()), "run")
          },
          {
            id: "global.player.hp_full",
            label: "HP=满",
            run: /* @__PURE__ */ __name(() => this.setPlayerHpToFull(dataManager), "run")
          },
          {
            id: "global.player.hp_one",
            label: "HP=1",
            run: /* @__PURE__ */ __name(() => this.setPlayerHp(dataManager, 1), "run")
          },
          {
            id: "global.player.stamina_full",
            label: "体力=满",
            run: /* @__PURE__ */ __name(() => this.setPlayerStaminaToFull(dataManager), "run")
          },
          {
            id: "global.player.stamina_zero",
            label: "体力=0",
            run: /* @__PURE__ */ __name(() => this.setPlayerStamina(dataManager, 0), "run")
          },
          {
            id: "global.player.run_stamina_3s",
            label: "测试奔跑10秒",
            run: /* @__PURE__ */ __name(() => this.runStaminaDrainTest(dataManager), "run")
          }
        ],
        inventory: [
          {
            id: "global.inventory.print",
            label: "打印背包",
            run: /* @__PURE__ */ __name(() => console.info("[DebugPanel] inventory", {
              slots: dataManager.getPlayerBagSlotCount(),
              scope: dataManager.getCurrentScope(),
              items: dataManager.getInventorySnapshot()
            }), "run")
          },
          {
            id: "global.inventory.add_wood_1",
            label: "木头x1",
            run: /* @__PURE__ */ __name(() => {
              dataManager.grantItemsToActive([{ itemId: "wood", count: 1 }]);
              console.info("[DebugPanel] inventory after grant", dataManager.getInventorySnapshot());
            }, "run")
          }
        ],
        warehouse: [
          {
            id: "global.warehouse.print",
            label: "打印仓库",
            run: /* @__PURE__ */ __name(() => console.info("[DebugPanel] warehouse", {
              slots: dataManager.getWarehouseSlotCount(),
              items: dataManager.getWarehouseSnapshot()
            }), "run")
          }
        ],
        save: [
          {
            id: "global.save.summary",
            label: "存档摘要",
            run: /* @__PURE__ */ __name(() => console.info("[DebugPanel] save summary", {
              player: dataManager.getPlayerStats(),
              inventoryItems: dataManager.getInventorySnapshot().filter((item) => !!item).length,
              warehouseItems: dataManager.getWarehouseSnapshot().filter((item) => !!item).length,
              equipment: dataManager.getEquippedItems()
            }), "run")
          },
          {
            id: "global.save.reload",
            label: "重新读取",
            run: /* @__PURE__ */ __name(() => __async(this, null, function* () {
              yield dataManager.loadAll();
              console.info("[DebugPanel] reload complete", dataManager.getPlayerStats());
            }), "run")
          }
        ],
        reward: [
          {
            id: "global.reward.signin",
            label: "签到状态",
            run: /* @__PURE__ */ __name(() => __async(this, null, function* () {
              const sync = yield GameTimeService.getInstance().syncServerTime();
              console.info("[DebugPanel] sign in time source", {
                success: sync.success,
                source: sync.source,
                now: new Date(sync.nowMs).toISOString(),
                error: sync.error || ""
              });
              console.info("[DebugPanel] sign in rewards", dataManager.getSignInRewards());
            }), "run")
          },
          {
            id: "global.reward.signin_midnight",
            label: "签到0点测试",
            run: /* @__PURE__ */ __name(() => this.runSignInMidnightTest(dataManager), "run")
          }
        ],
        platform: [
          {
            id: "global.platform.tt",
            label: "检查tt",
            run: /* @__PURE__ */ __name(() => {
              var _a;
              return console.info("[DebugPanel] platform", {
                hasTt: typeof globalThis.tt !== "undefined",
                hasCloud: !!((_a = globalThis.tt) == null ? void 0 : _a.cloud)
              });
            }, "run")
          }
        ],
        integrity: [
          {
            id: "global.integrity.run",
            label: "完整性检查",
            run: /* @__PURE__ */ __name(() => __async(this, null, function* () {
              const report = yield RuntimeDiagnostics.runAndLog();
              console.info("[DebugPanel] integrity summary", {
                pass: report.passed,
                warn: report.warnings,
                fail: report.failed,
                total: report.checks.length
              });
            }), "run")
          }
        ],
        danger: [
          {
            id: "global.danger.disabled",
            label: "暂不开放",
            run: /* @__PURE__ */ __name(() => console.warn("[DebugPanel] danger actions require confirm flow first"), "run")
          }
        ]
      };
      return actionsByType[selectedTypeId] || [];
    }
    setPlayerHpToFull(dataManager) {
      const stats = dataManager.getPlayerStats();
      this.setPlayerHp(dataManager, stats.maxHp);
    }
    setPlayerHp(dataManager, hp) {
      const stats = dataManager.getPlayerStats();
      dataManager.setPlayerHp(hp, stats.maxHp);
      const activePlayer = PlayerController.activeInstance;
      if (activePlayer && typeof activePlayer.syncHpFromData === "function") {
        activePlayer.syncHpFromData();
      }
      console.info("[DebugPanel] player hp updated", dataManager.getPlayerStats());
    }
    setPlayerStaminaToFull(dataManager) {
      const stats = dataManager.getPlayerStats();
      this.setPlayerStamina(dataManager, stats.maxStamina);
    }
    setPlayerStamina(dataManager, stamina) {
      const stats = dataManager.getPlayerStats();
      dataManager.setPlayerStamina(stamina, stats.maxStamina);
      const activePlayer = PlayerController.activeInstance;
      if (activePlayer && typeof activePlayer.syncStaminaFromData === "function") {
        activePlayer.syncStaminaFromData();
      }
      console.info("[DebugPanel] player stamina updated", dataManager.getPlayerStats());
    }
    getActivePlayerSnapshot() {
      const activePlayer = PlayerController.activeInstance;
      if (activePlayer && typeof activePlayer.snapshot === "function") {
        return activePlayer.snapshot();
      }
      return { activePlayer: false };
    }
    runStaminaDrainTest(dataManager) {
      return __async(this, null, function* () {
        var _a;
        const player = PlayerController.activeInstance;
        if (!player) {
          throw new Error("No active PlayerController; enter a gameplay scene first.");
        }
        const joystick = Joystick.instance;
        if (!joystick) {
          throw new Error("No active Joystick; enter a gameplay scene with play_ui first.");
        }
        const runButton = this.findRunButton();
        if (!runButton) {
          throw new Error("No active run button; test must go through the formal run button flow.");
        }
        const previousJoystickX = Number(joystick.valueX) || 0;
        const previousJoystickY = Number(joystick.valueY) || 0;
        const previousRunning = player.isRunning;
        const startStats = dataManager.getPlayerStats();
        const startStamina = Math.max(60, startStats.currentStamina);
        this.setPlayerStamina(dataManager, Math.min(startStats.maxStamina, startStamina));
        joystick.valueX = 1;
        joystick.valueY = 0;
        yield this.clickRunButtonToState(runButton, player, true);
        console.info("[DebugPanel] run stamina test start", dataManager.getPlayerStats(), {
          runButtonOwner: ((_a = runButton.owner) == null ? void 0 : _a.name) || null,
          isRunning: player.isRunning
        });
        try {
          yield this.delay(5e3);
          console.info("[DebugPanel] run stamina test middle", dataManager.getPlayerStats(), player.snapshot());
          yield this.delay(5e3);
          console.info("[DebugPanel] run stamina test end", dataManager.getPlayerStats(), player.snapshot());
        } finally {
          joystick.valueX = previousJoystickX;
          joystick.valueY = previousJoystickY;
          yield this.clickRunButtonToState(runButton, player, previousRunning);
          console.info("[DebugPanel] run stamina test restored", dataManager.getPlayerStats());
        }
      });
    }
    clickRunButtonToState(runButton, player, running) {
      return __async(this, null, function* () {
        if (player.isRunning === running) {
          return;
        }
        const owner = runButton.owner;
        if (!owner) {
          throw new Error("Run button owner is missing.");
        }
        if (typeof owner.event === "function") {
          owner.event(Laya.Event.CLICK);
          yield this.delay(50);
        }
        if (player.isRunning !== running && typeof runButton.onRunClick === "function") {
          runButton.onRunClick();
          yield this.delay(50);
        }
        if (player.isRunning !== running) {
          throw new Error(`Run button did not switch running state to ${running}.`);
        }
      });
    }
    findRunButton() {
      return this.findComponentInTree(Laya.stage, run);
    }
    findComponentInTree(root, componentType) {
      if (!root) {
        return null;
      }
      const component = root.getComponent(componentType);
      if (component) {
        return component;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findComponentInTree(children[i], componentType);
        if (found) {
          return found;
        }
      }
      return null;
    }
    delay(ms) {
      return new Promise((resolve) => {
        Laya.timer.once(ms, this, resolve);
      });
    }
    runSignInMidnightTest(dataManager) {
      const now = /* @__PURE__ */ new Date();
      const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const beforeMidnight = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 23, 59, 59, 999);
      const afterMidnight = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + 1, 0, 0, 0, 0);
      const startDayKey = this.formatDayKey(startDay);
      const before = dataManager.previewSignInUnlock(startDayKey, beforeMidnight);
      const after = dataManager.previewSignInUnlock(startDayKey, afterMidnight);
      const pass = before.unlockedDay === 1 && after.unlockedDay === 2;
      console.info("[DebugPanel] sign in midnight test", {
        pass,
        startDayKey,
        beforeMidnight: before,
        afterMidnight: after,
        rule: "same local date unlocks day 1; next local date at 00:00 unlocks day 2",
        currentTimeSource: GameTimeService.getInstance().getSource()
      });
      if (!pass) {
        throw new Error(`Sign-in midnight rule failed: before=${before.unlockedDay}, after=${after.unlockedDay}`);
      }
    }
    formatDayKey(date) {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    }
  };
  __name(_DebugActionsController, "DebugActionsController");
  var DebugActionsController = _DebugActionsController;

  // src/debug/DebugPanel.ts
  var { regClass: regClass41 } = Laya;
  var DebugPanel = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.actionsController = new DebugActionsController();
      this.scopeItems = [
        { id: "global", label: "全局" },
        { id: "cunzhuang", label: "cunzhuang" },
        { id: "forest", label: "forest" },
        { id: "mine", label: "mine" }
      ];
      this.typeItemsByScope = {
        global: [
          { id: "player", label: "玩家" },
          { id: "inventory", label: "背包" },
          { id: "warehouse", label: "仓库" },
          { id: "save", label: "存档" },
          { id: "reward", label: "奖励" },
          { id: "platform", label: "平台" },
          { id: "integrity", label: "完整性" },
          { id: "danger", label: "危险" }
        ],
        cunzhuang: [
          { id: "player", label: "玩家" },
          { id: "ui", label: "UI" },
          { id: "warehouse", label: "仓库" },
          { id: "crafting", label: "制作" },
          { id: "map", label: "地图" },
          { id: "death", label: "死亡" }
        ],
        forest: [
          { id: "player", label: "玩家" },
          { id: "move", label: "移动" },
          { id: "combat", label: "战斗" },
          { id: "harvest", label: "采集" },
          { id: "inventory", label: "背包" },
          { id: "extract", label: "带出" }
        ],
        mine: [
          { id: "player", label: "玩家" },
          { id: "move", label: "移动" },
          { id: "combat", label: "战斗" },
          { id: "mining", label: "挖矿" },
          { id: "inventory", label: "背包" },
          { id: "extract", label: "带出" }
        ]
      };
      this.sceneListNode = null;
      this.typeListNode = null;
      this.debugListNode = null;
      this.selectedScopeId = "global";
      this.selectedTypeId = "player";
    }
    onAwake() {
      this.resolveBindings();
      this.refreshAll();
    }
    onEnable() {
      this.resolveBindings();
      this.refreshAll();
    }
    resolveBindings() {
      const root = this.owner;
      this.sceneListNode = this.sceneListNode || this.findChildByName(root, "scene");
      this.typeListNode = this.typeListNode || this.findChildByName(root, "type");
      this.debugListNode = this.debugListNode || this.findChildByName(root, "debug");
    }
    refreshAll() {
      this.refreshSceneList();
      this.refreshTypeList();
      this.refreshDebugList();
    }
    refreshSceneList() {
      this.renderList(this.sceneListNode, this.scopeItems.length, (index, node) => {
        this.renderSceneItem(this.scopeItems[index] || null, node);
      });
    }
    refreshTypeList() {
      var _a;
      const items = this.getCurrentTypeItems();
      if (!items.some((item) => item.id === this.selectedTypeId)) {
        this.selectedTypeId = ((_a = items[0]) == null ? void 0 : _a.id) || "";
      }
      this.renderList(this.typeListNode, items.length, (index, node) => {
        this.renderTypeItem(items[index] || null, node);
      });
    }
    refreshDebugList() {
      const items = this.getCurrentDebugActions();
      this.renderList(this.debugListNode, items.length, (index, node) => {
        this.renderDebugItem(items[index] || null, node);
      });
    }
    renderSceneItem(item, node) {
      this.setNodeVisible(node, !!item);
      if (!item) {
        return;
      }
      this.setFirstText(node, item.label);
      this.setNodeAlpha(node, item.id === this.selectedScopeId ? 1 : 0.65);
      const target = node;
      if (target && typeof target.off === "function" && typeof target.on === "function") {
        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.onSceneItemClick);
        target.on(Laya.Event.CLICK, this, this.onSceneItemClick, [item.id]);
      }
    }
    onSceneItemClick(scopeId) {
      var _a;
      this.selectedScopeId = scopeId;
      this.selectedTypeId = ((_a = this.getCurrentTypeItems()[0]) == null ? void 0 : _a.id) || "";
      console.info(`[DebugPanel] selected scope=${scopeId}`);
      this.refreshAll();
    }
    renderTypeItem(item, node) {
      this.setNodeVisible(node, !!item);
      if (!item) {
        return;
      }
      this.setFirstText(node, item.label);
      this.setNodeAlpha(node, item.id === this.selectedTypeId ? 1 : 0.65);
      const target = node;
      if (target && typeof target.off === "function" && typeof target.on === "function") {
        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.onTypeItemClick);
        target.on(Laya.Event.CLICK, this, this.onTypeItemClick, [item.id]);
      }
    }
    onTypeItemClick(typeId) {
      this.selectedTypeId = typeId;
      console.info(`[DebugPanel] selected type=${typeId}`);
      this.refreshTypeList();
      this.refreshDebugList();
    }
    getCurrentTypeItems() {
      return this.typeItemsByScope[this.selectedScopeId] || [];
    }
    renderDebugItem(item, node) {
      this.setNodeVisible(node, !!item);
      if (!item) {
        return;
      }
      this.setFirstText(node, item.label);
      this.setNodeAlpha(node, 1);
      const target = node;
      if (target && typeof target.off === "function" && typeof target.on === "function") {
        target.mouseEnabled = true;
        target.off(Laya.Event.CLICK, this, this.onDebugItemClick);
        target.on(Laya.Event.CLICK, this, this.onDebugItemClick, [item.id]);
      }
    }
    onDebugItemClick(actionId) {
      return __async(this, null, function* () {
        const action = this.getCurrentDebugActions().find((item) => item.id === actionId);
        if (!action) {
          console.warn(`[DebugPanel] action missing: ${actionId}`);
          return;
        }
        try {
          console.info(`[DebugPanel] run action=${actionId}`);
          yield action.run();
          console.info(`[DebugPanel] PASS ${action.label}`);
        } catch (error) {
          console.error(`[DebugPanel] FAIL ${action.label}`, error);
        }
      });
    }
    getCurrentDebugActions() {
      return this.actionsController.getActions(
        this.selectedScopeId,
        this.selectedTypeId
      );
    }
    renderList(listNode, count, renderer) {
      const list = listNode;
      if (!list) {
        console.warn("[DebugPanel] scene list node missing");
        return;
      }
      if (!this.getTemplateNode(listNode)) {
        Laya.timer.callLater(this, () => this.renderList(listNode, count, renderer));
        return;
      }
      if ("itemRenderer" in list) {
        list.itemRenderer = (index, item) => {
          renderer(index, item);
        };
      }
      if ("numItems" in list) {
        list.numItems = count;
      }
      if (typeof list.refresh === "function") {
        list.refresh(true);
      }
      Laya.timer.callLater(this, () => this.renderVisibleListItems(listNode, count, renderer));
    }
    renderVisibleListItems(listNode, count, renderer) {
      const children = listNode && Array.isArray(listNode.children) ? listNode.children : [];
      const templateNode = this.getTemplateNode(listNode);
      let dataIndex = 0;
      for (let i = 0; i < children.length && dataIndex < count; i++) {
        const node = children[i];
        if (!node || node === templateNode) {
          continue;
        }
        renderer(dataIndex, node);
        dataIndex++;
      }
    }
    getTemplateNode(listNode) {
      const list = listNode;
      const explicitTemplate = (list == null ? void 0 : list._templateNode) || (list == null ? void 0 : list.templateNode);
      if (explicitTemplate) {
        return explicitTemplate;
      }
      const children = listNode && Array.isArray(listNode.children) ? listNode.children : [];
      return children[0] || null;
    }
    setFirstText(root, text) {
      const textNode = this.findChildByType(root, "Text");
      if (textNode) {
        textNode.text = text;
      }
    }
    findChildByName(root, name) {
      if (!root) {
        return null;
      }
      if (root.name === name) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByName(children[i], name);
        if (found) {
          return found;
        }
      }
      return null;
    }
    findChildByType(root, typeName) {
      var _a;
      if (!root) {
        return null;
      }
      if (((_a = root.constructor) == null ? void 0 : _a.name) === typeName || root._$type === typeName) {
        return root;
      }
      const children = root.children;
      if (!children) {
        return null;
      }
      for (let i = 0; i < children.length; i++) {
        const found = this.findChildByType(children[i], typeName);
        if (found) {
          return found;
        }
      }
      return null;
    }
    setNodeVisible(node, visible) {
      const target = node;
      if (!target) {
        return;
      }
      if ("visible" in target) {
        target.visible = visible;
      }
      if ("active" in target) {
        target.active = visible;
      }
    }
    setNodeAlpha(node, alpha) {
      const target = node;
      if (target && "alpha" in target) {
        target.alpha = alpha;
      }
    }
  };
  __name(DebugPanel, "DebugPanel");
  DebugPanel = __decorateClass([
    regClass41("bc5cb705-bb50-437e-8787-90153e635b2d", "../src/debug/DebugPanel.ts")
  ], DebugPanel);

  // src/debug/DebugGlobalUI.ts
  var _DebugGlobalUI = class _DebugGlobalUI {
    static install() {
      if (!DebugConfig.ENABLE_DEBUG_UI) {
        _DebugGlobalUI.log("install skipped: debug ui disabled");
        return;
      }
      if (_DebugGlobalUI.installed) {
        _DebugGlobalUI.log("install skipped: already installed");
        _DebugGlobalUI.ensure();
        return;
      }
      _DebugGlobalUI.installed = true;
      _DebugGlobalUI.log(`install start, prefab=${DebugConfig.DEBUG_PANEL_PREFAB_URL}`);
      _DebugGlobalUI.ensureWhenStageReady();
    }
    static ensure() {
      if (!DebugConfig.ENABLE_DEBUG_UI) {
        _DebugGlobalUI.log("ensure skipped: debug ui disabled");
        return;
      }
      if (_DebugGlobalUI.loading) {
        if (!_DebugGlobalUI.hasLoggedLoadingSkip) {
          _DebugGlobalUI.hasLoggedLoadingSkip = true;
          _DebugGlobalUI.log("ensure skipped: prefab is loading");
        }
        return;
      }
      const stage = Laya.stage;
      if (!stage) {
        if (!_DebugGlobalUI.hasLoggedStageMissing) {
          _DebugGlobalUI.hasLoggedStageMissing = true;
          _DebugGlobalUI.log("ensure skipped: Laya.stage is missing");
        }
        return;
      }
      _DebugGlobalUI.hasLoggedStageMissing = false;
      const root = _DebugGlobalUI.ensureRoot(stage);
      if (root.getChildByName(_DebugGlobalUI.PANEL_NAME)) {
        _DebugGlobalUI.ensureToggleButton(root);
        _DebugGlobalUI.keepOnTop(root);
        return;
      }
      _DebugGlobalUI.loading = true;
      _DebugGlobalUI.hasLoggedLoadingSkip = false;
      _DebugGlobalUI.logRootState("start loading prefab", root);
      void _DebugGlobalUI.loadPanel(root);
    }
    static ensureWhenStageReady() {
      const tryEnsure = /* @__PURE__ */ __name(() => _DebugGlobalUI.ensure(), "tryEnsure");
      tryEnsure();
      if (Laya.timer) {
        Laya.timer.loop(1e3, _DebugGlobalUI, tryEnsure);
      }
    }
    static ensureRoot(stage) {
      let root = stage.getChildByName(_DebugGlobalUI.ROOT_NAME);
      if (root) {
        return root;
      }
      root = new Laya.Sprite();
      root.name = _DebugGlobalUI.ROOT_NAME;
      root.zOrder = 999990;
      root.mouseEnabled = true;
      if ("mouseThrough" in root) {
        root.mouseThrough = true;
      }
      root.size(Math.max(1, stage.width || 1334), Math.max(1, stage.height || 750));
      stage.addChild(root);
      _DebugGlobalUI.keepOnTop(root);
      _DebugGlobalUI.logRootState("root created", root);
      return root;
    }
    static loadPanel(root) {
      return __async(this, null, function* () {
        try {
          const loaderType = Laya.Loader && Laya.Loader.HIERARCHY ? Laya.Loader.HIERARCHY : void 0;
          _DebugGlobalUI.log(`loading prefab: url=${DebugConfig.DEBUG_PANEL_PREFAB_URL}, loaderType=${loaderType || "default"}`);
          const prefab = loaderType ? yield Laya.loader.load(DebugConfig.DEBUG_PANEL_PREFAB_URL, null, null, loaderType) : yield Laya.loader.load(DebugConfig.DEBUG_PANEL_PREFAB_URL);
          _DebugGlobalUI.log(`prefab loaded: ${_DebugGlobalUI.describeNode(prefab)}`);
          const panel = _DebugGlobalUI.createPanelFromPrefab(prefab);
          if (!panel) {
            _DebugGlobalUI.warn("prefab loaded, but panel create failed; using fallback panel");
            const fallbackPanel = _DebugGlobalUI.createFallbackPanel("Debug prefab loaded, but create() returned empty.");
            fallbackPanel.visible = _DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
            root.addChild(fallbackPanel);
            _DebugGlobalUI.ensureToggleButton(root);
            _DebugGlobalUI.keepOnTop(root);
            _DebugGlobalUI.logRootState("fallback panel added after create failed", root);
            return;
          }
          panel.name = _DebugGlobalUI.PANEL_NAME;
          panel.x = 20;
          panel.y = 20;
          panel.zOrder = 2;
          panel.visible = _DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
          root.addChild(panel);
          _DebugGlobalUI.ensureToggleButton(root);
          _DebugGlobalUI.keepOnTop(root);
          _DebugGlobalUI.logPanelState("panel added", panel, root);
        } catch (error) {
          console.error("[DebugGlobalUI] load debug panel failed", error);
          const fallbackPanel = _DebugGlobalUI.createFallbackPanel(`Debug prefab load failed: ${error instanceof Error ? error.message : String(error)}`);
          fallbackPanel.visible = _DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
          root.addChild(fallbackPanel);
          _DebugGlobalUI.ensureToggleButton(root);
          _DebugGlobalUI.keepOnTop(root);
          _DebugGlobalUI.logRootState("fallback panel added after load failed", root);
        } finally {
          _DebugGlobalUI.loading = false;
          _DebugGlobalUI.log("load finished");
        }
      });
    }
    static createPanelFromPrefab(prefab) {
      if (!prefab) {
        return null;
      }
      if (typeof prefab.create === "function") {
        return prefab.create();
      }
      if (prefab instanceof Laya.Node) {
        return prefab;
      }
      return null;
    }
    static ensureToggleButton(root) {
      let toggle = root.getChildByName(_DebugGlobalUI.TOGGLE_NAME);
      if (toggle) {
        toggle.zOrder = 3;
        return toggle;
      }
      toggle = new Laya.Sprite();
      toggle.name = _DebugGlobalUI.TOGGLE_NAME;
      toggle.pos(20, 20);
      toggle.size(86, 36);
      toggle.zOrder = 3;
      toggle.mouseEnabled = true;
      toggle.graphics.drawRect(0, 0, 86, 36, "#111827", "#ffffff", 1);
      const label = new Laya.Text();
      label.name = "Label";
      label.text = "DEBUG";
      label.color = "#ffffff";
      label.fontSize = 18;
      label.bold = true;
      label.width = 86;
      label.height = 36;
      label.align = "center";
      label.valign = "middle";
      label.mouseEnabled = false;
      toggle.addChild(label);
      toggle.on(Laya.Event.CLICK, _DebugGlobalUI, _DebugGlobalUI.togglePanel);
      root.addChild(toggle);
      _DebugGlobalUI.log("toggle button added: x=20, y=20, w=86, h=36");
      return toggle;
    }
    static togglePanel() {
      const root = Laya.stage && Laya.stage.getChildByName(_DebugGlobalUI.ROOT_NAME);
      const panel = root && root.getChildByName(_DebugGlobalUI.PANEL_NAME);
      if (!panel) {
        _DebugGlobalUI.warn("toggle clicked, but debug panel is missing");
        return;
      }
      panel.visible = !panel.visible;
      _DebugGlobalUI.keepOnTop(root);
      _DebugGlobalUI.log(`panel visible=${panel.visible}`);
    }
    static createFallbackPanel(message) {
      const panel = new Laya.Sprite();
      panel.name = _DebugGlobalUI.PANEL_NAME;
      panel.pos(20, 20);
      panel.size(520, 120);
      panel.zOrder = 2;
      panel.mouseEnabled = true;
      panel.graphics.drawRect(0, 0, 520, 120, "#7f1d1d", "#fca5a5", 2);
      const text = new Laya.Text();
      text.name = "Text";
      text.text = message;
      text.color = "#ffffff";
      text.fontSize = 20;
      text.width = 500;
      text.height = 100;
      text.wordWrap = true;
      text.leading = 6;
      text.pos(10, 10);
      panel.addChild(text);
      return panel;
    }
    static keepOnTop(root) {
      const stage = Laya.stage;
      if (!stage || !root) {
        return;
      }
      root.zOrder = 999990;
      if (typeof root.size === "function") {
        root.size(Math.max(1, stage.width || 1334), Math.max(1, stage.height || 750));
      }
      if (root.parent !== stage) {
        stage.addChild(root);
      }
      if (typeof stage.updateZOrder === "function") {
        stage.updateZOrder();
      }
    }
    static log(message) {
      console.info(`${_DebugGlobalUI.LOG_PREFIX} ${message}`);
    }
    static warn(message) {
      console.warn(`${_DebugGlobalUI.LOG_PREFIX} ${message}`);
    }
    static logRootState(message, root) {
      const stage = Laya.stage;
      _DebugGlobalUI.log(`${message}: stage=${_DebugGlobalUI.describeNode(stage)}, root=${_DebugGlobalUI.describeNode(root)}, rootChildren=${root && root.numChildren}`);
    }
    static logPanelState(message, panel, root) {
      _DebugGlobalUI.log(`${message}: panel=${_DebugGlobalUI.describeNode(panel)}, parent=${panel && panel.parent && panel.parent.name}, rootChildren=${root && root.numChildren}`);
    }
    static describeNode(node) {
      if (!node) {
        return "null";
      }
      const name = node.name || "(no name)";
      const type = node.constructor && node.constructor.name ? node.constructor.name : typeof node;
      const x = typeof node.x === "number" ? node.x : "n/a";
      const y = typeof node.y === "number" ? node.y : "n/a";
      const width = typeof node.width === "number" ? node.width : "n/a";
      const height = typeof node.height === "number" ? node.height : "n/a";
      const zOrder = typeof node.zOrder === "number" ? node.zOrder : "n/a";
      const visible = typeof node.visible === "boolean" ? node.visible : "n/a";
      return `${type}(name=${name}, x=${x}, y=${y}, w=${width}, h=${height}, zOrder=${zOrder}, visible=${visible})`;
    }
  };
  __name(_DebugGlobalUI, "DebugGlobalUI");
  _DebugGlobalUI.ROOT_NAME = "__DebugGlobalRoot";
  _DebugGlobalUI.PANEL_NAME = "__DebugPanel";
  _DebugGlobalUI.TOGGLE_NAME = "__DebugToggle";
  _DebugGlobalUI.PANEL_DEFAULT_VISIBLE = false;
  _DebugGlobalUI.loading = false;
  _DebugGlobalUI.installed = false;
  _DebugGlobalUI.hasLoggedStageMissing = false;
  _DebugGlobalUI.hasLoggedLoadingSkip = false;
  _DebugGlobalUI.LOG_PREFIX = "[DebugGlobalUI]";
  var DebugGlobalUI = _DebugGlobalUI;

  // src/debug/DebugBootstrap.ts
  var { regClass: regClass42 } = Laya;
  var DebugBootstrap = class extends Laya.Script {
    onAwake() {
      if (!DebugConfig.ENABLE_DEBUG_UI) {
        return;
      }
      DebugGlobalUI.install();
    }
    onEnable() {
      if (!DebugConfig.ENABLE_DEBUG_UI) {
        return;
      }
      DebugGlobalUI.ensure();
    }
  };
  __name(DebugBootstrap, "DebugBootstrap");
  DebugBootstrap = __decorateClass([
    regClass42("74505597-ffcd-42bf-a41c-a619d3876601", "../src/debug/DebugBootstrap.ts")
  ], DebugBootstrap);

  // src/douyin/AddDesktopButton.ts
  var { regClass: regClass43, property: property35 } = Laya;
  var AddDesktopButton = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.buttonNode = null;
    }
    onEnable() {
      if (!this.buttonNode) {
        console.error("[AddDesktop] 没有绑定按钮节点");
        return;
      }
      this.buttonNode.on(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    onDisable() {
      if (!this.buttonNode) {
        return;
      }
      this.buttonNode.off(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    onClick() {
      console.log("[AddDesktop] 玩家点击添加到桌面");
      this.addDesktop();
    }
    addDesktop() {
      const tt2 = globalThis.tt;
      if (!tt2) {
        console.error(
          "[AddDesktop] 当前不是抖音小游戏环境"
        );
        return;
      }
      if (typeof tt2.addShortcut !== "function") {
        console.error(
          "[AddDesktop] 当前环境不支持 addShortcut"
        );
        return;
      }
      tt2.addShortcut({
        success: /* @__PURE__ */ __name((res) => {
          console.log(
            "[AddDesktop] 添加桌面成功",
            res
          );
        }, "success"),
        fail: /* @__PURE__ */ __name((err) => {
          console.error(
            "[AddDesktop] 添加桌面失败",
            err
          );
        }, "fail"),
        complete: /* @__PURE__ */ __name((res) => {
          console.log(
            "[AddDesktop] 添加桌面流程结束",
            res
          );
        }, "complete")
      });
    }
  };
  __name(AddDesktopButton, "AddDesktopButton");
  __decorateClass([
    property35(Laya.Node)
  ], AddDesktopButton.prototype, "buttonNode", 2);
  AddDesktopButton = __decorateClass([
    regClass43("01a5fb0e-cb2e-46ce-aa80-cf85c829b7c6", "../src/douyin/AddDesktopButton.ts")
  ], AddDesktopButton);

  // src/douyin/RewardedAdButton.ts
  var { regClass: regClass44, property: property36 } = Laya;
  var RewardedAdButton = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.buttonNode = null;
      this.adUnitId = "";
      this.rewardEventName = "rewarded-ad-completed";
      this.preloadOnEnable = true;
      this.ad = null;
      this.boundButton = null;
      this.showing = false;
      this.pendingResolve = null;
    }
    onAwake() {
      this.bindClick();
    }
    onEnable() {
      this.bindClick();
      if (this.preloadOnEnable) {
        this.createAd();
      }
    }
    onDisable() {
      this.unbindClick();
    }
    onDestroy() {
      var _a, _b;
      this.unbindClick();
      this.finish(false);
      (_b = (_a = this.ad) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
      this.ad = null;
    }
    bindClick() {
      this.unbindClick();
      const button = this.buttonNode || this.owner;
      if (!button) {
        return;
      }
      this.boundButton = button;
      button.mouseEnabled = true;
      if ("mouseThrough" in button) {
        button.mouseThrough = false;
      }
      if (typeof button.onClick === "function") {
        button.onClick(this, this.onClick);
      } else {
        button.on(Laya.Event.CLICK, this, this.onClick);
      }
    }
    unbindClick() {
      if (!this.boundButton) {
        return;
      }
      if (typeof this.boundButton.offClick === "function") {
        this.boundButton.offClick(this, this.onClick);
      } else {
        this.boundButton.off(Laya.Event.CLICK, this, this.onClick);
      }
      this.boundButton = null;
    }
    onClick() {
      void this.showRewardedAd();
    }
    showRewardedAd() {
      return __async(this, null, function* () {
        if (this.showing) {
          return false;
        }
        const ad = this.createAd();
        if (!ad) {
          return false;
        }
        this.showing = true;
        try {
          yield this.showAd(ad);
          return yield new Promise((resolve) => {
            this.pendingResolve = resolve;
          });
        } catch (error) {
          console.error("[RewardedAdButton] show rewarded ad failed", error);
          this.finish(false);
          this.ad = null;
          return false;
        }
      });
    }
    showAd(ad) {
      return __async(this, null, function* () {
        try {
          yield Promise.resolve(ad.show());
        } catch (e) {
          yield Promise.resolve(ad.load());
          yield Promise.resolve(ad.show());
        }
      });
    }
    createAd() {
      var _a, _b;
      if (this.ad) {
        return this.ad;
      }
      const tt2 = globalThis.tt;
      if (!tt2 || typeof tt2.createRewardedVideoAd !== "function") {
        console.error("[RewardedAdButton] tt.createRewardedVideoAd is unavailable");
        return null;
      }
      const adUnitId = String(this.adUnitId || "").trim();
      if (!adUnitId) {
        console.error("[RewardedAdButton] adUnitId is empty");
        return null;
      }
      const ad = tt2.createRewardedVideoAd({ adUnitId });
      if (!ad) {
        console.error("[RewardedAdButton] createRewardedVideoAd returned empty ad");
        return null;
      }
      this.ad = ad;
      (_a = ad.onClose) == null ? void 0 : _a.call(ad, (result) => {
        var _a2;
        const completed = !!result && result.isEnded === true;
        this.finish(completed);
        if (completed) {
          (_a2 = this.createAd()) == null ? void 0 : _a2.load();
        }
      });
      (_b = ad.onError) == null ? void 0 : _b.call(ad, (error) => {
        console.error("[RewardedAdButton] rewarded ad error", error);
        this.finish(false);
        this.ad = null;
      });
      try {
        ad.load();
      } catch (error) {
        console.error("[RewardedAdButton] preload rewarded ad failed", error);
      }
      return ad;
    }
    finish(completed) {
      var _a, _b;
      this.showing = false;
      const resolve = this.pendingResolve;
      this.pendingResolve = null;
      if (resolve) {
        resolve(completed);
      }
      if (completed && this.rewardEventName) {
        (_b = (_a = this.owner) == null ? void 0 : _a.event) == null ? void 0 : _b.call(_a, this.rewardEventName, completed);
      }
    }
  };
  __name(RewardedAdButton, "RewardedAdButton");
  __decorateClass([
    property36(Laya.Node)
  ], RewardedAdButton.prototype, "buttonNode", 2);
  __decorateClass([
    property36(String)
  ], RewardedAdButton.prototype, "adUnitId", 2);
  __decorateClass([
    property36(String)
  ], RewardedAdButton.prototype, "rewardEventName", 2);
  __decorateClass([
    property36(Boolean)
  ], RewardedAdButton.prototype, "preloadOnEnable", 2);
  RewardedAdButton = __decorateClass([
    regClass44("9c1f431e-702b-42bf-90f0-04f0f7e01a13", "../src/douyin/RewardedAdButton.ts")
  ], RewardedAdButton);

  // src/douyin/SubscribeButton.ts
  var { regClass: regClass45, property: property37 } = Laya;
  var SubscribeButton = class extends Laya.Script {
    constructor() {
      super(...arguments);
      this.buttonNode = null;
      this.templateId = "";
    }
    onEnable() {
      if (!this.buttonNode) {
        console.error("[Subscribe] 未绑定按钮");
        return;
      }
      this.buttonNode.on(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    onDisable() {
      if (!this.buttonNode) {
        return;
      }
      this.buttonNode.off(
        Laya.Event.CLICK,
        this,
        this.onClick
      );
    }
    onClick() {
      console.log("[Subscribe] 点击订阅按钮");
      if (typeof tt === "undefined") {
        console.error("[Subscribe] 当前不是抖音小游戏环境");
        return;
      }
      if (typeof tt.requestSubscribeMessage !== "function") {
        console.error("[Subscribe] 当前不支持订阅消息");
        return;
      }
      if (!this.templateId) {
        console.error("[Subscribe] templateId 未配置");
        return;
      }
      tt.requestSubscribeMessage({
        tmplIds: [this.templateId],
        success: /* @__PURE__ */ __name((res) => {
          console.log("[Subscribe] 订阅结果:", res);
          const result = res[this.templateId];
          if (result === "accept") {
            console.log("[Subscribe] 用户同意订阅");
          } else if (result === "reject") {
            console.log("[Subscribe] 用户拒绝订阅");
          } else {
            console.log("[Subscribe] 订阅状态:", result);
          }
        }, "success"),
        fail: /* @__PURE__ */ __name((err) => {
          console.error("[Subscribe] 订阅失败:", err);
        }, "fail")
      });
    }
  };
  __name(SubscribeButton, "SubscribeButton");
  __decorateClass([
    property37(Laya.Node)
  ], SubscribeButton.prototype, "buttonNode", 2);
  __decorateClass([
    property37(String)
  ], SubscribeButton.prototype, "templateId", 2);
  SubscribeButton = __decorateClass([
    regClass45("13b8da6b-cda3-4de5-9390-45c2a8752821", "../src/douyin/SubscribeButton.ts")
  ], SubscribeButton);

  // src/harvestable/branches.ts
  var { regClass: regClass46 } = Laya;
  var branches = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_branches",
        name: "branches",
        displayName: "小树枝堆",
        action: "search",
        interactTime: 1e3,
        once: true,
        range: 160,
        sequence: [
          { animation: "search/search_start", duration: 816, loop: false },
          { animation: "search/search_loop", duration: 2983, loop: true },
          { animation: "search/search_end", duration: 816, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_branches", [
          {
            itemId: "xiaoshuzhi",
            label: "小树枝",
            minCount: 1,
            maxCount: 3,
            probability: 1
          }
        ])
      };
    }
  };
  __name(branches, "branches");
  branches = __decorateClass([
    regClass46("e5ddcc78-f8a4-4896-b76a-a2652f821513", "../src/harvestable/branches.ts")
  ], branches);

  // src/harvestable/bush.ts
  var { regClass: regClass47 } = Laya;
  var bush = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_bush",
        name: "bush",
        displayName: "灌木",
        action: "search",
        interactTime: 1e3,
        once: true,
        range: 160,
        sequence: [
          { animation: "search/search_start", duration: 816, loop: false },
          { animation: "search/search_loop", duration: 2983, loop: true },
          { animation: "search/search_end", duration: 816, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_bush", [
          {
            itemId: "grass",
            label: "草",
            minCount: 2,
            maxCount: 3,
            probability: 0.9,
            countWeights: [
              { count: 2, probability: 0.5 },
              { count: 3, probability: 0.5 }
            ]
          },
          {
            itemId: "xiaoshuzhi",
            label: "小树枝",
            minCount: 1,
            maxCount: 2,
            probability: 0.8,
            countWeights: [
              { count: 1, probability: 0.4 },
              { count: 2, probability: 0.2 }
            ]
          },
          {
            itemId: "food_material_01",
            label: "浆果",
            minCount: 1,
            maxCount: 2,
            probability: 0.8,
            countWeights: [
              { count: 1, probability: 0.5 },
              { count: 2, probability: 0.3 }
            ]
          },
          {
            itemId: "yaocao",
            label: "药草",
            minCount: 1,
            maxCount: 1,
            probability: 0.3
          }
        ])
      };
    }
  };
  __name(bush, "bush");
  bush = __decorateClass([
    regClass47("52449e7d-e786-42d6-b694-4aec22306a71", "../src/harvestable/bush.ts")
  ], bush);

  // src/harvestable/dig.ts
  var { regClass: regClass48 } = Laya;
  var dig2 = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_dig",
        name: "dig",
        displayName: "矿点",
        action: "dig",
        interactTime: 3201,
        once: true,
        range: 170,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_dig", [])
      };
    }
  };
  __name(dig2, "dig");
  dig2 = __decorateClass([
    regClass48("f8822b1b-733c-43fd-b449-f8d36740a13a", "../src/harvestable/dig.ts")
  ], dig2);

  // src/harvestable/l1_kuang.ts
  var { regClass: regClass49 } = Laya;
  var l1_kuang = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_l1_kuang",
        name: "l1-kuang",
        displayName: "L1矿",
        action: "dig",
        interactTime: 3201,
        once: true,
        range: 160,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_l1_kuang", [
          {
            itemId: "shitou",
            label: "石头",
            minCount: 2,
            maxCount: 4,
            probability: 1,
            countWeights: [
              { count: 2, probability: 0.4 },
              { count: 3, probability: 0.5 },
              { count: 4, probability: 0.1 }
            ]
          },
          {
            itemId: "iron",
            label: "铁",
            minCount: 1,
            maxCount: 3,
            probability: 1,
            countWeights: [
              { count: 1, probability: 0.2 },
              { count: 2, probability: 0.5 },
              { count: 3, probability: 0.3 }
            ]
          }
        ])
      };
    }
  };
  __name(l1_kuang, "l1_kuang");
  l1_kuang = __decorateClass([
    regClass49("5c239f2c-1470-45a7-988c-34ecf873d447", "../src/harvestable/l1_kuang.ts")
  ], l1_kuang);

  // src/harvestable/l2_kuang.ts
  var { regClass: regClass50 } = Laya;
  var l2_kuang = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_l2_kuang",
        name: "l2-kuang",
        displayName: "L2矿",
        action: "dig",
        interactTime: 3201,
        once: true,
        range: 160,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_l2_kuang", [
          {
            itemId: "iron",
            label: "铁",
            minCount: 1,
            maxCount: 3,
            probability: 1,
            countWeights: [
              { count: 1, probability: 0.2 },
              { count: 2, probability: 0.5 },
              { count: 3, probability: 0.3 }
            ]
          },
          {
            itemId: "copper",
            label: "铜",
            minCount: 1,
            maxCount: 3,
            probability: 0.5,
            countWeights: [
              { count: 1, probability: 0.5 },
              { count: 2, probability: 0.3 },
              { count: 3, probability: 0.2 }
            ]
          },
          {
            itemId: "liuhuang",
            label: "硫磺",
            minCount: 1,
            maxCount: 2,
            probability: 0.2,
            countWeights: [
              { count: 1, probability: 0.7 },
              { count: 2, probability: 0.3 }
            ]
          },
          {
            itemId: "mutan",
            label: "煤",
            minCount: 1,
            maxCount: 2,
            probability: 0.3,
            countWeights: [
              { count: 1, probability: 0.7 },
              { count: 2, probability: 0.3 }
            ]
          }
        ])
      };
    }
  };
  __name(l2_kuang, "l2_kuang");
  l2_kuang = __decorateClass([
    regClass50("0d7f7b56-a74b-475f-9aa6-5184352e30a8", "../src/harvestable/l2_kuang.ts")
  ], l2_kuang);

  // src/harvestable/l3_kuang.ts
  var { regClass: regClass51 } = Laya;
  var l3_kuang = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_l3_kuang",
        name: "l3-kuang",
        displayName: "L3矿",
        action: "dig",
        interactTime: 3201,
        once: true,
        range: 160,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_l3_kuang", [
          {
            itemId: "xiyoujinshu",
            label: "稀有金属",
            minCount: 1,
            maxCount: 2,
            probability: 1,
            countWeights: [
              { count: 1, probability: 0.7 },
              { count: 2, probability: 0.3 }
            ]
          },
          {
            itemId: "tezhonghejin",
            label: "特种合金",
            minCount: 1,
            maxCount: 1,
            probability: 0.15
          }
        ])
      };
    }
  };
  __name(l3_kuang, "l3_kuang");
  l3_kuang = __decorateClass([
    regClass51("6c87a749-39d6-4bb5-b032-94e3f790eb25", "../src/harvestable/l3_kuang.ts")
  ], l3_kuang);

  // src/harvestable/mound.ts
  var { regClass: regClass52 } = Laya;
  var mound = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_mound",
        name: "mound",
        displayName: "土堆",
        action: "search",
        interactTime: 1e3,
        once: true,
        range: 160,
        sequence: [
          { animation: "search/search_start", duration: 816, loop: false },
          { animation: "search/search_loop", duration: 2983, loop: true },
          { animation: "search/search_end", duration: 816, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_mound", [
          { itemId: "base_material_10", label: "矿渣", minCount: 1, maxCount: 1, probability: 0.35 },
          { itemId: "xiaoshuzhi", label: "小树枝", minCount: 1, maxCount: 1, probability: 0.35 },
          { itemId: "common_material_02", label: "石头", minCount: 1, maxCount: 1, probability: 0.3 }
        ])
      };
    }
  };
  __name(mound, "mound");
  mound = __decorateClass([
    regClass52("87527e24-a0ae-4fda-a2f6-8d7c3001575b", "../src/harvestable/mound.ts")
  ], mound);

  // src/harvestable/oak.ts
  var { regClass: regClass53 } = Laya;
  var oak = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_oak",
        name: "oak",
        displayName: "橡树",
        action: "chop",
        interactTime: 1e3,
        once: true,
        range: 180,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_oak", [
          {
            itemId: "xiaoshuzhi",
            label: "小树枝",
            minCount: 2,
            maxCount: 4,
            probability: 1
          }
        ])
      };
    }
  };
  __name(oak, "oak");
  oak = __decorateClass([
    regClass53("02505adb-0d3a-4cde-a150-7c95fa6c937a", "../src/harvestable/oak.ts")
  ], oak);

  // src/harvestable/pine.ts
  var { regClass: regClass54 } = Laya;
  var pine = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_pine",
        name: "pine",
        displayName: "松树",
        action: "chop",
        interactTime: 1e3,
        once: true,
        range: 180,
        sequence: [
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
          { animation: "attack/attack_melee_swing", duration: 1067, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_pine", [
          {
            itemId: "wood",
            label: "木头",
            minCount: 2,
            maxCount: 3,
            probability: 1,
            countWeights: [
              { count: 2, probability: 0.5 },
              { count: 3, probability: 0.5 }
            ]
          },
          {
            itemId: "shupi",
            label: "树皮",
            minCount: 1,
            maxCount: 1,
            probability: 0.2
          },
          {
            itemId: "xiaoshuzhi",
            label: "小树枝",
            minCount: 1,
            maxCount: 1,
            probability: 0.2
          }
        ])
      };
    }
  };
  __name(pine, "pine");
  pine = __decorateClass([
    regClass54("2736c8a8-d5f3-47ee-9618-6679033b3be9", "../src/harvestable/pine.ts")
  ], pine);

  // src/harvestable/stones.ts
  var { regClass: regClass55 } = Laya;
  var stones = class extends HarvestableBase {
    getConfig() {
      return {
        id: "harvestable_stones",
        name: "stones",
        displayName: "石堆",
        action: "search",
        interactTime: 1e3,
        once: true,
        range: 160,
        sequence: [
          { animation: "search/search_start", duration: 816, loop: false },
          { animation: "search/search_loop", duration: 2983, loop: true },
          { animation: "search/search_end", duration: 816, loop: false }
        ],
        drops: DataManager.getInstance().getHarvestDrops("harvestable_stones", [
          {
            itemId: "common_material_02",
            label: "石头",
            minCount: 2,
            maxCount: 4,
            probability: 1
          }
        ])
      };
    }
  };
  __name(stones, "stones");
  stones = __decorateClass([
    regClass55("3a5a9258-ae48-4a4b-bdb4-7dc7b956f9dc", "../src/harvestable/stones.ts")
  ], stones);
})();
//# sourceMappingURL=bundle.js.map
