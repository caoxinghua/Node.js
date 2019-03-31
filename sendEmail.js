const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRIDKEY);

sgMail.send({
    to: 'minneapolis2006@gmail.com',
    from: 'caoxinghua1982@gmail.com',
    subject: 'test subject',
    html: `
    <html>
      <body>
        <div style="text-align: center;">
          <h3>I'd like your input!</h3>
          <p>Please answer the following question:</p>
          <div>
            <a href="http://localhost:3000/users/me">Yes</a>
          </div>
        </div>
      </body>
    </html>
  `
});