import { describe, it, expect } from 'vitest';
import { NAME_PATTERN, SUPPORTED_IMAGE_EXTENSIONS } from '../types';
import { validateName, isValidImageExtension } from '../lib/storage';

describe('NAME_PATTERN', () => {
  it('英小文字のみを許可する', () => {
    expect(NAME_PATTERN.test('gitcommands')).toBe(true);
  });

  it('英大文字のみを許可する', () => {
    expect(NAME_PATTERN.test('GITCOMMANDS')).toBe(true);
  });

  it('数字のみを許可する', () => {
    expect(NAME_PATTERN.test('12345')).toBe(true);
  });

  it('ハイフンを含む名前を許可する', () => {
    expect(NAME_PATTERN.test('git-commands')).toBe(true);
  });

  it('アンダースコアを含む名前を許可する', () => {
    expect(NAME_PATTERN.test('git_commands')).toBe(true);
  });

  it('英数字、ハイフン、アンダースコアの組み合わせを許可する', () => {
    expect(NAME_PATTERN.test('my-Cheat_Sheet123')).toBe(true);
  });

  it('日本語を含む名前を拒否する', () => {
    expect(NAME_PATTERN.test('日本語')).toBe(false);
  });

  it('スペースを含む名前を拒否する', () => {
    expect(NAME_PATTERN.test('git commands')).toBe(false);
  });

  it('特殊文字を含む名前を拒否する', () => {
    expect(NAME_PATTERN.test('git@commands')).toBe(false);
    expect(NAME_PATTERN.test('git.commands')).toBe(false);
    expect(NAME_PATTERN.test('git/commands')).toBe(false);
  });

  it('空文字を拒否する', () => {
    expect(NAME_PATTERN.test('')).toBe(false);
  });
});

describe('validateName', () => {
  it('有効な名前でtrueを返す', () => {
    expect(validateName('git-cheat')).toBe(true);
    expect(validateName('vim_commands')).toBe(true);
    expect(validateName('Docker123')).toBe(true);
  });

  it('無効な名前でfalseを返す', () => {
    expect(validateName('')).toBe(false);
    expect(validateName('invalid name')).toBe(false);
    expect(validateName('日本語')).toBe(false);
  });
});

describe('isValidImageExtension', () => {
  it('サポートされている画像拡張子でtrueを返す', () => {
    expect(isValidImageExtension('image.png')).toBe(true);
    expect(isValidImageExtension('image.jpg')).toBe(true);
    expect(isValidImageExtension('image.jpeg')).toBe(true);
    expect(isValidImageExtension('image.gif')).toBe(true);
    expect(isValidImageExtension('image.webp')).toBe(true);
    expect(isValidImageExtension('image.svg')).toBe(true);
  });

  it('大文字の拡張子でもtrueを返す', () => {
    expect(isValidImageExtension('image.PNG')).toBe(true);
    expect(isValidImageExtension('image.JPG')).toBe(true);
  });

  it('サポートされていない拡張子でfalseを返す', () => {
    expect(isValidImageExtension('image.bmp')).toBe(false);
    expect(isValidImageExtension('image.tiff')).toBe(false);
    expect(isValidImageExtension('document.pdf')).toBe(false);
    expect(isValidImageExtension('text.md')).toBe(false);
  });
});

describe('SUPPORTED_IMAGE_EXTENSIONS', () => {
  it('6つの画像形式をサポートする', () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toHaveLength(6);
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('png');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('jpg');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('jpeg');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('gif');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('webp');
    expect(SUPPORTED_IMAGE_EXTENSIONS).toContain('svg');
  });
});
