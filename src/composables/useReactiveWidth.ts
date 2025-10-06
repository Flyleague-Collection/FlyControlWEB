import {useMediaQuery} from "@vueuse/core";

export const useReactiveWidth = () => {
    return {
        less1200px: useMediaQuery("(max-width: 1200px)"),
        less1100px: useMediaQuery("(max-width: 1100px)"),
        less1000px: useMediaQuery("(max-width: 1000px)"),
        less900px: useMediaQuery("(max-width: 900px)"),
        less800px: useMediaQuery("(max-width: 800px)"),
        less700px: useMediaQuery("(max-width: 700px)"),
        less600px: useMediaQuery("(max-width: 600px)"),
        less500px: useMediaQuery("(max-width: 500px)"),
        less400px: useMediaQuery("(max-width: 400px)")
    }
}