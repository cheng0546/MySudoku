// 多语言：界面文字字典（zh / en / fr）与教学内容。其余模块通过 I18n.t(key, params) 取文字。
const I18n = (() => {
  const SUPPORTED = ["zh", "en", "fr"];
  const LANG_KEY = "mysudoku-lang";
  const dict = { zh: {}, en: {}, fr: {} };
  const content = { zh: {}, en: {}, fr: {} };
  const listeners = [];

  const detect = () => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) { /* 存储不可用：使用浏览器语言 */ }
    const nav = String(navigator.language || "").toLowerCase();
    if (nav.startsWith("zh")) return "zh";
    if (nav.startsWith("fr")) return "fr";
    return nav ? "en" : "zh";
  };
  let lang = typeof navigator === "undefined" ? "zh" : detect();

  const t = (key, params) => {
    let s = dict[lang][key];
    if (s === undefined) s = dict.zh[key];
    if (s === undefined) s = key;
    return params ? s.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m)) : s;
  };

  const add = (l, obj) => Object.assign(dict[l], obj);
  // 教学内容：{ basics, marks, help: {技巧: {summary, how}}, lessons: {技巧: {terms, sections:[{h,t,lab}], tip}} }
  const addContent = (l, obj) => {
    const c = content[l];
    for (const k of ["basics", "marks"]) if (obj[k]) c[k] = obj[k];
    for (const k of ["help", "lessons"]) c[k] = Object.assign(c[k] || {}, obj[k] || {});
  };
  const getContent = () => content[lang];

  // 技巧名称：中文用配置中的中文名，英文用固定英文名，法语用字典（缺省回退英文名）
  const techName = (key) => {
    const cfg = SolverKit.TECHNIQUE_CONFIG[key];
    if (lang === "zh") return cfg.name;
    if (lang === "fr") return dict.fr["tech." + key] || cfg.nameEn;
    return cfg.nameEn;
  };

  const techFull = (key) => {
    const cfg = SolverKit.TECHNIQUE_CONFIG[key];
    const n = techName(key);
    if (lang === "zh") return `${n}（${cfg.nameEn}）`;
    return n === cfg.nameEn ? n : `${n} (${cfg.nameEn})`;
  };

  const setLang = (l) => {
    if (!SUPPORTED.includes(l) || l === lang) return;
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* 忽略 */ }
    if (typeof document !== "undefined") document.documentElement.lang = { zh: "zh-CN", en: "en", fr: "fr" }[l];
    listeners.forEach((f) => f(l));
  };
  const onChange = (f) => listeners.push(f);

  return {
    SUPPORTED, add, addContent, getContent, t, techName, techFull, setLang, onChange,
    keys: (l) => Object.keys(dict[l]),
    get lang() { return lang; },
  };
})();
