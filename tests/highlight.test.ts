import assert from 'node:assert/strict'
import test from 'node:test'
import { highlightCode } from '../lib/highlight'

test('VS Code grammars highlight web and game code without changing the source', async () => {
  for (const [language, code] of [
    ['js', 'const text = "<script>alert(1)</script>";\nconsole.log(text);\n'],
    ['c++', '#include <iostream>\nint main() { return 42; }'],
    ['csharp', 'public class Player { public int Score = 42; }'],
    ['glsl', 'uniform vec3 color;\nvoid main() { gl_FragColor = vec4(color, 1.0); }'],
    ['python', 'def greet(name):\n    return "Hello " + name'],
  ]) {
    const tokens = await highlightCode(code, language)
    assert.equal(tokens.map(line => line.map(token => token.content).join('')).join('\n'), code)
    assert.ok(new Set(tokens.flat().map(token => token.color)).size > 1, language)
  }
})

test('missing and unknown languages fall back to readable text', async () => {
  const source = '<img src=x onerror=alert(1)>\n\tIndentation stays\n'
  for (const language of [undefined, 'future-language', '__proto__']) {
    const tokens = await highlightCode(source, language)
    assert.equal(tokens.map(line => line.map(token => token.content).join('')).join('\n'), source)
  }
})
