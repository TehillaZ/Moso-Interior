 const jwt = require('jsonwebtoken');
 const User = require('../models/userModel'); 

const handleRefreshToken = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    const foundUser = await User.findOne({ refreshToken }).exec();
    console.log(foundUser)
    if (!foundUser) return res.sendStatus(403);

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.fullname !== decoded.fullname) return res.status(403).json({"message":"try it"});

        const accessToken = jwt.sign(
          {
            fullname: decoded.fullname,
            email: decoded.email
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: '10m' }
        );

        res.json({ accessToken });
      }
    );
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ message: 'Server error during refresh' });
  }
};

module.exports = {handleRefreshToken}

