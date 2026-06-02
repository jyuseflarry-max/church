import { createClient } from "@supabase/supabase-js";
import { PDFCheckBox, PDFDocument, PDFTextField } from "pdf-lib";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const archiveDir = path.join(rootDir, "public", "archive");
const outputDir = path.join(rootDir, "tmp", "benevolence-import");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const removeDemo = args.has("--remove-demo") || apply;

const skipRules = [
  ["receipt", "receipt"],
  ["receipts", "receipt"],
  ["email", "email"],
  ["legal docs", "legal document"],
  ["notarized", "legal document"],
  ["affidavit", "legal document"],
  ["oath", "legal document"],
  ["cover letter", "legal document"],
  ["proof of letters", "legal document"],
  ["resume", "not an assistance request"],
  ["banking", "financial document"],
  ["direct deposit", "financial document"],
  ["invoice", "invoice"],
  ["summary", "summary document"],
  ["support letter", "support letter"],
];

const needRules = [
  ["rent", "Rent / Mortgage"],
  ["mortgage", "Rent / Mortgage"],
  ["hotel", "Hotel"],
  ["motel", "Hotel"],
  ["suite", "Hotel"],
  ["utility", "Utility Bill"],
  ["electric", "Utility Bill"],
  ["water", "Utility Bill"],
  ["cell bill", "Utility Bill"],
  ["medical", "Medical Expenses"],
  ["auto", "Auto Repair"],
  ["car insurance", "Auto Repair"],
  ["repair", "Auto Repair"],
  ["food", "Food"],
  ["grocery", "Food"],
  ["walmart", "Food"],
  ["gift card", "Food"],
  ["gas", "Gas"],
  ["clothes", "Clothing"],
  ["camp", "Camp"],
  ["plumbing", "Home Repair"],
];

const requestedNeedFields = [
  ["Food", "Food"],
  ["REQfood", "Food"],
  ["Rent / Mortgage", "Rent / Mortgage"],
  ["RentMort", "Rent / Mortgage"],
  ["REQrent_mortg", "Rent / Mortgage"],
  ["Hotel", "Hotel"],
  ["REQhotel", "Hotel"],
  ["Gas", "Gas"],
  ["REQgas", "Gas"],
  ["Auto Repair", "Auto Repair"],
  ["AutoRepair", "Auto Repair"],
  ["REQauto_rep", "Auto Repair"],
  ["Medicine", "Medicine"],
  ["Meds", "Medicine"],
  ["REQmeds", "Medicine"],
  ["Medical Expenses", "Medical Expenses"],
  ["MedExp", "Medical Expenses"],
  ["REQmedExp", "Medical Expenses"],
  ["Auto Payment", "Auto Payment"],
  ["AutoPymt", "Auto Payment"],
  ["REQautoPymnt", "Auto Payment"],
  ["Prayers", "Prayers"],
  ["REQprayers", "Prayers"],
  ["Budget Training", "Budget Training"],
  ["BudgetTraining", "Budget Training"],
  ["REQbudget_training", "Budget Training"],
  ["Utility Bill", "Utility Bill"],
  ["Utility Payment", "Utility Bill"],
  ["Utility", "Utility Bill"],
  ["REQutilityBill", "Utility Bill"],
];

const providedNeedFields = [
  ...requestedNeedFields.map(([field, need]) => [`${field} 2`, need]),
  ["PROfood", "Food"],
  ["PROrent_mort", "Rent / Mortgage"],
  ["PROhotel", "Hotel"],
  ["PROgas", "Gas"],
  ["PROauto_repair", "Auto Repair"],
  ["PROmeds", "Medicine"],
  ["PROmedExpenses", "Medical Expenses"],
  ["PROauto_pymnt", "Auto Payment"],
  ["PROprayers", "Prayers"],
  ["PRObudget_training", "Budget Training"],
  ["PROutility_bill", "Utility Bill"],
];

const amountRequestedFields = ["$ Requested", "REQUESTED", "Request For", "Amount Requested"];
const amountProvidedFields = ["$ Provided", "PROVIDED", "Amount Provided"];

