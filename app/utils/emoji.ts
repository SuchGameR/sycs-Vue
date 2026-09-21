export interface EmojiEntry {
  name: string
  char: string
  keywords?: string[]
  group: string
}

type Row = [name: string, char: string, keywords?: string]

const SMILIES: Row[] = [
  ['grinning', '😀'], ['smiley', '😃'], ['smile', '😄', ['happy', 'joy']], ['grin', '😁'],
  ['laughing', '😆', ['satisfied']], ['sweat_smile', '😅'], ['joy', '😂', ['lol', 'tears']],
  ['rofl', '🤣', ['lmao']], ['blush', '😊'], ['wink', '😉'], ['heart_eyes', '😍'],
  ['kissing_heart', '😘'], ['yum', '😋'], ['sunglasses', '😎'], ['thinking', '🤔'],
  ['neutral_face', '😐'], ['no_mouth', '😶'], ['smirk', '😏'], ['stuck_out_tongue', '😛'],
  ['stuck_out_tongue_winking_eye', '😜'], ['zany_face', '🤪'],
  ['flushed', '😳'], ['pleading_face', '🥺'], ['sob', '😭', ['cry']], ['cry', '😢'],
  ['angry', '😠'], ['rage', '😡'], ['scream', '😱'], ['fearful', '😨'],
  ['cold_sweat', '😰'], ['sweat', '😓'], ['sleepy', '😪'], ['sleeping', '😴'],
  ['zzz', '💤'], ['dizzy_face', '😵'], ['crazy_face', '🤯'], ['shush', '🤫'],
  ['mask', '😷'], ['nerd', '🤓'], ['monocle_face', '🧐'], ['shrug', '🤷'],
  ['facepalm', '🤦'], ['pensive', '😔'], ['disappointed', '😞'], ['worried', '😟'],
  ['confused', '😕'], ['upside_down_face', '🙃'], ['expressionless', '😑'],
  ['unamused', '😒'], ['roll_eyes', '🙄'], ['lying_face', '🤥'], ['relieved', '😌'],
  ['grinning_face_with_sweat', '😅'], ['partying_face', '🥳'], ['star_struck', '🤩'],
  ['smiling_face_with_hearts', '🥰'], ['hot_face', '🥵'], ['cold_face', '🥶'],
  ['woozy_face', '🥴'], ['pleading', '🥺'], ['skull', '💀', ['dead']],
  ['ghost', '👻'], ['alien', '👽'], ['robot', '🤖'], ['poop', '💩', ['shit']],
  ['clown_face', '🤡'], ['imp', '👿'], ['smiling_imp', '😈'], ['japanese_ogre', '👹'],
  ['jack_o_lantern', '🎃'], ['santa', '🎅'], ['snowman', '☃️'], ['christmas_tree', '🎄'],
]

const GESTURES: Row[] = [
  ['thumbsup', '👍', ['+1', 'like']], ['thumbsdown', '👎', ['-1']], ['ok_hand', '👌'],
  ['clap', '👏'], ['pray', '🙏', ['thanks']], ['wave', '👋', ['hello', 'bye']],
  ['point_up', '☝️'], ['point_down', '👇'], ['point_left', '👈'], ['point_right', '👉'],
  ['muscle', '💪', ['strong']], ['v', '✌️'], ['metal', '🤘'], ['crossed_fingers', '🤞'],
  ['handshake', '🤝'], ['raised_hands', '🙌'], ['folded_hands', '🙏'],
  ['open_hands', '👐'], ['raised_hand', '✋'], ['writing_hand', '✍️'], ['nail_care', '💅'],
  ['eyes', '👀'], ['eye', '👁️'], ['brain', '🧠'], ['heart', '❤️', ['love']],
  ['broken_heart', '💔'], ['sparkling_heart', '💖'], ['two_hearts', '💕'],
  ['blue_heart', '💙'], ['green_heart', '💚'], ['yellow_heart', '💛'], ['purple_heart', '💜'],
  ['orange_heart', '🧡'], ['black_heart', '🖤'], ['white_heart', '🤍'], ['brown_heart', '🤎'],
  ['hearts', '♥️'], ['heartbeat', '💓'], ['cupid', '💘'], ['kiss', '💋'],
]

