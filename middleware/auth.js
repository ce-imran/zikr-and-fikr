const requireAdminAuth = (req, res, next) => {
  const isAuth = req.user || (req.session && req.session.adminUser);
  const isSecretOk = req.session && req.session.secretVerified === true;

  if (isAuth && isSecretOk) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access Denied. Secret Master Key Verification Required.'
  });
};

module.exports = { requireAdminAuth };
