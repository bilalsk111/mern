import { tool } from "@langchain/core/tools";
import * as z from "zod";
import { sendEmail } from "../services/mail.service.js"
import { body } from "express-validator";


export const emailTool = tool(
    async ({ to, subject, body }) => {
        try {
            await sendEmail({
                to,
                subject,
                html: `<p style="font-family:sans-serif;line-height:1.6">
                ${body.replace(/\n/g, "<br>")}
              </p>`,
            });

            return `Email sent successfully to ${to}`;
        } catch (err) {
      return `Email failed: ${err.message}`;
    }
    },
    {
        name:"send_email",
        description:"Send an email to a specific recipient",
        schema:z.object({
            to:z.string().email(),
            subject:z.string(),
            body:z.string(),
        })
    }
)