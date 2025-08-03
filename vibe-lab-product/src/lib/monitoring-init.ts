/**
 * Monitoring System Initialization for Vibe Lab Development
 * Activates AVCA/DIAS monitoring for real-time development insights
 */

import { unifiedMonitor } from '@/lib/monitoring/unified-monitor';

// Initialize monitoring for development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
  // Server-side initialization
  console.log('🔍 Initializing AVCA/DIAS monitoring for Vibe Lab development...');
  unifiedMonitor.start();
  
  // Log system status
  const status = unifiedMonitor.getSystemStatus();
  console.log(`📊 Monitoring Status: ${status.health}`);
  console.log(`🔧 Active Components: Logic(${status.logic.activeModules}), Metrics(${status.metrics.services}), Logs(${status.logs.active})`);
  
  // Log where to find monitoring
  console.log('📍 Monitoring available at:');
  console.log('  • Dashboard: http://localhost:3000/dev/monitor');
  console.log('  • Console: Real-time logs in terminal');
  console.log('  • Events: EventBus integration active\n');
}

// Client-side monitoring initialization
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Client-side monitoring initialized');
  console.log('📊 Visit /dev/monitor for real-time dashboard');
}

export { unifiedMonitor };