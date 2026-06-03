"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  requestId?: string;
};

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
  enteredBy?: string;
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

type EditState = {
  status: "idle" | "success" | "error";
  message: string;
};

type EditableField = {
  table: "benevolence_people" | "benevolence_requests";
  kind: "text" | "number" | "money" | "date" | "textarea" | "list";
};

const editableFields: Record<string, EditableField> = {
  "benevolence_people.full_name": { table: "benevolence_people", kind: "text" },
  "benevolence_people.age": { table: "benevolence_people", kind: "text" },
  "benevolence_people.gender": { table: "benevolence_people", kind: "text" },
  "benevolence_people.family_status": { table: "benevolence_people", kind: "text" },
  "benevolence_people.current_address": { table: "benevolence_people", kind: "text" },
  "benevolence_people.work_phone": { table: "benevolence_people", kind: "text" },
  "benevolence_people.home_phone": { table: "benevolence_people", kind: "text" },
  "benevolence_people.cell_phone": { table: "benevolence_people", kind: "text" },
  "benevolence_people.email_address": { table: "benevolence_people", kind: "text" },
  "benevolence_people.spouse_name": { table: "benevolence_people", kind: "text" },
  "benevolence_people.family_members_in_home": { table: "benevolence_people", kind: "textarea" },
  "benevolence_requests.entered_by_name": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.request_made_date": { table: "benevolence_requests", kind: "date" },
  "benevolence_requests.request_approved_date": { table: "benevolence_requests", kind: "date" },
  "benevolence_requests.response_call_date": { table: "benevolence_requests", kind: "date" },
  "benevolence_requests.follow_up_interview_date": { table: "benevolence_requests", kind: "date" },
  "benevolence_requests.amount_requested": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.amount_provided": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.requested_needs": { table: "benevolence_requests", kind: "list" },
  "benevolence_requests.provided_needs": { table: "benevolence_requests", kind: "list" },
  "benevolence_requests.decision_status": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.urgency_level": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.follow_up_status": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.referral_source": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.assistance_outcome": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.household_size": { table: "benevolence_requests", kind: "number" },
  "benevolence_requests.monthly_income": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.monthly_expenses": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.is_member": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.wants_study": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.previous_assistance": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.previous_assistance_amount": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.previous_assistance_purpose": { table: "benevolence_requests", kind: "textarea" },
  "benevolence_requests.other_assistance": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.other_assistance_amount": { table: "benevolence_requests", kind: "money" },
  "benevolence_requests.other_assistance_purpose": { table: "benevolence_requests", kind: "textarea" },
  "benevolence_requests.budget_training": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.contact_allowed": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.approval_made_by": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.form_completed_by": { table: "benevolence_requests", kind: "text" },
  "benevolence_requests.comments": { table: "benevolence_requests", kind: "textarea" },
  "benevolence_requests.risk_notes": { table: "benevolence_requests", kind: "textarea" },
};

