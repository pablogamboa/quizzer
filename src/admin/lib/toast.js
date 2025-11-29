import { writable } from 'svelte/store'

export const toasts = writable([])

let toastId = 0

export function showToast(message, type = 'info', duration = 3000) {
    const id = ++toastId

    toasts.update((t) => [...t, { id, message, type }])

    if (duration > 0) {
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    return id
}

export function removeToast(id) {
    toasts.update((t) => t.filter((toast) => toast.id !== id))
}

export function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration)
}

export function showError(message, duration = 5000) {
    return showToast(message, 'error', duration)
}

export function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration)
}
