import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFCheckBox, PDFDocument, PDFTextField, StandardFonts } from "pdf-lib";

type BenevolencePayload = {
  applicantName?: string;
  age?: string;
  gender?: string;
  familyStatus?: string;
  currentAddress?: string;
  workPhone?: string;
  homePhone?: string;
  cellPhone?: string;
  emailAddress?: string;
  spouseName?: string;
  children?: { name: string; age: string }[];
  familyMembersInHome?: string;
  requestMadeDate?: string;
  requestApprovedDate?: string;
  responseCallDate?: string;
  followUpInterviewDate?: string;
  amountRequested?: string;
  requestedNeeds?: string[];
  amountProvided?: string;
  providedNeeds?: string[];
  isMember?: string;
  howLong?: string;
  memberWhere?: string;
  attendsWhere?: string;
  wantsStudy?: string;
  previousAssistance?: string;
  previousAssistanceAmount?: string;
  previousAssistancePurpose?: string;
  otherAssistance?: string;
  otherAssistanceAmount?: string;
  otherAssistancePurpose?: string;
  budgetTraining?: string;
  contactAllowed?: string;
  approvalMadeBy?: string;
  formCompletedBy?: string;
  comments?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${Number(month)}/${Number(day)}/${year.slice(-2)}`;
}

function filenameFromName(name: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `benevolence-${slug || "request"}.pdf`;
}

function setText(
  form: ReturnType<PDFDocument["getForm"]>,
  name: string,
  value: unknown,
  fontSize?: number,
) {
  const field = form.getFieldMaybe(name);
  if (field instanceof PDFTextField) {
    field.setText(clean(value));
    if (fontSize) {
      field.setFontSize(fontSize);
    }
  }
}

function setCheck(form: ReturnType<PDFDocument["getForm"]>, name: string, checked: boolean) {
  const field = form.getFieldMaybe(name);
  if (field instanceof PDFCheckBox) {
    if (checked) {
      field.check();
    } else {
      field.uncheck();
    }
  }
}

function fillNeedChecks(
  form: ReturnType<PDFDocument["getForm"]>,
  selected: string[] | undefined,
  suffix = "",
) {
  const values = new Set(selected ?? []);
  const fieldNames = [
    "Food",
    "Hotel",
    "Gas",
    "Rent / Mortgage",
    "Auto Repair",
    "Medicine",
    "Medical Expenses",
    "Utility Bill",
    "Auto Payment",
    "Prayers",
    "Budget Training",
  ];

  for (const fieldName of fieldNames) {
    const pdfFieldName =
      suffix && fieldName === "Utility Bill" ? "Utility Payment 2" : `${fieldName}${suffix}`;
    setCheck(form, pdfFieldName, values.has(fieldName));
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as BenevolencePayload;
    const pdfPath = path.join(process.cwd(), "public", "benevolence.pdf");
    const sourcePdf = await readFile(pdfPath);
    const pdf = await PDFDocument.load(sourcePdf);
    const form = pdf.getForm();

    setText(form, "Name - Required", payload.applicantName);
    setText(form, "Age", payload.age);
    setText(form, "Family Members in Home", payload.familyMembersInHome);
    setText(form, "Current Address", payload.currentAddress, 10);
    setText(form, "Home Phone", payload.homePhone);
    setText(form, "Work Phone", payload.workPhone);
    setText(form, "Cell Phone", payload.cellPhone);
    setText(form, "Email Address", payload.emailAddress);
    setText(form, "Spouse's Name", payload.spouseName);

    payload.children?.forEach((child, index) => {
      setText(form, `Child ${index + 1}`, child.name);
      setText(form, `Age ${index + 1}`, child.age);
    });

    setText(form, "Request Made_af_date", formatDate(payload.requestMadeDate));
    setText(form, "Request Approved_af_date", formatDate(payload.requestApprovedDate));
    setText(form, "Response Call_af_date", formatDate(payload.responseCallDate));
    setText(form, "Follow-Up Interview_af_date", formatDate(payload.followUpInterviewDate));
    setText(form, "$ Requested", payload.amountRequested);
    setText(form, "$ Provided", payload.amountProvided);

    setCheck(form, "Male", payload.gender === "Male");
    setCheck(form, "Female", payload.gender === "Female");
    setCheck(form, "Family", Boolean(clean(payload.familyStatus)));

    fillNeedChecks(form, payload.requestedNeeds);
    fillNeedChecks(form, payload.providedNeeds, " 2");

    setCheck(form, "Yes Member", payload.isMember === "Yes");
    setCheck(form, "No Member", payload.isMember === "No");
    setText(form, "How Long", payload.howLong);
    setText(form, "Member Where", payload.memberWhere);
    setText(form, "Attends Where", payload.attendsWhere);

    setCheck(form, "Yes Study", payload.wantsStudy === "Yes");
    setCheck(form, "No Study", payload.wantsStudy === "No");
    setCheck(form, "Yes Prev Assistance", payload.previousAssistance === "Yes");
    setCheck(form, "No Previous Assistance", payload.previousAssistance === "No");
    setText(form, "How Much", payload.previousAssistanceAmount);
    setText(form, "What Was It For?", payload.previousAssistancePurpose);

    setCheck(form, "Yes Other", payload.otherAssistance === "Yes");
    setCheck(form, "No Other", payload.otherAssistance === "No");
    setText(form, "How Much #2", payload.otherAssistanceAmount);
    setText(form, "What Was It For 2?", payload.otherAssistancePurpose);

    setCheck(form, "Yes Budget", payload.budgetTraining === "Yes");
    setCheck(form, "No Budget", payload.budgetTraining === "No");
    setCheck(form, "Yes Contact", payload.contactAllowed === "Yes");
    setCheck(form, "No Contact", payload.contactAllowed === "No");

    setText(form, "Approval made by", payload.approvalMadeBy);
    setText(form, "Form Completed By", payload.formCompletedBy);
    setText(form, "Comments", payload.comments);

    const font = await pdf.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
    form.flatten();

    const completedPdf = await pdf.save();
    const filename = filenameFromName(clean(payload.applicantName));

    const pdfBody = completedPdf.slice().buffer as ArrayBuffer;

    return new Response(pdfBody, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Unable to generate the completed PDF.", { status: 500 });
  }
}
