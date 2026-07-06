import Anthropic, {
  APIConnectionError,
  APIError,
  AuthenticationError,
  RateLimitError,
} from '@anthropic-ai/sdk';

// AI生成・整形に使うモデル
export const AI_MODEL = 'claude-opus-4-8';

const GENERATE_SYSTEM = `You are a cheatsheet generator for a CLI tool called "cs".
Given a topic, produce a practical, concise cheatsheet in Markdown.

Rules:
- Start with a single "# Title" heading.
- Group related commands or snippets under "## Section" headings.
- Put every command or code snippet in a fenced code block with a language tag (e.g. \`\`\`bash).
- Add a short comment or one-line description for each command.
- Use tables only when they are clearly better than a list.
- Include only accurate, widely applicable information. Do not invent flags or APIs.
- Write in the same language as the topic given by the user.
- Output ONLY the raw Markdown content: no preamble, no closing remarks, and do not wrap the whole document in a code fence.`;

const REFINE_SYSTEM = `You are a cheatsheet editor for a CLI tool called "cs".
The user gives you the raw content of an existing cheatsheet. It may be messy notes, unstructured text, or command output.

Restructure it into a clean Markdown cheatsheet:
- Start with a single "# Title" heading.
- Group related items under "## Section" headings.
- Put every command or code snippet in a fenced code block with a language tag (e.g. \`\`\`bash).
- Fix typos and formatting.

Constraints:
- Preserve ALL commands, options, and factual content from the input. Do not drop information.
- Do not invent new commands, flags, or facts that are not in the input.
- Write in the same language as the input.
- Output ONLY the raw Markdown content: no preamble, no closing remarks, and do not wrap the whole document in a code fence.`;

// レスポンスからテキストブロックを連結して取り出す
const extractText = (message: Anthropic.Message): string =>
  message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

// 出力全体が ```markdown フェンスで包まれていたら剥がす
export const stripOuterFence = (text: string): string => {
  const match = text.match(/^```(?:markdown|md)?[ \t]*\n([\s\S]*?)\n```[ \t]*$/);
  return match ? match[1] : text;
};

const complete = async (system: string, userContent: string): Promise<string> => {
  const client = new Anthropic();
  const stream = client.messages.stream({
    model: AI_MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system,
    messages: [{ role: 'user', content: userContent }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') {
    throw new Error('Claude declined to generate this content');
  }

  const text = stripOuterFence(extractText(message).trim()).trim();
  if (text === '') {
    throw new Error('Claude returned an empty response');
  }
  return text;
};

// トピックからチートシートを生成
export const generateCheatsheet = (topic: string): Promise<string> =>
  complete(GENERATE_SYSTEM, `Create a cheatsheet about: ${topic}`);

// 既存の内容を整形されたチートシートに書き直す
export const refineCheatsheet = (content: string): Promise<string> =>
  complete(REFINE_SYSTEM, content);

const NO_KEY_MESSAGE =
  'No Claude API credentials found. Set the ANTHROPIC_API_KEY environment variable (get a key at https://platform.claude.com/)';

// APIエラーをユーザー向けメッセージに変換
export const formatAiError = (error: unknown): string => {
  if (error instanceof AuthenticationError) {
    return `Authentication failed. Check your ANTHROPIC_API_KEY (${error.message})`;
  }
  if (error instanceof RateLimitError) {
    return 'Rate limited by the Claude API. Wait a moment and try again';
  }
  if (error instanceof APIConnectionError) {
    return 'Could not reach the Claude API. Check your network connection';
  }
  if (error instanceof APIError) {
    return `Claude API error (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    // SDKはキー未設定だと "Could not resolve authentication method. Expected either apiKey or authToken..." を投げる
    if (/apiKey|api key|authToken/i.test(error.message)) {
      return NO_KEY_MESSAGE;
    }
    return error.message;
  }
  return String(error);
};
