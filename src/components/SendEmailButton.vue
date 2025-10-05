<script setup lang="ts">
import {ref} from "vue";
import {useCountdown} from "@vueuse/core";
import {useServerConfigStore} from "@/store/server_config.js";
import {showError} from "@/utils/message.js";

const serverConfig = useServerConfigStore();
const underCooldown = ref(false);

const btnText = defineModel({type: String, default: "发送验证码"});

defineProps({
    size: {
        type: String,
        required: false,
        default: 'default'
    },
    round: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emits = defineEmits<{
    (e: 'buttonClickEvent', callback: Callback1<boolean>): Promise<void>;
}>();

const {remaining, start, reset} = useCountdown(serverConfig.config.email_send_interval, {
    onComplete() {
        underCooldown.value = false;
        btnText.value = "发送验证码";
        reset();
    },
    onTick() {
        btnText.value = `${remaining.value}s`;
    }
})

const clickButton = async () => {
    if (underCooldown.value) {
        showError(`请在${remaining.value}s后再次发送`);
        return;
    }
    underCooldown.value = true;
    await emits('buttonClickEvent', success => success ? start() : underCooldown.value = false);
}

defineExpose({remaining, underCooldown})
</script>

<template>
    <el-button type="primary" :disabled="underCooldown" :loading="underCooldown" @click="clickButton()" :size="size"
               :round="round">
        {{ btnText }}
    </el-button>
</template>

<style scoped>

</style>