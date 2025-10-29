import { sendEmail } from './sendEmail';
import { EventEmitter } from "events";
import { emailTemplate } from './email.template';
import { OtpTypeEnum } from 'src/common';

export const eventEmitter = new EventEmitter();

eventEmitter.on(OtpTypeEnum.CONFIRM_EMAIL, async (data) => {
    const { email, otp } = data;
    await sendEmail({ to: email, subject: "Confirm Email", html: emailTemplate(otp, "Confirm Email") });
})

eventEmitter.on(OtpTypeEnum.FORGET_PASSWORD, async (data) => {
    const { email, otp } = data;
    await sendEmail({ to: email, subject: "Password Reset", html: emailTemplate(otp, "Password Reset") });
})

// eventEmitter.on("mentionTags", async (data) => {
//     const { postId, authorId, tags } = data;
//     const _userModel = new UserRepository(userModel);

//     const users = await _userModel.find({ _id: { $in: tags } });
//     for (const user of users) {
//         await sendEmail({ to: user.email, subject: "You were tagged", html: emailTemplate(`You were tagged in post ${postId} by user ${authorId}`, "Tags") });
//     }
// })