const fieldAliases = {
  applicantName: ["Name - Required", "Name"],
  age: ["Age"],
  currentAddress: ["Current Address"],
  addressLine1: ["AddressRow1"],
  addressLine2: ["AddressRow2"],
  workPhone: ["Work Phone"],
  homePhone: ["Home Phone"],
  cellPhone: ["Cell Phone"],
  emailAddress: ["Email Address", "Email"],
  spouseName: ["Spouse's Name", "Spouses Name if applicable", "Spouses Name if applicableRow2"],
  familyMembersInHome: ["Family Members in Home", "In home"],
  requestMadeDate: ["Request Made_af_date", "DateRequest Made", "Date Request Made"],
  requestApprovedDate: ["Request Approved_af_date", "DateRequest Approved", "Date Request Approved", "DateRequest Completed", "Date Request Completed"],
  responseCallDate: ["Response Call_af_date", "DateResponse Call", "Response Call"],
  followUpInterviewDate: ["Follow-Up Interview_af_date", "DateFollow up Interview", "Follow Up Interview"],
  howLong: ["How Long"],
  memberWhere: ["Member Where", "If Yes A Member Where", "If yes A Member Where"],
  attendsWhere: ["Attends Where", "If No A Member Where", "No - Where"],
  previousAssistanceAmount: ["How Much", "How Much if Yes", "Amt_from_PrevAssist", "PrevAmountGiven"],
  previousAssistancePurpose: ["What Was It For?", "What was it for", "What for"],
  otherAssistanceAmount: ["How Much #2", "Amt_from_others", "OtherAgencyAmountGiven"],
  otherAssistancePurpose: ["What Was It For 2?", "What was it for_2"],
  approvalMadeBy: ["Approval made by", "Approval By"],
  formCompletedBy: ["Form Completed By", "Filled Out by", "Request Form Filled Out By", "Request Completed and Follow Up Interview By"],
  comments: ["Comments"],
};

