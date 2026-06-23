// @ts-nocheck
import kpiOrchestrationService from '../../../application/kpi/kpiOrchestrationService.js';
const kpiOrchestrationController = {
    async getDashboard(req, res, next) {
        try {
            const payload = await kpiOrchestrationService.getDashboard(req);
            res.json(payload);
        }
        catch (err) {
            next(err);
        }
    }
};
export default kpiOrchestrationController;
