export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHtml(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 40px 0;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }
        .header {
            background-color: #0284c7;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 40px 32px;
            text-align: center;
        }
        .intro-text {
            font-size: 16px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 24px 0;
        }
        .otp-container {
            background-color: #f0f9ff;
            border: 2px dashed #bae6fd;
            border-radius: 8px;
            padding: 16px 24px;
            display: inline-block;
            margin-bottom: 24px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 6px;
            color: #0369a1;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
        }
        .expiry-text {
            font-size: 14px;
            color: #ef4444;
            font-weight: 600;
            background-color: #fef2f2;
            padding: 6px 16px;
            border-radius: 20px;
            display: inline-block;
            margin-bottom: 32px;
        }
        .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 24px;
            font-size: 13px;
            color: #94a3b8;
            line-height: 1.5;
        }
        .clinic-name {
            font-weight: 600;
            color: #64748b;
            margin: 12px 0 0 0;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Clinic Management System</h1>
            </div>
            <div class="content">
                <p class="intro-text">Please use the following One-Time Password (OTP) to complete your verification process. For security reasons, do not share this code with anyone.</p>
                <div class="otp-container">
                    <p class="otp-code">${otp}</p>
                </div>
                <div>
                    <span class="expiry-text">Expires in 10 minutes</span>
                </div>
                <div class="footer">
                    <p style="margin: 0 0 8px 0;">This is an automated security notification. Please do not reply directly to this email.</p>
                    <p class="clinic-name">&copy; 2026 Clinic Management System. All rights reserved.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `
}

// function getOtpText(otp) {
//     return `Your OTP is: ${otp}. This OTP will expire in 10 minutes.`;
// }