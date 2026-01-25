import React from 'react';
import { useNavigate } from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
  btnProp?:string;
};

function BackButton({ children = "Go Back", btnProp }: Props) {
  let classNameProp = "nav-btn"
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Goes back one step in history
  };

  return(
        <div>
            <button className={(btnProp ? btnProp : classNameProp)} onClick={handleBack}>{children}</button>
        </div>
    );
}

export default BackButton;
