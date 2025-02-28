import React, { useEffect, useState } from "react";
import { Form, useForm } from "react-hook-form";
import { Button, Col, Row } from "react-bootstrap";
import StepperHeadingSection from "../StepperHeadingSection";
import SidebarSection from "../SidebarSection";
import { getVendorActiveStepFields } from "../../helper/RegisterConstant";
import CommonInput from "../../atomic/CommonInput";
import { useTranslation } from "react-i18next";

const VendorDecisionMakers = ({
  activeStep,
  type,
  activeStepFields,
  setError,
  clearErrors,
  setValue,
  previewImage,
  setImageFile,
  errors,
  control,
  watch,
  register,
  getActiveStepText,
  smallLoader,
  setPreviewImage,
  imageFile
}) => {

  const { t } = useTranslation()
  // const fields = getVendorActiveStepFields(activeStep);
  const fields = activeStepFields;


  return (
    <>
      <section>
        <div>
          <Row>
            <Col md={12}>
              <StepperHeadingSection activeStep={activeStep} type={"vendor"} />
              <p className="font-12 fw-medium">* includes a required field</p>
              <div>
                <Row className="w-100">
                  {fields?.map(
                    (
                      {
                        label,
                        fieldName,
                        type,
                        rules,
                        placeholder,
                        columnWidth,
                        isRequired,
                        isPasswordSection,
                        isAutocomplete,
                        options,
                        isLocation,
                        defaultOption,
                      },
                      index
                    ) => (

                      <>
                        <Col md={columnWidth} >
                        <CommonInput
                              label={t(`${label}`) + `${isRequired && " *"}`}
                              name={fieldName}
                              control={control}
                              invalidFieldRequired={true}
                              rules={{ ...rules }}
                              error={errors?.[fieldName]}
                              type={type}
                              // options={companyTypeOptions ? companyTypeOptions:options}//get options
                              defaultOption={defaultOption}
                              placeholder={placeholder}
                            />
                        </Col>
                      </>

                    )
                  )}
                </Row>
                {/* <div className="">
                  <Button variant="transparent" className="position-btn">
                    + Add another member
                  </Button>
                </div> */}
              </div>
            </Col>
          </Row>
        </div>
      </section>
    </>
  );
};

export default VendorDecisionMakers;
