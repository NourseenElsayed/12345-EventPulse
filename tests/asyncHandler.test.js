const asyncHandler = require('../utils/asyncHandler');

describe('asyncHandler', () => {
  test('handles successful async function', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const handler = asyncHandler(async (req, res, next) => {
      res.success = true;
    });

    await handler(req, res, next);

    expect(res.success).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  test('passes rejected errors to next', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const testError = new Error('Test failure');

    const handler = asyncHandler(async () => {
      throw testError;
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(testError);
  });
});
