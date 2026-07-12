export const showToast = (message, type = 'success') => {
    
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success';
    
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium text-white shadow-lg transform transition-all duration-300 translate-y-10 opacity-0 ${isSuccess ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-red-500 dark:bg-red-600'}`;
    
    // Iconos SVG
    const successIcon = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
    const errorIcon = `<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
    
    toast.innerHTML = `
        ${isSuccess ? successIcon : errorIcon}
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });
    
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.showToast = showToast;
