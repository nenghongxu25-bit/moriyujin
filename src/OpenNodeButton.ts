const { regClass, property } = Laya;

interface RoleInteraction {
    label: string;
    response: string;
}

@regClass()
export class OpenNodeButton extends Laya.Script {
    @property(Laya.Node)
    targetNode: Laya.Node | null = null;

    @property(String)
    targetNodeName = "";

    @property(String)
    buildingName = "";

    @property(String)
    displayName = "";

    private button!: Laya.Sprite;

    private readonly buildingDetails: Record<string, string[]> = {
        "山门": ["青槐宗弟子"],
        "青槐居": [],
        "栖枝院": [],
        "迎风厅": ["顾清川"],
        "积薪阁": ["赵静安"],
        "授木堂": ["孟怀木", "江听雪", "陈砚秋"],
        "藏木阁": ["书架1"],
        "藏书阁": ["书架1"],
        "槐安居": ["沈青梧", "秦望川"],
        "枫桥": [],
        "青槐家": ["陈伯", "陈婶", "青槐"],
        "集市": [],
        "土地庙": [],
        "铁匠铺": ["林铁匠"],
        "医馆": ["孙郎中"],
        "武馆": ["赵教头"],
        "居民区": ["周二婶", "小石头"],
        "后山": [],
        "昭阳府": ["陆景明", "韩镇岳", "许问衡", "马承驿"],
        "校场": ["周砺", "程开山"],
        "东市": ["孙百草", "钱有余"],
        "西市": ["铁云生", "罗万材"],
        "青槐祠": ["祝守真"],
        "客栈": ["胡三娘", "柳闲声"],
        "驿站": [],
        "居民坊": [],
        "渡口": ["艄公"],
        "茶棚": ["小二"],
        "柳岸": [],
        "采集区": ["药丛", "矿点", "树林"],
        "猎场": ["鹿"],
        "隐秘入口": [],
        "青屏寨": [],
        "杨家庄/庄门": ["庄丁"],
        "杨家庄/议事堂": ["杨破风"],
        "杨家庄/杨公庙": ["墨公"],
        "杨家庄/校场": ["杨雪翎"],
        "北风谷/资源点": ["药丛"],
        "北风谷/房屋": ["村民"],
        "北风谷/田地": ["农户"],
        "北风谷/茅草屋": ["谷中老人"],
        "雁回山/军营": ["边军"],
        "雁回山/边境线": ["斥候"],
        "雁回山/古战场": ["残枪"],
        "雁回山/山脚": ["药丛", "树林"],
        "北境/副营": ["周瞎子", "柳四娘"],
        "北境/主营": ["赫连铁骨"],
        "北境/叛军门口": ["流寇"],
        "北境/先锋营": ["庞千斤"],
        "玄甲卫/演武场": ["玄甲卫"],
        "玄甲卫/将军府": ["玄甲将军"],
        "玄甲卫/先锋营": ["先锋校尉"],
        "玄甲卫/军械库": ["军械官"],
        "玄甲卫/情报处": ["情报官"],
        "镇岳宗/铸甲堂": ["铸甲师"],
        "镇岳宗/玄武殿": ["镇岳宗主"],
        "镇岳宗/迎客厅": ["迎客弟子"],
        "镇岳宗/石林": ["练功弟子"],
        "归乡陵/甲冢": ["旧甲"],
        "归乡陵/碑林": ["石碑"],
        "归乡陵/守陵庐": ["守陵人"],
        "黑石村/冶炼炉": ["炉工"],
        "黑石村/矿区": ["矿工"],
        "黑石村/小木屋": ["村民"],
        "黑石村/采石场": ["石匠"],
        "沉铁湖/黑泥": ["黑泥"],
        "沉铁湖/黑水": ["黑水"],
        "燎原谷/熔岩地脉": ["地脉火息"],
        "燎原谷/火山灰": ["火山灰"],
        "燎原谷/采集队": ["采集队长"],
        "开阳宗/开阳殿": ["守殿弟子"],
        "开阳宗/升阳殿": ["升阳执事"],
        "沧浪宗/观潮台": ["观潮弟子"],
        "沧浪宗/墨玉潭": ["墨潭守者"],
        "沧浪宗/渔水村": ["渔水村民"],
        "沧浪宗/大码头": ["码头管事"],
        "野外/听音阁": ["听潮行者"],
        "野外/沧浪殿": ["巡殿弟子"],
        "野外/静水洞": ["静修弟子"],
        "野外/水廊": ["水廊守卫"],
        "苍山/梧桐林": ["林中隐者"],
        "苍山/坐台": ["坐台修士"],
        "苍山/悬崖": ["崖边采药人"],
        "归墟宫/上清殿": ["上清道众"],
        "归墟宫/太清殿": ["太清执事"],
        "归墟宫/无心阁": ["无心阁守"],
        "归墟宫/洗心池": ["洗心池童"],
        "重岳城/铁匠铺": ["重岳铁匠"],
        "重岳城/玄甲府": ["玄甲道使", "玄甲兵曹", "玄甲巡按"],
        "重岳城/酒肆": ["酒肆掌柜"],
        "重岳城/驿站": ["玄甲驿丞"],
        "重岳城/客栈": ["客栈掌柜"],
        "重岳城/裁缝铺": ["裁缝"],
        "重岳城/瞭望台": ["守望兵"],
    };

