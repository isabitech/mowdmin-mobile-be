// InfoService.js
// Satisfies tests expecting a service for info routes

export const getAllInfo = async () => {
    return {
        mission: "To spread the Gospel of Salvation globally.",
        impact: [
            "Africa missions", "Europe outreach", "Orphan care", "Partnerships"
        ],
        media: []
    };
};

export default {
    getAllInfo,
};
