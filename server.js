const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Nodemailer (usando Gmail como ejemplo)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'zgame.zero29@gmail.com',
        pass: process.env.EMAIL_PASS || 'tu-contraseña-de-aplicación',
    },
});

// Verificar conexión con el servidor de correo
transporter.verify()
    .then(() => console.log('✅ Servidor de correo listo'))
    .catch(err => console.error('❌ Error en servidor de correo:', err));

// Ruta para el formulario de contacto
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    // Validación básica
    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            success: false,
            message: 'Todos los campos requeridos deben ser completados.',
        });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: 'El formato del correo electrónico no es válido.',
        });
    }

    // Protección anti-spam: límite de longitud
    if (message.length > 2000 || name.length > 100 || subject.length > 200) {
        return res.status(400).json({
            success: false,
            message: 'Los campos exceden la longitud permitida.',
        });
    }

    // Construir el correo
    const mailOptions = {
        from: `"GAMEZONE Contacto" <${process.env.EMAIL_USER || 'zgame.zero29@gmail.com'}>`,
        to: 'zgame.zero29@gmail.com',
        replyTo: email,
        subject: `🎮 GAMEZONE | ${subject} - de ${name}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f1c;color:#e0e0e0;border-radius:15px;overflow:hidden;border:2px solid #00D4FF;">
                <div style="background:linear-gradient(135deg,#00D4FF,#B026FF);padding:20px;text-align:center;">
                    <h1 style="color:#050816;margin:0;font-size:1.5rem;">🎮 GAMEZONE ACCESSORIES</h1>
                    <p style="color:#050816;margin:5px 0 0;">Nuevo mensaje de contacto</p>
                </div>
                <div style="padding:25px;">
                    <p><strong style="color:#00D4FF;">👤 Nombre:</strong> ${name}</p>
                    <p><strong style="color:#00D4FF;">📧 Correo:</strong> ${email}</p>
                    <p><strong style="color:#00D4FF;">📱 Teléfono:</strong> ${phone || 'No especificado'}</p>
                    <p><strong style="color:#00D4FF;">📝 Asunto:</strong> ${subject}</p>
                    <hr style="border-color:#1a1f30;">
                    <p><strong style="color:#B026FF;">💬 Mensaje:</strong></p>
                    <p style="background:#121826;padding:15px;border-radius:10px;border-left:3px solid #A8FF00;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="background:#121826;padding:15px;text-align:center;font-size:0.8rem;color:#666;">
                    📧 GAMEZONE ACCESSORIES | zgame.zero29@gmail.com
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado desde: ${email} - Asunto: ${subject}`);
        res.status(200).json({
            success: true,
            message: '¡Mensaje enviado con éxito! Te contactaremos pronto.',
        });
    } catch (error) {
        console.error('❌ Error al enviar correo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje. Por favor, intenta de nuevo más tarde.',
        });
    }
});

// Servir el HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor GAMEZONE corriendo en http://localhost:${PORT}`);
    console.log(`📧 Correo destino: zgame.zero29@gmail.com`);
});