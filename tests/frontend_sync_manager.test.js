const fs = require('fs');
const path = require('path');

describe('Frontend SyncManager', () => {
  let SyncManager;
  let authWidgetMock;
  let syncManager;
  let reloadMock;
  let localStorageMock;

  beforeAll(() => {
    const storage = {};
    localStorageMock = {
      getItem: jest.fn((k) => storage[k] || null),
      setItem: jest.fn((k, v) => { storage[k] = v.toString(); }),
      removeItem: jest.fn((k) => { delete storage[k]; }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach((k) => delete storage[k]);
      }),
    };
    global.localStorage = localStorageMock;

    reloadMock = jest.fn();
    global.window = {
      location: {
        reload: reloadMock,
      },
    };

    const code = fs.readFileSync(path.join(__dirname, '../public/javascripts/sync_manager.js'), 'utf8');
    SyncManager = new Function(`${code}\nreturn SyncManager;`)();
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();

    global.fetch = jest.fn();

    authWidgetMock = {
      isAuthenticated: jest.fn().mockReturnValue(true),
    };

    syncManager = new SyncManager(authWidgetMock);
  });

  describe('mergeData', () => {
    test('uses server data when no local data exists', () => {
      const serverData = { list1: ['apple', 'banana'] };
      syncManager.mergeData('NH', serverData);

      expect(JSON.parse(localStorage.getItem('NH'))).toEqual(serverData);
      expect(reloadMock).toHaveBeenCalled();
    });

    test('merges objects with server winning on conflict', () => {
      const localData = {
        list1: ['local_val'],
        list2: ['only_local'],
      };
      const serverData = {
        list1: ['server_val'],
        list3: ['only_server'],
      };
      localStorage.setItem('NH', JSON.stringify(localData));

      syncManager.syncToServer = jest.fn();
      syncManager.mergeData('NH', serverData);

      const merged = JSON.parse(localStorage.getItem('NH'));
      expect(merged).toEqual({
        list1: ['server_val'],
        list2: ['only_local'],
        list3: ['only_server'],
      });
      expect(syncManager.syncToServer).toHaveBeenCalledWith('NH', 0);
      expect(reloadMock).toHaveBeenCalled();
    });

    test('does not reload when object data is identical', () => {
      const sameData = { list1: ['apple'] };
      localStorage.setItem('NH', JSON.stringify(sameData));

      syncManager.mergeData('NH', sameData);
      expect(reloadMock).not.toHaveBeenCalled();
    });

    test('merges array canvas items choosing newest timestamp per index', () => {
      const localCanvas = [
        { id: 1, timestamp: 100, data: 'old_local' },
        { id: 2, timestamp: 300, data: 'new_local' },
      ];
      const serverCanvas = [
        { id: 1, timestamp: 200, data: 'new_server' },
        { id: 2, timestamp: 250, data: 'old_server' },
        { id: 3, timestamp: 150, data: 'only_server' },
      ];
      localStorage.setItem('shapes', JSON.stringify(localCanvas));

      syncManager.syncToServer = jest.fn();
      syncManager.mergeData('shapes', serverCanvas);

      const merged = JSON.parse(localStorage.getItem('shapes'));
      expect(merged[0]).toEqual({ id: 1, timestamp: 200, data: 'new_server' });
      expect(merged[1]).toEqual({ id: 2, timestamp: 300, data: 'new_local' });
      expect(merged[2]).toEqual({ id: 3, timestamp: 150, data: 'only_server' });
    });
  });

  describe('syncPreference & loadPreference', () => {
    test('syncPreference sends POST request to /api/preferences/:key', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await syncManager.syncPreference('theme', 'dark');
      expect(global.fetch).toHaveBeenCalledWith('/api/preferences/theme', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 'dark' }),
      }));
    });

    test('loadPreference sends GET request and returns value', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, value: 'dark' }),
      });

      const value = await syncManager.loadPreference('theme');
      expect(value).toBe('dark');
      expect(global.fetch).toHaveBeenCalledWith('/api/preferences/theme');
    });
  });
});
