"use client";

import * as React from "react";
// Note: This component requires the input-otp package to be installed
// import { OTPInput, OTPInputContext } from "input-otp";
import { MinusIcon } from "lucide-react";
import { cn } from "./utils";

export function InputOTP({
  className,
  containerClassName,
  ...props
}) {
  // Note: Requires input-otp package
  // For now, return a basic input until package is installed
  return (
    <input
      type="text"
      data-slot="input-otp"
      className={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
        "disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
}

export function InputOTPGroup({ className, ...props }) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  );
}

export function InputOTPSlot({
  index,
  className,
  ...props
}) {
  // Note: Requires input-otp package for context
  // const inputOTPContext = React.useContext(OTPInputContext);
  // const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      className={cn(
        "border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md",
        className,
      )}
      {...props}
    />
  );
}

export function InputOTPSeparator({ ...props }) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}
