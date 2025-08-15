/**
 * Cache Busting Service for Fresh Content Delivery
 * Implements multiple strategies to ensure users get the latest content
 */

export class CacheBustingService {
  private static instance: CacheBustingService;
  private buildVersion: string;
  private cacheBustingEnabled: boolean;

  private constructor() {
    this.buildVersion = this.generateBuildVersion();
    this.cacheBustingEnabled = import.meta.env.PROD;
    this.initializeCacheBusting();
  }

  static getInstance(): CacheBustingService {
    if (!CacheBustingService.instance) {
      CacheBustingService.instance = new CacheBustingService();
    }
    return CacheBustingService.instance;
  }

  /**
   * Generate a unique build version identifier
   */
  private generateBuildVersion(): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomId}`;
  }

  /**
   * Initialize cache busting strategies
   */
  private initializeCacheBusting(): void {
    if (!this.cacheBustingEnabled) return;

    // Set no-cache headers for dynamic requests
    this.setupFetchInterceptor();
    
    // Add version parameter to critical resources
    this.versionCriticalResources();
    
    // Setup service worker cache invalidation
    this.setupServiceWorkerCacheInvalidation();
    
    // Monitor for new versions
    this.setupVersionMonitoring();
  }

  /**
   * Setup fetch interceptor to add cache-busting headers
   */
  private setupFetchInterceptor(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      
      // Apply cache busting to API calls and dynamic content
      if (this.shouldApplyCacheBusting(url)) {
        const cacheBustingInit: RequestInit = {
          ...init,
          headers: {
            ...init?.headers,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Cache-Bust': this.buildVersion
          }
        };

        // Add version parameter to URL
        const cacheBustedUrl = this.addVersionParameter(url);
        const cacheBustedInput = typeof input === 'string' ? cacheBustedUrl : 
                                input instanceof URL ? new URL(cacheBustedUrl) : 
                                { ...input, url: cacheBustedUrl };

        return originalFetch(cacheBustedInput, cacheBustingInit);
      }

      return originalFetch(input, init);
    };
  }

  /**
   * Check if cache busting should be applied to a URL
   */
  private shouldApplyCacheBusting(url: string): boolean {
    // Apply cache busting to:
    // - API endpoints
    // - JSON files
    // - Dynamic content
    // - Service worker files
    const cacheBustingPatterns = [
      /\/api\//,
      /\.json$/,
      /\/sw\.js$/,
      /\/firebase-messaging-sw\.js$/,
      /\/manifest\.json$/,
      /weather|earthquake|disaster|emergency/i
    ];

    return cacheBustingPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Add version parameter to URL for cache busting
   */
  private addVersionParameter(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      urlObj.searchParams.set('v', this.buildVersion);
      urlObj.searchParams.set('_t', Date.now().toString());
      return urlObj.toString();
    } catch {
      // Fallback for relative URLs
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}v=${this.buildVersion}&_t=${Date.now()}`;
    }
  }

  /**
   * Version critical resources like CSS and JS files
   */
  private versionCriticalResources(): void {
    // Update meta tags for cache busting
    this.updateMetaTags();
    
    // Update critical resource URLs
    this.updateCriticalResourceUrls();
  }

  /**
   * Update meta tags for cache control
   */
  private updateMetaTags(): void {
    const metaTags = [
      { name: 'cache-control', content: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      { name: 'pragma', content: 'no-cache' },
      { name: 'expires', content: '0' },
      { name: 'version', content: this.buildVersion },
      { name: 'last-modified', content: new Date().toISOString() }
    ];

    metaTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    });
  }

  /**
   * Update URLs of critical resources
   */
  private updateCriticalResourceUrls(): void {
    // Update service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }

    // Update manifest link
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      manifestLink.href = this.addVersionParameter(manifestLink.href);
    }
  }

  /**
   * Setup service worker cache invalidation
   */
  private setupServiceWorkerCacheInvalidation(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATE_REQUIRED') {
          this.clearAllCaches();
        }
      });

      // Send version info to service worker
      navigator.serviceWorker.ready.then(registration => {
        if (registration.active) {
          registration.active.postMessage({
            type: 'VERSION_UPDATE',
            version: this.buildVersion
          });
        }
      });
    }
  }

  /**
   * Setup version monitoring to detect new releases
   */
  private setupVersionMonitoring(): void {
    // Check for new version every 5 minutes
    setInterval(() => {
      this.checkForNewVersion();
    }, 5 * 60 * 1000);

    // Check when user returns to tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForNewVersion();
      }
    });
  }

  /**
   * Check for new version of the application
   */
  private async checkForNewVersion(): Promise<void> {
    try {
      const response = await fetch('/version.json', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const versionData = await response.json();
        if (versionData.version && versionData.version !== this.buildVersion) {
          this.handleNewVersionDetected(versionData.version);
        }
      }
    } catch (error) {
      console.log('Version check failed:', error);
    }
  }

  /**
   * Handle new version detection
   */
  private handleNewVersionDetected(newVersion: string): void {
    console.log(`New version detected: ${newVersion}`);
    
    // Show notification to user
    this.showUpdateNotification();
    
    // Clear caches
    this.clearAllCaches();
    
    // Update build version
    this.buildVersion = newVersion;
  }

  /**
   * Show update notification to user
   */
  private showUpdateNotification(): void {
    // Create a non-intrusive update notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      max-width: 300px;
      cursor: pointer;
      transition: all 0.3s ease;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🔄</span>
        <div>
          <div style="font-weight: 600;">Update Available</div>
          <div style="font-size: 12px; opacity: 0.9;">Click to refresh and get the latest features</div>
        </div>
      </div>
    `;

    notification.addEventListener('click', () => {
      this.forceRefresh();
    });

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Clear all browser caches
   */
  public async clearAllCaches(): Promise<void> {
    try {
      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear localStorage version info
      localStorage.removeItem('app_version');
      localStorage.removeItem('cache_timestamp');

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('All caches cleared successfully');
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }

  /**
   * Force refresh the application
   */
  public forceRefresh(): void {
    // Clear caches first
    this.clearAllCaches().then(() => {
      // Hard refresh the page
      window.location.reload();
    });
  }

  /**
   * Get current build version
   */
  public getBuildVersion(): string {
    return this.buildVersion;
  }

  /**
   * Enable or disable cache busting
   */
  public setCacheBustingEnabled(enabled: boolean): void {
    this.cacheBustingEnabled = enabled;
  }

  /**
   * Get cache busting status
   */
  public isCacheBustingEnabled(): boolean {
    return this.cacheBustingEnabled;
  }

  /**
   * Manual cache bust for specific URL
   */
  public bustCache(url: string): string {
    return this.addVersionParameter(url);
  }

  /**
   * Check if content is fresh (not from cache)
   */
  public async checkContentFreshness(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      });

      const lastModified = response.headers.get('Last-Modified');
      const etag = response.headers.get('ETag');
      
      // Store and compare with previous values
      const cacheKey = `freshness_${btoa(url)}`;
      const previousData = localStorage.getItem(cacheKey);
      const currentData = JSON.stringify({ lastModified, etag });
      
      if (previousData !== currentData) {
        localStorage.setItem(cacheKey, currentData);
        return true; // Content is fresh
      }
      
      return false; // Content might be cached
    } catch {
      return true; // Assume fresh if check fails
    }
  }
}

// Initialize cache busting service
export const cacheBustingService = CacheBustingService.getInstance();

// Export utility functions
export const forceRefresh = () => cacheBustingService.forceRefresh();
export const clearAllCaches = () => cacheBustingService.clearAllCaches();
export const bustCache = (url: string) => cacheBustingService.bustCache(url);

export default CacheBustingService;
