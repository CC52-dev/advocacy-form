import { z } from "zod";
import db from "../db/db.js";
import { applicantsTable } from "../db/schema.js";
import { checkEmail } from "../lib/checkEmail.js";

const formSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .superRefine(async (val, ctx) => {
      if (val) {
        const response = await checkEmail(val);
        if (!response || response === "sign") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Email is already being used, Sign in instead?",
          });
        }
      }
    }),
  location: z.array(z.string()).min(2, "Both country and state are required"),
  addr: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  zip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  interest: z.array(z.string()).min(1, "Please select at least one interest"),
  over16: z.boolean().refine((val) => val === true, {
    message: "You must be over 16 years old",
  }),
});

export async function handleNewForm(formdata: object) {
  const parseResult = await formSchema.safeParseAsync(formdata);
  if (!parseResult.success) {
    return { result: parseResult.error.issues };
  }

  await db.insert(applicantsTable).values(formdata);
  return { result: true };
}
// const router = express.Router();

// router.post("/submit", async (req, res) => {
//     const formdata = req.body;
//     const result = await handleNewForm(formdata);
//     if (result.result === true) {
//         res.status(200).send("Form submitted successfully");
//     } else {
//         res.status(400).json(result.result);
//     }
// });

// export default router;
