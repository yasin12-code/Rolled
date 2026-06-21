import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const { slip, recipientEmail, companyName } = await request.json();

    if (!slip || !recipientEmail) {
      return NextResponse.json({ error: 'Missing salary slip data or recipient email.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !resend) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = months[(slip.month - 1)] || '';

    const allowanceRows = (slip.snapshot.allowances || [])
      .map((a: any) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#4a4a5a;">${a.label}</td>
          <td style="padding:8px 0;font-size:13px;color:#1c1c2e;font-weight:500;text-align:right;">PKR ${a.amount.toLocaleString('en-PK')}</td>
        </tr>`).join('');

    const deductionRows = (slip.snapshot.deductions || [])
      .map((d: any) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#4a4a5a;">${d.label}</td>
          <td style="padding:8px 0;font-size:13px;color:#e05a3a;font-weight:500;text-align:right;">- PKR ${d.amount.toLocaleString('en-PK')}</td>
        </tr>`).join('');

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f9fb;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb; padding: 40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #7c3aed 0%, #2e5bff 100%); padding: 40px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Rolled</span>
                  <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Invoice & Payroll Platform</p>
                </td>
                <td align="right">
                  <span style="background:rgba(255,255,255,0.15);color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;">
                    SALARY SLIP
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Pay Period Banner -->
        <tr>
          <td style="background:#1c1c2e;padding:20px 48px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">PAY PERIOD</p>
                  <p style="color:#fff;font-size:20px;font-weight:700;margin:0;">${monthName} ${slip.year}</p>
                </td>
                <td align="right">
                  <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">NET PAY</p>
                  <p style="color:#a78bfa;font-size:28px;font-weight:800;margin:0;">PKR ${slip.netPay.toLocaleString('en-PK')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Employee Details -->
        <tr>
          <td style="padding: 36px 48px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">EMPLOYEE DETAILS</p>
                  <table cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:12px;padding:20px 24px;width:100%;">
                    <tr>
                      <td>
                        <p style="font-size:20px;font-weight:700;color:#1c1c2e;margin:0 0 4px;">${slip.employeeName}</p>
                        <p style="color:#8a8a9a;font-size:13px;margin:0;">${slip.snapshot.designation} &bull; ${slip.snapshot.department}</p>
                      </td>
                      <td align="right">
                        <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:0.5px;margin:0 0 4px;">COMPANY</p>
                        <p style="font-size:14px;font-weight:600;color:#1c1c2e;margin:0;">${companyName || 'Vertex Technologies'}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Earnings -->
        <tr>
          <td style="padding: 0 48px 16px;">
            <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">EARNINGS</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0eb;border-radius:12px;overflow:hidden;padding:16px 20px;">
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#4a4a5a;">Basic Salary</td>
                <td style="padding:8px 0;font-size:13px;color:#1c1c2e;font-weight:500;text-align:right;">PKR ${slip.snapshot.basic.toLocaleString('en-PK')}</td>
              </tr>
              ${allowanceRows}
              <tr style="border-top:1px solid #e0e0eb;">
                <td style="padding:12px 0 4px;font-size:14px;font-weight:700;color:#1c1c2e;">Gross Pay</td>
                <td style="padding:12px 0 4px;font-size:14px;font-weight:700;color:#0f7a4a;text-align:right;">PKR ${slip.grossPay.toLocaleString('en-PK')}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Deductions -->
        <tr>
          <td style="padding: 0 48px 32px;">
            <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">DEDUCTIONS</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0eb;border-radius:12px;overflow:hidden;padding:16px 20px;">
              ${deductionRows}
              <tr>
                <td style="padding:8px 0;font-size:13px;color:#4a4a5a;">Income Tax</td>
                <td style="padding:8px 0;font-size:13px;color:#e05a3a;font-weight:500;text-align:right;">- PKR ${slip.taxDeduction.toLocaleString('en-PK')}</td>
              </tr>
              <tr style="border-top:1px solid #e0e0eb;">
                <td style="padding:12px 0 4px;font-size:14px;font-weight:700;color:#1c1c2e;">Total Deductions</td>
                <td style="padding:12px 0 4px;font-size:14px;font-weight:700;color:#e05a3a;text-align:right;">PKR ${(slip.totalDeductions + slip.taxDeduction).toLocaleString('en-PK')}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Net Pay Summary -->
        <tr>
          <td style="padding: 0 48px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg, #7c3aed15 0%, #2e5bff15 100%);border:1px solid #7c3aed30;border-radius:12px;padding:24px;">
              <tr>
                <td>
                  <p style="color:#7c3aed;font-size:13px;font-weight:700;margin:0 0 4px;">NET PAY FOR ${monthName.toUpperCase()} ${slip.year}</p>
                  <p style="color:#1c1c2e;font-size:32px;font-weight:800;margin:0;">PKR ${slip.netPay.toLocaleString('en-PK')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fb;padding:24px 48px;border-top:1px solid #e0e0eb;">
            <p style="color:#8a8a9a;font-size:12px;text-align:center;margin:0;">
              This salary slip was generated by <strong>Rolled</strong> — Invoice & Payroll Platform.<br>
              This is a system-generated document and does not require a signature.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Resend sandbox: without a verified domain you can only send to your own
    // address. RESEND_TEST_TO overrides the recipient for local/demo use.
    const deliverTo = process.env.RESEND_TEST_TO || recipientEmail;
    const subjectPrefix = process.env.RESEND_TEST_TO
      ? `[TEST → ${recipientEmail}] `
      : '';

    const { data, error } = await resend.emails.send({
      from: 'Rolled Payroll <onboarding@resend.dev>',
      to: [deliverTo],
      subject: `${subjectPrefix}Your Salary Slip for ${monthName} ${slip.year} — PKR ${slip.netPay.toLocaleString('en-PK')} Net Pay`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (error: any) {
    console.error('Send Salary Slip Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
