import React from "react";

// Props definition for a reusable action button component
// - text: label displayed on the button
// - actionFunction: callback function executed on button click
type Props = {
  text : string;
  actionFunction: () => void;
};

// Reusable button component used for authentication-related actions
export default function Action({ actionFunction, text }: Props) {
  return (
    <div className="auth-actions">
       <button type="button" className="btn-link" onClick={actionFunction}>
        {text}
      </button>
    </div>
  );
}
