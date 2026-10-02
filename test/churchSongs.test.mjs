import assert from 'node:assert/strict';
import test from 'node:test';
import { extractYouTubeVideoId, parseLyricsToSlides } from '../app/lib/churchSongs.ts';

test('recognizes supported YouTube URLs and rejects other hosts', () => {
  for (const url of ['https://www.youtube.com/watch?v=abc123', 'https://youtu.be/abc123', 'https://www.youtube.com/embed/abc123', 'https://www.youtube.com/shorts/abc123']) assert.equal(extractYouTubeVideoId(url), 'abc123');
  assert.equal(extractYouTubeVideoId('https://google.com/abc123'), null);
});
test('splits lyrics into blocks across line endings and repeated blanks', () => {
  assert.deepEqual(parseLyricsToSlides('Verso linha 1\r\nVerso linha 2\r\n\r\n\r\nSegundo bloco linha 1\nSegundo bloco linha 2'), ['Verso linha 1\nVerso linha 2', 'Segundo bloco linha 1\nSegundo bloco linha 2']);
});
