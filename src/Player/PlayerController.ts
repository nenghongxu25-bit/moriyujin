const { regClass, property } = Laya;

import { PlayerMovementController } from "./PlayerMovementController";
import { PlayerUIHints } from "./PlayerUIHints";
import { PlayerCombatController } from "./PlayerCombatController";
import type { PlayerAttackOptions } from "./PlayerCombatController";
import { PlayerAnimationController } from "./PlayerAnimationController";
import { PlayerEquipmentVisualController } from "./PlayerEquipmentVisualController";
import { PlayerRangedController } from "./PlayerRangedController";
import { DataManager } from "../systems/datamanager";
import { installSpineRuntimeGuard } from "../runtime/SpineRuntimeGuard";
import { RunResultPanel } from "../PlayUI/RunResult/RunResultPanel";

installSpineRuntimeGuard();

@regClass()
export class PlayerController extends Laya.Script {
    public static activeInstance: PlayerController | null = null;
    private static readonly throwableExplosionFrames = [0, 1, 2, 3].map((index) =>
        `atlas/picture/effects/combat-vfx-samples/grenade_explosion_f0${index}.png`);
    private static throwableExplosionFramesPromise: Promise<Laya.Texture[]> | null = null;
    private static throwableEffectFrames = new Map<string, Promise<Laya.Texture[]>>();
    private static molotovFireFramesPromise: Promise<Laya.Texture[]> | null = null;
    private readonly smokeSoundSessions = new Set<{stopped:boolean;channels:Set<Laya.SoundChannel>;previous:Laya.SoundChannel|null}>();

    @property(Number)
    public walkSpeed: number = 200;

    @property(Number)
    public runSpeed: number = 320;

    @property(Number)
    public moveSpeed: number = 0;

    @property(Number)
    public tileBlockHalfWidth: number = 48;
    @property({type:Number,caption:'脚底碰撞前后半径'})
    public tileBlockHalfDepth: number = 28;

    @property(Number)
    public tileBlockFootOffsetY: number = 80;


    @property(Boolean)
    public footstepSoundEnabled: boolean = true;

    @property(String)
    public cunzhuangWalkSoundUrl: string = "sound/sfx/walk/walk_wood.mp3";

    @property(String)
    public cunzhuangRunSoundUrl: string = "sound/sfx/run/run_wood.mp3";

    @property(String)
    public forestWalkSoundUrl: string = "sound/sfx/walk/walk_grass.mp3";

    @property(String)
    public forestRunSoundUrl: string = "sound/sfx/run/run_grass.mp3";

    @property(String)
    public mineWalkSoundUrl: string = "sound/sfx/walk/walk_floor.wav";

    @property(String)
    public mineRunSoundUrl: string = "sound/sfx/run/run_inside_floor.mp3";

    @property(Number)
    public walkFootstepInterval: number = 420;

    @property(Number)
    public runFootstepInterval: number = 300;

    @property(Number)
    public walkFootstepPlaybackRate: number = 1;

    @property(Number)
    public runFootstepPlaybackRate: number = 1;

    @property(Number)
    public footstepPlaybackRateVariance: number = 0;

    @property(Boolean)
    public isRunning: boolean = false;

    @property(Laya.Node)
    public joystickNode: Laya.Node | null = null;

    @property(Laya.Node)
    public spineNode: Laya.Node | null = null;

    @property(Laya.Node)
    public attackNode: Laya.Node | null = null;

    @property(Laya.Node)
    public detectNode: Laya.Node | null = null;

    @property(Laya.Node)
    public stateText: Laya.Node | null = null;

    @property(Laya.Node)
    public itemText: Laya.Node | null = null;

    @property(Laya.Node)
    public hpFillNode: Laya.Node | null = null;

    @property(Laya.Node)
    public hpBarNode: Laya.Node | null = null;

    @property(Laya.Node)
    public staminaFillNode: Laya.Node | null = null;

    @property(Laya.Node)
    public staminaBarNode: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponSlotNode: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponIconNode: Laya.Node | null = null;

    @property(Laya.Node)
    public rangedWeaponRootNode: Laya.Node | null = null;

    @property(Laya.Node)
    public rangedWeaponImageNode: Laya.Node | null = null;

    @property(String)
    public weaponSpineSlotName: string = "";

    @property(String)
    public weaponMeleeSpineSlotName: string = "weapon_melee_slot";

    @property(String)
    public weaponRangedSpineSlotName: string = "weapon_ranged_slot";

    @property(String)
    public insertPlateSpineSlotName: string = "";

    @property(String)
    public helmetSpineSlotName: string = "";

    @property(String)
    public armorSpineSlotName: string = "";

    @property(Number)
    public currentHp: number = 100;

    @property(Number)
    public maxHp: number = 100;

    @property(Number)
    public hpFillFullWidth: number = 70;

    @property(Number)
    public currentStamina: number = 150;

    @property(Number)
    public maxStamina: number = 150;

    @property(Number)
    public runRecoverStaminaThreshold: number = 30;

    @property(Number)
    public staminaFillFullWidth: number = 70;

