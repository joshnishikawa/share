////////////////////////////////////////////////////////////////////////////////
// sync_manager.js — Handles bidirectional sync between localStorage and server.
//
// PATTERN: Like auth_widget.js, uses ES6 class, async/await, fetch, const/let.
//          Clean structure with proper error handling throughout.
//
// FLOW:
//   1. initSync(key) — On page load, fetch server data and merge with local.
//   2. mergeData(key, serverData) — Conflict resolution:
//      - Objects (lists): shallow merge { ...local, ...server } (server wins on conflicts)
//      - Arrays (canvas): per-index newest-timestamp wins
//   3. syncToServer(key) — Debounced push of local data to server.
//   4. syncPreference / loadPreference — Key-value prefs sync.
//
// DEPENDS ON: AuthWidget instance (passed to constructor)
////////////////////////////////////////////////////////////////////////////////

/**
 * SyncManager - Handles localStorage <-> server synchronization
 * Usage: new SyncManager(authWidget)
 */
class SyncManager {
  constructor(authWidget) {
    this.authWidget = authWidget;
    this.syncTimers = {}; // Debounce timers for each storage key
    this.syncInProgress = {}; // Prevents concurrent syncs for the same key
  }

  /**
   * Initialize sync for a storage key - downloads from server and merges with local
   */
  async initSync(storageKey) {
    if (!this.authWidget.isAuthenticated()) {
      console.log('SyncManager: Not authenticated, skipping sync for', storageKey);
      return;
    }

    try {
      console.log('SyncManager: Initializing sync for', storageKey);

      // Fetch server data
      const response = await fetch(`/api/sync/canvas/${storageKey}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('SyncManager: Error fetching server data:', result);
        return;
      }

      if (result.success && result.data) {
        // Merge server data with local data
        this.mergeData(storageKey, result.data);
      } else {
        // No server data, push local data to server if it exists
        const localData = this.getLocalData(storageKey);
        const hasLocalData = localData && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0);
        if (hasLocalData) {
          console.log('SyncManager: No server data, pushing local data');
          await this.syncToServer(storageKey, 0); // Immediate sync
        }
      }
    } catch (err) {
      console.error('SyncManager: Error during init sync:', err);
    }
  }

  /**
   * Merge server data with localStorage.
   * - Objects: shallow spread merge (server keys overwrite local on conflict).
   *   NOTE: This means server always wins on key conflicts for objects.
   *   The spread order { ...local, ...server } is intentional.
   * - Arrays: per-index comparison using .timestamp (newest wins).
   *
   *
   * NOTE: window.location.reload() is called in 3 places in this method.
   *       If the merge produces changes, the user sees a full page refresh
   *       which can be jarring. Consider updating the UI in-place instead.
   */
  mergeData(storageKey, serverData) {
    const localData = this.getLocalData(storageKey);

    // Check if data is an object (lists) or array (canvas)
    const isObject = serverData && typeof serverData === 'object' && !Array.isArray(serverData);
    const hasLocalData = localData && (Array.isArray(localData) ? localData.length > 0 : Object.keys(localData).length > 0);
    const hasServerData = serverData && (Array.isArray(serverData) ? serverData.length > 0 : Object.keys(serverData).length > 0);

    if (!hasLocalData) {
      // No local data, save server data
      if (hasServerData) {
        console.log('SyncManager: No local data, using server data');
        localStorage.setItem(storageKey, JSON.stringify(serverData));
        // Only reload if we actually added data
        window.location.reload();
      } else {
        console.log('SyncManager: No local or server data');
      }
      return;
    }

    if (!hasServerData) {
      // No server data, keep local data
      console.log('SyncManager: No server data, keeping local data');
      return;
    }

    // Handle object merging (for lists)
    if (isObject) {
      const merged = { ...localData, ...serverData };
      const hasChanges = JSON.stringify(localData) !== JSON.stringify(merged);

      if (hasChanges) {
        console.log('SyncManager: Merged list data with changes');
        localStorage.setItem(storageKey, JSON.stringify(merged));
        // Push merged data back to server, then reload
        this.syncToServer(storageKey, 0);
        window.location.reload();
      } else {
        console.log('SyncManager: List data already up to date');
      }
      return;
    }

    // Handle array merging (for canvas data with timestamps)
    const merged = [];
    const maxLength = Math.max(localData.length, serverData.length);
    let hasChanges = false;

    for (let i = 0; i < maxLength; i++) {
      const localItem = localData[i];
      const serverItem = serverData[i];

      if (localItem && serverItem) {
        // Both exist, use newest
        const localTime = localItem.timestamp || 0;
        const serverTime = serverItem.timestamp || 0;
        const chosen = localTime > serverTime ? localItem : serverItem;
        merged[i] = chosen;
        // Check if we chose server data (meaning local was older)
        if (localTime < serverTime) {
          hasChanges = true;
        }
      } else if (localItem) {
        // Only local exists
        merged[i] = localItem;
      } else if (serverItem) {
        // Only server exists (server has more canvases than local)
        merged[i] = serverItem;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      console.log('SyncManager: Merged data with changes:', merged.length, 'items');
      localStorage.setItem(storageKey, JSON.stringify(merged));
      // Push merged data back to server, then reload
      this.syncToServer(storageKey, 0);
      window.location.reload();
    } else {
      console.log('SyncManager: Data already up to date, no changes needed');
    }
  }

  /**
   * Sync localStorage data to server (debounced).
   * Default 500ms debounce; pass 0 for immediate sync.
   * Uses syncInProgress flag to prevent concurrent syncs for the same key.
   *
   * NOTE: The debounce timer callback is async but setTimeout doesn't
   *       await it — errors inside are caught by try/catch, but the caller
   *       of syncToServer() can't await the actual sync completion.
   *       This is generally fine for fire-and-forget, but means the
   *       mergeData() calls to syncToServer(key, 0) don't actually wait.
   */
  async syncToServer(storageKey, delay = 500) {
    if (!this.authWidget.isAuthenticated()) {
      console.log('SyncManager: Not authenticated, skipping server sync');
      return;
    }

    // Clear existing timer
    if (this.syncTimers[storageKey]) {
      clearTimeout(this.syncTimers[storageKey]);
    }

    // Set new debounced timer
    this.syncTimers[storageKey] = setTimeout(async () => {
      if (this.syncInProgress[storageKey]) {
        console.log('SyncManager: Sync already in progress for', storageKey);
        return;
      }

      this.syncInProgress[storageKey] = true;

      try {
        const localData = this.getLocalData(storageKey);

        console.log('SyncManager: Syncing to server:', storageKey, localData?.length || 0, 'items');

        const response = await fetch(`/api/sync/canvas/${storageKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: localData || [] })
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('SyncManager: Error syncing to server:', result);
        } else {
          console.log('SyncManager: Successfully synced to server');
        }
      } catch (err) {
        console.error('SyncManager: Error during sync:', err);
      } finally {
        this.syncInProgress[storageKey] = false;
      }
    }, delay);
  }

  /**
   * Sync a single user preference to server (POST /api/preferences/:key).
   * Stores as key-value pair in user_preferences table.
   */
  async syncPreference(key, value) {
    if (!this.authWidget.isAuthenticated()) {
      return;
    }

    try {
      const response = await fetch(`/api/preferences/${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('SyncManager: Error syncing preference:', result);
      }
    } catch (err) {
      console.error('SyncManager: Error syncing preference:', err);
    }
  }

  /**
   * Load a single user preference from server (GET /api/preferences/:key).
   * Returns null if not authenticated or on any error.
   */
  async loadPreference(key) {
    if (!this.authWidget.isAuthenticated()) {
      return null;
    }

    try {
      const response = await fetch(`/api/preferences/${key}`);
      const result = await response.json();

      if (response.ok && result.success) {
        return result.value;
      }
    } catch (err) {
      console.error('SyncManager: Error loading preference:', err);
    }

    return null;
  }

  /**
   * Get and parse localStorage data. Returns null on missing or invalid JSON.
   * NOTE: Good defensive parsing — catches malformed localStorage gracefully.
   */
  getLocalData(storageKey) {
    const data = localStorage.getItem(storageKey);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (err) {
      console.error('SyncManager: Error parsing local data:', err);
      return null;
    }
  }
}

if (typeof window !== 'undefined') {
  window.SyncManager = SyncManager;
}
