import { Link, useNavigate } from "react-router-dom";
// useMutation unlike useQuery() does not automatically send this request when this
// component is rendered but instead only when you tell it to send that request
import { useMutation } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { createNewEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../util/http.js";
export default function NewEvent() {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      //  this function only runs if the mutationFn successed
      queryClient.invalidateQueries({ queryKey: ["events"] }); // this tells reactQuery that data is invalidated and needs refetching
      navigate("/events");
    },
  });
  function handleSubmit(formData) {
    // mutate in the useMutation() is used to send mutateFn anywhere in the component
    mutate({ event: formData });
  }

  return (
    <Modal onClose={() => navigate("../")}>
      <EventForm onSubmit={handleSubmit}>
        {isPending && <p>Creating new event...</p>}
        {!isPending && (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="Failed to create an event"
          message={
            error.info?.message ||
            "Failed to create an event. Pleasecheck your inputs and try again"
          }
        />
      )}
    </Modal>
  );
}
