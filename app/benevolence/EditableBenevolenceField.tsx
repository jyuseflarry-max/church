"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { updateBenevolenceField } from "./actions";

type Option = {
  label: string;
  value: string;
};

type EditableBenevolenceFieldProps = {
  table: "benevolence_people" | "benevolence_requests";
  field: string;
  id: string;
  value: string | number | string[] | null | undefined;
  displayValue?: React.ReactNode;
  emptyLabel?: string;
  inputType?: "text" | "number" | "date" | "money" | "textarea" | "list" | "select";
  options?: Option[];
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
  align?: "left" | "right";
};

const initialState = {
  status: "idle" as const,
  message: "",
};

function stringValue(value: EditableBenevolenceFieldProps["value"]) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-sage px-3 py-1.5 text-xs font-semibold text-white hover:bg-sage-dark disabled:opacity-60"
    >
      {pending ? "Saving" : "Save"}
    </button>
  );
}

export default function EditableBenevolenceField({
  table,
  field,
  id,
  value,
  displayValue,
  emptyLabel = "Not recorded",
  inputType = "text",
  options = [],
  className = "",
  buttonClassName = "",
  inputClassName = "",
  align = "left",
}: EditableBenevolenceFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState(updateBenevolenceField, initialState);
  const rawValue = stringValue(value);
  const shownValue = displayValue ?? rawValue;
  const hasDisplayValue =
    shownValue !== null && shownValue !== undefined && String(shownValue).trim() !== "";

  const controlClassName = useMemo(
    () =>
      [
        "w-full rounded-md border border-sage-muted px-2 py-1.5 text-sm text-charcoal focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage-muted",
        align === "right" ? "text-right tabular-nums" : "",
        inputClassName,
      ]
        .filter(Boolean)
        .join(" "),
    [align, inputClassName],
  );

  useEffect(() => {
    if (editing) {
      const input = inputRef.current;
      input?.focus();
      if (input && input.tagName !== "SELECT") {
        (input as HTMLInputElement | HTMLTextAreaElement).select();
      }
    }
  }, [editing]);

  useEffect(() => {
    if (state.status === "success") {
      window.setTimeout(() => setEditing(false), 0);
      router.refresh();
    }
  }, [router, state.status]);

  if (!editing) {
    return (
      <span className={className}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={[
            "min-h-7 rounded-md px-1.5 py-1 text-left hover:bg-sage-muted focus:bg-sage-muted focus:outline-none focus:ring-2 focus:ring-sage",
            align === "right" ? "w-full text-right tabular-nums" : "",
            buttonClassName,
          ]
            .filter(Boolean)
            .join(" ")}
          title="Edit"
        >
          {hasDisplayValue ? shownValue : <span className="text-muted">{emptyLabel}</span>}
        </button>
      </span>
    );
  }

  return (
    <form action={action} className={["space-y-2", className].filter(Boolean).join(" ")}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnPath" value={pathname} />

      {inputType === "textarea" ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          name="value"
          defaultValue={rawValue}
          rows={4}
          className={controlClassName}
        />
      ) : inputType === "select" ? (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          name="value"
          defaultValue={rawValue}
          className={controlClassName}
        >
          <option value="">Not recorded</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          name="value"
          type={inputType === "money" || inputType === "list" ? "text" : inputType}
          inputMode={inputType === "money" || inputType === "number" ? "decimal" : undefined}
          step={inputType === "money" ? "0.01" : undefined}
          defaultValue={rawValue}
          className={controlClassName}
        />
      )}

      <div className={["flex items-center gap-2", align === "right" ? "justify-end" : ""].join(" ")}>
        <SaveButton />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-sage-muted px-3 py-1.5 text-xs font-semibold text-sage-deep hover:bg-sage-muted"
        >
          Cancel
        </button>
      </div>
      {state.status === "error" ? (
        <div className="text-xs font-semibold text-rose-dark">{state.message}</div>
      ) : null}
    </form>
  );
}