    private readonly roleDescriptions: Record<string, string> = {
        "青槐宗弟子": "守山弟子，负责山门值守、通传来客与巡查出入。",
        "顾清川": "青槐宗外务长老，掌管门派对外往来、委托任务、山门交涉与资源采购。",
        "赵静安": "青槐宗内务长老，掌管宗门庶务、弟子名册、仓储分配与戒律执行。",
        "孟怀木": "青槐宗传功长老，掌管传功授业、弟子修行考核与武学典籍。",
        "江听雪": "青槐宗核心弟子，常在授木堂协助传授剑法。",
        "陈砚秋": "青槐宗核心弟子，常在授木堂协助传授拳法。",
        "沈青梧": "青槐宗掌门，统领宗门大事，掌握青槐宗核心传承。",
        "秦望川": "青槐宗大弟子，掌门近前弟子，常协助处理门内要务。",
        "陈伯": "青槐家长辈，平日务农，性子稳重，常提醒青槐行事量力而行。",
        "陈婶": "青槐家长辈，照顾家中起居，也常带青槐去集市采买。",
        "青槐": "故事主角，出身枫桥镇，尚在摸索自己未来要走的路。",
        "周二婶": "枫桥镇居民，常在集市卖菜，熟悉镇上的家长里短。",
        "小石头": "枫桥镇孩子，常在镇上玩耍，是青槐熟识的晚辈。",
        "孙郎中": "医馆郎中，负责看病抓药，也会托青槐帮忙送药。",
        "林铁匠": "铁匠铺主人，负责打造和修理农具兵器。",
        "赵教头": "武馆教头，身手扎实，是青槐早期习武的引路人。",
        "书架1": "藏书阁中的书架，摆放着可供翻阅的典籍。",
        "陆景明": "青槐道使，坐镇昭阳府，负责青槐道政务调度与各地文书裁定。",
        "韩镇岳": "青槐兵曹，负责青槐道军事防务、府兵调遣与要地巡防。",
        "许问衡": "青槐巡按，负责律法监察、案卷复核与巡察纠弊。",
        "马承驿": "驿丞，负责昭阳府往来文书、传信路线与驿站调度。",
        "周砺": "校场校尉，负责府兵操练、武试考核与临时征调。",
        "程开山": "校场武师，负责指导基础武艺和实战切磋。",
        "孙百草": "东市药商，经营常用药材、跌打药和补益药。",
        "钱有余": "东市杂货商，经营日用杂货、行囊器具和零散材料。",
        "铁云生": "西市兵器商，售卖刀剑枪棍和常见护具。",
        "罗万材": "西市材料商，收售矿石、木料、皮革等打造材料。",
        "祝守真": "青槐祠祠祝，主持祭祀、祈福和地方旧礼。",
        "胡三娘": "客栈掌柜，掌管客房、饭食，也熟悉来往客商消息。",
        "柳闲声": "说书人，常在客栈讲古论今，消息灵通。",
        "艄公": "柳津渡撑船渡人的艄公，熟悉附近水路和往来船客。",
        "小二": "茶棚里招呼客人的小二，常听过路人闲谈，知道不少渡口消息。",
        "药丛": "青屏山常见的野生药丛，可采集基础药材。",
        "矿点": "山石间露出的矿点，可采集矿石材料。",
        "树林": "青屏山林木茂密，可采集木材，也可能遇到山中小事。",
        "鹿": "出没在猎场附近的野鹿，警觉灵敏，可用于狩猎事件。",
        "庄丁": "杨家庄守门庄丁，负责看守庄门、通传来客与巡查庄外动静。",
        "杨破风": "杨家庄当代庄主，掌管庄中事务，也是寒缨落月枪的主要传承者。",
        "杨雪翎": "杨破风之女，常在校场练枪，枪法轻灵迅捷。",
        "墨公": "杨家庄旧籍管事，负责整理枪谱、族谱、旧战录和香火账册。",
        "村民": "北风谷居民，常年住在谷中，知道谷里近来的家常与传闻。",
        "农户": "北风谷农户，负责照看田地，也会留意谷口商路的动静。",
        "谷中老人": "住在茅草屋里的老人，见过不少云岚道旧事。",
        "边军": "驻守雁回山旧军营的边军，负责看守山道和旧战场遗迹。",
        "斥候": "巡行边境线的斥候，熟悉山路、风向和敌踪。",
        "残枪": "插在古战场上的残破长枪，枪缨早已褪色，却仍带着旧战痕迹。",
        "赫连铁骨": "北境叛军头目，绰号沙狼，擅长突袭与风沙扰敌。",
        "周瞎子": "北境叛军头目，绰号独眼枭，刀法狠厉，善守反击。",
        "柳四娘": "北境叛军头目，绰号夜鸽子，擅长潜行、刺杀与截杀弱点。",
        "庞千斤": "北境叛军头目，绰号饿虎，力大势沉，擅长冲阵压制。",
        "流寇": "北境叛军外围小兵，负责守门、巡逻和拦截来人。",
        "玄甲卫": "玄甲道精锐军卫，负责守城、镇关、护送与剿匪。",
        "玄甲将军": "玄甲卫主将，统领卫所军务，负责玄甲道要地防务。",
        "先锋校尉": "玄甲卫先锋营校尉，负责前线冲阵、巡边和急行驰援。",
        "军械官": "玄甲卫军械库管事，负责甲胄、兵器、弩机与军资登记。",
        "情报官": "玄甲卫情报处主事，负责汇总边报、密信和敌踪线索。",
        "铸甲师": "镇岳宗铸甲堂匠师，负责锻甲、修盾和调校重兵器。",
        "镇岳宗主": "镇岳宗宗主，统领宗门传承，重视根基、防御与守诺。",
        "迎客弟子": "镇岳宗迎客厅弟子，负责接待来客、通传拜山与安排等候。",
        "练功弟子": "镇岳宗弟子，常在石林磨炼步法、横练与重兵器架势。",
        "旧甲": "归乡陵甲冢中保存的旧甲，甲片残缺，却仍可见当年战阵痕迹。",
        "石碑": "归乡陵碑林中的石碑，刻着玄甲道旧战死者与归乡者的姓名。",
        "守陵人": "归乡陵守陵人，负责看护甲冢、碑林和陵中香火。",
        "炉工": "黑石村冶炼炉工，负责烧炉、炼铁和粗炼矿料。",
        "矿工": "黑石村矿工，常年进出矿区，熟悉矿脉和塌方隐患。",
        "石匠": "黑石村石匠，负责开石、修屋和处理采石场石料。",
        "黑泥": "沉铁湖边的黑色淤泥，夹杂细碎铁砂和潮湿矿渣。",
        "黑水": "沉铁湖中的深色湖水，水下可能沉着可打捞的铁料。",
        "地脉火息": "燎原谷地底涌出的火性灵息，热力沿岩缝游走，适合采炼火属材料。",
        "火山灰": "燎原谷风口沉积的细灰，混着焦土与矿粉，可作炼器、制药的辅料。",
        "采集队长": "燎原谷采集队的领头人，熟悉谷内热风、裂岩和火灰沉降的位置。",
        "守殿弟子": "开阳宗开阳殿值守弟子，负责通传来客、看守殿前规矩。",
        "升阳执事": "开阳宗升阳殿执事，掌管晨课、试炼记录和火系功法入门考核。",
        "观潮弟子": "沧浪宗观潮台弟子，记录潮汐、风向和水脉灵息的变化。",
        "墨潭守者": "墨玉潭守者，负责看护潭水禁制，辨认潭底回声是否异常。",
        "渔水村民": "渔水村民，常年靠水而居，熟悉潮音道近岸水路和渔汛。",
        "码头管事": "大码头管事，调度船只、货栈和往来修士的登岸登记。",
        "听潮行者": "听音阁行者，循水声辨路，收集野外潮声中的异动。",
        "巡殿弟子": "沧浪殿巡守弟子，负责殿前巡查和外来人员引导。",
        "静修弟子": "静水洞闭关弟子，借无波静水调息，少与外客交谈。",
        "水廊守卫": "水廊守卫，沿廊巡查潮线和暗流，防止外人误入深水区。",
        "林中隐者": "苍山梧桐林中的隐居修士，识草木生机，也懂山中旧路。",
        "坐台修士": "苍山坐台修士，常在高台静观云气，记录苍梧道灵机流转。",
        "崖边采药人": "苍山悬崖边采药人，熟悉岩缝灵草和险崖落脚处。",
        "上清道众": "归墟宫上清殿道众，负责日课、礼仪和来客引见。",
        "太清执事": "归墟宫太清殿执事，掌管宫内典册、清修规矩和内务分派。",
        "无心阁守": "归墟宫无心阁看守，守着旧卷与静修札记，不喜喧哗。",
        "洗心池童": "归墟宫洗心池童，照看池水与净心香，负责引导弟子入池静心。",
        "重岳铁匠": "重岳城铁匠铺师傅，负责打造和修理城中常用兵器与铁具。",
        "玄甲道使": "玄甲道政务主官，坐镇玄甲府，负责道域政令和地方调度。",
        "玄甲兵曹": "玄甲道军事主官，负责城防、卫所调遣和军务文书。",
        "玄甲巡按": "玄甲道巡察官，负责监察案件、复核纠纷和巡查吏治。",
        "酒肆掌柜": "重岳城酒肆掌柜，熟悉城中闲谈和往来客人的消息。",
        "玄甲驿丞": "重岳城驿站驿丞，负责文书传递、马匹调度和驿路安排。",
        "客栈掌柜": "重岳城客栈掌柜，负责住店、饭食和来往旅客接待。",
        "裁缝": "重岳城裁缝铺师傅，能缝补衣物，也能处理简单皮甲内衬。",
        "守望兵": "重岳城瞭望台守兵，负责观察城外道路和远处山势动静。",
    };

