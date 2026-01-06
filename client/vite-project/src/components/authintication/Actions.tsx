import React from "react";

type Props = {
  text : string;
  actionFunction: () => void;
};

export default function Action({ actionFunction, text }: Props) {
  return (
    <div className="auth-actions">
       <button type="button" className="btn-link" onClick={actionFunction}>
        {text}
      </button>
    </div>
  );
}
