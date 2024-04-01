import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { fetchEvents } from "../../util/http.js";

export default function FindEventSection() {
  const searchElement = useRef();
  // we have to have create a state that will rerender when the search
  // term is submited cause using useref() will not rerender
  // we did this ustate to be nothing so that we can use the enabled
  const [searchTerm, setSearchTerm] = useState("");

  // isLoading if data is disabled it does not become true vs isPending which becomes true
  const { data, isLoading, isError, error } = useQuery({
    // we have changes searchElement.current.value to state inorder to rerender
    queryKey: ["event", { search: searchTerm }],
    queryFn: ({ signal }) => fetchEvents({ signal, searchTerm }),
    enabled: searchTerm !== "",
  });

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search Term and to find events.</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }
  if (isError) {
    content = (
      <ErrorBlock
        title="Error in the Search"
        message={
          error.info?.message ||
          "Error has occured in the Finding the searchTerm"
        }
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
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input
            type="search"
            placeholder="Search events"
            ref={searchElement}
          />
          <button>Search</button>
        </form>
      </header>
      {/* <p>Please enter a search term and to find events.</p> */}
      {content}
    </section>
  );
}
