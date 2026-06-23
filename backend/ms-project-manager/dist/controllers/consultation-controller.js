// @ts-nocheck
import consultationService from '../services/consultationService.js';
const consultationController = {
    async getTaskDashboard(req, res, next) {
        try {
            const payload = await consultationService.getTaskDashboardForUser(req.user.id);
            res.json(payload);
        }
        catch (error) {
            next(error);
        }
    }
};
export default consultationController;
;
