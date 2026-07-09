export const studentWelcomeTemplate = ({
    name,
    studentId,
    password
}) => {

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome</title>
</head>

<body style="margin:0;padding:40px;background:#f4f6f9;font-family:Arial,sans-serif;">

<table
width="600"
align="center"
cellpadding="0"
cellspacing="0"
style="
background:#ffffff;
border-radius:10px;
overflow:hidden;
box-shadow:0 3px 10px rgba(0,0,0,.08);
">

<tr>
<td
style="
background:#2563eb;
padding:30px;
text-align:center;
color:white;
">

<h1 style="margin:0;">
Laboratory Attendance &
Asset Management System
</h1>

</td>
</tr>

<tr>

<td style="padding:35px;">

<h2 style="margin-top:0;">
Welcome ${name},
</h2>

<p>
Your student account has successfully been created.
</p>

<table
width="100%"
style="
margin:25px 0;
border-collapse:collapse;
">

<tr>

<td
style="
padding:12px;
background:#f8fafc;
border:1px solid #e5e7eb;
">

<b>Student ID</b>

</td>

<td
style="
padding:12px;
border:1px solid #e5e7eb;
">
${studentId}
</td>

</tr>

<tr>

<td
style="
padding:12px;
background:#f8fafc;
border:1px solid #e5e7eb;
">

<b>Password</b>

</td>

<td
style="
padding:12px;
border:1px solid #e5e7eb;
">

${password}

</td>

</tr>

</table>

<p>

Use these credentials to log into the student portal.

</p>

<p>

Please change your password after your first login if your system later supports password changes.

</p>

<p>

Good luck with your semester!

</p>

<hr>

<p
style="
font-size:13px;
color:#777;
">

This is an automated email.
Please do not reply.

</p>

</td>

</tr>

</table>

</body>

</html>
`;

};

export const sessionCreatedTemplate = ({
    name,
    course,
    date,
    startTime,
    endTime,
    location
}) => {

return `
<h2>Hello ${name},</h2>

<p>

A new class session has been scheduled.

</p>

<ul>

<li><b>Course:</b> ${course}</li>

<li><b>Date:</b> ${date}</li>

<li><b>Time:</b> ${startTime} - ${endTime}</li>

<li><b>Venue:</b> ${location}</li>

</ul>

<p>

Please attend on time.

</p>

`;
};

export const borrowApprovedTemplate = ({
    name,
    asset,
    dueDate
}) => {

return `
<h2>Hello ${name}</h2>

<p>

Your request to borrow an asset has been approved.

</p>

<p>

<b>Asset:</b> ${asset}

</p>

<p>

<b>Due Date:</b>

${dueDate}

</p>

<p>

Please return the asset before the due date.

</p>

`;

};

export const borrowRejectedTemplate = ({
    name,
    asset,
    reason
}) => {

return `
<h2>Hello ${name}</h2>

<p>

Unfortunately your borrowing request was rejected.

</p>

<p>

<b>Asset:</b>

${asset}

</p>

<p>

<b>Reason</b>

</p>

<p>

${reason}

</p>

`;

};

export const returnApprovedTemplate = ({
    name,
    asset
}) => {

return `
<h2>Hello ${name}</h2>

<p>

Your returned asset has been inspected and approved.

</p>

<p>

Asset:

<b>${asset}</b>

</p>

<p>

Thank you.

</p>

`;

};

export const returnRejectedTemplate = ({
    name,
    asset,
    reason
}) => {

return `
<h2>Hello ${name}</h2>

<p>

Your returned asset requires further attention.

</p>

<p>

<b>Asset:</b>

${asset}

</p>

<p>

<b>Reason</b>

</p>

<p>

${reason}

</p>

<p>

Please contact the laboratory administrator.

</p>

`;

};