jest.mock('shared/infrastructure/logger', () => ({
  __esModule: true,
  default: {info: jest.fn()},
}));

import logger from 'shared/infrastructure/logger';
import {logPublicFormRequest} from './logPublicFormRequest';

const mockedInfo = logger.info as jest.Mock;

const fakeReq = (overrides: any = {}) =>
  ({
    method: 'GET',
    originalUrl: '/forms/e5b1-4c/html',
    params: {formId: 'e5b1-4c'},
    headers: {
      host: 'api.icruiting.at',
      referer: 'https://kunde.at/karriere',
      'x-forwarded-proto': 'https',
    },
    ...overrides,
  }) as any;

describe('logPublicFormRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('logs one structured line with host, path, formId, referer and forwardedProto', () => {
    const next = jest.fn();

    logPublicFormRequest(fakeReq(), {} as any, next);

    expect(mockedInfo).toHaveBeenCalledTimes(1);
    expect(mockedInfo).toHaveBeenCalledWith(
      {
        event: 'public_form_request',
        method: 'GET',
        host: 'api.icruiting.at',
        path: '/forms/e5b1-4c/html',
        formId: 'e5b1-4c',
        referer: 'https://kunde.at/karriere',
        forwardedProto: 'https',
      },
      'public form request',
    );
    expect(next).toHaveBeenCalled();
  });

  it('logs the submitting method so GET renders and POST submits are distinguishable', () => {
    logPublicFormRequest(fakeReq({method: 'POST'}), {} as any, jest.fn());

    expect(mockedInfo).toHaveBeenCalledWith(
      expect.objectContaining({method: 'POST'}),
      expect.any(String),
    );
  });

  it('keeps the query string in path, matching the router log', () => {
    logPublicFormRequest(
      fakeReq({originalUrl: '/forms/e5b1-4c/html?utm_source=newsletter'}),
      {} as any,
      jest.fn(),
    );

    expect(mockedInfo).toHaveBeenCalledWith(
      expect.objectContaining({path: '/forms/e5b1-4c/html?utm_source=newsletter'}),
      expect.any(String),
    );
  });

  // A stricter referrer policy on the embedding page drops the header entirely -
  // log null rather than omitting the key, so "no referer" stays greppable.
  it('logs null for headers the client did not send', () => {
    logPublicFormRequest(fakeReq({headers: {host: 'api.icruiting.at'}}), {} as any, jest.fn());

    expect(mockedInfo).toHaveBeenCalledWith(
      expect.objectContaining({referer: null, forwardedProto: null}),
      expect.any(String),
    );
  });

  it('calls next even when logging throws, so a log line never breaks the form', () => {
    mockedInfo.mockImplementationOnce(() => {
      throw new Error('transport gone');
    });
    const next = jest.fn();

    logPublicFormRequest(fakeReq(), {} as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});
