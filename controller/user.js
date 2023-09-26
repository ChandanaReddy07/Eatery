const User = require('../models/user');

exports.getUserById = async (req, res, next, id) => {
    try {
      const user = await User.findById(id).exec();
  
      if (!user) {
        return res.status(400).json({ error: 'USER not found' });
      }
  
      req.profile = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.getUser = (req, res) => {
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;
    return res.json(req.profile);
};