const choiceFields = {
  gender: [
    ["Male", ["Male", "Male_chkbx"]],
    ["Female", ["Female", "Female_chkbx"]],
  ],
  familyStatus: [
    ["Family", ["Family", "Family_chkbx"]],
  ],
  isMember: [
    ["Yes", ["Yes Member", "Member_Yes", "MemberYes", "Yes Mem"]],
    ["No", ["No Member", "Member_No", "MemberNo", "No Mem"]],
  ],
  wantsStudy: [
    ["Yes", ["Yes Study", "StudyYes", "BibleStudyYes"]],
    ["No", ["No Study", "StudyNo", "BibleStudyNO"]],
  ],
  previousAssistance: [
    ["Yes", ["Yes Prev Assistance", "PrevAssist_Yes", "PrevAssistYes", "Yes Previous"]],
    ["No", ["No Previous Assistance", "PrevAssist_No", "PrevAsistNO", "No Previous"]],
  ],
  otherAssistance: [
    ["Yes", ["Yes Other", "Assist_from_other_Yes", "OthrChurchYes"]],
    ["No", ["No Other", "Assist_from_others_No", "OthrChurchNO"]],
  ],
  budgetTraining: [
    ["Yes", ["Yes Budget", "BudgetYes", "BudgetTrnYes", "Yes budget"]],
    ["No", ["No Budget", "BudgetNo", "BudgetTrnNO", "No budget"]],
  ],
  contactAllowed: [
    ["Yes", ["Yes Contact", "ContactYes", "BTContactYes", "BudgetContact_Yes"]],
    ["No", ["No Contact", "ContactNo", "ContactNO", "BTContactNO", "BudgetContact_No"]],
  ],
};

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function displayNameFromFolder(folder) {
  return folder
    .replace(/\s+-\s+NO.*$/i, "")
    .replace(/\s+NO\s+assistance.*$/i, "")
    .replace(/_No More.*$/i, "")
    .replace(/_Family$/i, " Family")
    .replace(/_Austin$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function personFolder(parts) {
  if (parts[0] === "Hurricane Harvey Assistance" && parts[1]) {
    return parts[1];
  }

  return parts[0];
}

function publicPath(filePath) {
  const relative = path.relative(path.join(rootDir, "public"), filePath);
  return `/${relative.split(path.sep).map(encodeURIComponent).join("/")}`;
}

function skipReason(relativePath) {
  const lower = relativePath.toLowerCase();
  const base = path.basename(relativePath).toLowerCase();
  if (base.startsWith("re ") || base.startsWith("re_")) {
    return "email";
  }
  for (const [needle, reason] of skipRules) {
    if (lower.includes(needle)) {
      return reason;
    }
  }
  return "";
}

function sourceKey(row) {
  const datePart =
    row.sourceDate ??
    row.relative
      .toLowerCase()
      .replace(/\bread\s*only\b/g, "")
      .replace(/\(\d+\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  return `${row.normalizedName}|${datePart}`;
}

function inferNeeds(relativePath) {
  const lower = relativePath.toLowerCase();
  const needs = new Set();
  for (const [needle, need] of needRules) {
    if (lower.includes(needle)) {
      needs.add(need);
    }
  }
  return [...needs];
}

function parseMoney(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  const cleaned = text.replace(/[$,\s]/g, "").replace(/\*+$/g, "");
  if (cleaned && /^-?\d*(?:\.\d+)?$/.test(cleaned)) {
    const amount = Number(cleaned);
    return Number.isFinite(amount) ? amount.toFixed(2) : null;
  }

  const strongAmounts = [
    ...text.matchAll(/(?:\$\s*)?\d{1,3}(?:,\d{3})+(?:\.\d+)?|\$\s*\d+(?:\.\d+)?|\d+\.\d{2}/g),
  ].map((match) => Number(match[0].replace(/[$,\s]/g, "")));
  const amounts = strongAmounts.filter((amount) => Number.isFinite(amount));
  if (!amounts.length) {
    return null;
  }

  const plusExpression = text.includes("+") && text.split("+").every((part) => parseMoney(part) !== null);
  if (plusExpression) {
    return amounts.reduce((total, amount) => total + amount, 0).toFixed(2);
  }

  return amounts[0].toFixed(2);
}

function firstValue(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return null;
}

function mergeUnique(...arrays) {
  return [...new Set(arrays.flat().filter(Boolean))];
}

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function textField(fieldValues, fields) {
  for (const field of fields) {
    const value = cleanText(fieldValues.get(field));
    if (value) {
      return value;
    }
  }
  return null;
}

function checkboxChoice(fieldValues, choices) {
  for (const [value, fields] of choices) {
    if (fields.some((field) => fieldValues.get(field) === true)) {
      return value;
    }
  }
  return null;
}

function parseDateValue(value, fallbackYear = null) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  const numeric = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    const [, month, day, rawYear] = numeric;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return isoDate(year, month, day);
  }

  const normalized = text.replace(/\./g, "").replace(/,/g, " ").replace(/\s+/g, " ").trim();
  const monthNumber = (monthName) => {
    const month = [
      "jan",
      "feb",
      "mar",
      "apr",
      "may",
      "jun",
      "jul",
      "aug",
      "sep",
      "oct",
      "nov",
      "dec",
    ].findIndex((name) => monthName.toLowerCase().startsWith(name));
    return month >= 0 ? String(month + 1) : null;
  };
  const dayMonthYear = normalized.match(/\b(\d{1,2})[-\s]([A-Za-z]{3,})[-\s](\d{2,4})\b/);
  if (dayMonthYear) {
    const [, day, rawMonth, rawYear] = dayMonthYear;
    const month = monthNumber(rawMonth);
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return month ? isoDate(year, month, day) : null;
  }

  const monthDayYear = normalized.match(/\b([A-Za-z]{3,})\s+(\d{1,2})(?:\s+(\d{2,4}))?\b/);
  if (monthDayYear) {
    const [, rawMonth, day, rawYear] = monthDayYear;
    const month = monthNumber(rawMonth);
    const year = rawYear ? (rawYear.length === 2 ? `20${rawYear}` : rawYear) : fallbackYear;
    return month && year ? isoDate(year, month, day) : null;
  }

  const hasYear = /\b(?:19|20)\d{2}\b/.test(normalized);
  const parseText = !hasYear && fallbackYear ? `${normalized} ${fallbackYear}` : normalized;
  const parsed = new Date(`${parseText} 00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return isoDate(String(parsed.getFullYear()), String(parsed.getMonth() + 1), String(parsed.getDate()));
}

function dateField(fieldValues, fields, fallbackYear = null) {
  for (const field of fields) {
    const value = parseDateValue(fieldValues.get(field), fallbackYear);
    if (value) {
      return value;
    }
  }
  return null;
}

function addressFromFields(fieldValues) {
  return firstValue(
    textField(fieldValues, fieldAliases.currentAddress),
    [textField(fieldValues, fieldAliases.addressLine1), textField(fieldValues, fieldAliases.addressLine2)]
      .filter(Boolean)
      .join(", "),
  );
}

function childrenFromFields(fieldValues) {
  const children = [];
  for (let index = 1; index <= 6; index += 1) {
    const child = {
      name: textField(fieldValues, [`Child ${index}`]),
      age: textField(fieldValues, [`Age ${index}`]),
    };
    if (child.name || child.age) {
      children.push(child);
    }
  }

  for (const suffix of ["a", "b", "c", "d", "e", "f"]) {
    const child = {
      name: textField(fieldValues, [`Child Name ${suffix}`]),
      age: textField(fieldValues, [`Child Age ${suffix}`]),
    };
    if (child.name || child.age) {
      children.push(child);
    }
  }

  for (const field of [
    "Childrens NamesAges",
    "Childrens NamesAges2",
    "Childrens NamesAges3",
    "Childrens NamesAges4",
    "Childrens NamesAges5",
    "Childrens NamesAges6",
    "Childrens NamesAges7",
  ]) {
    const value = textField(fieldValues, [field]);
    if (value) {
      children.push({ name: value, age: "" });
    }
  }

  return children;
}

function mergeChildren(...childLists) {
  const seen = new Set();
  const children = [];
  for (const child of childLists.flat()) {
    if (!child || (!child.name && !child.age)) {
      continue;
    }
    const normalized = `${child.name ?? ""}|${child.age ?? ""}`.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      children.push({ name: child.name ?? "", age: child.age ?? "" });
    }
  }
  return children;
}

function mergeObjectFirstValue(...objects) {
  const merged = {};
  for (const object of objects) {
    for (const [key, value] of Object.entries(object ?? {})) {
      if (key === "children") {
        merged.children = mergeChildren(merged.children ?? [], value ?? []);
      } else {
        merged[key] = firstValue(merged[key], value);
      }
    }
  }
  return merged;
}

function checkedNeeds(fieldValues, fields) {
  const needs = [];
  for (const [fieldName, need] of fields) {
    if (fieldValues.get(fieldName) === true) {
      needs.push(need);
    }
  }
  return needs;
}

function moneyField(fieldValues, fields) {
  for (const field of fields) {
    const amount = parseMoney(fieldValues.get(field));
    if (amount !== null) {
      return amount;
    }
  }
  return null;
}

async function readPdfFormData(filePath, fallbackDate = null) {
  try {
    const pdf = await PDFDocument.load(await readFile(filePath), { ignoreEncryption: true });
    const form = pdf.getForm();
    const values = new Map();

    for (const field of form.getFields()) {
      if (field instanceof PDFTextField) {
        values.set(field.getName(), field.getText());
      } else if (field instanceof PDFCheckBox) {
        values.set(field.getName(), field.isChecked());
      }
    }

    const fallbackYear = fallbackDate ? fallbackDate.slice(0, 4) : null;

    return {
      applicantName: textField(values, fieldAliases.applicantName),
      age: textField(values, fieldAliases.age),
      gender: checkboxChoice(values, choiceFields.gender),
      familyStatus: firstValue(checkboxChoice(values, choiceFields.familyStatus), textField(values, ["Other"])),
      currentAddress: addressFromFields(values),
      workPhone: textField(values, fieldAliases.workPhone),
      homePhone: textField(values, fieldAliases.homePhone),
      cellPhone: textField(values, fieldAliases.cellPhone),
      emailAddress: textField(values, fieldAliases.emailAddress),
      spouseName: textField(values, fieldAliases.spouseName),
      familyMembersInHome: textField(values, fieldAliases.familyMembersInHome),
      requestMadeDate: dateField(values, fieldAliases.requestMadeDate, fallbackYear),
      requestApprovedDate: dateField(values, fieldAliases.requestApprovedDate, fallbackYear),
      responseCallDate: dateField(values, fieldAliases.responseCallDate, fallbackYear),
      followUpInterviewDate: dateField(values, fieldAliases.followUpInterviewDate, fallbackYear),
      amountRequested: moneyField(values, amountRequestedFields),
      amountProvided: moneyField(values, amountProvidedFields),
      requestedNeeds: checkedNeeds(values, requestedNeedFields),
      providedNeeds: checkedNeeds(values, providedNeedFields),
      isMember: checkboxChoice(values, choiceFields.isMember),
      howLong: textField(values, fieldAliases.howLong),
      memberWhere: textField(values, fieldAliases.memberWhere),
      attendsWhere: textField(values, fieldAliases.attendsWhere),
      wantsStudy: checkboxChoice(values, choiceFields.wantsStudy),
      previousAssistance: checkboxChoice(values, choiceFields.previousAssistance),
      previousAssistanceAmount: moneyField(values, fieldAliases.previousAssistanceAmount),
      previousAssistancePurpose: textField(values, fieldAliases.previousAssistancePurpose),
      otherAssistance: checkboxChoice(values, choiceFields.otherAssistance),
      otherAssistanceAmount: moneyField(values, fieldAliases.otherAssistanceAmount),
      otherAssistancePurpose: textField(values, fieldAliases.otherAssistancePurpose),
      budgetTraining: checkboxChoice(values, choiceFields.budgetTraining),
      contactAllowed: checkboxChoice(values, choiceFields.contactAllowed),
      approvalMadeBy: textField(values, fieldAliases.approvalMadeBy),
      formCompletedBy: textField(values, fieldAliases.formCompletedBy),
      children: childrenFromFields(values),
      comments: textField(values, fieldAliases.comments),
    };
  } catch {
    return {
      applicantName: null,
      age: null,
      gender: null,
      familyStatus: null,
      currentAddress: null,
      workPhone: null,
      homePhone: null,
      cellPhone: null,
      emailAddress: null,
      spouseName: null,
      familyMembersInHome: null,
      requestMadeDate: null,
      requestApprovedDate: null,
      responseCallDate: null,
      followUpInterviewDate: null,
      amountRequested: null,
      amountProvided: null,
      requestedNeeds: [],
      providedNeeds: [],
      isMember: null,
      howLong: null,
      memberWhere: null,
      attendsWhere: null,
      wantsStudy: null,
      previousAssistance: null,
      previousAssistanceAmount: null,
      previousAssistancePurpose: null,
      otherAssistance: null,
      otherAssistanceAmount: null,
      otherAssistancePurpose: null,
      budgetTraining: null,
      contactAllowed: null,
      approvalMadeBy: null,
      formCompletedBy: null,
      children: [],
      comments: null,
    };
  }
}

function inferDecisionStatus(relativePath) {
  const lower = relativePath.toLowerCase();
  if (lower.includes("no assistance") || lower.includes("no support") || lower.includes("no more")) {
    return "declined";
  }
  if (lower.includes("approved")) {
    return "approved";
  }
  return "approved";
}

function parseDateFromName(value) {
  const normalized = value.replace(/[_-]/g, " ");
  const yearFirst = normalized.match(/\b(20\d{2}|19\d{2})\s+(\d{1,2})(?:\s+(\d{1,2}))?(?=\D|$)/);
  if (yearFirst) {
    const [, year, month, day = "1"] = yearFirst;
    return isoDate(year, month, day);
  }

  const monthFirst = normalized.match(/\b(\d{1,2})\s+(\d{1,2})\s+(20\d{2}|19\d{2}|\d{2})(?=\D|$)/);
  if (monthFirst) {
    const [, month, day, rawYear] = monthFirst;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return isoDate(year, month, day);
  }

  const monthYear = normalized.match(/\b(\d{1,2})\s+(20\d{2}|19\d{2})(?=\D|$)/);
  if (monthYear) {
    const [, month, year] = monthYear;
    return isoDate(year, month, "1");
  }

  return null;
}

function isoDate(year, month, day) {
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

async function loadEnv() {
  const envPath = path.join(rootDir, ".env.local");
  const text = await readFile(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

function normalizeSupabaseUrl(url) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function buildPlan() {
  const allFiles = await walk(archiveDir);
  const pdfFiles = allFiles.filter((file) => file.toLowerCase().endsWith(".pdf"));
  const rowMap = new Map();
  const skipped = [];

  for (const filePath of pdfFiles) {
    const relative = path.relative(archiveDir, filePath);
    const reason = skipReason(relative);
    const parts = relative.split(path.sep);
    const folder = personFolder(parts);
    const personName = displayNameFromFolder(folder);

    if (!personName) {
      skipped.push({ relative, reason: "missing person folder" });
      continue;
    }

    if (reason) {
      skipped.push({ relative, reason });
      continue;
    }

    const requestDate = parseDateFromName(relative);
    const formData = await readPdfFormData(filePath, requestDate);
    const requestedNeeds = mergeUnique(formData.requestedNeeds, inferNeeds(relative));
    const providedNeeds = formData.providedNeeds;
    const personData = {
      fullName: formData.applicantName,
      age: formData.age,
      gender: formData.gender,
      familyStatus: formData.familyStatus,
      currentAddress: formData.currentAddress,
      workPhone: formData.workPhone,
      homePhone: formData.homePhone,
      cellPhone: formData.cellPhone,
      emailAddress: formData.emailAddress,
      spouseName: formData.spouseName,
      familyMembersInHome: formData.familyMembersInHome,
    };
    const requestData = {
      requestMadeDate: formData.requestMadeDate ?? requestDate,
      requestApprovedDate: formData.requestApprovedDate,
      responseCallDate: formData.responseCallDate,
      followUpInterviewDate: formData.followUpInterviewDate,
      isMember: formData.isMember,
      howLong: formData.howLong,
      memberWhere: formData.memberWhere,
      attendsWhere: formData.attendsWhere,
      wantsStudy: formData.wantsStudy,
      previousAssistance: formData.previousAssistance,
      previousAssistanceAmount: formData.previousAssistanceAmount,
      previousAssistancePurpose: formData.previousAssistancePurpose,
      otherAssistance: formData.otherAssistance,
      otherAssistanceAmount: formData.otherAssistanceAmount,
      otherAssistancePurpose: formData.otherAssistancePurpose,
      budgetTraining: formData.budgetTraining,
      contactAllowed: formData.contactAllowed,
      approvalMadeBy: formData.approvalMadeBy,
      formCompletedBy: formData.formCompletedBy,
      children: formData.children,
      comments: formData.comments,
    };
    const row = {
      personName,
      normalizedName: normalizeName(personName),
      sourceDate: requestDate,
      requestDate: requestData.requestMadeDate,
      decisionStatus: inferDecisionStatus(relative),
      needs: requestedNeeds,
      providedNeeds,
      amountRequested: formData.amountRequested,
      amountProvided: formData.amountProvided,
      personData,
      requestData,
      relative,
      publicPath: publicPath(filePath),
    };
    const key = sourceKey(row);
    const existing = rowMap.get(key);

    if (existing) {
      existing.needs = mergeUnique(existing.needs, row.needs);
      existing.providedNeeds = mergeUnique(existing.providedNeeds, row.providedNeeds);
      existing.amountRequested = firstValue(existing.amountRequested, row.amountRequested);
      existing.amountProvided = firstValue(existing.amountProvided, row.amountProvided);
      existing.personData = mergeObjectFirstValue(existing.personData, row.personData);
      existing.requestData = mergeObjectFirstValue(existing.requestData, row.requestData);
      existing.requestDate = firstValue(existing.requestDate, row.requestDate);
      existing.documents.push({ relative: row.relative, publicPath: row.publicPath });
      if (row.decisionStatus === "declined") {
        existing.decisionStatus = "declined";
      }
    } else {
      rowMap.set(key, {
        ...row,
        sourceKey: key,
        documents: [{ relative: row.relative, publicPath: row.publicPath }],
      });
    }
  }

  const rows = [...rowMap.values()].sort((a, b) =>
    a.personName.localeCompare(b.personName) ||
    (a.requestDate ?? "").localeCompare(b.requestDate ?? "") ||
    a.relative.localeCompare(b.relative)
  );

  return { pdfFiles, rows, skipped };
}

async function writeCsv(name, rows, headers) {
  await mkdir(outputDir, { recursive: true });
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\r\n");
  const filePath = path.join(outputDir, name);
  await writeFile(filePath, csv, "utf8");
  return filePath;
}

async function removeDemoData(supabase) {
  const { error: requestError, count: requestCount } = await supabase
    .from("benevolence_requests")
    .delete({ count: "exact" })
    .eq("is_demo_data", true);
  if (requestError) {
    throw requestError;
  }

  const { error: peopleError, count: peopleCount } = await supabase
    .from("benevolence_people")
    .delete({ count: "exact" })
    .eq("is_demo_data", true);
  if (peopleError) {
    throw peopleError;
  }

  return {
    requests: requestCount ?? 0,
    people: peopleCount ?? 0,
  };
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== null && value !== undefined && value !== ""),
  );
}

function personPayload(person) {
  return compactObject({
    normalized_name: person.normalizedName,
    full_name: person.personData.fullName ?? person.personName,
    age: person.personData.age,
    gender: person.personData.gender,
    family_status: person.personData.familyStatus,
    current_address: person.personData.currentAddress,
    work_phone: person.personData.workPhone,
    home_phone: person.personData.homePhone,
    cell_phone: person.personData.cellPhone,
    email_address: person.personData.emailAddress,
    spouse_name: person.personData.spouseName,
    family_members_in_home: person.personData.familyMembersInHome,
    is_demo_data: false,
    updated_at: new Date().toISOString(),
  });
}

function requestPayload(row) {
  return compactObject({
    request_made_date: row.requestData.requestMadeDate,
    request_approved_date: row.requestData.requestApprovedDate,
    response_call_date: row.requestData.responseCallDate,
    follow_up_interview_date: row.requestData.followUpInterviewDate,
    amount_requested: row.amountRequested,
    amount_provided: row.amountProvided,
    is_member: row.requestData.isMember,
    how_long: row.requestData.howLong,
    member_where: row.requestData.memberWhere,
    attends_where: row.requestData.attendsWhere,
    wants_study: row.requestData.wantsStudy,
    previous_assistance: row.requestData.previousAssistance,
    previous_assistance_amount: row.requestData.previousAssistanceAmount,
    previous_assistance_purpose: row.requestData.previousAssistancePurpose,
    other_assistance: row.requestData.otherAssistance,
    other_assistance_amount: row.requestData.otherAssistanceAmount,
    other_assistance_purpose: row.requestData.otherAssistancePurpose,
    budget_training: row.requestData.budgetTraining,
    contact_allowed: row.requestData.contactAllowed,
    approval_made_by: row.requestData.approvalMadeBy,
    form_completed_by: row.requestData.formCompletedBy,
    comments: row.requestData.comments,
  });
}

async function importRows(supabase, rows) {
  const people = [
    ...rows
      .reduce((map, row) => {
        const existing = map.get(row.normalizedName);
        if (existing) {
          existing.personData = mergeObjectFirstValue(existing.personData, row.personData);
        } else {
          map.set(row.normalizedName, { ...row });
        }
        return map;
      }, new Map())
      .values(),
  ];
  const { data: upsertedPeople, error: peopleError } = await supabase
    .from("benevolence_people")
    .upsert(people.map(personPayload), { onConflict: "normalized_name" })
    .select("id, normalized_name");

  if (peopleError) {
    throw peopleError;
  }

  const peopleByName = new Map(upsertedPeople.map((person) => [person.normalized_name, person.id]));
  let inserted = 0;
  let duplicates = 0;
  let updated = 0;

  for (const row of rows) {
    const { data: existing, error: existingError } = await supabase
      .from("benevolence_requests")
      .select("id, amount_requested, amount_provided, children, raw_form_data")
      .filter("raw_form_data->archiveImport->>sourceKey", "eq", row.sourceKey)
      .maybeSingle();
    if (existingError) {
      throw existingError;
    }
    if (existing) {
      duplicates += 1;
      const updates = {
        ...requestPayload(row),
        requested_needs: row.needs,
        provided_needs: row.decisionStatus === "approved" ? mergeUnique(row.providedNeeds, row.needs) : row.providedNeeds,
        children: row.requestData.children?.length ? row.requestData.children : existing.children,
        raw_form_data: {
          ...(existing.raw_form_data ?? {}),
          archiveImport: {
            ...(existing.raw_form_data?.archiveImport ?? {}),
            extractedFormFields: {
              person: row.personData,
              request: row.requestData,
              amountRequested: row.amountRequested,
              amountProvided: row.amountProvided,
              requestedNeeds: row.needs,
              providedNeeds: row.providedNeeds,
            },
          },
        },
      };
      const { error: updateError } = await supabase
        .from("benevolence_requests")
        .update(updates)
        .eq("id", existing.id);
      if (updateError) {
        throw updateError;
      }
      updated += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("benevolence_requests").insert({
      person_id: peopleByName.get(row.normalizedName),
      entered_by_name: "Archive import",
      ...requestPayload(row),
      requested_needs: row.needs,
      provided_needs: row.decisionStatus === "approved" ? mergeUnique(row.providedNeeds, row.needs) : row.providedNeeds,
      children: row.requestData.children,
      comments: row.requestData.comments ?? "Imported from public benevolence PDF archive. Detailed form fields may require manual review.",
      raw_form_data: {
        archiveImport: {
          importedAt: new Date().toISOString(),
          sourceKey: row.sourceKey,
          amountRequested: row.amountRequested,
          amountProvided: row.amountProvided,
          extractedFormFields: {
            person: row.personData,
            request: row.requestData,
            amountRequested: row.amountRequested,
            amountProvided: row.amountProvided,
            requestedNeeds: row.needs,
            providedNeeds: row.providedNeeds,
          },
          publicPath: row.publicPath,
          publicPaths: row.documents.map((document) => document.publicPath),
          originalPath: row.relative,
          originalPaths: row.documents.map((document) => document.relative),
          source: "public/archive",
        },
      },
      is_demo_data: false,
      decision_status: row.decisionStatus,
      follow_up_status: "not_needed",
    });

    if (insertError) {
      throw insertError;
    }
    inserted += 1;
  }

  return { inserted, duplicates, updated, people: people.length };
}

const { pdfFiles, rows, skipped } = await buildPlan();
const importCsv = await writeCsv(
  "planned-import.csv",
  rows.map((row) => ({
      personName: row.personName,
      sourceKey: row.sourceKey,
      requestDate: row.requestDate ?? "",
      decisionStatus: row.decisionStatus,
      needs: row.needs.join("; "),
      amountRequested: row.amountRequested ?? "",
      amountProvided: row.amountProvided ?? "",
      applicantName: row.personData.fullName ?? "",
      currentAddress: row.personData.currentAddress ?? "",
      cellPhone: row.personData.cellPhone ?? "",
      emailAddress: row.personData.emailAddress ?? "",
      requestApprovedDate: row.requestData.requestApprovedDate ?? "",
      isMember: row.requestData.isMember ?? "",
      wantsStudy: row.requestData.wantsStudy ?? "",
      previousAssistance: row.requestData.previousAssistance ?? "",
      otherAssistance: row.requestData.otherAssistance ?? "",
      budgetTraining: row.requestData.budgetTraining ?? "",
      approvalMadeBy: row.requestData.approvalMadeBy ?? "",
      formCompletedBy: row.requestData.formCompletedBy ?? "",
      children: (row.requestData.children ?? []).map((child) => [child.name, child.age].filter(Boolean).join(" ")).join("; "),
      publicPath: row.publicPath,
      documentCount: row.documents.length,
      documents: row.documents.map((document) => document.relative).join("; "),
      relative: row.relative,
    })),
  [
    "personName",
    "sourceKey",
    "requestDate",
    "decisionStatus",
    "needs",
    "amountRequested",
    "amountProvided",
    "applicantName",
    "currentAddress",
    "cellPhone",
    "emailAddress",
    "requestApprovedDate",
    "isMember",
    "wantsStudy",
    "previousAssistance",
    "otherAssistance",
    "budgetTraining",
    "approvalMadeBy",
    "formCompletedBy",
    "children",
    "publicPath",
    "documentCount",
    "documents",
    "relative",
  ],
);
const skippedCsv = await writeCsv("skipped-pdfs.csv", skipped, ["relative", "reason"]);

console.log(`PDFs found: ${pdfFiles.length}`);
console.log(`Planned request imports: ${rows.length}`);
console.log(`Skipped PDFs: ${skipped.length}`);
console.log(`Planned import CSV: ${importCsv}`);
console.log(`Skipped PDF CSV: ${skippedCsv}`);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to remove demo data and import planned rows.");
  process.exit(0);
}

await loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase configuration.");
}

const supabase = createClient(normalizeSupabaseUrl(supabaseUrl), supabaseKey, {
  auth: { persistSession: false },
});

let removed = { requests: 0, people: 0 };
if (removeDemo) {
  removed = await removeDemoData(supabase);
}
const imported = await importRows(supabase, rows);

console.log(`Demo requests removed: ${removed.requests}`);
console.log(`Demo people removed: ${removed.people}`);
console.log(`People upserted: ${imported.people}`);
console.log(`Requests inserted: ${imported.inserted}`);
console.log(`Existing archive rows updated: ${imported.updated}`);
console.log(`Duplicate archive rows skipped: ${imported.duplicates}`);
