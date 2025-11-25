const mockDb = {
    query: jest.fn(),
    pool: {
      connect: jest.fn()
    }
  };
  
  module.exports = mockDb;
  