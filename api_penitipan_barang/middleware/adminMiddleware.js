const adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.' });
  }
  next();
};

module.exports = adminMiddleware;