    @property(Number)
    public hpBarRightX: number = -35;

    @property(Number)
    public hpBarLeftX: number = 35;

    @property(Number)
    public staminaBarRightX: number = -35;

    @property(Number)
    public staminaBarLeftX: number = 35;

    @property(String)
    public deathReturnSceneUrl: string = "scenes/cunzhuang.ls";

    @property(Number)
    public initialFacingSign: number = 1;

    @property(Number)
    public attackAreaRightX: number = -100;

    @property(Number)
    public attackAreaLeftX: number = 0;

    @property(Number)
    public attackCooldown: number = 300;

    @property(Number)
    public attackPower: number = 10;

    @property(Number)
    public baseAttackPower: number = 10;

    @property(Number)
    public attackSpeed: number = 1;

    @property(Number)
    public attackDamageRange: number = 120;

    @property(Number)
    public attackHitboxShowDelay: number = 0;

    @property(Number)
    public attackHitboxVisibleDuration: number = 200;

    @property(Number)
    public rangedAttackRange: number = 520;

    @property(Number)
    public rangedAttackWidth: number = 90;

    @property(Number)
    public rangedAttackHitDelay: number = 220;

    @property(String)
    public rangedAttackSoundUrl: string = "sound/sfx/weapon/ranged/akm/akm_singleshot.mp3";

    @property(Number)
    public rangedWeaponAimRotationOffset: number = 0;

    @property(Number)
    public rangedChargeDuration: number = 900;

    @property(Number)
    public rangedMinDamageMultiplier: number = 0.75;

    @property(Number)
    public rangedMaxDamageMultiplier: number = 2;

    @property(String)
    public rangedBulletTextureUrl: string = "res://atlas/picture/ui/zidan.png";

    @property(Number)
    public rangedBulletSpeed: number = 900;

    @property(Number)
    public rangedBulletScale: number = 1;

    @property(Number)
    public rangedBulletRotationOffset: number = 0;

    @property(Number)
    public rangedBulletSpawnOffsetX: number = 0;

    @property(Number)
    public rangedBulletSpawnOffsetY: number = 0;

    @property(String)
    public idleAnimation: string = "idle/idle_melee_swing";

    @property(String)
    public walkAnimation: string = "walk/walk_body_lower";

    @property(String)
    public runAnimation: string = "run/run_body_lower";

    @property({ type: Number, caption: "Run Animation Rate", tips: "Playback rate used only by the player run Spine locomotion animation." })
    public runAnimationPlaybackRate: number = 1.3;

    @property(String)
    public attackAnimation: string = "attack/attack_melee_swing";

    @property(String)
    public rangedAttackAnimation: string = "attack/attack_ranged_firearm";

    @property(Boolean)
    public layeredSpineAnimationEnabled: boolean = true;

    @property(String)
    public upperIdleAnimation: string = "idle/idle_melee_swing";

    @property(String)
    public upperWalkAnimation: string = "walk/walk_body_upper_melee_swing";

    @property(String)
    public upperRunAnimation: string = "run/run_body_upper_melee_swing";

    @property(String)
    public rangedUpperIdleAnimation: string = "idle/idle_ranged_firearm";

    @property(String)
    public rangedUpperWalkAnimation: string = "walk/walk_body_upper_ranged_firearm";

    @property(String)
    public rangedUpperRunAnimation: string = "run/run_body_upper_ranged_firearm";

    @property(Number)
    public attackAnimationDuration: number = 1067;

    public movement!: PlayerMovementController;
    public ui!: PlayerUIHints;
    public combat!: PlayerCombatController;
    public animation!: PlayerAnimationController;
    public equipment!: PlayerEquipmentVisualController;
    public ranged!: PlayerRangedController;
    private attackToken: number = 0;
    private staminaTickElapsed: number = 0;
    private readonly fillBaseTransforms = new WeakMap<object, { width: number; scaleX: number }>();
    private runStaminaLocked: boolean = false;
    private deathReturnTriggered: boolean = false;
    private lastEquipmentSignature: string = "__init";
    private defaultRangedBulletSpeed: number = 0;

