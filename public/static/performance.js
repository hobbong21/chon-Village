// Performance optimization utilities

// Lazy loading for images
class LazyLoader {
  constructor() {
    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              this.observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.01
        }
      );
      
      this.observeImages();
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  observeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => this.observer.observe(img));
  }

  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.add('loaded');
    }
  }

  loadAllImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => this.loadImage(img));
  }

  refresh() {
    this.observeImages();
  }
}

// Debounce function for search and scroll
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Virtual scrolling for long lists
class VirtualScroller {
  constructor(container, items, renderItem, itemHeight = 80) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    this.startIndex = 0;
    
    this.init();
  }

  init() {
    this.container.style.position = 'relative';
    this.container.style.overflowY = 'auto';
    
    // Create spacer
    this.spacer = document.createElement('div');
    this.spacer.style.height = `${this.items.length * this.itemHeight}px`;
    this.container.appendChild(this.spacer);
    
    // Create viewport
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.left = '0';
    this.viewport.style.right = '0';
    this.container.appendChild(this.viewport);
    
    // Render initial items
    this.render();
    
    // Listen to scroll
    this.container.addEventListener('scroll', throttle(() => this.onScroll(), 100));
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const newStartIndex = Math.floor(scrollTop / this.itemHeight);
    
    if (newStartIndex !== this.startIndex) {
      this.startIndex = newStartIndex;
      this.render();
    }
  }

  render() {
    const endIndex = Math.min(this.startIndex + this.visibleCount, this.items.length);
    const visibleItems = this.items.slice(this.startIndex, endIndex);
    
    this.viewport.style.transform = `translateY(${this.startIndex * this.itemHeight}px)`;
    this.viewport.innerHTML = visibleItems.map(item => this.renderItem(item)).join('');
  }

  update(newItems) {
    this.items = newItems;
    this.spacer.style.height = `${this.items.length * this.itemHeight}px`;
    this.render();
  }
}

// Resource prefetching
function prefetchResource(url, type = 'fetch') {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      const link = document.createElement('link');
      link.rel = type === 'script' ? 'prefetch' : 'prefetch';
      link.href = url;
      link.as = type;
      document.head.appendChild(link);
    });
  }
}

// Code splitting loader
async function loadModule(moduleName) {
  const modules = {
    'chart': () => import('https://cdn.jsdelivr.net/npm/chart.js'),
    'moment': () => import('https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js'),
  };

  if (modules[moduleName]) {
    try {
      return await modules[moduleName]();
    } catch (error) {
      console.error(`Failed to load module: ${moduleName}`, error);
      return null;
    }
  }
  
  console.warn(`Module not found: ${moduleName}`);
  return null;
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0
    };
    
    this.init();
  }

  init() {
    if ('PerformanceObserver' in window) {
      // FCP
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
          this.metrics.firstContentfulPaint = entry.startTime;
          console.log('[Perf] FCP:', entry.startTime.toFixed(2), 'ms');
        }
      }).observe({ type: 'paint', buffered: true });

      // LCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        console.log('[Perf] LCP:', lastEntry.startTime.toFixed(2), 'ms');
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FID
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          console.log('[Perf] FID:', this.metrics.firstInputDelay.toFixed(2), 'ms');
        }
      }).observe({ type: 'first-input', buffered: true });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.metrics.cumulativeLayoutShift = clsValue;
        console.log('[Perf] CLS:', clsValue.toFixed(4));
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  logMetrics() {
    console.table(this.metrics);
  }
}

// Initialize lazy loader
const lazyLoader = new LazyLoader();

// Initialize performance monitor
const perfMonitor = new PerformanceMonitor();

// Log performance metrics after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    perfMonitor.logMetrics();
  }, 3000);
});

// Export utilities
window.LazyLoader = LazyLoader;
window.VirtualScroller = VirtualScroller;
window.debounce = debounce;
window.throttle = throttle;
window.prefetchResource = prefetchResource;
window.loadModule = loadModule;
window.perfMonitor = perfMonitor;
