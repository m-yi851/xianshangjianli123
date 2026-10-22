export const asset = filename => `${import.meta.env.BASE_URL}assets/${filename}`;

// 所有展示资料集中在此维护。作品名称尚未提供，暂用原文件编号。
export const profile = {
  name: '王聪聪',
  englishName: 'WANG CONGCONG',
  role: '短视频编导 / AIGC 编导',
  city: '天津',
  email: '1904578838@qq.com',
  phone: '19833199685',
  introduction: '我是王聪聪，专注短视频与 AIGC 影像创作。从一个想法出发，寻找合适的叙事、画面与节奏，把创意变成可以被看见的作品。',
  background: '物联网工程专业出身，拥有用户运营与独立项目实践背景。我希望把对用户的理解、技术思维与影像表达连接起来，探索更多创作可能。',
};

export const projects = [
  { id: '01', title: '作品 01', subtitle: '让画面，展开叙事。', category: '视频作品', type: 'video', media: asset('project-01.mp4'), poster: asset('project-01.jpg'), duration: '02:18', format: '9:16 / VIDEO', description: '完整视频作品 · 点击播放，查看原有叙事与影像节奏。', note: '作品名称、项目背景与本人职责待补充。' },
  { id: '02', title: '作品 02', subtitle: '每一帧，都有表达。', category: '视频作品', type: 'video', media: asset('project-02.mp4'), poster: asset('project-02.jpg'), duration: '01:26', format: '9:16 / VIDEO', description: '完整视频作品 · 用影像呈现创意，留下感受。', note: '作品名称、项目背景与本人职责待补充。' },
  { id: '03', title: '爱人错过', subtitle: '故事落在，人与人的瞬间。', category: '影像摄影', type: 'image', media: asset('project-03.jpg'), poster: asset('project-03.jpg'), duration: 'STILL', format: '16:9 / PHOTOGRAPHY', description: '摄影作品 · 作品图署名：摄影 / 王聪聪。', note: '当前提供的是作品图片，暂无对应视频。' },
];

export const experiences = [
  { date: '2026.03 — 2026.06', title: '运营助理 · 实习', detail: '天津津榜提名校外托管服务有限公司', body: '参与用户需求对接、课程排期、数据跟踪与运营流程优化。' },
  { date: '2024.07 — 2024.09', title: '独立项目实践', detail: '假期补课班 · 项目负责人', body: '从调研、获客到交付，独立推动项目落地，积累资源统筹与执行经验。' },
  { date: '2024.02 — 2024.06', title: '用户运营专员', detail: '星力宇教育科技发展有限公司', body: '围绕用户需求开展社群运营、内容分享与服务流程建设。' },
];

export const strengths = [
  { no: '01', mark: '✳', en: 'STORY & PEOPLE', title: '从观众出发', text: '把用户运营中的需求理解带入创作，让主题、表达与受众的真实处境产生联系。', tags: ['需求理解', '内容表达'] },
  { no: '02', mark: '⌘', en: 'AI & IMAGINATION', title: '用技术打开想象', text: '结合技术学习背景，探索 AIGC 在创意构思与影像表达中的应用。', tags: ['AIGC 探索', '技术思维'] },
  { no: '03', mark: '↗', en: 'IDEA TO EXECUTION', title: '让想法落到实处', text: '拥有独立项目从调研到交付的实践，把目标拆成可执行的步骤，推动协作与落地。', tags: ['项目统筹', '执行推进'] },
];
