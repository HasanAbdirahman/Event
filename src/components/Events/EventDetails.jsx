import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { deleteEvent, fetchDetailEvent } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import { queryClient } from "../../util/http.js";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const eventId = params.id;
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    // the second paramter makes sure that the query does not cache the same event
    queryKey: ["event", eventId],
    queryFn: ({ signal }) => fetchDetailEvent({ signal, id: eventId }),
  });

  // useMutate does not have SIGNAL only when useQuery
  let {
    mutate,
    isPending: isPendingDeleting,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        // the page that is going to be deleted is not refetched hence not giving 404
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }
  function handleDelete() {
    // as we said we can use mutate() so that we can run mutateFn anywhere
    // and any argument the function should be put in an object
    mutate({ id: params.id });
  }

  if (isPending) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return (
      <ErrorBlock
        title="Failed to load event"
        message={
          error.info?.message ||
          "Data cannot be fetched. Please try again later."
        }
      />
    );
  }
  const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>
            Do you really want to delete this event? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isPendingDeleting && <p>Deleting, Please wait ....</p>}
            {!isPendingDeleting && (
              <>
                <button className="button-text" onClick={handleStopDelete}>
                  Cancel
                </button>
                <button className="button" onClick={handleDelete}>
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
              title="Event could not be deleted"
              message={
                deleteError.info?.message ||
                "Failed to delete event, please try again"
              }
            />
          )}
        </Modal>
      )}

      <Outlet />

      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </article>
    </>
  );
}
