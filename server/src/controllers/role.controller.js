import * as roleService from '../services/role.service.js';
import * as audit from '../services/audit.service.js';

export async function getRoles(req, res) {
  res.json(await roleService.getRoles());
}

export async function createRole(req, res) {
  await roleService.createRole(req.body.name);
  await audit.log(req.user, `create role ${req.body.name}`);
  res.json({ message: 'created' });
}

export async function updateRole(req, res) {
  await roleService.updateRole(req.params.id, req.body.name);
  await audit.log(req.user, `update role ${req.body.name}`);
  res.json({ message: 'updated' });
}

export async function deleteRole(req, res) {
  const role = await roleService.getRoleById(req.params.id);
  await roleService.deleteRole(req.params.id);
  await audit.log(req.user, `delete role ${role.name}`);
  res.json({ message: 'deleted' });
}