    private readonly roleActions: Record<string, RoleInteraction[]> = {
        "青槐宗弟子": [
            { label: "交谈", response: "守山弟子拱手道：山门今日无异动，若要外出，还请先向长老报备。" },
        ],
        "顾清川": [
            { label: "交谈", response: "顾清川说道：外务讲究分寸，既要护住宗门颜面，也不能误了山外人情。" },
            { label: "委托", response: "顾清川取出几封外务文书：这些是近日送来的委托，你可先挑力所能及的。" },
        ],
        "赵静安": [
            { label: "交谈", response: "赵静安说道：宗门内务不显山露水，却最怕一处松散牵动全局。" },
            { label: "领取", response: "赵静安翻看名册：你的月例还未领取，稍后去库房登记。" },
        ],
        "孟怀木": [
            { label: "交谈", response: "孟怀木说道：练功先练根，根基浮了，再好的招式也只是空架子。" },
            { label: "请教", response: "孟怀木指点道：今日先把吐纳节奏压稳，三息一转，不要急着求快。" },
        ],
        "江听雪": [
            { label: "交谈", response: "江听雪说道：剑法不是只看出剑快慢，先看你脚下能不能站稳。" },
            { label: "请教", response: "江听雪演示一式青枝出岫：剑起时留三分余地，后招才接得上。" },
        ],
        "陈砚秋": [
            { label: "交谈", response: "陈砚秋笑道：拳脚功夫最实在，偷不了懒，也装不了样子。" },
            { label: "请教", response: "陈砚秋按住你的肩：出拳前先沉胯，力从脚下起，不是从胳膊硬抡。" },
        ],
        "沈青梧": [
            { label: "交谈", response: "沈青梧说道：青槐宗立宗，重在根深。人如此，宗门亦如此。" },
            { label: "请安", response: "沈青梧微微颔首：修行不只争一时进境，守得住本心，才走得远。" },
        ],
        "秦望川": [
            { label: "交谈", response: "秦望川说道：掌门事务繁重，寻常门内事可以先交由我转呈。" },
            { label: "请教", response: "秦望川提醒道：入门修行先把规矩记牢，少走许多弯路。" },
        ],
        "陈伯": [
            { label: "交谈", response: "陈伯说道：路见不平是好事，但凡事要先掂量自己有几分本事。" },
        ],
        "陈婶": [
            { label: "交谈", response: "陈婶说道：镇上人多眼杂，出门记得早点回来。" },
            { label: "买菜", response: "陈婶把篮子递来：鸡蛋和菜都要买，别漏了。" },
        ],
        "青槐": [
            { label: "自省", response: "青槐想了想：我还没想清以后要做什么，但总不能一直这样下去。" },
        ],
        "周二婶": [
            { label: "交谈", response: "周二婶招呼道：今日菜新鲜，都是一早刚摘的。" },
        ],
        "小石头": [
            { label: "交谈", response: "小石头笑着挥手：青槐哥，你今天也来镇上玩吗？" },
        ],
        "孙郎中": [
            { label: "交谈", response: "孙郎中说道：药柜里几味药快用完了，过两日还得补一批。" },
            { label: "送药", response: "孙郎中递来药包：这副药劳你送去镇东那户人家。" },
        ],
        "林铁匠": [
            { label: "交谈", response: "林铁匠擦了擦汗：农具修起来不难，难的是赶上农忙时节。" },
            { label: "送农具", response: "林铁匠把修好的农具放好：帮我把这些送到客人家里。" },
        ],
        "赵教头": [
            { label: "交谈", response: "赵教头说道：想学武可以，但先吃得住基本功的苦。" },
            { label: "练功", response: "赵教头沉声道：扎马步，稳住。根基不稳，拳脚都是虚的。" },
        ],
        "书架1": [
            { label: "翻阅", response: "你翻开书架上的典籍，看到几段关于青槐宗基础心法的注解。" },
        ],
        "陆景明": [
            { label: "交谈", response: "陆景明说道：青槐道事务繁杂，最要紧的是各地秩序不能乱。" },
            { label: "政务", response: "陆景明翻开文案：这里有几件地方呈报，需派可靠之人查证。" },
        ],
        "韩镇岳": [
            { label: "交谈", response: "韩镇岳说道：兵曹只认两件事，守得住城，打得退敌。" },
            { label: "军务", response: "韩镇岳点了点地图：近日山道不太安稳，巡防要加密。" },
        ],
        "许问衡": [
            { label: "交谈", response: "许问衡说道：查案不能只听一面之词，证据比口供更可靠。" },
            { label: "案卷", response: "许问衡递来案卷：这桩纠纷尚有疑点，你可先去问几个人。" },
        ],
        "马承驿": [
            { label: "交谈", response: "马承驿说道：信走得快不难，难的是一路不丢、不误、不乱。" },
            { label: "传信", response: "马承驿取出封好的文书：这封信要送到青槐道北线驿点。" },
        ],
        "周砺": [
            { label: "交谈", response: "周砺说道：校场上不看嘴上功夫，动手便知斤两。" },
            { label: "试炼", response: "周砺举起木牌：想试身手，就从基础擂开始。" },
        ],
        "程开山": [
            { label: "交谈", response: "程开山说道：招式先别贪多，能把一招练熟，比十招半生不熟强。" },
            { label: "请教", response: "程开山压低你的肩：出力之前先站稳，别让下盘飘了。" },
        ],
        "孙百草": [
            { label: "交谈", response: "孙百草说道：药材讲究年份和火候，看错一味，药性就偏了。" },
            { label: "买药", response: "孙百草打开药柜：常用伤药都在这里，你自己挑。" },
        ],
        "钱有余": [
            { label: "交谈", response: "钱有余笑道：小本生意，讲的是东西齐全，价钱公道。" },
            { label: "交易", response: "钱有余摆开货箱：绳索、布包、火折子，出门总有用得上的。" },
        ],
        "铁云生": [
            { label: "交谈", response: "铁云生说道：兵器合不合手，比名头响不响更重要。" },
            { label: "买兵器", response: "铁云生指向架上兵器：刀剑枪棍都有，先试重量。" },
        ],
        "罗万材": [
            { label: "交谈", response: "罗万材说道：好材料不怕贵，怕的是你不知道它能做什么。" },
            { label: "买材料", response: "罗万材摊开账册：矿石、木料、皮革都有新货。" },
        ],
        "祝守真": [
            { label: "交谈", response: "祝守真说道：祠中香火不断，求的是人心有所敬畏。" },
            { label: "祈福", response: "祝守真点燃清香：心诚则正，正则行路不偏。" },
        ],
        "胡三娘": [
            { label: "交谈", response: "胡三娘说道：住店吃饭都好说，先把账结清就成。" },
            { label: "休息", response: "胡三娘拿出房牌：楼上还有空房，今晚可安心歇下。" },
        ],
        "柳闲声": [
            { label: "交谈", response: "柳闲声合上折扇：你想听江湖旧闻，还是近来的城中风声？" },
            { label: "打听", response: "柳闲声压低声音：这几日昭阳府里来往文书比往常多。" },
        ],
        "艄公": [
            { label: "交谈", response: "艄公撑着竹篙说道：今日水势平稳，过渡倒是不难。" },
            { label: "渡河", response: "艄公把船绳解开：要过河便上船，趁风还顺。" },
        ],
        "小二": [
            { label: "交谈", response: "小二擦着桌子说道：来往客多，茶水不贵，消息倒是不少。" },
            { label: "打听", response: "小二压低声音：这两日渡口来了几拨外乡人，看着不像普通商旅。" },
            { label: "歇脚", response: "小二端上一碗热茶：先坐一会儿，赶路也不差这一盏茶的功夫。" },
        ],
        "药丛": [
            { label: "采药", response: "你拨开草叶，采下几株可用的基础药材。" },
        ],
        "矿点": [
            { label: "采矿", response: "你敲开裸露的山石，取下一些可用矿料。" },
        ],
        "树林": [
            { label: "伐木", response: "你在林间挑选合用枝干，整理出一捆木材。" },
            { label: "搜索", response: "你沿着林下查看，发现有人来过的浅淡痕迹。" },
        ],
        "鹿": [
            { label: "狩猎", response: "野鹿察觉动静，猛地跃入草木深处。你需要更接近些才有机会。" },
        ],
        "庄丁": [
            { label: "交谈", response: "庄丁抱拳道：此处是杨家庄，来客若有要事，可先报上姓名。" },
        ],
        "杨破风": [
            { label: "交谈", response: "杨破风说道：杨家庄立庄靠的不是名声，是一代代人守出来的规矩。" },
        ],
        "杨雪翎": [
            { label: "交谈", response: "杨雪翎收枪而立：校场上说话不如出招，站稳了再谈胜负。" },
            { label: "请教", response: "杨雪翎抬枪点地：寒缨落月枪重在身随枪走，脚步慢半分，枪势就断了。" },
        ],
        "墨公": [
            { label: "交谈", response: "墨公合上旧册：书卷不怕旧，怕的是翻的人只看热闹，不看来处。" },
            { label: "翻阅", response: "墨公取出一卷旧录，里面记着杨家庄早年立庄与寒缨落月枪的来历。" },
        ],
        "村民": [
            { label: "交谈", response: "村民说道：谷里平日安静，最近外头来往的人倒是多了些。" },
        ],
        "农户": [
            { label: "交谈", response: "农户拍了拍衣上的土：田里活不等人，风再大也得下地。" },
            { label: "帮忙", response: "农户指向田埂：若有空，帮我把那边的水渠清一清。" },
        ],
        "谷中老人": [
            { label: "交谈", response: "谷中老人慢慢说道：北风谷的风声里，常夹着旧路上的消息。" },
            { label: "打听", response: "谷中老人眯起眼：早年从北边退回来的人，多少都经过这条谷道。" },
        ],
        "边军": [
            { label: "交谈", response: "边军说道：雁回山风口险，旧军营虽破，山道仍不能无人看守。" },
        ],
        "斥候": [
            { label: "交谈", response: "斥候压低声音：边境线近日有脚印往来，不像普通猎户。" },
            { label: "探查", response: "斥候摊开简图：若要查敌踪，先从背风坡那条小路绕过去。" },
        ],
        "残枪": [
            { label: "查看", response: "你拂去枪杆上的尘土，隐约看见旧刻痕，像是杨家枪法留下的记号。" },
        ],
        "赫连铁骨": [
            { label: "交谈", response: "赫连铁骨冷笑道：这片风沙里，能站住的人才有资格说话。" },
        ],
        "周瞎子": [
            { label: "交谈", response: "周瞎子侧耳听了听：脚步虚，呼吸乱，你还没到能拔刀的时候。" },
        ],
        "柳四娘": [
            { label: "交谈", response: "柳四娘轻声道：夜里别回头，回头的人通常走不远。" },
        ],
        "庞千斤": [
            { label: "交谈", response: "庞千斤咧嘴一笑：先锋营不讲虚礼，挡路的都得先挨一下。" },
        ],
        "流寇": [
            { label: "交谈", response: "流寇拦在门前：前面不是你该来的地方，识相就退。" },
        ],
        "玄甲卫": [
            { label: "交谈", response: "玄甲卫沉声道：入演武场先卸杂念，甲重，心更要稳。" },
            { label: "操练", response: "玄甲卫列阵演练，盾步沉稳，枪锋一齐向前压去。" },
        ],
        "玄甲将军": [
            { label: "交谈", response: "玄甲将军说道：玄甲卫守的是城，也是人心。军令一出，不容摇摆。" },
            { label: "军务", response: "玄甲将军摊开军报：近来北线不安，巡防路线要重新核定。" },
        ],
        "先锋校尉": [
            { label: "交谈", response: "先锋校尉说道：先锋营不怕先行，只怕后路不明。" },
            { label: "巡边", response: "先锋校尉点了几名卫士：今日巡边，从西岭口出发。" },
        ],
        "军械官": [
            { label: "交谈", response: "军械官翻看簿册：甲少一片、弩少一弦，到了战时都是人命。" },
            { label: "整备", response: "军械官取出一套护甲：先验甲，再领兵器，规矩不能省。" },
        ],
        "情报官": [
            { label: "交谈", response: "情报官低声道：消息先辨真假，再论轻重，急不得。" },
            { label: "打听", response: "情报官抽出密报：北境方向近来有几处暗线失联。" },
        ],
        "铸甲师": [
            { label: "交谈", response: "铸甲师敲了敲甲片：甲要合身，盾要顺手，差一寸都能要命。" },
            { label: "修甲", response: "铸甲师取过工具：把破损处留下，我先替你看一遍。" },
        ],
        "镇岳宗主": [
            { label: "交谈", response: "镇岳宗主说道：山岳不争高低，只看能不能镇得住脚下之地。" },
            { label: "请教", response: "镇岳宗主沉声道：练玄甲功，先练一口不乱的气。" },
        ],
        "迎客弟子": [
            { label: "交谈", response: "迎客弟子拱手道：来客请先在厅中稍候，我去通传。" },
        ],
        "练功弟子": [
            { label: "交谈", response: "练功弟子擦去额上汗水：石林里练步，慢一步就撞得满身青。" },
            { label: "切磋", response: "练功弟子摆开架势：只比招式，不伤筋骨。" },
        ],
        "旧甲": [
            { label: "查看", response: "你看见旧甲内侧有几道深痕，像是被重兵器硬生生砸裂。" },
        ],
        "石碑": [
            { label: "查看", response: "碑上姓名密密麻麻，其中有些已被风雨磨得难以辨认。" },
        ],
        "守陵人": [
            { label: "交谈", response: "守陵人说道：来这里的人，有的祭旧人，有的找旧债。" },
            { label: "打听", response: "守陵人望向碑林：归乡陵记下的，不只是死人，也是不肯散的旧事。" },
        ],
        "炉工": [
            { label: "交谈", response: "炉工擦了擦汗：炉火一开就不能停，火候差一点，铁水就废了。" },
            { label: "炼铁", response: "炉工夹起矿料：先看成色，再入炉，急不得。" },
        ],
        "矿工": [
            { label: "交谈", response: "矿工说道：矿洞里听声最要紧，石头响得不对，就得立刻退出来。" },
            { label: "采矿", response: "矿工递来矿镐：往里三十步有一段黑石层，别敲承重的地方。" },
        ],
        "石匠": [
            { label: "交谈", response: "石匠拍了拍石料：黑石村靠山吃山，石头也分好坏。" },
            { label: "采石", response: "石匠指向采石场：那片石层结实，适合修墙铺基。" },
        ],
        "黑泥": [
            { label: "采集", response: "你从黑泥里筛出一些细碎铁砂，泥水带着淡淡铁腥味。" },
        ],
        "黑水": [
            { label: "查看", response: "黑水深不见底，湖面平静得有些发沉。" },
            { label: "打捞", response: "你试着探入水中，感觉湖底有硬物压在淤泥下。" },
        ],
        "地脉火息": [
            { label: "探查", response: "你靠近岩缝，热意顺着脚底往上窜，火息忽强忽弱，像在地下缓慢呼吸。" },
            { label: "采集", response: "你避开最烫的裂口，收集到一缕可封存的火性灵息。" },
        ],
        "火山灰": [
            { label: "采集", response: "你拢起一捧细灰，灰里夹着微亮的矿粉，指尖能感到残余热度。" },
            { label: "筛选", response: "你筛去粗砂，留下质地更细的火山灰，可作后续炼制材料。" },
        ],
        "采集队长": [
            { label: "交谈", response: "采集队长抬手挡住热风：谷里别乱走，红岩发亮的地方，脚踩上去就晚了。" },
            { label: "委托", response: "采集队长递来一只封灰袋：去东侧风口取些细灰，别靠近裂火带。" },
        ],
        "守殿弟子": [
            { label: "交谈", response: "守殿弟子拱手道：此处是开阳殿，来客若有拜山文书，可先交由我通传。" },
            { label: "通传", response: "守殿弟子接过名帖，转身入殿禀报，只留殿前火纹灯静静燃着。" },
        ],
        "升阳执事": [
            { label: "交谈", response: "升阳执事翻看片册：升阳殿重晨课与试炼，火候不稳者，先练心息。" },
            { label: "试炼", response: "升阳执事点出一枚赤色木签：若要试炼，先去殿前火阶走满三巡。" },
        ],
        "观潮弟子": [
            { label: "交谈", response: "观潮弟子望着远水：潮声三短一长，今夜水脉会涨，不宜久留台下。" },
            { label: "观潮", response: "你顺着石台看去，潮线一层层推开，远处水雾像被无形之手拨动。" },
        ],
        "墨潭守者": [
            { label: "交谈", response: "墨潭守者低声道：潭色越黑，越不能乱探，水下回声会把人心也照出来。" },
            { label: "探潭", response: "你俯身看向潭面，只见黑水不映人影，反倒传来极轻的回响。" },
        ],
        "渔水村民": [
            { label: "交谈", response: "渔水村民收起渔网：靠水吃饭的人，先看天，再看潮，最后才看鱼。" },
            { label: "打听", response: "村民指向下游：这两日大码头来的船多，货少，人却杂。" },
        ],
        "码头管事": [
            { label: "交谈", response: "码头管事翻着木牌：上岸登记，出船报备，潮音道的水路不能乱走。" },
            { label: "查船", response: "码头管事抽出一册船簿：昨夜有一艘无灯小船靠过外埠。" },
        ],
        "听潮行者": [
            { label: "交谈", response: "听潮行者侧耳听风：水声里有杂音，像有人在上游动过禁制。" },
            { label: "寻声", response: "你跟着行者停步，细听之下，潮声中果然夹着断续的石鸣。" },
        ],
        "巡殿弟子": [
            { label: "交谈", response: "巡殿弟子拱手道：沧浪殿今日闭殿半日，外客请先在廊下等候。" },
            { label: "通报", response: "巡殿弟子记下你的来意，转身沿水阶入殿通报。" },
        ],
        "静修弟子": [
            { label: "交谈", response: "静修弟子睁眼片刻：洞中水静，心若不静，听见的都是乱声。" },
            { label: "静坐", response: "你在洞口坐下，水滴声慢慢压低杂念，呼吸也跟着沉稳下来。" },
        ],
        "水廊守卫": [
            { label: "交谈", response: "水廊守卫抬手拦住去路：廊外暗流急，没令牌别往深处走。" },
            { label: "巡查", response: "水廊守卫沿栏杆查看水痕，几处潮线比昨日又高了一寸。" },
        ],
        "林中隐者": [
            { label: "交谈", response: "林中隐者拨开梧桐叶：树听风，人听心。山里路多，别只看脚下。" },
            { label: "问路", response: "隐者指向林深处：顺着落叶少的地方走，能避开最潮的山坳。" },
        ],
        "坐台修士": [
            { label: "交谈", response: "坐台修士缓缓睁眼：云气今日偏东，苍山灵机有些浮动。" },
            { label: "观气", response: "你登上坐台远望，山脊间雾线层叠，像一条缓慢游动的白脉。" },
        ],
        "崖边采药人": [
            { label: "交谈", response: "采药人系紧腰绳：崖边草好，命也薄。要采药，先看石头稳不稳。" },
            { label: "采药", response: "你沿崖壁慢慢探手，采下一株贴石而生的细叶灵草。" },
        ],
        "上清道众": [
            { label: "交谈", response: "上清道众稽首道：上清殿内正在早课，来客请在阶前稍候。" },
            { label: "请见", response: "道众收下名帖，转入殿内通传，殿中钟声随即低低响起。" },
        ],
        "太清执事": [
            { label: "交谈", response: "太清执事合上典册：归墟宫规矩不重声势，重在心念清明。" },
            { label: "领事", response: "太清执事递来一枚木签：今日可去洗心池协助更换净心香。" },
        ],
        "无心阁守": [
            { label: "交谈", response: "无心阁守低声道：阁中旧卷不可外借，若要翻阅，先洗手静坐。" },
            { label: "翻阅", response: "你翻开旧卷，纸页间记着归墟宫前辈对无心入定的注解。" },
        ],
        "洗心池童": [
            { label: "交谈", response: "洗心池童捧着香盒：池水不洗尘土，洗的是念头。" },
            { label: "静心", response: "你在池边停下，净心香散开，杂念像水面涟漪一样慢慢平复。" },
        ],
        "重岳铁匠": [
            { label: "交谈", response: "重岳铁匠说道：玄甲道的铁器讲究结实，花巧不顶用。" },
            { label: "修理", response: "重岳铁匠接过器具：放这儿吧，晚些时候来取。" },
        ],
        "玄甲道使": [
            { label: "交谈", response: "玄甲道使说道：重岳城立在这里，靠的是规矩稳、城防稳、人心也稳。" },
            { label: "政务", response: "玄甲道使翻开文案：黑石村和沉铁湖的呈报都要核一遍。" },
        ],
        "玄甲兵曹": [
            { label: "交谈", response: "玄甲兵曹说道：城墙再厚，也得有人守。" },
            { label: "军务", response: "玄甲兵曹点向地图：玄甲卫今日要增派一队去北门巡防。" },
        ],
        "玄甲巡按": [
            { label: "交谈", response: "玄甲巡按说道：重案看证据，小案看人心，两样都不能偏。" },
            { label: "案卷", response: "玄甲巡按取出卷宗：这里有一桩矿区纠纷，牵涉的人不少。" },
        ],
        "酒肆掌柜": [
            { label: "交谈", response: "酒肆掌柜笑道：酒能暖身，话能暖场，但有些话听了就当没听见。" },
            { label: "打听", response: "酒肆掌柜压低声音：最近玄甲府的人常往沉铁湖方向去。" },
        ],
        "玄甲驿丞": [
            { label: "交谈", response: "玄甲驿丞说道：驿路不能断，消息一慢，边地就容易出乱子。" },
            { label: "传信", response: "玄甲驿丞递来封好的文书：送去黑石村，路上别耽搁。" },
        ],
        "客栈掌柜": [
            { label: "交谈", response: "客栈掌柜说道：住店可以，兵器别带进上房，免得惊了客人。" },
            { label: "休息", response: "客栈掌柜取出木牌：二楼靠里的房间还空着。" },
        ],
        "裁缝": [
            { label: "交谈", response: "裁缝抬头看了看你：衣服磨损不算事，走远路的人哪有不破边的。" },
            { label: "缝补", response: "裁缝取来针线：破口不大，一会儿就能补好。" },
        ],
        "守望兵": [
            { label: "交谈", response: "守望兵望着城外：重岳城不怕风大，就怕看漏了远处的烟尘。" },
            { label: "观察", response: "你登上瞭望台，看见城外官道和远山轮廓尽收眼底。" },
        ],
    };

