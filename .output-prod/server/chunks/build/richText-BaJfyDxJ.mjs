import { m as useState, $ as $fetch$1 } from '../virtual/entry.mjs';
import { computed } from 'vue';

function useCustomEmojis() {
  const emojis = useState("custom-emojis", () => []);
  const loaded = useState("custom-emojis:loaded", () => false);
  const loading = useState("custom-emojis:loading", () => false);
  const map = computed(() => Object.fromEntries(emojis.value.map((e) => [e.name, e.url])));
  const byName = computed(() => Object.fromEntries(emojis.value.map((e) => [e.name, e])));
  function has(name) {
    return !!byName.value[name.toLowerCase()];
  }
  async function refresh() {
    if (loading.value) return;
    loading.value = true;
    try {
      const res = await $fetch$1("/api/emojis");
      emojis.value = res.emojis || [];
      loaded.value = true;
    } catch {
    } finally {
      loading.value = false;
    }
  }
  async function ensure() {
    if (loaded.value || loading.value) return;
    await refresh();
  }
  async function upload(name, file) {
    const form = new FormData();
    form.append("name", name.replace(/^:|:$/g, "").toLowerCase());
    form.append("file", file);
    const res = await $fetch$1("/api/emojis", {
      method: "POST",
      body: form
    });
    emojis.value = [res.emoji, ...emojis.value];
    return res.emoji;
  }
  async function remove(id) {
    await $fetch$1(`/api/emojis/${id}`, { method: "DELETE" });
    emojis.value = emojis.value.filter((e) => e.id !== id);
  }
  return {
    emojis,
    map,
    byName,
    loaded,
    loading,
    has,
    refresh,
    ensure,
    upload,
    remove
  };
}
var EMOJI_LIST = [
  ["smileys", [
    ["grinning", "\u{1F600}"],
    ["smiley", "\u{1F603}"],
    [
      "smile",
      "\u{1F604}",
      ["happy", "joy"]
    ],
    ["grin", "\u{1F601}"],
    [
      "laughing",
      "\u{1F606}",
      ["satisfied"]
    ],
    ["sweat_smile", "\u{1F605}"],
    [
      "joy",
      "\u{1F602}",
      ["lol", "tears"]
    ],
    [
      "rofl",
      "\u{1F923}",
      ["lmao"]
    ],
    ["blush", "\u{1F60A}"],
    ["wink", "\u{1F609}"],
    ["heart_eyes", "\u{1F60D}"],
    ["kissing_heart", "\u{1F618}"],
    ["yum", "\u{1F60B}"],
    ["sunglasses", "\u{1F60E}"],
    ["thinking", "\u{1F914}"],
    ["neutral_face", "\u{1F610}"],
    ["no_mouth", "\u{1F636}"],
    ["smirk", "\u{1F60F}"],
    ["stuck_out_tongue", "\u{1F61B}"],
    ["stuck_out_tongue_winking_eye", "\u{1F61C}"],
    ["zany_face", "\u{1F92A}"],
    ["flushed", "\u{1F633}"],
    ["pleading_face", "\u{1F97A}"],
    [
      "sob",
      "\u{1F62D}",
      ["cry"]
    ],
    ["cry", "\u{1F622}"],
    ["angry", "\u{1F620}"],
    ["rage", "\u{1F621}"],
    ["scream", "\u{1F631}"],
    ["fearful", "\u{1F628}"],
    ["cold_sweat", "\u{1F630}"],
    ["sweat", "\u{1F613}"],
    ["sleepy", "\u{1F62A}"],
    ["sleeping", "\u{1F634}"],
    ["zzz", "\u{1F4A4}"],
    ["dizzy_face", "\u{1F635}"],
    ["crazy_face", "\u{1F92F}"],
    ["shush", "\u{1F92B}"],
    ["mask", "\u{1F637}"],
    ["nerd", "\u{1F913}"],
    ["monocle_face", "\u{1F9D0}"],
    ["shrug", "\u{1F937}"],
    ["facepalm", "\u{1F926}"],
    ["pensive", "\u{1F614}"],
    ["disappointed", "\u{1F61E}"],
    ["worried", "\u{1F61F}"],
    ["confused", "\u{1F615}"],
    ["upside_down_face", "\u{1F643}"],
    ["expressionless", "\u{1F611}"],
    ["unamused", "\u{1F612}"],
    ["roll_eyes", "\u{1F644}"],
    ["lying_face", "\u{1F925}"],
    ["relieved", "\u{1F60C}"],
    ["grinning_face_with_sweat", "\u{1F605}"],
    ["partying_face", "\u{1F973}"],
    ["star_struck", "\u{1F929}"],
    ["smiling_face_with_hearts", "\u{1F970}"],
    ["hot_face", "\u{1F975}"],
    ["cold_face", "\u{1F976}"],
    ["woozy_face", "\u{1F974}"],
    ["pleading", "\u{1F97A}"],
    [
      "skull",
      "\u{1F480}",
      ["dead"]
    ],
    ["ghost", "\u{1F47B}"],
    ["alien", "\u{1F47D}"],
    ["robot", "\u{1F916}"],
    [
      "poop",
      "\u{1F4A9}",
      ["shit"]
    ],
    ["clown_face", "\u{1F921}"],
    ["imp", "\u{1F47F}"],
    ["smiling_imp", "\u{1F608}"],
    ["japanese_ogre", "\u{1F479}"],
    ["jack_o_lantern", "\u{1F383}"],
    ["santa", "\u{1F385}"],
    ["snowman", "\u2603\uFE0F"],
    ["christmas_tree", "\u{1F384}"]
  ]],
  ["gestures", [
    [
      "thumbsup",
      "\u{1F44D}",
      ["+1", "like"]
    ],
    [
      "thumbsdown",
      "\u{1F44E}",
      ["-1"]
    ],
    ["ok_hand", "\u{1F44C}"],
    ["clap", "\u{1F44F}"],
    [
      "pray",
      "\u{1F64F}",
      ["thanks"]
    ],
    [
      "wave",
      "\u{1F44B}",
      ["hello", "bye"]
    ],
    ["point_up", "\u261D\uFE0F"],
    ["point_down", "\u{1F447}"],
    ["point_left", "\u{1F448}"],
    ["point_right", "\u{1F449}"],
    [
      "muscle",
      "\u{1F4AA}",
      ["strong"]
    ],
    ["v", "\u270C\uFE0F"],
    ["metal", "\u{1F918}"],
    ["crossed_fingers", "\u{1F91E}"],
    ["handshake", "\u{1F91D}"],
    ["raised_hands", "\u{1F64C}"],
    ["folded_hands", "\u{1F64F}"],
    ["open_hands", "\u{1F450}"],
    ["raised_hand", "\u270B"],
    ["writing_hand", "\u270D\uFE0F"],
    ["nail_care", "\u{1F485}"],
    ["eyes", "\u{1F440}"],
    ["eye", "\u{1F441}\uFE0F"],
    ["brain", "\u{1F9E0}"],
    [
      "heart",
      "\u2764\uFE0F",
      ["love"]
    ],
    ["broken_heart", "\u{1F494}"],
    ["sparkling_heart", "\u{1F496}"],
    ["two_hearts", "\u{1F495}"],
    ["blue_heart", "\u{1F499}"],
    ["green_heart", "\u{1F49A}"],
    ["yellow_heart", "\u{1F49B}"],
    ["purple_heart", "\u{1F49C}"],
    ["orange_heart", "\u{1F9E1}"],
    ["black_heart", "\u{1F5A4}"],
    ["white_heart", "\u{1F90D}"],
    ["brown_heart", "\u{1F90E}"],
    ["hearts", "\u2665\uFE0F"],
    ["heartbeat", "\u{1F493}"],
    ["cupid", "\u{1F498}"],
    ["kiss", "\u{1F48B}"]
  ]],
  ["objects", [
    [
      "fire",
      "\u{1F525}",
      ["lit"]
    ],
    ["star", "\u2B50"],
    ["star2", "\u{1F31F}"],
    ["sparkles", "\u2728"],
    ["zap", "\u26A1"],
    ["boom", "\u{1F4A5}"],
    [
      "tada",
      "\u{1F389}",
      ["party"]
    ],
    ["confetti_ball", "\u{1F38A}"],
    ["gift", "\u{1F381}"],
    ["trophy", "\u{1F3C6}"],
    ["medal", "\u{1F3C5}"],
    ["crown", "\u{1F451}"],
    ["gem", "\u{1F48E}"],
    ["rocket", "\u{1F680}"],
    ["airplane", "\u2708\uFE0F"],
    ["car", "\u{1F697}"],
    ["train", "\u{1F683}"],
    ["house", "\u{1F3E0}"],
    ["sun", "\u2600\uFE0F"],
    ["moon", "\u{1F319}"],
    ["cloud", "\u2601\uFE0F"],
    ["rain", "\u{1F327}\uFE0F"],
    ["snow", "\u2744\uFE0F"],
    ["umbrella", "\u2614"],
    ["rainbow", "\u{1F308}"],
    ["ocean", "\u{1F30A}"],
    ["earth", "\u{1F30D}"],
    ["globe_with_meridians", "\u{1F310}"],
    ["mountain", "\u26F0\uFE0F"],
    ["flower", "\u{1F338}"],
    ["sunflower", "\u{1F33B}"],
    ["rose", "\u{1F339}"],
    ["cherry_blossom", "\u{1F338}"],
    ["four_leaf_clover", "\u{1F340}"],
    ["apple", "\u{1F34E}"],
    ["orange", "\u{1F34A}"],
    ["banana", "\u{1F34C}"],
    ["watermelon", "\u{1F349}"],
    ["grapes", "\u{1F347}"],
    ["strawberry", "\u{1F353}"],
    ["peach", "\u{1F351}"],
    ["cherries", "\u{1F352}"],
    ["lemon", "\u{1F34B}"],
    ["pizza", "\u{1F355}"],
    ["hamburger", "\u{1F354}"],
    ["fries", "\u{1F35F}"],
    ["sushi", "\u{1F363}"],
    ["ramen", "\u{1F35C}"],
    ["beer", "\u{1F37A}"],
    ["sake", "\u{1F376}"],
    ["wine_glass", "\u{1F377}"],
    ["coffee", "\u2615"],
    ["tea", "\u{1F375}"],
    ["cake", "\u{1F370}"],
    ["birthday", "\u{1F382}"],
    ["cookie", "\u{1F36A}"],
    ["chocolate_bar", "\u{1F36B}"],
    ["candy", "\u{1F36C}"],
    ["rice", "\u{1F35A}"],
    ["curry", "\u{1F35B}"],
    ["bento", "\u{1F371}"],
    ["doughnut", "\u{1F369}"],
    ["icecream", "\u{1F366}"],
    ["dog", "\u{1F436}"],
    ["cat", "\u{1F431}"],
    ["mouse", "\u{1F42D}"],
    ["hamster", "\u{1F439}"],
    ["rabbit", "\u{1F430}"],
    ["fox_face", "\u{1F98A}"],
    ["bear", "\u{1F43B}"],
    ["panda_face", "\u{1F43C}"],
    ["koala", "\u{1F428}"],
    ["tiger", "\u{1F42F}"],
    ["lion_face", "\u{1F981}"],
    ["cow", "\u{1F42E}"],
    ["pig", "\u{1F437}"],
    ["frog", "\u{1F438}"],
    ["monkey_face", "\u{1F435}"],
    ["chicken", "\u{1F414}"],
    ["penguin", "\u{1F427}"],
    ["bird", "\u{1F426}"],
    ["unicorn_face", "\u{1F984}"],
    ["dragon", "\u{1F409}"],
    ["whale", "\u{1F433}"],
    ["fish", "\u{1F41F}"],
    ["dolphin", "\u{1F42C}"],
    ["octopus", "\u{1F419}"],
    ["bug", "\u{1F41B}"],
    ["butterfly", "\u{1F98B}"],
    ["snake", "\u{1F40D}"],
    ["turtle", "\u{1F422}"],
    ["bee", "\u{1F41D}"],
    ["ant", "\u{1F41C}"],
    ["computer", "\u{1F4BB}"],
    ["keyboard", "\u2328\uFE0F"],
    ["desktop", "\u{1F5A5}\uFE0F"],
    ["phone", "\u{1F4F1}"],
    ["camera", "\u{1F4F7}"],
    ["video_camera", "\u{1F4F9}"],
    ["headphones", "\u{1F3A7}"],
    ["speaker", "\u{1F50A}"],
    ["musical_note", "\u{1F3B5}"],
    ["notes", "\u{1F3B6}"],
    ["guitar", "\u{1F3B8}"],
    ["drum", "\u{1F941}"],
    ["piano", "\u{1F3B9}"],
    ["microphone", "\u{1F3A4}"],
    ["art", "\u{1F3A8}"],
    ["movie_camera", "\u{1F3AC}"],
    ["game_die", "\u{1F3B2}"],
    ["video_game", "\u{1F3AE}"],
    ["dart", "\u{1F3AF}"],
    ["soccer", "\u26BD"],
    ["basketball", "\u{1F3C0}"],
    ["baseball", "\u26BE"],
    ["tennis", "\u{1F3BE}"],
    ["trophy_game", "\u{1F3C6}"],
    ["book", "\u{1F4D6}"],
    ["books", "\u{1F4DA}"],
    ["memo", "\u{1F4DD}"],
    ["pencil", "\u270F\uFE0F"],
    ["bulb", "\u{1F4A1}"],
    ["wrench", "\u{1F527}"],
    ["hammer", "\u{1F528}"],
    ["gear", "\u2699\uFE0F"],
    ["lock", "\u{1F512}"],
    ["key", "\u{1F511}"],
    ["shield", "\u{1F6E1}\uFE0F"],
    ["bell", "\u{1F514}"],
    ["email", "\u{1F4E7}"],
    ["inbox_tray", "\u{1F4E5}"],
    ["package", "\u{1F4E6}"],
    ["link", "\u{1F517}"],
    [
      "mag",
      "\u{1F50D}",
      ["search"]
    ],
    ["pushpin", "\u{1F4CC}"],
    ["chart", "\u{1F4C8}"],
    ["bar_chart", "\u{1F4CA}"],
    ["calendar", "\u{1F4C5}"],
    ["clock", "\u{1F550}"],
    ["hourglass", "\u23F3"],
    ["alarm_clock", "\u23F0"],
    ["money", "\u{1F4B0}"],
    ["yen", "\u{1F4B4}"],
    ["credit_card", "\u{1F4B3}"],
    ["shopping_cart", "\u{1F6D2}"],
    ["warning", "\u26A0\uFE0F"],
    ["no_entry", "\u26D4"],
    ["prohibited", "\u{1F6AB}"],
    ["recycle", "\u267B\uFE0F"],
    ["check", "\u2705"],
    ["white_check_mark", "\u2705"],
    ["heavy_check_mark", "\u2714\uFE0F"],
    ["x", "\u274C"],
    ["o", "\u2B55"],
    ["exclamation", "\u2757"],
    ["question", "\u2753"],
    ["bangbang", "\u203C\uFE0F"],
    ["100", "\u{1F4AF}"],
    ["ok", "\u{1F197}"],
    ["new", "\u{1F195}"],
    ["top", "\u{1F51D}"],
    ["arrow_up", "\u2B06\uFE0F"],
    ["arrow_down", "\u2B07\uFE0F"],
    ["arrow_left", "\u2B05\uFE0F"],
    ["arrow_right", "\u27A1\uFE0F"],
    ["information_source", "\u2139\uFE0F"],
    ["speech_balloon", "\u{1F4AC}"],
    ["thought_balloon", "\u{1F4AD}"],
    ["heavy_plus_sign", "\u2795"],
    ["heavy_minus_sign", "\u2796"],
    ["infinity", "\u267E\uFE0F"]
  ]]
].flatMap(([group, rows]) => rows.map(([name, char, keywords]) => ({
  name,
  char,
  keywords,
  group
})));
var EMOJI_MAP = Object.fromEntries(EMOJI_LIST.map((e) => [e.name, e.char]));
function searchEmoji(query, limit = 40) {
  const q = query.trim().toLowerCase().replace(/^:/, "");
  if (!q) return EMOJI_LIST.slice(0, limit);
  const starts = [];
  const contains = [];
  for (const e of EMOJI_LIST) if (e.name.startsWith(q)) starts.push(e);
  else if (e.name.includes(q) || (e.keywords || []).some((k) => k.includes(q))) contains.push(e);
  return [...starts, ...contains].slice(0, limit);
}
function escapeEmojiAttr(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function customEmojiImg(name, url) {
  const safeName = escapeEmojiAttr(name);
  return `<img class="sycs-emoji" src="${escapeEmojiAttr(url)}" alt=":${safeName}:" title=":${safeName}:" loading="lazy" draggable="false" />`;
}
var EMOJI_TOKEN_RE = /(?::[a-z0-9_+-]+:|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)/giu;
function isEmojiOnlyMessage(text, custom) {
  const stripped = String(text != null ? text : "").replace(/\s+/g, "");
  if (!stripped) return false;
  const tokens = stripped.match(EMOJI_TOKEN_RE);
  if (!tokens || tokens.length === 0 || tokens.length > 3) return false;
  if (tokens.join("") !== stripped) return false;
  for (const token of tokens) {
    const m = /^:([a-z0-9_+-]+):$/i.exec(token);
    if (!m) continue;
    const key = m[1].toLowerCase();
    if (!(custom && custom[key]) && !EMOJI_MAP[key]) return false;
  }
  return true;
}
function shouldJumboEmoji(text, custom) {
  if (!isEmojiOnlyMessage(text, custom)) return false;
  return [...String(text != null ? text : "").trim()].length > 3;
}
function replaceShortcodes(text, custom) {
  return text.replace(/:([a-z0-9_+-]+):/gi, (match, name) => {
    const key = name.toLowerCase();
    if (custom && custom[key]) return customEmojiImg(key, custom[key]);
    return EMOJI_MAP[key] || match;
  });
}
var ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHtml(input) {
  return String(input != null ? input : "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}
var URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}"'])/g;
function renderRichText(input, options = {}) {
  const emoji = options.emoji !== false;
  let out = escapeHtml(input);
  out = out.replace(URL_RE, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" class="text-indigo-400 hover:underline">${url}</a>`);
  if (emoji) {
    out = replaceShortcodes(out, options.custom);
    if (shouldJumboEmoji(input, options.custom)) out = `<span class="sycs-emoji-jumbo">${out}</span>`;
  }
  return out;
}

export { EMOJI_LIST as E, shouldJumboEmoji as a, renderRichText as r, searchEmoji as s, useCustomEmojis as u };
//# sourceMappingURL=richText-BaJfyDxJ.mjs.map