function clean(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function money(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value.replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function editableValue(value: FormDataEntryValue | null, kind: EditableField["kind"]) {
  const raw = typeof value === "string" ? value.trim() : "";

  if (!raw) {
    return null;
  }

  if (kind === "money" || kind === "number") {
    const parsed = Number(raw.replace(/[$,]/g, ""));
    if (!Number.isFinite(parsed)) {
      throw new Error("Enter a valid number.");
    }
    return kind === "number" ? Math.trunc(parsed) : parsed;
  }

  if (kind === "list") {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return raw;
}

export async function saveBenevolenceRequest(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const rawPayload = formData.get("payload");
    if (typeof rawPayload !== "string") {
      return { status: "error", message: "The form data was not submitted correctly." };
    }

    const payload = JSON.parse(rawPayload) as BenevolencePayload;
    const applicantName = clean(payload.applicantName);
    const enteredBy = clean(payload.enteredBy);

    if (!applicantName) {
      return { status: "error", message: "Applicant name is required." };
    }

    if (!enteredBy) {
      return { status: "error", message: "Entered by is required for internal tracking." };
    }

    const supabase = getSupabaseAdmin();

    const { data: person, error: personError } = await supabase
      .from("benevolence_people")
      .upsert(
        {
          normalized_name: normalizeName(applicantName),
          full_name: applicantName,
          age: clean(payload.age),
          gender: clean(payload.gender),
          family_status: clean(payload.familyStatus),
          current_address: clean(payload.currentAddress),
          work_phone: clean(payload.workPhone),
          home_phone: clean(payload.homePhone),
          cell_phone: clean(payload.cellPhone),
          email_address: clean(payload.emailAddress),
          spouse_name: clean(payload.spouseName),
          family_members_in_home: clean(payload.familyMembersInHome),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "normalized_name" },
      )
      .select("id")
      .single();

    if (personError) {
      throw personError;
    }

    const { data: request, error: requestError } = await supabase
      .from("benevolence_requests")
      .insert({
        person_id: person.id,
        entered_by_name: enteredBy,
        request_made_date: clean(payload.requestMadeDate),
        request_approved_date: clean(payload.requestApprovedDate),
        response_call_date: clean(payload.responseCallDate),
        follow_up_interview_date: clean(payload.followUpInterviewDate),
        amount_requested: money(payload.amountRequested),
        requested_needs: payload.requestedNeeds ?? [],
        amount_provided: money(payload.amountProvided),
        provided_needs: payload.providedNeeds ?? [],
        is_member: clean(payload.isMember),
        how_long: clean(payload.howLong),
        member_where: clean(payload.memberWhere),
        attends_where: clean(payload.attendsWhere),
        wants_study: clean(payload.wantsStudy),
        previous_assistance: clean(payload.previousAssistance),
        previous_assistance_amount: money(payload.previousAssistanceAmount),
        previous_assistance_purpose: clean(payload.previousAssistancePurpose),
        other_assistance: clean(payload.otherAssistance),
        other_assistance_amount: money(payload.otherAssistanceAmount),
        other_assistance_purpose: clean(payload.otherAssistancePurpose),
        budget_training: clean(payload.budgetTraining),
        contact_allowed: clean(payload.contactAllowed),
        approval_made_by: clean(payload.approvalMadeBy),
        form_completed_by: clean(payload.formCompletedBy),
        children: payload.children?.filter((child) => child.name || child.age) ?? [],
        comments: clean(payload.comments),
        raw_form_data: payload,
      })
      .select("id")
      .single();

    if (requestError) {
      throw requestError;
    }

    return {
      status: "success",
      message: "Benevolence request saved.",
      requestId: request.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the form.";
    return { status: "error", message };
  }
}

export async function updateBenevolenceField(
  _previousState: EditState,
  formData: FormData,
): Promise<EditState> {
  try {
    const table = formData.get("table");
    const field = formData.get("field");
    const id = formData.get("id");
    const returnPath = formData.get("returnPath");

    if (typeof table !== "string" || typeof field !== "string" || typeof id !== "string") {
      return { status: "error", message: "This field could not be saved." };
    }

    const editable = editableFields[`${table}.${field}`];
    if (!editable || editable.table !== table) {
      return { status: "error", message: "This field is not editable." };
    }

    const value = editableValue(formData.get("value"), editable.kind);
    const update: Record<string, unknown> = { [field]: value };

    if (table === "benevolence_people") {
      update.updated_at = new Date().toISOString();
      if (field === "full_name" && typeof value === "string") {
        update.normalized_name = normalizeName(value);
      }
    }

    const { error } = await getSupabaseAdmin().from(table).update(update).eq("id", id);
    if (error) {
      throw error;
    }

    revalidatePath("/benevolence/reports");
    revalidatePath("/benevolence/requests");
    if (typeof returnPath === "string" && returnPath.startsWith("/benevolence/")) {
      revalidatePath(returnPath);
    }

    return { status: "success", message: "Saved." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save this field.";
    return { status: "error", message };
  }
}
