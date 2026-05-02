import * as auditService from '../services/audit.service.js';

export async function getLogs(req, res) {
  res.json(await auditService.getLogs());
}
