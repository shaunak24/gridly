import { IMAGE_PEEK_DURATION_MS } from '../peekHint';

describe('peekHint', () => {
  it('shows the image long enough to study but not solve from', () => {
    expect(IMAGE_PEEK_DURATION_MS).toBeGreaterThanOrEqual(3000);
    expect(IMAGE_PEEK_DURATION_MS).toBeLessThanOrEqual(6000);
  });
});
