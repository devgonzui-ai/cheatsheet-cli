"use strict";
// cheat.sh からチートシートを取得する
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchCheatSheet = exports.toMarkdown = exports.isUnknownTopic = exports.stripAnsi = exports.buildUrl = exports.topicToSheetName = exports.validateTopic = exports.DEFAULT_TIMEOUT_MS = void 0;
const BASE_URL = 'https://cheat.sh';
// cheat.sh は User-Agent がブラウザだと HTML を返すので curl を装う
const USER_AGENT = 'curl/8.4.0';
exports.DEFAULT_TIMEOUT_MS = 10000;
// トピックは英数と - _ . + / のみ（例: python/lists, go/reverse+string）
const TOPIC_PATTERN = /^[a-zA-Z0-9_.+/-]+$/;
const ANSI_PATTERN = /\u001B\[[0-9;]*m/g;
// URLに埋め込んでも安全な文字だけを許可し、親ディレクトリ参照は弾く
const validateTopic = (topic) => TOPIC_PATTERN.test(topic) && !topic.includes('..');
exports.validateTopic = validateTopic;
// トピックからシート名を作る（/ + . を - に畳んで NAME_PATTERN に収める）
const topicToSheetName = (topic) => topic
    .replace(/[/+.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
exports.topicToSheetName = topicToSheetName;
// ?T でカラーコードなしのプレーンテキストを要求する
const buildUrl = (topic) => `${BASE_URL}/${topic}?T`;
exports.buildUrl = buildUrl;
const stripAnsi = (text) => text.replace(ANSI_PATTERN, '');
exports.stripAnsi = stripAnsi;
// 該当トピックがない場合 cheat.sh は 200 で "Unknown topic." を返す
const isUnknownTopic = (body) => /^\s*Unknown topic\./.test((0, exports.stripAnsi)(body));
exports.isUnknownTopic = isUnknownTopic;
// 本文中の最長バッククォート列より長いフェンスを使う
const fenceFor = (content) => {
    const runs = [...content.matchAll(/`+/g)].map((match) => match[0].length);
    return '`'.repeat(Math.max(3, ...runs.map((length) => length + 1)));
};
// 取得した内容を出典付きの Markdown に整形する
const toMarkdown = (topic, content, date = new Date()) => {
    const body = (0, exports.stripAnsi)(content).replace(/\s+$/, '');
    const fence = fenceFor(body);
    const fetchedOn = date.toISOString().slice(0, 10);
    return [
        `# ${topic}`,
        '',
        `> Fetched from ${BASE_URL}/${topic} on ${fetchedOn}`,
        '',
        fence,
        body,
        fence,
        '',
    ].join('\n');
};
exports.toMarkdown = toMarkdown;
// cheat.sh からプレーンテキストを取得する（整形は toMarkdown 側）
const fetchCheatSheet = async (topic, options = {}) => {
    const { fetchImpl = fetch, timeoutMs = exports.DEFAULT_TIMEOUT_MS } = options;
    if (!(0, exports.validateTopic)(topic)) {
        throw new Error(`Invalid topic "${topic}" (only alphanumeric characters and - _ . + / are allowed)`);
    }
    let response;
    try {
        response = await fetchImpl((0, exports.buildUrl)(topic), {
            headers: { 'User-Agent': USER_AGENT, Accept: 'text/plain' },
            signal: AbortSignal.timeout(timeoutMs),
        });
    }
    catch (error) {
        const { name, message } = error;
        if (name === 'TimeoutError' || name === 'AbortError') {
            throw new Error(`cheat.sh did not respond within ${timeoutMs}ms`);
        }
        throw new Error(`Failed to reach cheat.sh: ${message}`);
    }
    if (!response.ok) {
        throw new Error(`cheat.sh returned ${response.status} ${response.statusText}`);
    }
    const body = (0, exports.stripAnsi)(await response.text());
    if ((0, exports.isUnknownTopic)(body)) {
        throw new Error(`No cheatsheet found on cheat.sh for "${topic}"`);
    }
    if (body.trim() === '') {
        throw new Error(`cheat.sh returned empty content for "${topic}"`);
    }
    return `${body.replace(/\s+$/, '')}\n`;
};
exports.fetchCheatSheet = fetchCheatSheet;
//# sourceMappingURL=cheatsh.js.map