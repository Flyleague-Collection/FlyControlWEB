import {ref, onMounted, onUnmounted} from 'vue'
import {uploadImage, isImageFile} from '@/api/file.js'
import {showError, showSuccess} from "@/utils/message.js";
import {sizeToString} from "@/utils/utils.js";
import {useServerConfigStore} from "@/store/server_config.js";

export const usePasteImage = (onImageUpload: (url: string) => void) => {
    const isUploading = ref(false)
    const serverConfigStore = useServerConfigStore();

    const handlePaste = async (event: ClipboardEvent) => {
        const clipboardData = event.clipboardData
        if (!clipboardData) return

        const items = clipboardData.items
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                event.preventDefault()

                const file = item.getAsFile()
                if (file && isImageFile(file)) {
                    if (file.size > serverConfigStore.config.image_limit.max_allow_size) {
                        showError(`不能上传大于${sizeToString(serverConfigStore.config.image_limit.max_allow_size)}的文件`);
                        break
                    }
                    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
                    if (serverConfigStore.config.image_limit.allowed_ext.findIndex(x => x === ext) === -1) {
                        showError(`不支持的图片类型`);
                        break
                    }
                    await processImageUpload(file)
                }
                break
            }
        }
    }

    const processImageUpload = async (file: File) => {
        if (isUploading.value) return

        isUploading.value = true
        const imageUrl = await uploadImage(file)
        if (imageUrl) {
            onImageUpload(imageUrl)
        }
        isUploading.value = false
    }

    onMounted(() => {
        document.addEventListener('paste', handlePaste)
    })

    onUnmounted(() => {
        document.removeEventListener('paste', handlePaste)
    })

    return {
        isUploading
    }
}