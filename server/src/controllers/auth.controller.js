import * as authService from '../services/auth.service.js';
import * as auditService from '../services/audit.service.js';

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    await auditService.log(result.user, 'login');
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}