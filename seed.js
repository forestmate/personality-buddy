/**
 * 种子配置：内容默认数据（首次启动生成 config.json）
 * 所有字段都可在管理后台编辑后保存，前端动态读取。
 */
const TRAIT = {
  D:{name:'果断',key:'当断则断',strength:'遇事能快速拍板、雷厉风行',weak:'偶有冲动，容易忽略细节风险'},
  C:{name:'谨慎',key:'三思后行',strength:'考虑周全、几乎不踩坑',weak:'容易想太多，机会来了会犹豫错过'},
  S:{name:'稳定',key:'情绪稳定',strength:'大风大浪面前也稳得住，是定心丸',weak:'共情稍弱，有时读不懂身边人情绪'},
  N:{name:'敏感',key:'细腻共情',strength:'能敏锐察觉他人情绪，相处贴心',weak:'容易内耗，一句话可能琢磨很久'},
  E:{name:'外向',key:'主动输出',strength:'自来熟、人脉广，能迅速打开局面',weak:'独处少，有时忽略内心真正想要什么'},
  I:{name:'内向',key:'深度独处',strength:'独处中沉淀出深度，朋友少但很铁',weak:'社交消耗大，容易错过关键机会'},
  O:{name:'秩序',key:'计划自律',strength:'凡事有规划、做事靠谱',weak:'计划被打乱会焦虑，灵活性不足'},
  P:{name:'随性',key:'灵活随缘',strength:'随机应变强，到哪里都能适应',weak:'容易拖延，重要事常赶最后期限'},
  T:{name:'理性',key:'逻辑优先',strength:'判断不感情用事，决策质量高',weak:'说话太直接，容易伤到在乎的人'},
  F:{name:'感性',key:'感受优先',strength:'重视他人感受，关系里有温度',weak:'易为情所困，重大决策可能被情绪带偏'},
  A:{name:'攻坚',key:'全力以赴',strength:'认定目标就冲刺到底，执行力拉满',weak:'容易焦虑紧绷，休息时也在卷自己'},
  L:{name:'躺平',key:'佛系自洽',strength:'心态极稳、抗压强，活得松弛',weak:'目标感偏弱，关键时刻缺少推进力'}
};
const BASES = {DSE:'领航者',DSI:'独行者',DNE:'燃星者',DNI:'暗锋者',CSE:'掌舵者',CSI:'守望者',CNE:'织梦者',CNI:'静思者'};
const MODS  = {OTA:'锋芒',OTL:'磐石',OFA:'暖锋',OFL:'港湾',PTA:'疾风',PTL:'清风',PFA:'焰火',PFL:'流云'};
const LET = [['D','C'],['S','N'],['E','I'],['O','P'],['T','F'],['A','L']];
const DIM_INFO = {
  dc:{label:'决策',opts:['果断','谨慎'],cat:'comp',benefit:'一个果断拍板、一个谨慎把关，是最经典的「决策拍档」',risk:'决策节奏不同：一个想立刻定，一个还要再想想'},
  sn:{label:'情绪',opts:['稳定','敏感'],cat:'comp',benefit:'一个提供安全感，一个提供情绪价值，是彼此的「情绪锚」',risk:'情绪表达温差大，一个波澜不惊，一个波澜起伏'},
  ei:{label:'社交',opts:['外向','内向'],cat:'comp',benefit:'一个开拓圈子、一个深度陪伴，一外一内把朋友圈盘活',risk:'社交需求不同：一个要热闹，一个要独处'},
  op:{label:'规划',opts:['秩序','随性'],cat:'mix',benefit:'一个兜底规划让计划落地，一个灵活破局打破僵局',risk:'一个雷打不动按计划来，一个随性走一步看一步，节奏容易对不上'},
  tf:{label:'思维',opts:['理性','感性'],cat:'conflict',benefit:'一个负责客观判断，一个负责照顾人情，看问题更全面',risk:'一个讲逻辑对错，一个重感受温度，沟通容易「鸡同鸭讲」'},
  al:{label:'行动',opts:['攻坚','躺平'],cat:'conflict',benefit:'一个负责冲、一个负责稳，松弛有度反而不内耗',risk:'一个在冲刺、一个在躺平，一个觉得对方不进取，一个觉得对方太紧绷'}
};