    onAwake(): void {
        this.button = this.owner as Laya.Sprite;
        this.button.mouseEnabled = true;
        this.button.on(Laya.Event.CLICK, this, this.openTarget);
    }

    onDestroy(): void {
        this.button?.off(Laya.Event.CLICK, this, this.openTarget);
    }

    private openTarget(): void {
        const target = this.targetNode ?? this.findTargetNode();
        if (target) {
            this.closeRoleDetail();
            (target as Laya.Sprite).visible = true;
            this.renderBuildingDetail(target);
        }
    }

    private closeRoleDetail(): void {
        const detailNode = this.findNode(this.getSceneRoot(), "node3");
        if (detailNode) {
            (detailNode as Laya.Sprite).visible = false;
        }
    }

    private renderBuildingDetail(target: Laya.Node): void {
        const buildingName = this.getBuildingName();
        const displayName = this.getDisplayName();
        const entries = this.buildingDetails[buildingName] ?? [];
        const title = this.findNode(target, "name") as Laya.Text | null;
        const list = this.findNode(target, "list") as Laya.GList | null;

        if (title) {
            title.text = displayName;
        }

        if (list) {
            list.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.renderRoleListItem(item, entries[index] ?? "");
            };
            list.numItems = entries.length;
        }
    }

    private renderRoleListItem(item: Laya.GWidget, roleName: string): void {
        item.mouseEnabled = roleName !== "";
        item.off(Laya.Event.CLICK, this, this.openRoleDetail);
        if (roleName) {
            item.on(Laya.Event.CLICK, this, this.openRoleDetail, [roleName]);
        }

        this.setItemText(item, roleName);
    }

    private openRoleDetail(roleName: string): void {
        const detailNode = this.findNode(this.getSceneRoot(), "node3");
        if (!detailNode) {
            return;
        }

        (detailNode as Laya.Sprite).visible = true;

        const title = this.findNode(detailNode, "name") as Laya.Text | null;
        if (title) {
            title.text = roleName;
        }

        const description = this.findNode(detailNode, "name_1") as Laya.Text | null;
        if (description) {
            description.text = this.roleDescriptions[roleName] ?? `${roleName}正在此处处理事务。`;
        }

        const list = this.findNode(detailNode, "list") as Laya.GList | null;
        if (list) {
            list.numItems = 0;
        }

        const actions = this.getRoleActions(roleName);
        const actionList = this.findNode(detailNode, "list_1") as Laya.GList | null;
        if (actionList) {
            actionList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.renderRoleActionItem(item, actions[index] ?? null);
            };
            actionList.numItems = actions.length;
        }
    }

    private renderRoleActionItem(item: Laya.GWidget, action: RoleInteraction | null): void {
        item.mouseEnabled = action !== null;
        item.off(Laya.Event.CLICK, this, this.showRoleInteraction);
        if (action) {
            item.on(Laya.Event.CLICK, this, this.showRoleInteraction, [action.response]);
        }

        this.setItemText(item, action?.label ?? "");
    }

    private showRoleInteraction(response: string): void {
        const detailNode = this.findNode(this.getSceneRoot(), "node3");
        const description = this.findNode(detailNode, "name_1") as Laya.Text | null;
        if (description) {
            description.text = response;
        }
    }

    private getRoleActions(roleName: string): RoleInteraction[] {
        return this.roleActions[roleName] ?? [{ label: "交谈", response: `${roleName}暂时没有特别的话要说。` }];
    }

    private setItemText(item: Laya.GWidget, textValue: string): void {
        const text =
            (item.getChildByName("char_0") ??
                item.getChildByName("Text") ??
                item.getChildByName("name")) as Laya.Text | null;
        if (text) {
            text.text = textValue;
        }
    }

    private getBuildingName(): string {
        return this.buildingName || (this.owner as Laya.Node).name;
    }

    private getDisplayName(): string {
        return this.displayName || this.getBuildingName();
    }

    private findTargetNode(): Laya.Node | null {
        if (!this.targetNodeName) {
            return null;
        }

        const owner = this.owner as Laya.Node;
        return this.findNode(owner.parent ?? Laya.stage, this.targetNodeName) ?? this.findNode(Laya.stage, this.targetNodeName);
    }

    private getSceneRoot(): Laya.Node {
        let node = this.owner as Laya.Node;
        while (node.parent) {
            node = node.parent;
        }

        return node;
    }

    private findNode(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNode(root.getChildAt(i), name);
            if (result) {
                return result;
            }
        }

        return null;
    }
}
