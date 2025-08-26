import {defineStore} from "pinia";
import {ref, Ref} from "vue";
import moment from "moment";

export const useActivityStore = defineStore("activity", () => {
    const activities: Ref<ActivityModel[]> = ref([
        {
            id: 1,
            publisher: 2352,
            title: "测试活动",
            image_url: "https://oss.half-nothing.cn/2.jpg",
            active_time: "2025-08-20T11:30:00Z",
            departure_airport: "ZSSS",
            arrival_airport: "ZBAD",
            route: "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            distance: 540,
            status: 2,
            NOTAMS: "",
            pilots: [
                {
                    id: 1,
                    activity_id: 1,
                    cid: 2352,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                },
                {
                    id: 2,
                    activity_id: 1,
                    cid: 1234,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 2
                },
                {
                    id: 3,
                    activity_id: 1,
                    cid: 6547,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 3
                },
                {
                    id: 4,
                    activity_id: 1,
                    cid: 6879,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 4
                },
                {
                    id: 5,
                    activity_id: 1,
                    cid: 6579,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                }
            ],
            facilities: [
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_DEL",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_GND",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZSSS_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5672
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZSSS_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 2352
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZSHA_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6523
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZBPE_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6578
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZBAA_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5348
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZBAA_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 7865
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZBAA_GND",
                    frequency: "111.111"
                }
            ]
        },
        {
            id: 2,
            publisher: 2352,
            title: "测试活动",
            image_url: "https://oss.half-nothing.cn/2.jpg",
            active_time: "2025-09-01T11:30:00Z",
            departure_airport: "ZSSS",
            arrival_airport: "ZBAD",
            route: "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            distance: 540,
            status: 1,
            NOTAMS: "",
            pilots: [
                {
                    id: 2,
                    activity_id: 1,
                    cid: 1234,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 2
                },
                {
                    id: 3,
                    activity_id: 1,
                    cid: 6547,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 3
                },
                {
                    id: 4,
                    activity_id: 1,
                    cid: 6879,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 4
                },
                {
                    id: 5,
                    activity_id: 1,
                    cid: 6579,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                }
            ],
            facilities: [
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_DEL",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_GND",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZSSS_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5672
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZSSS_APP",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZSHA_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6523
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZBPE_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6578
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZBAA_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5348
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZBAA_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 7865
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZBAA_GND",
                    frequency: "111.111"
                }
            ]
        },
        {
            id: 3,
            publisher: 2352,
            title: "测试活动",
            image_url: "https://oss.half-nothing.cn/1.jpg",
            active_time: "2025-07-29T11:30:00Z",
            departure_airport: "ZSSS",
            arrival_airport: "ZBAD",
            route: "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            distance: 540,
            status: 3,
            NOTAMS: "",
            pilots: [
                {
                    id: 2,
                    activity_id: 1,
                    cid: 1234,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 2
                },
                {
                    id: 3,
                    activity_id: 1,
                    cid: 6547,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 3
                },
                {
                    id: 4,
                    activity_id: 1,
                    cid: 6879,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 4
                },
                {
                    id: 5,
                    activity_id: 1,
                    cid: 6579,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                }
            ],
            facilities: [
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_DEL",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_GND",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZSSS_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5672
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZSSS_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 2352
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZSHA_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6523
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZBPE_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6578
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZBAA_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5348
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZBAA_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 7865
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZBAA_GND",
                    frequency: "111.111"
                }
            ]
        },
        {
            id: 4,
            publisher: 2352,
            title: "测试活动",
            image_url: "https://oss.half-nothing.cn/1.jpg",
            active_time: "2025-08-31T11:30:00Z",
            departure_airport: "ZSSS",
            arrival_airport: "ZBAD",
            route: "POMOK G330 PIMOL A593 DALIM W157 AVBOX",
            distance: 540,
            status: 1,
            NOTAMS: "",
            pilots: [
                {
                    id: 1,
                    activity_id: 1,
                    cid: 2352,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                },
                {
                    id: 2,
                    activity_id: 1,
                    cid: 1234,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 2
                },
                {
                    id: 3,
                    activity_id: 1,
                    cid: 6547,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 3
                },
                {
                    id: 4,
                    activity_id: 1,
                    cid: 6879,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 4
                },
                {
                    id: 5,
                    activity_id: 1,
                    cid: 6579,
                    callsign: "CES2352",
                    aircraft_type: "A320",
                    status: 1
                }
            ],
            facilities: [
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_DEL",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZSSS_GND",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZSSS_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5672
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZSSS_APP",
                    frequency: "111.111"
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZSHA_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6523
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 5,
                    callsign: "ZBPE_CTR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 6578
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 4,
                    callsign: "ZBAA_APP",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 5348
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 3,
                    callsign: "ZBAA_TWR",
                    frequency: "111.111",
                    controller: {
                        id: 1,
                        activity_id: 1,
                        facility_id: 1,
                        cid: 7865
                    }
                },
                {
                    id: 1,
                    activity_id: 1,
                    min_rating: 2,
                    callsign: "ZBAA_GND",
                    frequency: "111.111"
                }
            ]
        }
    ])

    const activitiesRecord: Ref<{ [key: string]: ActivityModel }> = ref({})

    const translateActivityData = (activities: ActivityModel[]) => {
        activitiesRecord.value = {}
        activities.forEach((activity) => {
            const activityDate = moment(activity.active_time)
            activity.start_time = activityDate.format('HH:mm:ss')
            activitiesRecord.value[activityDate.format("YYYY-MM-DD")] = activity
        })
    }

    translateActivityData(activities.value)

    const getActivityById = (activityId: number) => {
        for (const activity of activities.value) {
            if (activity.id == activityId) {
                return activity
            }
        }
        return null
    }

    return {activities, activitiesRecord, translateActivityData, getActivityById}
})