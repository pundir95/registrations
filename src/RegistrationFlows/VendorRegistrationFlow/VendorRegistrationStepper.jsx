import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Container } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import SidebarSection from "../SidebarSection";
import { getVendorActiveStepFields, MODAL_INFORMATION, SIDEBAR_ITEMS } from "../../helper/RegisterConstant";
import ClientStep1 from "../ClientRegistrationFlow/ClientStep1";
import { createOptionsForReactSelect } from "../../constant/developerStepConstant";
import { getCoutriesList, getWebClientLookUp, uploadFileToS3Bucket } from "../../Redux/Slices/ClientDataSlice";
import SetUpJobModal from "../../common/Modals/SetUpJobModal";
import { applyAsVendor, getAreaExpertise, getEditDecision, getVendorUpdatedDetails } from "../../Redux/Slices/VendorDataSlice";
import VendorDecisionMakers from "./VendorDecisionMakers";
import RexettButton from "../../atomic/RexettButton";
import RegistrationType from "../ClientRegistrationFlow/RegistrationType";

const VendorRegistrationStepper = () => {
  const dispatch = useDispatch();
  const [companyTypeOptions, setCompanyTypeOptions] = useState([]);
  const { smallLoader } = useSelector((state) => state.developerData);
  const { } = useSelector((state) => state.clientData);
  const {
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors },
    watch,
    setError,
    setValue,
    clearErrors,
  } = useForm({});
  const [activeStep, setActiveStep] = useState(1);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [showSetUpModal, setShowSetUpJobModal] = useState(false);
  const userId = localStorage.getItem("vendorId")
  const activeStepFields = getVendorActiveStepFields(activeStep);
  console.log(activeStepFields,"activeStepFields")
  console.log(activeStep,"activestep")

  useEffect(() => {
    const storedStep = localStorage.getItem("vendorActiveStep");
    if (storedStep) {
      setActiveStep(Number(storedStep));
    }
    if (activeStep === 1) {
      dispatch(getCoutriesList());
    }
  }, []);
  useEffect(() => {
    if (activeStep === 1) {
      dispatch(
        getWebClientLookUp((data) => {
          const newOptions = createOptionsForReactSelect(
            data?.company_type,
            "name",
            "name"
          );
          setCompanyTypeOptions(newOptions);
        })
      );

    }
  }, [activeStep]);
  useEffect(() => {
    const activeStepKeys = {
      1: "step1",
      2: "step2",
      3: "step3"
    }
    if (userId && [activeStepKeys[activeStep]]) {
      dispatch(getVendorUpdatedDetails(userId, (response) => {
        const data = response[activeStepKeys[activeStep]];
        for (let key in data) {
        
          if (activeStep === 1) {
            if (key === "country_code") {
              const newValue = {
                label: data["country"],
                value: data[key],
              };
              setValue(key, newValue);
            } else if (key === "state_iso_code") {
              const newValue = {
                label: data["state"],
                value: data[key],
              };
              setValue(key, newValue);
            } else if (key === "time_zone") {
              const newValue = { label: data[key], value: data["time_zone"] };
              setValue(key, newValue);
            } else if (key === "company_logo") {
              setPreviewImage(data?.company_logo)
            } else{
              setValue(key, data[key])
            }
          }
          if (activeStep !== 1){
            setValue(key, data[key])
          }
        }
      }))
    }
  }, [activeStep, userId])
  const handleAfterApiSuccess = () => {
    increaseStepCount();
    reset();
  };
  const handleToggleSetupModal = () => {
    setShowSetUpJobModal((prev) => !prev);
  };

  const onSubmit = () => {
    if (activeStep === 1) {
      setShowSetUpJobModal(true);
    } 
    const buttonText = getActiveStepText();
    switch (buttonText) {
      case "Next : Area of Expertise":
        callDecisionMakersAPI();
        break;
      case "Submit":
        callAreaOfExpertiseAPI();
        break;
    }
  };


 
  const increaseStepCount = () => {
    if (activeStep === 3) {
      localStorage.removeItem("vendorActiveStep");
    } else {
      setActiveStep((prev) => prev + 1);
      localStorage.setItem("vendorActiveStep", activeStep + 1);
    }
  };

  const decreaseStepCount = () => {
    setActiveStep((prev) => prev - 1);
    localStorage.setItem("vendorActiveStep", activeStep - 1);
  };
  const handleSetActiveStep = (step) => {
    if (activeStep > step) {
      setActiveStep(step);
      localStorage.setItem("vendorActiveStep", step);
    }
  };
  //   add this inside constant file
  const getActiveStepText = () => {
    switch (activeStep) {
      case 1:
        return "Next :  Decision Makers";
      case 2:
        return "Next : Area of Expertise";
      case 3:
        return "Submit";
    }
  };
  const handleProceed = () => {
    const stepData = watch();
    let formData = new FormData();
    formData.append('file', imageFile);
    dispatch(uploadFileToS3Bucket(formData, (url) => {
        let payload = {
            ...stepData,
            country_code: stepData["country_code"]?.value,
            state_iso_code: stepData["state_iso_code"]?.value,
            country: stepData["country_code"]?.label,
            state: stepData["state_iso_code"]?.label,
            company_logo: url,
            time_zone: stepData?.time_zone?.label,
            establishment_year: (new Date(stepData?.establishment_year).getFullYear()),
        };
        if (userId) {
            payload = {
                ...payload,
                user_id: userId,
            };
        }
        delete payload["profile_picture"];
        delete payload["timezone"];
        delete payload["confirm_password"];
        handleToggleSetupModal();
        dispatch(applyAsVendor(payload, handleAfterApiSuccess));
    }));
}

  const callDecisionMakersAPI = () => {
    const stepData = watch();
    let data = {
      user_id : userId,
      decision_makers: [
        {
          proprietor_name: [stepData?.proprietor_name],
          proprietor_email: [stepData?.proprietor_email],
          proprietor_contact_number: [stepData?.proprietor_contact_number],
          proprietor_position: [stepData?.proprietor_position]
        }
      ]
    }
    dispatch(getEditDecision(data, handleAfterApiSuccess))
  };

  const callAreaOfExpertiseAPI = () => {
    const stepData = watch();
    console.log(stepData,"stepDATA")
    let payload = {
      user_id : userId,
      specialization: stepData?.specialization,
      service_offering: stepData?.service_offering,
      turn_around_time_to_close_contract_position: stepData?.turn_around_time_to_close_contract_position,
      turn_around_time_to_close_permanent_position: stepData?.turn_around_time_to_close_permanent_position,
      success_story: stepData?.success_story
    }
    dispatch(getAreaExpertise(payload))
  };

  
  const renderActiveStep = () => {
    switch (activeStep) {
      case 1:
      case 3:
        // add proper naming for Client Step 1 This step can be used everywhere when we have to map fields

        return (
          <ClientStep1
            control={control}
            errors={errors}
            activeStep={activeStep}
            type={"vendor"}
            register={register}
            stepFields={activeStepFields}
            setError={setError}
            clearErrors={clearErrors}
            companyTypeOptions={companyTypeOptions}
            watch={watch}
            setValue={setValue}
            previewImage={previewImage}
            imageFile={imageFile}
            setPreviewImage={setPreviewImage}
            setImageFile={setImageFile}
            isProfileSectionRequired={activeStep === 1}
            isVendorStep1={true}
          />
        );
      case 2:
        return (
          <VendorDecisionMakers
            stepFields={activeStepFields}
            //  skillOptions={skillOptions}
            onSubmit={onSubmit}
            type={"vendor"}
            activeStepFields={activeStepFields}
            activeStep={activeStep}
            watch={watch}
            control={control}
            setError={setError}
            clearErrors={clearErrors}
            setValue={setValue}
            previewImage={previewImage}
            setImageFile={setImageFile}
            getActiveStepText={getActiveStepText}
            smallLoader={smallLoader}
            setPreviewImage={setPreviewImage}
            imageFile={imageFile}
            setActiveStep={setActiveStep}
          />
        );
    }
  };
  return (
    <>
      <section className="resume-section-wrapper">
        <SidebarSection
          activeStep={activeStep}
          handleSetActiveStep={handleSetActiveStep}
          stepperSideBarItems={SIDEBAR_ITEMS?.vendor}
        />
        <div className="resume-main-wrapper">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Container>
              {activeStep > 1 && <div>
                <span
                  onClick={decreaseStepCount}
                  className="go-back-link text-decoration-none text-green d-inline-block mb-3 fw-medium cursor-pointer"
                >
                  <FaArrowLeft /> Go Back
                </span>
              </div>}
              {renderActiveStep()}
              <div className="d-flex justify-content-between align-items-center ">
                <div></div>
                <div>
                  <RexettButton
                    type="submit"
                    text={getActiveStepText()}
                    className="main-btn px-5 mr-2"
                    disabled={smallLoader}
                    isLoading={smallLoader}
                  />
                </div>
              </div>
            </Container>
          </form>
        </div>
      </section>
      {showSetUpModal ? <SetUpJobModal
        show={showSetUpModal}
        handleClose={handleToggleSetupModal}
        handleProceed={handleProceed}
        smallLoader={smallLoader}
        modalData={MODAL_INFORMATION[1]}
        activeStep={activeStep}
      /> : ""}
    </>
  );
};

export default VendorRegistrationStepper;
