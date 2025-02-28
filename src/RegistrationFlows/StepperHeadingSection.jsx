import React from "react";
import { useTranslation } from "react-i18next";
import { getActiveStepHeadingData } from "../helper/RegisterConstant";

const StepperHeadingSection = ({ activeStep, type,nestedActiveStep }) => {
  const { t } = useTranslation();
  let { heading, para } = getActiveStepHeadingData(activeStep , type ,nestedActiveStep);
  console.log(heading,"heading")
  console.log(para,"para")


  return (
    <div>
      <h2 className="resume-heading">{t(heading)}</h2>
      <p>{t(para)}</p>
    </div>
  );
};

export default StepperHeadingSection;
