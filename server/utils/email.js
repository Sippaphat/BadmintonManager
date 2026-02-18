import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
    service: config.emailService,
    auth: {
        user: config.emailUser,
        pass: config.emailPass,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    if (!config.emailUser || !config.emailPass) {
        console.warn('Email credentials not provided. Skipping email sending.');
        console.log('To:', to);
        console.log('Subject:', subject);
        // console.log('HTML:', html);
        return;
    }

    const mailOptions = {
        from: config.emailFrom,
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
