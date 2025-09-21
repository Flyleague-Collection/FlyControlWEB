import {defineStore} from "pinia";
import {useDark, useToggle} from "@vueuse/core";

export const useStateStore = defineStore("state", () => {
    const isDark = useDark({disableTransition: false})
    const toggleDark = useToggle(isDark)

    return {
        isDark: isDark,
        toggleDark: toggleDark
    }
})