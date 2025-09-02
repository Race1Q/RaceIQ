// backend/test/setup.ts
// Dotenv already loaded by jest.config.ts -> setupFiles: ['dotenv/config']
// If you want to guarantee the right mode:
process.env.NODE_ENV = 'test';

// Optional hardening examples:
//
// Block real outbound HTTP during tests (uncomment if you like):
// import nock from 'nock';
// beforeAll(() => {
//   nock.disableNetConnect();
//   nock.enableNetConnect('127.0.0.1'); // allow supertest against Nest app
// });
// afterAll(() => nock.cleanAll());