    onAwake(): void {
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

    onStart(): void {
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

    onUpdate(): void {
        this.movement.onUpdate();
        this.updateStamina();
        this.syncEquipmentStats();
        this.animation.onUpdate();
        this.syncRangedWeaponSpineSlotHidden();
        this.ranged.syncAimRotation("update");
    }

    onLateUpdate(): void {
        this.ranged.syncAimRotation("late");
    }

    onDestroy(): void {
        if (PlayerController.activeInstance === this) {
            PlayerController.activeInstance = null;
        }

        this.ranged?.onDestroy();
        this.equipment?.onDestroy();
        this.animation?.onDestroy();
        this.combat?.onDestroy();
        this.ui?.onDestroy();
    }

    public playAttack(queueIfBusy: boolean = false, options: PlayerAttackOptions = {}): boolean {
        return this.combat.playAttack(queueIfBusy, options);
    }

    public clearQueuedAttack(): void {
        this.combat.clearQueuedAttack();
    }

    public setAttackFacingByDirection(x: number, y: number = 0): boolean {
        return this.movement.setAttackFacingByDirection(x, y);
    }

    public clearAttackFacingOverride(): void {
        this.movement.clearAttackFacingOverride();
    }

    public setRangedWeaponAimByDirection(x: number, y: number = 0): void {
        this.ranged.setAimByDirection(x, y);
    }

    public throwThrowable(itemId: string, targetParentX?: number, targetParentY?: number, fuseDelayMs?: number, blastRadiusOverride?: number): boolean {
        const data=DataManager.getInstance(),meta=data.resolveItemMeta(itemId);
        if(!meta||data.getItemHudSlot(itemId)!=="throwable")return false;
        const owner=this.owner as Laya.Sprite|null,parent=owner?.parent as Laya.Sprite|null;
        if(!owner||!parent||typeof owner.localToGlobal!=="function"||typeof parent.globalToLocal!=="function")return false;
        const direction=this.ranged.getThrowableDirection(),origin=owner.localToGlobal(new Laya.Point(0,0),false);
        const range=Math.max(80,Number(meta.throwRange)||240),target=Number.isFinite(targetParentX)&&Number.isFinite(targetParentY)
            ? new Laya.Point(targetParentX as number,targetParentY as number)
            : parent.globalToLocal(new Laya.Point(origin.x+direction.x*range,origin.y+direction.y*range),false);
        const spawn=parent.globalToLocal(new Laya.Point(origin.x,origin.y),false);
        const projectile=new Laya.Sprite();parent.addChild(projectile);projectile.pos(spawn.x,spawn.y);projectile.zOrder=1000;
        projectile.mouseEnabled=false;
        void this.loadThrowableTexture(String(meta.icon||"")).then((texture)=>{
            if(!texture||projectile.destroyed)return;
            projectile.graphics.clear();
            projectile.texture=texture;
            projectile.pivot(texture.width*0.5,texture.height*0.5);
            const displayScale=44/Math.max(texture.width,texture.height);
            projectile.scale(displayScale,displayScale);
        });
        projectile.graphics.drawCircle(0,0,11,"#8c8a72","#373a31",2);
        projectile.graphics.drawLine(-8,-9,7,-9,"#d0cba9",2);
        projectile.graphics.drawLine(7,-9,10,-4,"#d0cba9",2);
        Laya.Tween.to(projectile,{x:target.x,y:target.y},450,Laya.Ease.quadOut);
        const fuse=Math.max(0,Number.isFinite(fuseDelayMs)?Number(fuseDelayMs):Number(meta.fuseMs)||900);
        Laya.timer.once(450,this,()=>{
            if(projectile.destroyed)return;
            Laya.timer.once(fuse,this,()=>{
                if(projectile.destroyed)return;
                const blast=new Laya.Sprite();parent.addChild(blast);blast.pos(target.x,target.y);blast.zOrder=1001;blast.mouseEnabled=false;
                const radius=Math.max(20,Number(blastRadiusOverride)||Number(meta.blastRadius)||120),damage=Math.max(0,Number(meta.throwDamage)||0);
                if(damage>0)this.applyThrowableBlastDamage(target.x,target.y,radius,damage);
                if(itemId==="frag_grenade")this.leaveThrowableCrater(parent,target.x,target.y,radius);
                this.playThrowableSound(itemId,"impact");
                this.playThrowableEffect(itemId,blast,radius);
                if(!projectile.destroyed)projectile.destroy(true);
            });
        });
        return true;
    }

    private loadThrowableTexture(iconPath:string):Promise<Laya.Texture|null>{
        const url=String(iconPath||"").replace(/^assets\//i,"").replace(/^res:\/\//i,"");
        if(!url)return Promise.resolve(null);
        const cached=Laya.loader.getRes?.(url) as Laya.Texture|null;
        if(cached)return Promise.resolve(cached);
        return Laya.loader.load(url,null,null,Laya.Loader.IMAGE).then((texture:Laya.Texture|null)=>texture||null).catch((error:any):Laya.Texture|null=>null);
    }

    private loadThrowableEffectFrames(key:string,urls:string[]):Promise<Laya.Texture[]>{
        let promise=PlayerController.throwableEffectFrames.get(key);
        if(!promise){
            promise=Promise.all(urls.map((url)=>Laya.loader.load(url,null,null,Laya.Loader.IMAGE)
                .then((texture:Laya.Texture|null)=>texture||null).catch((_error:any):Laya.Texture|null=>null)))
                .then((frames)=>frames.filter((texture):texture is Laya.Texture=>!!texture));
            PlayerController.throwableEffectFrames.set(key,promise);
        }
        return promise;
    }

    private playThrowableEffect(itemId:string,blast:Laya.Sprite,radius:number):void{
        if(itemId==="decoy_grenade"){
            const parent=blast.parent as Laya.Sprite|null,x=blast.x,y=blast.y;
            blast.destroy(true);
            for(let i=0;i<3;i++)this.createThrowablePulse(parent,x,y,radius,"#83dfff",i*150,850);
            return;
        }
        if(itemId==="molotov"){
            const parent=blast.parent as Laya.Sprite|null,x=blast.x,y=blast.y;
            blast.destroy(true);
            this.playMolotovFire(parent,x,y,radius);
            return;
        }
        if(itemId==="smoke_grenade"){
            this.playSmokeThrowable(blast,radius);
            return;
        }
        const flashbang=itemId==="flashbang",stun=itemId==="stun_grenade";
        if(flashbang)this.createThrowablePulse(blast.parent as Laya.Sprite,blast.x,blast.y,radius,"#fff8c9",0,460,true);
        if(stun)this.createThrowablePulse(blast.parent as Laya.Sprite,blast.x,blast.y,radius,"#ffb347",0,560);
        this.playThrowableExplosion(blast,radius);
    }

    public playThrowableSound(itemId:string,moment:"prime"|"throw"|"impact"):void{
        const soundRoot="sound/sfx/thread/";
        if(moment==="impact"&&itemId==="smoke_grenade"){
            this.playContinuousSmokeSound(`${soundRoot}放烟.mp3`);
            return;
        }
        let filename="",loops=1,volume=0.72;
        if(moment==="prime"){
            if(itemId==="molotov")return;
            filename=itemId==="frag_grenade"?"掐菠萝.mp3":"掐雷.mp3";
            volume=0.5;
        }else if(moment==="throw"){
            filename=itemId==="molotov"?"扔燃烧瓶.mp3":"扔雷.mp3";
            volume=0.65;
        }else if(itemId==="frag_grenade"){
            filename="菠萝炸.mp3";volume=0.9;
        }else if(itemId==="molotov"){
            filename="燃烧瓶炸.mp3";volume=0.85;
        }else{
            filename="摔炮炸.mp3";volume=itemId==="decoy_grenade"?0.55:0.82;
        }
        try{
            const channel=Laya.SoundManager.playSound(`${soundRoot}${filename}`,loops);
            if(channel)channel.volume=volume;
            if(moment==="impact"&&itemId==="molotov"){
                this.playThrowableSoundClip(`${soundRoot}燃烧瓶烧.mp3`,4,0.4);
            }
        }catch(_error){}
    }

    private playContinuousSmokeSound(url:string):void{
        const session={stopped:false,channels:new Set<Laya.SoundChannel>(),previous:null as Laya.SoundChannel|null};
        this.smokeSoundSessions.add(session);
        const stop=()=>{
            if(session.stopped)return;
            session.stopped=true;Laya.timer.clearAll(session);
            for(const channel of session.channels){
                Laya.Tween.clearAll(channel);
                channel.stop();
            }
            session.channels.clear();this.smokeSoundSessions.delete(session);
        };
        const playNext=()=>{
            if(session.stopped)return;
            let channel:Laya.SoundChannel|null=null;
            try{channel=Laya.SoundManager.playSound(url,1);}catch(_error){return;}
            if(!channel)return;
            session.channels.add(channel);
            const previous=session.previous;
            if(previous&&!previous.isStopped){
                channel.volume=0;
                Laya.Tween.to(channel,{volume:0.52},220,Laya.Ease.linear);
                Laya.Tween.to(previous,{volume:0},220,Laya.Ease.linear,Laya.Handler.create(this,()=>{
                    previous.stop();session.channels.delete(previous);
                }));
            }else channel.volume=0.52;
            session.previous=channel;
            const scheduleOverlap=()=>{
                if(session.stopped)return;
                const duration=Number(channel!.duration);
                if(duration>0&&Number.isFinite(duration)){
                    // Start the next copy before this MP3's padded tail reaches its loop point.
                    Laya.timer.once(Math.max(80,duration*1000-220),session,playNext);
                }else if(!channel!.isStopped)Laya.timer.once(25,session,scheduleOverlap);
            };
            scheduleOverlap();
        };
        playNext();
        Laya.timer.once(6400,session,stop);
    }

    private playThrowableSoundClip(url:string,loops:number,volume:number):void{
        try{
            const channel=Laya.SoundManager.playSound(url,loops);
            if(channel)channel.volume=volume;
        }catch(_error){}
    }

    private playThrowableExplosion(blast:Laya.Sprite,radius:number):void{
        if(!PlayerController.throwableExplosionFramesPromise){
            PlayerController.throwableExplosionFramesPromise=this.loadThrowableEffectFrames("explosion",PlayerController.throwableExplosionFrames);
        }
        void PlayerController.throwableExplosionFramesPromise.then((frames)=>{
            if(blast.destroyed)return;
            if(!frames.length){
                blast.graphics.drawCircle(0,0,radius,"rgba(255,176,72,0.35)","#ffd27a",3);
                Laya.Tween.to(blast,{alpha:0,scaleX:1.35,scaleY:1.35},420,Laya.Ease.quadOut,Laya.Handler.create(this,()=>{if(!blast.destroyed)blast.destroy(true);}));
                return;
            }
            const first=frames[0];blast.texture=first;blast.pivot(first.width/2,first.height/2);
            const size=Math.max(radius*2,first.width);
            const scale=size/Math.max(first.width,first.height);
            blast.scale(scale*0.35,scale*0.35);blast.alpha=0.95;
            Laya.Tween.to(blast,{scaleX:scale,scaleY:scale},170,Laya.Ease.quadOut);
            for(let i=1;i<frames.length;i++)Laya.timer.once(i*85,blast,()=>{if(!blast.destroyed)blast.texture=frames[i];});
            Laya.timer.once(frames.length*85,blast,()=>{
                if(blast.destroyed)return;
                Laya.Tween.to(blast,{alpha:0,scaleX:scale*1.22,scaleY:scale*1.22},260,Laya.Ease.quadOut,Laya.Handler.create(this,()=>{if(!blast.destroyed)blast.destroy(true);}));
            });
        });
    }

    private leaveThrowableCrater(parent:Laya.Sprite,x:number,y:number,radius:number):void{
        if(parent.destroyed)return;
        const crater=new Laya.Sprite(),rx=Math.max(34,radius*0.78),ry=Math.max(16,radius*0.27);
        parent.addChild(crater);crater.name="GrenadeCrater";crater.pos(x,y);crater.zOrder=y-1;crater.mouseEnabled=false;
        const rim:number[]=[];
        for(let i=0;i<24;i++){
            const angle=i*Math.PI*2/24,roughness=0.83+((i*37)%11)/45;
            rim.push(Math.cos(angle)*rx*roughness,Math.sin(angle)*ry*roughness);
        }
        crater.graphics.drawPoly(0,0,rim,"rgba(46,36,29,0.88)","rgba(117,77,48,0.9)",3);
        crater.graphics.drawEllipse(-rx*0.69,-ry*0.56,rx*1.38,ry*1.12,"rgba(21,19,17,0.94)","rgba(67,55,43,0.9)",2);
        crater.graphics.drawEllipse(-rx*0.42,-ry*0.3,rx*0.84,ry*0.6,"rgba(10,10,10,0.78)",null,0);
        for(let i=0;i<7;i++){
            const angle=(i*2.399),inner=0.58,outer=0.78+((i*13)%5)/25;
            crater.graphics.drawLine(Math.cos(angle)*rx*inner,Math.sin(angle)*ry*inner,Math.cos(angle)*rx*outer,Math.sin(angle)*ry*outer,"rgba(124,83,50,0.78)",2);
        }
        for(let i=0;i<9;i++){
            const angle=i*2.4+0.25,dist=0.76+((i*7)%4)/18,size=2+(i%3);
            const px=Math.cos(angle)*rx*dist,py=Math.sin(angle)*ry*dist;
            crater.graphics.drawCircle(px,py,size,"rgba(64,57,48,0.96)","rgba(132,91,53,0.72)",1);
        }
        for(let i=0;i<4;i++){
            const angle=i*1.71+0.5,px=Math.cos(angle)*rx*0.55,py=Math.sin(angle)*ry*0.5;
            crater.graphics.drawCircle(px,py,1.5,"rgba(255,145,54,0.9)",null,0);
        }
        crater.alpha=0;
        Laya.Tween.to(crater,{alpha:0.92},260,Laya.Ease.quadOut);
        Laya.timer.once(18000,crater,()=>{
            if(!crater.destroyed)Laya.Tween.to(crater,{alpha:0},5000,Laya.Ease.linear,Laya.Handler.create(this,()=>{if(!crater.destroyed)crater.destroy(true);}));
        });
    }

    private createThrowablePulse(parent:Laya.Sprite,x:number,y:number,radius:number,color:string,delay:number,duration:number,filled=false):void{
        if(!parent||parent.destroyed)return;
        const ring=new Laya.Sprite();parent.addChild(ring);ring.pos(x,y);ring.pivot(0,0);ring.mouseEnabled=false;ring.alpha=0;
        const base=Math.max(18,Math.min(42,radius*0.22));
        ring.graphics.drawCircle(0,0,base,filled?color:null,color,filled?1:4);
        const begin=()=>{
            if(ring.destroyed)return;
            ring.alpha=filled?0.78:0.82;ring.scale(0.35,0.35);
            Laya.Tween.to(ring,{scaleX:Math.max(1,radius/base),scaleY:Math.max(1,radius/base),alpha:0},duration,Laya.Ease.quadOut,Laya.Handler.create(this,()=>{if(!ring.destroyed)ring.destroy(true);}));
        };
        if(delay>0)Laya.timer.once(delay,ring,begin);else begin();
    }

    private playSmokeThrowable(blast:Laya.Sprite,radius:number):void{
        const parent=blast.parent as Laya.Sprite|null;
        if(!parent){blast.destroy(true);return;}
        const urls=[0,1,2,3].map((i)=>`atlas/picture/effects/combat-vfx-samples/smoke_release_f0${i}.png`);
        void this.loadThrowableEffectFrames("smoke-release",urls).then((frames)=>{
            if(blast.destroyed)return;
            const playCloud=()=>this.spawnThrowableSmoke(parent,blast.x,blast.y,radius);
            if(!frames.length){playCloud();blast.destroy(true);return;}
            const first=frames[0];blast.texture=first;blast.pivot(first.width/2,first.height/2);blast.scale(0.65,0.65);blast.alpha=0.9;
            frames.forEach((frame,i)=>Laya.timer.once(i*100,blast,()=>{if(!blast.destroyed)blast.texture=frame;}));
            Laya.timer.once(frames.length*100,blast,()=>{if(!blast.destroyed){playCloud();Laya.Tween.to(blast,{alpha:0,scaleX:1.2,scaleY:1.2},220,Laya.Ease.quadOut,Laya.Handler.create(this,()=>{if(!blast.destroyed)blast.destroy(true);}));}});
        });
    }

    private spawnThrowableSmoke(parent:Laya.Sprite,x:number,y:number,radius:number):void{
        const url="atlas/picture/effects/combat-vfx-samples/smoke_particle_cloud.png";
        void this.loadThrowableEffectFrames("smoke-cloud",[url]).then((textures)=>{
            if(parent.destroyed||!textures.length)return;
            const texture=textures[0];
            for(let i=0;i<6;i++){
                const puff=new Laya.Sprite();parent.addChild(puff);puff.texture=texture;puff.pivot(texture.width/2,texture.height/2);
                const angle=Math.PI*2*i/6,spread=radius*0.32,px=x+Math.cos(angle)*spread*0.35,py=y+Math.sin(angle)*spread*0.2;
                const size=Math.max(0.09,radius*1.25/texture.width)*(0.78+(i%3)*0.13);puff.pos(px,py);puff.scale(size*0.38,size*0.38);puff.alpha=0.02;puff.mouseEnabled=false;
                Laya.Tween.to(puff,{x:px+Math.cos(angle)*spread,y:py+Math.sin(angle)*spread*0.55,scaleX:size,scaleY:size,alpha:0.36},420,Laya.Ease.quadOut);
                Laya.timer.once(700+i*90,puff,()=>{if(!puff.destroyed)Laya.Tween.to(puff,{alpha:0,scaleX:size*1.18,scaleY:size*1.18},4500,Laya.Ease.linear,Laya.Handler.create(this,()=>{if(!puff.destroyed)puff.destroy(true);}));});
            }
        });
    }

    private playMolotovFire(parent:Laya.Sprite,x:number,y:number,radius:number):void{
        if(!parent||parent.destroyed)return;
        if(!PlayerController.molotovFireFramesPromise){
            PlayerController.molotovFireFramesPromise=this.loadThrowableEffectFrames("molotov-fire",["animation/fire/torch-flame-sheet.png"])
                .then((sources)=>{
                    if(!sources.length)return [];
                    const sheet=sources[0],w=sheet.width/4,h=sheet.height/2,frames:Laya.Texture[]=[];
                    for(let i=0;i<8;i++)frames.push(Laya.Texture.createFromTexture(sheet,(i%4)*w,Math.floor(i/4)*h,w,h));
                    return frames;
                });
        }
        void PlayerController.molotovFireFramesPromise.then((frames)=>{
            if(parent.destroyed)return;
            if(!frames.length){this.createThrowablePulse(parent,x,y,radius,"#ff9a32",0,650,true);return;}
            for(let i=0;i<5;i++){
                const flame=new Laya.Sprite();parent.addChild(flame);flame.pivot(frames[0].width/2,frames[0].height*0.92);flame.mouseEnabled=false;
                const angle=Math.PI*2*i/5,spread=radius*0.42,size=radius*0.7/frames[0].width*(i===0?1.2:0.88);
                flame.pos(x+Math.cos(angle)*spread,y+Math.sin(angle)*spread*0.42);flame.scale(size,size);flame.alpha=0;flame.texture=frames[i%frames.length];
                Laya.Tween.to(flame,{alpha:0.95},280,Laya.Ease.quadOut);
                const finish=Date.now()+5200;
                const advance=()=>{
                    if(flame.destroyed)return;
                    if(Date.now()>=finish){Laya.Tween.to(flame,{alpha:0,scaleX:size*1.12,scaleY:size*1.12},650,Laya.Ease.quadOut,Laya.Handler.create(this,()=>{if(!flame.destroyed)flame.destroy(true);}));return;}
                    flame.texture=frames[(Math.floor(Date.now()/125)+i)%frames.length];Laya.timer.once(125,flame,advance);
                };
                Laya.timer.once(125,flame,advance);
            }
        });
    }

    private applyThrowableBlastDamage(x:number,y:number,radius:number,damage:number):void {
        const visit=(node:Laya.Node):void=>{
            if(node!==this.owner){
                const components=((node as any)._components||[]) as any[];
                for(const component of components){
                    if(component===this||typeof component?.takeDamage!=="function"||(typeof component.isDead==="function"&&component.isDead()))continue;
                    const point=(node as any).localToGlobal?.(new Laya.Point(0,0),false);if(!point)break;
                    const distance=Math.hypot(point.x-x,point.y-y);
                    if(distance<=radius){const scale=Math.max(0.25,1-distance/radius);component.takeDamage(Math.max(1,Math.round(damage*scale)));}
                    break;
                }
            }
            const parent=node as any;for(let i=0;i<(parent.numChildren||0);i++)visit(parent.getChildAt(i));
        };
        if(Laya.stage)visit(Laya.stage);
    }

    public clearRangedWeaponAim(): void {
        this.ranged.clearAim();
    }

    public beginAttackHit(): number {
        this.attackToken += 1;
        return this.attackToken;
    }

    public endAttackHit(): void {
        this.attackToken = 0;
    }

    public getAttackToken(): number {
        return this.attackToken;
    }

    public syncEquipmentStats(): void {
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
        this.animation?.invalidateLocomotion();
        this.equipment.scheduleInitialization();
    }

    public setRunningState(value: boolean): void {
        this.updateRunStaminaLock();
        this.isRunning = value && this.canStartRunning();
        this.moveSpeed = this.isRunning ? this.runSpeed : 0;
    }

    public setRunning(value: boolean): void {
        this.setRunningState(value);
    }

    public toggleRunning(): void {
        this.setRunningState(!this.isRunning);
    }

    public canStartRunning(): boolean {
        return this.currentStamina > 0 && !this.runStaminaLocked;
    }

    public isRunStaminaLocked(): boolean {
        return this.runStaminaLocked;
    }

    public showState(text: string, duration: number = 1200): void {
        this.ui.showState(text, duration);
    }

    public showItem(text: string, duration: number = 1500): void {
        this.ui.showItem(text, duration);
    }

    public hideStateText(): void {
        this.ui.hideStateText();
    }

    public hideItemText(): void {
        this.ui.hideItemText();
    }

    public setHp(currentHp: number, maxHp: number = this.maxHp): void {
        this.maxHp = Math.max(1, Math.floor(maxHp));
        this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
        DataManager.getInstance().setPlayerHp(this.currentHp, this.maxHp);
        this.refreshHpBar();

        if (this.currentHp <= 0) {
            this.returnToDeathScene();
        }
    }

    public takeDamage(amount: number): void {
        const damage = Math.max(0, Math.floor(amount));
        if (damage <= 0 || this.currentHp <= 0) {
            return;
        }

        this.setHp(this.currentHp - damage, this.maxHp);
    }

    public refreshHpBar(): void {
        const fill = this.hpFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.currentHp / Math.max(1, this.maxHp);
        this.applyHpFillWidth(fill, Math.max(0, this.hpFillFullWidth * ratio));
        this.syncStatusBarTransform();
    }

    public syncHpFromData(): void {
        const stats = DataManager.getInstance().getPlayerStats();
        this.maxHp = Math.max(1, Math.floor(stats.maxHp || 100));
        const currentHp = Number.isFinite(stats.currentHp) ? stats.currentHp : this.maxHp;
        this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
        this.refreshHpBar();
    }

    public setStamina(currentStamina: number, maxStamina: number = this.maxStamina): void {
        this.maxStamina = Math.max(1, Math.floor(maxStamina));
        this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
        this.updateRunStaminaLock();
        DataManager.getInstance().setPlayerStamina(this.currentStamina, this.maxStamina);
        if (!this.canStartRunning() && this.isRunning) {
            this.setRunningState(false);
        }
        this.refreshStaminaBar();
    }

    public consumeStaminaForCompletedAttack(): void {
        // Kept as a compatibility hook; attacks no longer consume stamina.
    }

    public syncStaminaFromData(): void {
        const stats = DataManager.getInstance().getPlayerStats();
        this.maxStamina = Math.max(1, Math.floor(stats.maxStamina || 150));
        const currentStamina = Number.isFinite(stats.currentStamina) ? stats.currentStamina : this.maxStamina;
        this.currentStamina = Math.max(0, Math.min(Math.floor(currentStamina), this.maxStamina));
        this.updateRunStaminaLock();
        if (!this.canStartRunning() && this.isRunning) {
            this.setRunningState(false);
        }
        this.refreshStaminaBar();
    }

    public refreshStaminaBar(): void {
        const fill = this.staminaFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.currentStamina / Math.max(1, this.maxStamina);
        const width = Math.max(0, this.staminaFillFullWidth * ratio);
        this.applyHpFillWidth(fill, width);
        this.syncStatusBarTransform();
    }

    public syncStatusBarTransform(): void {
        const facingSign = this.movement ? this.movement.getFacingSign() : this.initialFacingSign >= 0 ? 1 : -1;
        this.applyCounterTransform(this.hpBarNode || this.hpFillNode?.parent || null, facingSign, this.hpBarRightX, this.hpBarLeftX);
        this.applyCounterTransform(this.staminaBarNode || this.staminaFillNode?.parent || null, facingSign, this.staminaBarRightX, this.staminaBarLeftX);
    }

    private updateStamina(): void {
        this.staminaTickElapsed += Math.max(0, Laya.timer.delta || 0);

        const moving=this.movement.getIsMovingNow();
        if(!moving){
            this.staminaTickElapsed=0;
            return;
        }
        while (this.staminaTickElapsed >= 1000) {
            this.staminaTickElapsed -= 1000;
            if (this.isRunning) this.setStamina(this.currentStamina - 5, this.maxStamina);
            else this.setStamina(this.currentStamina + 2, this.maxStamina);
        }
    }

    private updateRunStaminaLock(): void {
        if (this.currentStamina <= 0) {
            this.runStaminaLocked = true;
            return;
        }

        const recoverThreshold = Math.max(1, Math.min(this.maxStamina, Math.floor(this.runRecoverStaminaThreshold || 30)));
        if (this.currentStamina >= recoverThreshold) {
            this.runStaminaLocked = false;
        }
    }

    private returnToDeathScene(): void {
        if (this.deathReturnTriggered) {
            return;
        }

        const url = String(this.deathReturnSceneUrl || "scenes/cunzhuang.ls").trim();
        if (!url) {
            return;
        }

        this.deathReturnTriggered = true;
        Laya.timer.once(0, null, () => {
            const returnToBase = (): void => {
                DataManager.getInstance().returnToBaseAfterDeath(url);
                Laya.Scene.open(url);
            };

            if (RunResultPanel.showFailed(2500, returnToBase)) {
                return;
            }

            returnToBase();
        });
    }

    private applyHpFillWidth(fill: any, width: number): void {
        let base = this.fillBaseTransforms.get(fill as object);
        if (!base) {
            base = {
                width: Math.max(0, Number(fill.width) || width),
                scaleX: Number(fill.scaleX) || 1,
            };
            this.fillBaseTransforms.set(fill as object, base);
        }

        // Keep the DrawRect at its original size and scale the node. This
        // reliably repaints on mobile/mini-game renderers where changing a
        // cached DrawRect width alone can leave the old pixels on screen.
        const ratio = base.width > 0 ? Math.max(0, Math.min(1, width / base.width)) : 0;
        fill.width = base.width;
        fill.scaleX = base.scaleX * ratio;

        const commands = fill._gcmds;
        if (!Array.isArray(commands)) {
            return;
        }

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command && "width" in command) {
                command.width = base.width;
            }
        }
    }

    private applyCounterTransform(node: Laya.Node | null, facingSign: number, rightX: number, leftX: number): void {
        const sprite = node as Laya.Sprite | null;
        if (!sprite) {
            return;
        }

        const facingRight = facingSign === (this.initialFacingSign >= 0 ? 1 : -1);
        sprite.x = facingRight ? leftX : rightX;
        sprite.scaleX = facingRight ? -1 : 1;
    }

    public syncWeaponSpineSlot(force: boolean = false): boolean {
        return this.equipment.syncWeaponSpineSlot(force);
    }

    public resolveUpperLocomotionAnimation(lowerAnimation: string): string {
        const ranged = this.isEquippedRangedWeapon();
        const idle = ranged
            ? this.rangedUpperIdleAnimation || this.upperIdleAnimation
            : this.upperIdleAnimation;

        if (lowerAnimation === this.runAnimation) {
            return ranged
                ? this.rangedUpperRunAnimation || idle || lowerAnimation
                : this.upperRunAnimation || idle || lowerAnimation;
        }

        if (lowerAnimation === this.walkAnimation) {
            return ranged
                ? this.rangedUpperWalkAnimation || idle || lowerAnimation
                : this.upperWalkAnimation || idle || lowerAnimation;
        }

        return idle || lowerAnimation;
    }

    public resolveAttackAnimation(): string {
        if (this.isEquippedRangedWeapon()) {
            return this.rangedAttackAnimation || this.attackAnimation;
        }

        return this.attackAnimation;
    }

    public syncEquipmentSpineSlots(force: boolean = false): boolean {
        return this.equipment.syncEquipmentSpineSlots(force);
    }

    public refreshEquipmentFromData(): void {
        this.equipment.refreshFromData();
    }

    public refreshEquipmentVisualsFromData(): boolean {
        return this.equipment.refreshVisualsFromData();
    }

    public invalidateEquipmentStats(): void {
        this.lastEquipmentSignature = "__force";
    }

    public isEquippedRangedWeapon(): boolean {
        return this.equipment.isEquippedRangedWeapon();
    }

    private syncRangedWeaponSpineSlotHidden(): void {
        if (!this.equipment || !this.isEquippedRangedWeapon()) {
            return;
        }

        this.equipment.syncWeaponSpineSlot(false);
    }

    public applyRangedAttackDamage(options: PlayerAttackOptions = {}): boolean {
        return this.ranged.applyDamage(options);
    }

    public spawnRangedBullet(options: PlayerAttackOptions = {}): void {
        this.ranged.spawnBullet(options);
    }

    public resolveRangedChargeRatio(heldMs: number, dragRatio: number): number {
        return this.ranged.resolveChargeRatio(heldMs, dragRatio);
    }

    public snapshot(): Record<string, any> {
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
            scaleX: this.owner ? (this.owner as Laya.Sprite).scaleX : null,
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
            ranged: this.ranged ? this.ranged.snapshot() : null,
        };
    }
}
