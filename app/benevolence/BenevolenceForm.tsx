"use client";

import { useActionState, useMemo, useState } from "react";
import { saveBenevolenceRequest } from "./actions";

const needOptions = [
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

const initialChildren = Array.from({ length: 6 }, () => ({ name: "", age: "" }));

const fieldClass =
  "w-full border-0 border-b border-charcoal/60 bg-transparent px-1 py-1 text-sm text-charcoal outline-none focus:border-sage print:border-charcoal";

const boxClass =
  "rounded-md border border-sage-muted bg-white px-4 py-3 print:border-charcoal print:bg-white print:px-2 print:py-1";

type FormValues = {
  applicantName: string;
  age: string;
  gender: string;
  familyStatus: string;
  currentAddress: string;
  workPhone: string;
  homePhone: string;
  cellPhone: string;
  emailAddress: string;
  spouseName: string;
  children: { name: string; age: string }[];
  familyMembersInHome: string;
  enteredBy: string;
  requestMadeDate: string;
  requestApprovedDate: string;
  responseCallDate: string;
  followUpInterviewDate: string;
  amountRequested: string;
  requestedNeeds: string[];
  amountProvided: string;
  providedNeeds: string[];
  isMember: string;
  howLong: string;
  memberWhere: string;
  attendsWhere: string;
  wantsStudy: string;
  previousAssistance: string;
  previousAssistanceAmount: string;
  previousAssistancePurpose: string;
  otherAssistance: string;
  otherAssistanceAmount: string;
  otherAssistancePurpose: string;
  budgetTraining: string;
  contactAllowed: string;
  approvalMadeBy: string;
  formCompletedBy: string;
  comments: string;
};

const initialValues: FormValues = {
  applicantName: "",
  age: "",
  gender: "",
  familyStatus: "",
  currentAddress: "",
  workPhone: "",
  homePhone: "",
  cellPhone: "",
  emailAddress: "",
  spouseName: "",
  children: initialChildren,
  familyMembersInHome: "",
  enteredBy: "",
  requestMadeDate: "",
  requestApprovedDate: "",
  responseCallDate: "",
  followUpInterviewDate: "",
  amountRequested: "",
  requestedNeeds: [],
  amountProvided: "",
  providedNeeds: [],
  isMember: "",
  howLong: "",
  memberWhere: "",
  attendsWhere: "",
  wantsStudy: "",
  previousAssistance: "",
  previousAssistanceAmount: "",
  previousAssistancePurpose: "",
  otherAssistance: "",
  otherAssistanceAmount: "",
  otherAssistancePurpose: "",
  budgetTraining: "",
  contactAllowed: "",
  approvalMadeBy: "",
  formCompletedBy: "",
  comments: "",
};

function Field({
  label,
  name,
  value,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  name: keyof FormValues;
  value: string;
  type?: string;
  required?: boolean;
  onChange: (name: keyof FormValues, value: string) => void;
}) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide text-charcoal">
      {label}
      <input
        className={fieldClass}
        name={name}
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(name, event.target.value)}
      />
    </label>
  );
}

function Choice({
  label,
  value,
  checked,
  onChange,
  name,
}: {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-charcoal">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-sage"
      />
      {label}
    </label>
  );
}

function NeedChecks({
  values,
  onChange,
}: {
  values: string[];
  onChange: (values: string[]) => void;
}) {
  function toggle(option: string) {
    onChange(
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option],
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 print:grid-cols-3">
      {needOptions.map((option) => (
        <label key={option} className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.includes(option)}
            onChange={() => toggle(option)}
            className="h-4 w-4 accent-sage"
          />
          {option}
        </label>
      ))}
    </div>
  );
}

