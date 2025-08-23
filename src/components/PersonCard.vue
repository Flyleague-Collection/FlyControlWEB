<script setup lang="ts">
import {UserFilled} from "@element-plus/icons-vue";

defineProps({
    expend: {
        type: Boolean,
        default: true,
        required: true
    }
})
</script>

<template>
    <div class="person-card">
        <el-avatar :icon="UserFilled"></el-avatar>
        <Transition>
            <div class="user-info" v-if="expend">
                <span class="username">Half_nothing</span>
                <span class="level">C3</span>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.username {
    font-size: 20px;
    font-weight: bold;
}

.level {
    font-size: 15px;
    background-color: #ccafbb;
    border-radius: 5px;
    padding: 0 10px;
}

.person-card {
    display: flex;
    overflow: hidden;
    height: 50px;
}

.person-card > * {
    margin: 5px 0;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 10px;
}

.v-enter-active,
.v-leave-active {
    transition: width 0.3s ease-out;
    opacity: 0;
}

.v-enter-to,
.v-leave-from {
    width: 200px;
    opacity: 0;
}

.v-enter-from,
.v-leave-to {
    width: 0;
    opacity: 0;
}
</style>