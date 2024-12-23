import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";

// Create a custom hook for pagination
const usePagination = (items, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");

  const totalPages = useMemo(() => {
    // Ensure totalPages is at least 1 if there are items, or 0 if there are none
    return items.length === 0 ? 1 : Math.ceil(items.length / itemsPerPage);
  }, [items.length, itemsPerPage]);

  const currentItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, items, itemsPerPage]);

  const goToPage = useCallback(
    (pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
      }
    },
    [totalPages]
  );

  const handlePageJump = useCallback(() => {
    const pageNum = parseInt(pageInput, 10);
    goToPage(pageNum);
    setPageInput("");
  }, [pageInput, goToPage]);

  return {
    currentPage,
    totalPages,
    currentItems,
    setCurrentPage,
    pageInput,
    setPageInput,
    goToPage,
    handlePageJump,
  };
};

// Create a service for fetching sentences
const sentenceService = {
  async fetchSentences() {
    try {
      const response = await axios.get(
        `https://server-pos-major.vercel.app/getsentence`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching sentences:", error);
      throw new Error("Failed to load sentences");
    }
  },
};

// Memoized sentence item component
const SentenceItem = React.memo(({ sentence }) => (
  <Link to={`/${sentence.index}`} className="block">
    <p
      className={`rounded-md shadow-md px-4 py-4 ${
        sentence.status ? "bg-green-500" : "bg-red-200"
      } border-black/5 border text-ellipsis overflow-hidden text-nowrap`}
    >
      {sentence.Content}
    </p>
  </Link>
));

SentenceItem.propTypes = {
  sentence: PropTypes.shape({
    index: PropTypes.number.isRequired,
    Content: PropTypes.string.isRequired,
    status: PropTypes.bool.isRequired,
  }).isRequired,
};

const Sidebar = () => {
  const [sentences, setSentences] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const SENTENCES_PER_PAGE = 20;

  const {
    currentPage,
    totalPages,
    currentItems,
    setCurrentPage,
    pageInput,
    setPageInput,
    handlePageJump,
  } = usePagination(sentences, SENTENCES_PER_PAGE);

  useEffect(() => {
    const loadSentences = async () => {
      try {
        setIsLoading(true);
        const fetchedSentences = await sentenceService.fetchSentences();
        setSentences(fetchedSentences);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSentences();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-1/4 flex flex-col px-2 py-4">
        <h1 className="text-2xl font-light text-zinc-800 mb-4">Loading...</h1>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-1/4 flex flex-col px-2 py-4">
        <h1 className="text-2xl font-light text-zinc-800 mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-1/4 flex flex-col px-2 py-4">
      <h1 className="text-2xl font-light text-zinc-800 mb-4">Sentences</h1>

      <div className="flex flex-col gap-4 overflow-y-scroll h-[calc(100vh-150px)] mb-4">
        {currentItems.map((sentence) => (
          <SentenceItem key={sentence.index} sentence={sentence} />
        ))}
      </div>

      <div className="flex flex-col space-y-2">
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

        <div className="flex justify-center items-center space-x-2">
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder="Go to page"
            min="1"
            max={totalPages > 0 ? totalPages : 1} // Ensure max is valid
            className="w-20 px-2 py-1 border rounded"
          />
          <button
            onClick={handlePageJump}
            className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Jump
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
