import * as React from "react";

export function ScrollArea({ className = "", style = {}, ...props }) {
  return (
    <div
      className={`overflow-y-auto ${className}`}
      style={{ maxHeight: 350, ...style }}
      {...props}
    />
  );
}
