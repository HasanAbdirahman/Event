import { useQuery } from "@tanstack/react-query";
// useQuery can only be used when we are getting data
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function NewEventsSection() {
  const { data, isPending, isError, error } = useQuery({
    // The unique key you provide is used internally tanstack query for refetching,
    // caching (request is stored in the future so that it can be used in future ),
    // and sharing your queries throughout your application.
    queryKey: ["events", { max: 3 }],
    // A function that returns a promise that:
    // Resolves the data, or Throws an error
    queryFn: ({ signal }) => fetchEvents({ signal, max: 3 }),
    // staleTime when a user gets out of the page and returns
    // withing the staleTime the queryFn will not rerender
    staleTime: 5000,
    // how long the data is stored in the cache
    gcTime: 30000,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || "Failed to fetch events"}
      />
    );
  }
  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
