// InfoController.js
// Minimal controller for static ministry/charity info (expand as needed)
import { sendSuccess } from "../core/response.js";
import InfoService from "../Services/InfoService.js";

const getMinistryInfo = async (req, res, next) => {
  const info = await InfoService.getAllInfo();
  return sendSuccess(res, { message: "Ministry Info Fetched Successfully", data: info });

};

export default getMinistryInfo;