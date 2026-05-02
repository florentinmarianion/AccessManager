import jwt from 'jsonwebtoken';

export function auth(requiredRoles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: 'No token' });

    const token = header.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      if (
        requiredRoles.length &&
        !requiredRoles.includes(Number(decoded.role_id))
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}   