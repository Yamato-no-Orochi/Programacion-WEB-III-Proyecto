import axios from 'axios';

export const validarCaptcha = async (req, res, next) => {
  try {
    const { captchaToken } = req.body;
    
    if (!captchaToken) {
      return res.status(400).json({ error: 'CAPTCHA requerido' });
    }
    
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
    );
    
    if (!response.data.success) {
      return res.status(400).json({ error: 'CAPTCHA inválido' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error validando CAPTCHA' });
  }
};