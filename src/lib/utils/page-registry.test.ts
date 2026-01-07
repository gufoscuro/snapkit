import { describe, it, expect } from 'vitest';
import { getPageByRoute } from './page-registry';

describe('page-registry route matching', () => {
  it('should match exact routes', async () => {
    const result = await getPageByRoute('/orders');
    expect(result).not.toBeNull();
    expect(result?.config.page_key).toBe('orders');
    expect(result?.params).toEqual({});
  });

  it('should match routes with single parameter', async () => {
    const result = await getPageByRoute('/orders/abc-123-def');
    expect(result).not.toBeNull();
    expect(result?.config.page_key).toBe('order-detail');
    expect(result?.params).toEqual({ uuid: 'abc-123-def' });
  });

  it('should match routes with multiple parameters', async () => {
    const result = await getPageByRoute('/orders/order-456/delivery/delivery-789');
    expect(result).not.toBeNull();
    expect(result?.config.page_key).toBe('order-delivery');
    expect(result?.params).toEqual({
      uuid: 'order-456',
      delivery_uuid: 'delivery-789'
    });
  });

  it('should return null for non-matching routes', async () => {
    const result = await getPageByRoute('/non-existent-page');
    expect(result).toBeNull();
  });

  it('should handle URL encoded parameters', async () => {
    const result = await getPageByRoute('/orders/test%20with%20spaces');
    expect(result).not.toBeNull();
    expect(result?.params.uuid).toBe('test with spaces');
  });
});
