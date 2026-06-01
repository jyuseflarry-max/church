"use server";

import { createClient } from "@supabase/supabase-js";

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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase server configuration. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

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
