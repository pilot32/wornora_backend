const EMAIL_TIMEOUT_MS = 10 * 1000;

const isEmailConfigured = () => (
    (process.env.EMAIL_PROVIDER || '').toLowerCase() === 'resend' &&
    Boolean(process.env.EMAIL_API_KEY) &&
    Boolean(process.env.EMAIL_FROM)
);

const sendWithResend = async ({ to, subject, html, text }) => {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(EMAIL_TIMEOUT_MS),
        headers: {
            Authorization: `Bearer ${process.env.EMAIL_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [to],
            subject,
            html,
            text,
        }),
    });

    if (!response.ok) {
        throw new Error(`Email provider rejected the message (${response.status})`);
    }
};

const sendEmail = async ({ to, subject, html, text }) => {
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();

    if (provider === 'console' && process.env.NODE_ENV !== 'production') {
        console.log(`Email to ${to}: ${subject}`);
        return { sent: true, provider: 'console' };
    }

    if (!isEmailConfigured()) {
        console.warn('Order email skipped because email delivery is not configured');
        return { sent: false, reason: 'not_configured' };
    }

    await sendWithResend({ to, subject, html, text });
    return { sent: true, provider: 'resend' };
};

module.exports = {
    isEmailConfigured,
    sendEmail,
};
