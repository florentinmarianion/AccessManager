import * as userService from '../services/user.service.js';
import * as audit from '../services/audit.service.js';

export async function getUsers(req, res) {
  res.json(await userService.getUsers());
}

export async function createUser(req, res) {
  try {
    const { username, email, first_name, last_name, phone, custom_fields, password, role_id } = req.body;
    if (!username || !email || !password || !role_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    await userService.createUser(req.body);
    await audit.log(req.user, `create user ${username}`);
    res.json({ message: 'created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function updateUser(req, res) {
  const { username, email, first_name, last_name, phone, custom_fields, password, role_id } = req.body;
  await userService.updateUser(req.params.id, { username, email, first_name, last_name, phone, custom_fields, password, role_id });
  await audit.log(req.user, `update user ${username}`);
  res.json({ message: 'updated' });
}

export async function deleteUser(req, res) {
  const user = await userService.getUserById(req.params.id);
  await userService.deleteUser(req.params.id);
  await audit.log(req.user, `delete user ${user.username}`);
  res.json({ message: 'deleted' });
}