const OBJECTS: Row[] = [
  ['fire', '🔥', ['lit']], ['star', '⭐'], ['star2', '🌟'], ['sparkles', '✨'],
  ['zap', '⚡'], ['boom', '💥'], ['tada', '🎉', ['party']], ['confetti_ball', '🎊'],
  ['gift', '🎁'], ['trophy', '🏆'], ['medal', '🏅'], ['crown', '👑'], ['gem', '💎'],
  ['rocket', '🚀'], ['airplane', '✈️'], ['car', '🚗'], ['train', '🚃'],
  ['house', '🏠'], ['sun', '☀️'], ['moon', '🌙'], ['cloud', '☁️'], ['rain', '🌧️'],
  ['snow', '❄️'], ['umbrella', '☔'], ['rainbow', '🌈'], ['ocean', '🌊'],
  ['earth', '🌍'], ['globe_with_meridians', '🌐'], ['mountain', '⛰️'], ['flower', '🌸'],
  ['sunflower', '🌻'], ['rose', '🌹'], ['cherry_blossom', '🌸'], ['four_leaf_clover', '🍀'],
  ['apple', '🍎'], ['orange', '🍊'], ['banana', '🍌'], ['watermelon', '🍉'],
  ['grapes', '🍇'], ['strawberry', '🍓'], ['peach', '🍑'], ['cherries', '🍒'],
  ['lemon', '🍋'], ['pizza', '🍕'], ['hamburger', '🍔'], ['fries', '🍟'],
  ['sushi', '🍣'], ['ramen', '🍜'], ['beer', '🍺'], ['sake', '🍶'], ['wine_glass', '🍷'],
  ['coffee', '☕'], ['tea', '🍵'], ['cake', '🍰'], ['birthday', '🎂'],
  ['cookie', '🍪'], ['chocolate_bar', '🍫'], ['candy', '🍬'], ['rice', '🍚'],
  ['curry', '🍛'], ['bento', '🍱'], ['doughnut', '🍩'], ['icecream', '🍦'],
  ['dog', '🐶'], ['cat', '🐱'], ['mouse', '🐭'], ['hamster', '🐹'], ['rabbit', '🐰'],
  ['fox_face', '🦊'], ['bear', '🐻'], ['panda_face', '🐼'], ['koala', '🐨'],
  ['tiger', '🐯'], ['lion_face', '🦁'], ['cow', '🐮'], ['pig', '🐷'], ['frog', '🐸'],
  ['monkey_face', '🐵'], ['chicken', '🐔'], ['penguin', '🐧'], ['bird', '🐦'],
  ['unicorn_face', '🦄'], ['dragon', '🐉'], ['whale', '🐳'], ['fish', '🐟'],
  ['dolphin', '🐬'], ['octopus', '🐙'], ['bug', '🐛'], ['butterfly', '🦋'],
  ['snake', '🐍'], ['turtle', '🐢'], ['bee', '🐝'], ['ant', '🐜'],
  ['computer', '💻'], ['keyboard', '⌨️'], ['desktop', '🖥️'], ['phone', '📱'],
  ['camera', '📷'], ['video_camera', '📹'], ['headphones', '🎧'], ['speaker', '🔊'],
  ['musical_note', '🎵'], ['notes', '🎶'], ['guitar', '🎸'], ['drum', '🥁'],
  ['piano', '🎹'], ['microphone', '🎤'], ['art', '🎨'], ['movie_camera', '🎬'],
  ['game_die', '🎲'], ['video_game', '🎮'], ['dart', '🎯'], ['soccer', '⚽'],
  ['basketball', '🏀'], ['baseball', '⚾'], ['tennis', '🎾'], ['trophy_game', '🏆'],
  ['book', '📖'], ['books', '📚'], ['memo', '📝'], ['pencil', '✏️'],
  ['bulb', '💡'], ['wrench', '🔧'], ['hammer', '🔨'], ['gear', '⚙️'],
  ['lock', '🔒'], ['key', '🔑'], ['shield', '🛡️'], ['bell', '🔔'],
  ['email', '📧'], ['inbox_tray', '📥'], ['package', '📦'], ['link', '🔗'],
  ['mag', '🔍', ['search']], ['pushpin', '📌'], ['chart', '📈'], ['bar_chart', '📊'],
  ['calendar', '📅'], ['clock', '🕐'], ['hourglass', '⏳'], ['alarm_clock', '⏰'],
  ['money', '💰'], ['yen', '💴'], ['credit_card', '💳'], ['shopping_cart', '🛒'],
  ['warning', '⚠️'], ['no_entry', '⛔'], ['prohibited', '🚫'], ['recycle', '♻️'],
  ['check', '✅'], ['white_check_mark', '✅'], ['heavy_check_mark', '✔️'], ['x', '❌'],
  ['o', '⭕'], ['exclamation', '❗'], ['question', '❓'], ['bangbang', '‼️'],
  ['100', '💯'], ['ok', '🆗'], ['new', '🆕'], ['top', '🔝'],
  ['arrow_up', '⬆️'], ['arrow_down', '⬇️'], ['arrow_left', '⬅️'], ['arrow_right', '➡️'],
  ['information_source', 'ℹ️'], ['speech_balloon', '💬'], ['thought_balloon', '💭'],
  ['heavy_plus_sign', '➕'], ['heavy_minus_sign', '➖'], ['infinity', '♾️'],
]

