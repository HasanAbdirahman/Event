import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchDetailEvent, editEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const params = useParams();
  const eventId = params.id;

  const { data, isPending, isError, error } = useQuery({
    // the second paramter makes sure that the query does not cache the same event
    queryKey: ["event", eventId],
    queryFn: ({ signal }) => fetchDetailEvent({ signal, id: eventId }),
  });

  const { mutate } = useMutation({
    mutationFn: editEvent,

    // we can use this method but it will not update faster we have to refresh
    // onSuccess: () => {
    //   queryClient.invalidateQueries({
    //     queryKey: ["events", params.id],
    //   });
    //   navigate("../");
    // },

    // instead of doing onSuccess and using queryClient we can use this method
    // optimistic updating where data is updated before we send it to the backend
    // and if the backend returns an error it goes back to the original data
    onMutate: async (data) => {
      const newEvent = data.event;
      await queryClient.cancelQueries({ queryKey: ["events", params.id] }); // cancel queries before not mutation
      const previousEventData = queryClient.getQueryData(["events", params.id]);
      // setting event to new data
      queryClient.setQueryData(["events", params.id], newEvent);

      return { previousEventData };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(
        ["events", params.id],
        context.previousEventData
      );
    },
    // this function is called whether the updating failed or succeeded
    // it makes sure the data u have in the database and frontend are the same
    onSettled: () => {
      queryClient.invalidateQueries(["events", params.id]);
    },
  });

  function handleSubmit(formData) {
    mutate({ id: params.id, event: formData });
    // going to where u came from the detail page
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }
  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            "Failed to load event. Please check your inputs and try again later"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }
  if (data) {
    content = (
      <>
        <EventForm inputData={data} onSubmit={handleSubmit}>
          <Link to="../" className="button-text">
            Cancel
          </Link>
          <button type="submit" className="button">
            Update
          </button>
        </EventForm>
      </>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}