/* 30 题（可后台编辑） */
const QUESTIONS = [
  {dim:'dc',fav:0,text:'和朋友商量周末去哪玩，你通常是第一个拍板定方案的人。'},
  {dim:'dc',fav:1,text:'面对重要选择，你会把选项列成清单反复权衡，才肯做决定。'},
  {dim:'dc',fav:0,text:'计划出现意外时，你能瞬间调整方向重新出击，不带犹豫。'},
  {dim:'dc',fav:1,text:'做决定之前，你总想等所有信息都到位，哪怕多花时间。'},
  {dim:'dc',fav:0,text:'有人说你「雷厉风行」，因为你看准了就立刻行动。'},
  {dim:'sn',fav:1,text:'朋友向你倾诉烦恼时，你很容易跟着一起心情低落。'},
  {dim:'sn',fav:0,text:'就算遇到糟心事，你也能很快把情绪稳住，不露声色。'},
  {dim:'sn',fav:1,text:'别人的一句话，可能让你在心里翻来覆去琢磨很久。'},
  {dim:'sn',fav:0,text:'你是朋友圈公认的「情绪稳定器」，大家有事都爱找你拿主意。'},
  {dim:'sn',fav:1,text:'看感人的电影或故事，你比身边人更容易眼眶发红。'},
  {dim:'ei',fav:0,text:'参加完热闹的聚会，你不但不累，反而感觉能量满满。'},
  {dim:'ei',fav:1,text:'比起一群人狂欢，你更享受一个人安安静静待着。'},
  {dim:'ei',fav:0,text:'和不熟的人第一次见面，你也能很快找到话题聊起来。'},
  {dim:'ei',fav:1,text:'周末你更愿意宅家充电，而不是出门社交应酬。'},
  {dim:'ei',fav:0,text:'在群里或饭局上，你常常是主动活跃气氛的那个人。'},
  {dim:'op',fav:0,text:'出门旅行前，你会把行程、酒店、攻略都安排得明明白白。'},
  {dim:'op',fav:1,text:'你的房间或桌面通常比较随性，想收就收，不想收也不勉强。'},
  {dim:'op',fav:0,text:'每天列待办清单、逐项打勾，会给你很强的成就感。'},
  {dim:'op',fav:1,text:'临时约饭、临时改计划，你完全 OK，随时能调整。'},
  {dim:'op',fav:0,text:'重要的任务你习惯提前完成，而不是拖到最后一刻。'},
  {dim:'tf',fav:0,text:'做决定时，你更看重「这样做是否合理」，而不是「感觉是否舒服」。'},
  {dim:'tf',fav:1,text:'朋友难过时，你会先给理解和安慰，而不是急着分析对错。'},
  {dim:'tf',fav:0,text:'讨论问题时，你会直接指出逻辑漏洞，哪怕对方听了不舒服。'},
  {dim:'tf',fav:1,text:'比起一大堆数据，你更容易被一个动人的故事说服。'},
  {dim:'tf',fav:0,text:'你认为感情用事最容易坏事，凡事理性分析最靠谱。'},
  {dim:'al',fav:0,text:'定了目标你就会全力冲刺，不达目的不罢休。'},
  {dim:'al',fav:1,text:'你的人生信条是「差不多就行」，舒服比上进重要。'},
  {dim:'al',fav:0,text:'看到别人都在卷，你会忍不住焦虑，跟着一起加码。'},
  {dim:'al',fav:1,text:'你更愿意把时间花在让自己开心的事上，而不是拼业绩。'},
  {dim:'al',fav:0,text:'闲下来的时候，你也在琢磨怎么提升自己、学点新东西。'}
];

/* 64 型人格名 */
const PERSONALITIES = {};
for (let i = 0; i < 64; i++) {
  let code = '';
  for (let d = 0; d < 6; d++) code += LET[d][(i >> d) & 1];
  const first3 = code.slice(0, 3), last3 = code.slice(3);
  PERSONALITIES[code] = {
    name: BASES[first3] + '·' + MODS[last3],
    tags: [TRAIT[code[0]].name, TRAIT[code[1]].name, TRAIT[code[2]].name]
  };
}

/* 匹配文案模板（可后台编辑） */
const TEMPLATES = {
  appName: '人格搭子 · 互补匹配',
  compTitle: '🏆 天选互补搭子',
  conflictTitle: '💥 雷区冲突搭子',
  similarTitle: '🤝 同类默契搭子',
  compWhy: '为什么最互补',
  compGain: '搭在一起的最大优势',
  compRisk: '唯一小风险',
  compWork: '最佳分工',
  conflictRoot: '冲突根源',
  conflictPoint: '高发矛盾点',
  conflictCheck: '可磨合判定',
  conflictAvoid: '避雷方案',
  similarGain: '相似优势',
  similarRisk: '隐藏风险',
  similarSupply: '需要刻意补足',
  compDefaultWhy: '你们在多个维度上形成天然咬合，彼此补上对方最缺的那块拼图。',
  compDefaultGain: '1+1>2 的组合，各自动能的短板都被对方补齐。',
  compDefaultRisk: '互补部分可能让一方偶尔觉得「被看穿」。',
  conflictDefaultRoot: '互补型差异没有直接雷区，但雷点藏在细节里，需要多沟通。',
  conflictDefaultPoint: '对事情的优先级和投入程度认知不一致。',
  conflictAvoidTxt: '先约定「观点归观点、感情归感情」，分歧时各退半步，把「我没错」换成「我们怎么共赢」。',
  similarRiskTxt: '两个同类会让这一侧的短板叠加放大，容易一起陷入惯性。',
  similarSupplyTxt: '故意找点「不一样」的外部输入，避免两人一起陷入惯性思维。',
  footer: '你敢测吗？测出谁最适合你、谁最克你'
};

module.exports = { questions: QUESTIONS, personalities: PERSONALITIES, templates: TEMPLATES, dims: DIM_INFO, traits: TRAIT };
