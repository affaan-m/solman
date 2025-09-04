"use client";

import * as React from "react";

export function Switch({ id }: { id?: string }) {
  const [checked, setChecked] = React.useState(false);
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => setChecked((v) => !v)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-orange-500" : "bg-slate-700"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
