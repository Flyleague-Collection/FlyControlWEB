import {POSITION, useToast} from 'vue-toastification'

const toast = useToast()

export const showSuccess = (message: string, position: POSITION = POSITION.TOP_CENTER, timeout: number = 3000) => {
    toast.success(message, {position, timeout})
}

export const showInfo = (message: string, position: POSITION = POSITION.TOP_CENTER, timeout: number = 3000) => {
    toast.info(message, {position, timeout})
}

export const showWarning = (message: string, position: POSITION = POSITION.TOP_CENTER, timeout: number = 3000) => {
    toast.warning(message, {position, timeout})
}

export const showError = (message: string, position: POSITION = POSITION.TOP_CENTER, timeout: number = 3000) => {
    toast.error(message, {position, timeout})
}