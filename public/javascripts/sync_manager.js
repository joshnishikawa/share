/**
 * SyncManager - Handles localStorage <-> server synchronization
 * Usage: new SyncManager(authWidget)
 */
class SyncManager {
  constructor(authWidget) {
    this.authWidget = authWidget;
    this.syncTimers = {}; // Debounce timers for each storage key
    this.syncInProgress = {};
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
        if (localData && localData.length > 0) {
          console.log('SyncManager: No server data, pushing local data');
          await this.syncToServer(storageKey, 0); // Immediate sync
        }
      }
    } catch (err) {
      console.error('SyncManager: Error during init sync:', err);
    }
  }

  /**
   * Merge server data with localStorage (newest timestamp wins)
   */
  mergeData(storageKey, serverData) {
    const localData = this.getLocalData(storageKey);
    const hadLocalData = localData && localData.length > 0;

    if (!hadLocalData) {
      // No local data, save server data
      if (serverData && serverData.length > 0) {
        console.log('SyncManager: No local data, using server data');
        localStorage.setItem(storageKey, JSON.stringify(serverData));
        // Only reload if we actually added data
        window.location.reload();
      } else {
        console.log('SyncManager: No local or server data');
      }
      return;
    }

    if (!serverData || serverData.length === 0) {
      // No server data, keep local data
      console.log('SyncManager: No server data, keeping local data');
      return;
    }

    // Merge logic: create a map by index, use newest timestamp
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
      // Reload page to show merged data
      window.location.reload();
    } else {
      console.log('SyncManager: Data already up to date, no changes needed');
    }

    // Push merged data back to server if there were changes
    if (hasChanges) {
      this.syncToServer(storageKey, 0); // Immediate sync after merge
    }
  }

  /**
   * Sync localStorage data to server (debounced)
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
   * Sync a user preference to server
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
   * Load a user preference from server
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
   * Get local storage data
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
