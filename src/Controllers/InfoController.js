// InfoController.js
// Minimal controller for static ministry/charity info (expand as needed)
import { sendSuccess } from "../core/response.js";

const getMinistryInfo = async (req, res, next) => {
    // This could be static or fetched from DB/config
    const info = {
      mission: "To spread the Gospel of Salvation globally.",
      impact: [
        "Africa missions", "Europe outreach", "Orphan care", "Partnerships"
      ],
      media: [
        // URLs or references to photos/videos
      ]
    };
   return sendSuccess(res, { message: "Ministry Info Fetched Successfully", data: info });
  
};

export default   getMinistryInfo ;