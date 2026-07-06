"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAiError = exports.refineCheatsheet = exports.generateCheatsheet = exports.stripOuterFence = exports.AI_MODEL = void 0;
const sdk_1 = __importStar(require("@anthropic-ai/sdk"));
// AI生成・整形に使うモデル
exports.AI_MODEL = 'claude-opus-4-8';
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
const extractText = (message) => message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');
// 出力全体が ```markdown フェンスで包まれていたら剥がす
const stripOuterFence = (text) => {
    const match = text.match(/^```(?:markdown|md)?[ \t]*\n([\s\S]*?)\n```[ \t]*$/);
    return match ? match[1] : text;
};
exports.stripOuterFence = stripOuterFence;
const complete = async (system, userContent) => {
    const client = new sdk_1.default();
    const stream = client.messages.stream({
        model: exports.AI_MODEL,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        system,
        messages: [{ role: 'user', content: userContent }],
    });
    const message = await stream.finalMessage();
    if (message.stop_reason === 'refusal') {
        throw new Error('Claude declined to generate this content');
    }
    const text = (0, exports.stripOuterFence)(extractText(message).trim()).trim();
    if (text === '') {
        throw new Error('Claude returned an empty response');
    }
    return text;
};
// トピックからチートシートを生成
const generateCheatsheet = (topic) => complete(GENERATE_SYSTEM, `Create a cheatsheet about: ${topic}`);
exports.generateCheatsheet = generateCheatsheet;
// 既存の内容を整形されたチートシートに書き直す
const refineCheatsheet = (content) => complete(REFINE_SYSTEM, content);
exports.refineCheatsheet = refineCheatsheet;
const NO_KEY_MESSAGE = 'No Claude API credentials found. Set the ANTHROPIC_API_KEY environment variable (get a key at https://platform.claude.com/)';
// APIエラーをユーザー向けメッセージに変換
const formatAiError = (error) => {
    if (error instanceof sdk_1.AuthenticationError) {
        return `Authentication failed. Check your ANTHROPIC_API_KEY (${error.message})`;
    }
    if (error instanceof sdk_1.RateLimitError) {
        return 'Rate limited by the Claude API. Wait a moment and try again';
    }
    if (error instanceof sdk_1.APIConnectionError) {
        return 'Could not reach the Claude API. Check your network connection';
    }
    if (error instanceof sdk_1.APIError) {
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
exports.formatAiError = formatAiError;
//# sourceMappingURL=ai.js.map