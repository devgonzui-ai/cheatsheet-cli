// cheat.sh からチートシートを取得する

const BASE_URL = 'https://cheat.sh';

// cheat.sh は User-Agent がブラウザだと HTML を返すので curl を装う
const USER_AGENT = 'curl/8.4.0';

export const DEFAULT_TIMEOUT_MS = 10000;

// トピックは英数と - _ . + / のみ（例: python/lists, go/reverse+string）
const TOPIC_PATTERN = /^[a-zA-Z0-9_.+/-]+$/;

const ANSI_PATTERN = /\u001B\[[0-9;]*m/g;

// URLに埋め込んでも安全な文字だけを許可し、親ディレクトリ参照は弾く
export const validateTopic = (topic: string): boolean =>
  TOPIC_PATTERN.test(topic) && !topic.includes('..');

// トピックからシート名を作る（/ + . を - に畳んで NAME_PATTERN に収める）
export const topicToSheetName = (topic: string): string =>
  topic
    .replace(/[/+.]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// ?T でカラーコードなしのプレーンテキストを要求する
export const buildUrl = (topic: string): string => `${BASE_URL}/${topic}?T`;

export const stripAnsi = (text: string): string => text.replace(ANSI_PATTERN, '');

// 該当トピックがない場合 cheat.sh は 200 で "Unknown topic." を返す
export const isUnknownTopic = (body: string): boolean =>
  /^\s*Unknown topic\./.test(stripAnsi(body));

// 本文中の最長バッククォート列より長いフェンスを使う
const fenceFor = (content: string): string => {
  const runs = [...content.matchAll(/`+/g)].map((match) => match[0].length);
  return '`'.repeat(Math.max(3, ...runs.map((length) => length + 1)));
};

// 取得した内容を出典付きの Markdown に整形する
export const toMarkdown = (topic: string, content: string, date: Date = new Date()): string => {
  const body = stripAnsi(content).replace(/\s+$/, '');
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

export interface FetchOptions {
  // テストから差し替えるために注入可能にしている
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

// cheat.sh からプレーンテキストを取得する（整形は toMarkdown 側）
export const fetchCheatSheet = async (
  topic: string,
  options: FetchOptions = {}
): Promise<string> => {
  const { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  if (!validateTopic(topic)) {
    throw new Error(
      `Invalid topic "${topic}" (only alphanumeric characters and - _ . + / are allowed)`
    );
  }

  let response: Response;
  try {
    response = await fetchImpl(buildUrl(topic), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/plain' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const { name, message } = error as Error;
    if (name === 'TimeoutError' || name === 'AbortError') {
      throw new Error(`cheat.sh did not respond within ${timeoutMs}ms`);
    }
    throw new Error(`Failed to reach cheat.sh: ${message}`);
  }

  if (!response.ok) {
    throw new Error(`cheat.sh returned ${response.status} ${response.statusText}`);
  }

  const body = stripAnsi(await response.text());

  if (isUnknownTopic(body)) {
    throw new Error(`No cheatsheet found on cheat.sh for "${topic}"`);
  }

  if (body.trim() === '') {
    throw new Error(`cheat.sh returned empty content for "${topic}"`);
  }

  return `${body.replace(/\s+$/, '')}\n`;
};