export default function BenevolenceForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [state, action, pending] = useActionState(saveBenevolenceRequest, {
    status: "idle",
    message: "",
  });

  const payload = useMemo(() => JSON.stringify(values), [values]);

  function update(name: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function updateChild(index: number, key: "name" | "age", value: string) {
    setValues((current) => ({
      ...current,
      children: current.children.map((child, childIndex) =>
        childIndex === index ? { ...child, [key]: value } : child,
      ),
    }));
  }

  async function downloadFilledPdf() {
    setIsDownloadingPdf(true);
    setDownloadError("");

    try {
      const response = await fetch("/api/benevolence/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Unable to generate the completed PDF.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition");
      const filename =
        disposition?.match(/filename="([^"]+)"/)?.[1] ?? "benevolence-request.pdf";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error instanceof Error ? error.message : "Unable to generate the completed PDF.",
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return (
    <form action={action} className="benevolence-form mx-auto max-w-5xl px-4 py-8 print:max-w-none print:p-0">
      <input type="hidden" name="payload" value={payload} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-sage-deep">Benevolence Request</h1>
          <p className="mt-1 text-sm text-muted">
            Complete the form, save it to Supabase, or print a paper copy.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/benevolence.pdf"
            target="_blank"
            className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
          >
            Open PDF
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted"
          >
            Print
          </button>
          <button
            type="button"
            onClick={downloadFilledPdf}
            disabled={isDownloadingPdf}
            className="rounded-md border border-sage px-4 py-2 text-sm font-semibold text-sage-deep hover:bg-sage-muted disabled:opacity-60"
          >
            {isDownloadingPdf ? "Preparing..." : "Download Filled PDF"}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-sage px-5 py-2 text-sm font-semibold text-white hover:bg-sage-dark disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {state.message ? (
        <div
          className={`mb-5 rounded-md px-4 py-3 text-sm font-semibold print:hidden ${
            state.status === "success"
              ? "bg-sage-muted text-sage-deep"
              : "bg-rose-muted text-rose-dark"
          }`}
        >
          {state.message}
          {state.requestId ? <span className="ml-2 font-normal">ID: {state.requestId}</span> : null}
        </div>
      ) : null}

      {downloadError ? (
        <div className="mb-5 rounded-md bg-rose-muted px-4 py-3 text-sm font-semibold text-rose-dark print:hidden">
          {downloadError}
        </div>
      ) : null}

      <section className="bg-white p-6 shadow-sm print:p-0 print:shadow-none">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wide text-charcoal">
            Request for Benevolence Assistance
          </h2>
          <p className="text-sm font-semibold text-charcoal">
            Fulshear Church of Christ
          </p>
        </div>

        <div className="space-y-4 text-charcoal">
          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-[2fr_0.5fr_1fr_1fr]">
              <Field label="Name - Required" name="applicantName" value={values.applicantName} required onChange={update} />
              <Field label="Age" name="age" value={values.age} onChange={update} />
              <div className="text-xs font-semibold uppercase tracking-wide">
                Gender
                <div className="mt-2 flex gap-4">
                  <Choice name="gender" label="Male" value="Male" checked={values.gender === "Male"} onChange={(value) => update("gender", value)} />
                  <Choice name="gender" label="Female" value="Female" checked={values.gender === "Female"} onChange={(value) => update("gender", value)} />
                </div>
              </div>
              <Field label="Family" name="familyStatus" value={values.familyStatus} onChange={update} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Current Address" name="currentAddress" value={values.currentAddress} onChange={update} />
              <Field label="Email Address" name="emailAddress" value={values.emailAddress} type="email" onChange={update} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Work Phone" name="workPhone" value={values.workPhone} type="tel" onChange={update} />
              <Field label="Home Phone" name="homePhone" value={values.homePhone} type="tel" onChange={update} />
              <Field label="Cell Phone" name="cellPhone" value={values.cellPhone} type="tel" onChange={update} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Spouse's Name" name="spouseName" value={values.spouseName} onChange={update} />
              <Field label="Family Members in Home" name="familyMembersInHome" value={values.familyMembersInHome} onChange={update} />
            </div>
          </div>

          <div className={boxClass}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide">Children</div>
            <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
              {values.children.map((child, index) => (
                <div key={index} className="grid grid-cols-[1fr_4rem] gap-3">
                  <label className="block text-xs font-semibold uppercase tracking-wide">
                    Child {index + 1}
                    <input className={fieldClass} value={child.name} onChange={(event) => updateChild(index, "name", event.target.value)} />
                  </label>
                  <label className="block text-xs font-semibold uppercase tracking-wide">
                    Age
                    <input className={fieldClass} value={child.age} onChange={(event) => updateChild(index, "age", event.target.value)} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-4">
              <Field label="Request Made" name="requestMadeDate" value={values.requestMadeDate} type="date" onChange={update} />
              <Field label="Request Approved" name="requestApprovedDate" value={values.requestApprovedDate} type="date" onChange={update} />
              <Field label="Response Call" name="responseCallDate" value={values.responseCallDate} type="date" onChange={update} />
              <Field label="Follow-Up Interview" name="followUpInterviewDate" value={values.followUpInterviewDate} type="date" onChange={update} />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-2">
            <div className={boxClass}>
              <Field label="$ Requested" name="amountRequested" value={values.amountRequested} onChange={update} />
              <div className="mt-4">
                <NeedChecks values={values.requestedNeeds} onChange={(requestedNeeds) => setValues((current) => ({ ...current, requestedNeeds }))} />
              </div>
            </div>
            <div className={boxClass}>
              <Field label="$ Provided" name="amountProvided" value={values.amountProvided} onChange={update} />
              <div className="mt-4">
                <NeedChecks values={values.providedNeeds} onChange={(providedNeeds) => setValues((current) => ({ ...current, providedNeeds }))} />
              </div>
            </div>
          </div>

          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Member?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="member" label="Yes" value="Yes" checked={values.isMember === "Yes"} onChange={(value) => update("isMember", value)} />
                  <Choice name="member" label="No" value="No" checked={values.isMember === "No"} onChange={(value) => update("isMember", value)} />
                </div>
              </div>
              <Field label="How Long" name="howLong" value={values.howLong} onChange={update} />
              <Field label="Member Where" name="memberWhere" value={values.memberWhere} onChange={update} />
              <Field label="Attends Where" name="attendsWhere" value={values.attendsWhere} onChange={update} />
            </div>
          </div>

          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Bible Study?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="study" label="Yes" value="Yes" checked={values.wantsStudy === "Yes"} onChange={(value) => update("wantsStudy", value)} />
                  <Choice name="study" label="No" value="No" checked={values.wantsStudy === "No"} onChange={(value) => update("wantsStudy", value)} />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Previous Assistance?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="previous" label="Yes" value="Yes" checked={values.previousAssistance === "Yes"} onChange={(value) => update("previousAssistance", value)} />
                  <Choice name="previous" label="No" value="No" checked={values.previousAssistance === "No"} onChange={(value) => update("previousAssistance", value)} />
                </div>
              </div>
              <Field label="How Much" name="previousAssistanceAmount" value={values.previousAssistanceAmount} onChange={update} />
            </div>
            <div className="mt-4">
              <Field label="What Was It For?" name="previousAssistancePurpose" value={values.previousAssistancePurpose} onChange={update} />
            </div>
          </div>

          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Other Assistance?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="other" label="Yes" value="Yes" checked={values.otherAssistance === "Yes"} onChange={(value) => update("otherAssistance", value)} />
                  <Choice name="other" label="No" value="No" checked={values.otherAssistance === "No"} onChange={(value) => update("otherAssistance", value)} />
                </div>
              </div>
              <Field label="How Much" name="otherAssistanceAmount" value={values.otherAssistanceAmount} onChange={update} />
              <Field label="What Was It For?" name="otherAssistancePurpose" value={values.otherAssistancePurpose} onChange={update} />
            </div>
          </div>

          <div className={boxClass}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">Budget Training?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="budget" label="Yes" value="Yes" checked={values.budgetTraining === "Yes"} onChange={(value) => update("budgetTraining", value)} />
                  <Choice name="budget" label="No" value="No" checked={values.budgetTraining === "No"} onChange={(value) => update("budgetTraining", value)} />
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide">May Contact?</div>
                <div className="mt-2 flex gap-4">
                  <Choice name="contact" label="Yes" value="Yes" checked={values.contactAllowed === "Yes"} onChange={(value) => update("contactAllowed", value)} />
                  <Choice name="contact" label="No" value="No" checked={values.contactAllowed === "No"} onChange={(value) => update("contactAllowed", value)} />
                </div>
              </div>
              <Field label="Approval Made By" name="approvalMadeBy" value={values.approvalMadeBy} onChange={update} />
              <Field label="Form Completed By" name="formCompletedBy" value={values.formCompletedBy} onChange={update} />
              <Field label="Entered By - Required" name="enteredBy" value={values.enteredBy} required onChange={update} />
            </div>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide">
            Comments
            <textarea
              className="mt-1 min-h-28 w-full rounded-md border border-sage-muted bg-white px-3 py-2 text-sm normal-case tracking-normal outline-none focus:border-sage print:min-h-14 print:border-charcoal print:px-2 print:py-1"
              value={values.comments}
              onChange={(event) => update("comments", event.target.value)}
            />
          </label>
        </div>
      </section>
    </form>
  );
}
