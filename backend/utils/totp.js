const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const generateSecret = (username, issuer = 'TOTP Auth System') => {
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${username})`,
    issuer: issuer,
    length: 32,
  });

  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url,
  };
};

const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR code error:', error);
    throw new Error('QR code generation failed');
  }
};

const verifyToken = (secret, token, window = 2) => {
  try {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: window,
    });

    return verified;
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
};

const generateCurrentToken = (secret) => {
  try {
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
    });
    return token;
  } catch (error) {
    console.error('TOTP generation error:', error);
    return null;
  }
};

module.exports = {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateCurrentToken,
};