const GROUPED: Array<[string, Row[]]> = [
  ['smileys', SMILIES],
  ['gestures', GESTURES],
  ['objects', OBJECTS],
]

export const EMOJI_LIST: EmojiEntry[] = GROUPED.flatMap(([group, rows]) =>
  rows.map(([name, char, keywords]) => ({ name, char, keywords, group }))
)

export const EMOJI_MAP: Record<string, string> = Object.fromEntries(
  EMOJI_LIST.map(e => [e.name, e.char])
)

export function isEmojiText(value: string): boolean {
  const v = value.trim()
  if (!v) return false
  return !/[a-z0-9]/i.test(v) && [...v].length <= 8
}

export function searchEmoji(query: string, limit = 40): EmojiEntry[] {
  const q = query.trim().toLowerCase().replace(/^:/, '')
  if (!q) return EMOJI_LIST.slice(0, limit)
  const starts: EmojiEntry[] = []
  const contains: EmojiEntry[] = []
  for (const e of EMOJI_LIST) {
    if (e.name.startsWith(q)) starts.push(e)
    else if (e.name.includes(q) || (e.keywords || []).some(k => k.includes(q))) contains.push(e)
  }
  return [...starts, ...contains].slice(0, limit)
}

export function escapeEmojiAttr(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export type CustomEmojiMap = Record<string, string>

export function customEmojiImg(name: string, url: string): string {
  const safeName = escapeEmojiAttr(name)
  const safeUrl = escapeEmojiAttr(url)
  return `<img class="sycs-emoji" src="${safeUrl}" alt=":${safeName}:" title=":${safeName}:" loading="lazy" draggable="false" />`
}

const EMOJI_TOKEN_RE = /(?::[a-z0-9_+-]+:|\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)/giu

/**
 * True when the whole string is made of 1〜3 emojis (unicode or custom
 * `:shortcode:`) separated only by whitespace. Used for "jumbo" rendering.
 */
export function isEmojiOnlyMessage(text: string, custom?: CustomEmojiMap): boolean {
  const stripped = String(text ?? '').replace(/\s+/g, '')
  if (!stripped) return false
  const tokens = stripped.match(EMOJI_TOKEN_RE)
  if (!tokens || tokens.length === 0 || tokens.length > 3) return false
  if (tokens.join('') !== stripped) return false
  for (const token of tokens) {
    const m = /^:([a-z0-9_+-]+):$/i.exec(token)
    if (!m) continue
    const key = m[1].toLowerCase()
    if (!(custom && custom[key]) && !EMOJI_MAP[key]) return false
  }
  return true
}

export function replaceShortcodes(text: string, custom?: CustomEmojiMap): string {
  return text.replace(/:([a-z0-9_+-]+):/gi, (match, name: string) => {
    const key = name.toLowerCase()
    if (custom && custom[key]) return customEmojiImg(key, custom[key])
    const char = EMOJI_MAP[key]
    return char || match
  })
}
