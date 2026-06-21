import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: Request) {
  try {
    const { invoice, recipientEmail } = await request.json();

    if (!invoice || !recipientEmail) {
      return NextResponse.json({ error: 'Missing invoice data or recipient email.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY || !resend) {
      return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 });
    }

    const itemRows = invoice.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f5; font-size: 14px; color: #1c1c2e;">${item.description}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f5; text-align: center; font-size: 14px; color: #6b6b80;">${item.quantity}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f5; text-align: right; font-size: 14px; color: #1c1c2e;">PKR ${item.rate.toLocaleString('en-PK')}</td>
          <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f5; text-align: right; font-size: 14px; font-weight: 600; color: #1c1c2e;">PKR ${item.total.toLocaleString('en-PK')}</td>
        </tr>`
      )
      .join('');

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
                  <div style="display:inline-flex; align-items:center; gap:10px;">
                    <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;"></div>
                    <span style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Rolled</span>
                  </div>
                  <p style="color:rgba(255,255,255,0.7);margin:8px 0 0;font-size:14px;">Invoice & Payroll Platform</p>
                </td>
                <td align="right">
                  <span style="background:rgba(255,255,255,0.15);color:#fff;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;">
                    ${invoice.status}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Invoice Meta -->
        <tr>
          <td style="padding: 40px 48px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="font-size:28px;font-weight:700;color:#1c1c2e;margin:0 0 4px;">${invoice.number}</p>
                  <p style="color:#8a8a9a;font-size:14px;margin:0;">Issued: ${new Date(invoice.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </td>
                <td align="right">
                  <p style="color:#8a8a9a;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin:0 0 4px;">Due Date</p>
                  <p style="color:#1c1c2e;font-size:18px;font-weight:700;margin:0;">${new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Bill To -->
        <tr>
          <td style="padding: 0 48px 32px;">
            <table cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:12px;padding:20px 24px;width:100%;">
              <tr>
                <td>
                  <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">BILL TO</p>
                  <p style="color:#1c1c2e;font-size:18px;font-weight:700;margin:0 0 4px;">${invoice.clientName}</p>
                </td>
                <td align="right">
                  <p style="color:#8a8a9a;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">TOTAL AMOUNT</p>
                  <p style="color:#7c3aed;font-size:24px;font-weight:800;margin:0;">PKR ${invoice.total.toLocaleString('en-PK')}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Line Items Table -->
        <tr>
          <td style="padding: 0 48px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0eb; border-radius: 12px; overflow:hidden;">
              <thead>
                <tr style="background:#f8f9fb;">
                  <th style="padding:12px 16px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.5px;color:#8a8a9a;text-transform:uppercase;">Description</th>
                  <th style="padding:12px 16px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.5px;color:#8a8a9a;text-transform:uppercase;">Qty</th>
                  <th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.5px;color:#8a8a9a;text-transform:uppercase;">Rate</th>
                  <th style="padding:12px 16px;text-align:right;font-size:11px;font-weight:700;letter-spacing:0.5px;color:#8a8a9a;text-transform:uppercase;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding:12px 16px;text-align:right;font-size:13px;color:#6b6b80;">Subtotal</td>
                  <td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:600;color:#1c1c2e;">PKR ${invoice.subtotal.toLocaleString('en-PK')}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding:12px 16px;text-align:right;font-size:13px;color:#6b6b80;">Tax (${invoice.taxRate}%)</td>
                  <td style="padding:12px 16px;text-align:right;font-size:13px;font-weight:600;color:#1c1c2e;">PKR ${invoice.taxAmount.toLocaleString('en-PK')}</td>
                </tr>
                <tr style="background:linear-gradient(135deg, #7c3aed15, #2e5bff15);">
                  <td colspan="3" style="padding:16px;text-align:right;font-size:15px;font-weight:700;color:#1c1c2e;">Total Due</td>
                  <td style="padding:16px;text-align:right;font-size:18px;font-weight:800;color:#7c3aed;">PKR ${invoice.total.toLocaleString('en-PK')}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Notes -->
        ${invoice.notes ? `
        <tr>
          <td style="padding: 0 48px 32px;">
            <p style="font-size:13px;color:#8a8a9a;margin:0 0 8px;font-weight:600;">NOTE</p>
            <p style="font-size:14px;color:#4a4a5a;margin:0;">${invoice.notes}</p>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fb;padding:24px 48px;border-top:1px solid #e0e0eb;">
            <p style="color:#8a8a9a;font-size:12px;text-align:center;margin:0;">
              This invoice was generated by <strong>Rolled</strong> — Invoice & Payroll Platform.<br>
              Please contact us if you have any questions about this invoice.
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
      from: 'Rolled Invoicing <onboarding@resend.dev>',
      to: [deliverTo],
      subject: `${subjectPrefix}Invoice ${invoice.number} from Vertex Technologies — PKR ${invoice.total.toLocaleString('en-PK')}`,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (error: any) {
    console.error('Send Invoice Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
