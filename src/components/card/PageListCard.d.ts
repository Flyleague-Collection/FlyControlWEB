import {ComponentExposed} from "vue-component-type-helpers";
import PageListCard from "@/components/card/PageListCard.vue";

export type PageListResponse<T> = {
    data: T[]
    total: number
}

export type PageListCardInstance = ComponentExposed<typeof PageListCard> | null