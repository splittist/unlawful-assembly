/**
 * Shared UI utilities for creator components
 */

/**
 * Get the color class for a placeholder type
 */
export function getTypeColor(type: string): string {
  switch (type) {
    case 'simple': return 'bg-blue-100 text-blue-800';
    case 'conditional': return 'bg-yellow-100 text-yellow-800';
    case 'loop': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Show a notification toast message
 */
export function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
  const colors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type]} border rounded-lg p-4 shadow-lg z-50 max-w-sm`;
  notification.innerHTML = `
    <div class="flex justify-between items-center">
      <p class="text-sm font-medium">${message}</p>
      <button class="ml-2 text-lg leading-none">&times;</button>
    </div>
  `;

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);

  // Manual close
  notification.querySelector('button')?.addEventListener('click', () => {
    notification.remove();
  });

  document.body.appendChild(notification);
}
