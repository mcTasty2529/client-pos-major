import React, { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const TAG_OPTIONS = [
  "नाम",
  "सर्वनाम",
  "क्रिया",
  "विशेषण",
  "क्रियाविशेषण",
  "संबंधबोधक",
  "संयोजक",
  "विस्मयादिबोधक",
  "उपसर्ग",
  "प्रत्यय",
  "अंक",
  "पूर्णविराम",
];

const SentenceTag = () => {
  const [sentences, setSentences] = useState([]);
  const [tags, setTags] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  // Memoized sentence fetch to prevent unnecessary re-renders
  const fetchSentences = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`http://localhost:3000/getsentence`);
      setSentences(data);

      const sentence = data.find((s) => s.index.toString() === id);
      if (sentence) {
        const initialTags = sentence.Content.split(" ").reduce(
          (acc, word, index) => {
            acc[`${id}-${index}`] = "";
            return acc;
          },
          {}
        );
        setTags(initialTags);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load sentences");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Use useEffect with fetchSentences
  React.useEffect(() => {
    fetchSentences();
  }, [fetchSentences]);

  // Memoized sentence and words to prevent unnecessary re-computations
  const sentence = useMemo(
    () => sentences.find((s) => s.index.toString() === id),
    [sentences, id]
  );

  const words = useMemo(
    () => (sentence ? sentence.Content.split(" ") : []),
    [sentence]
  );

  // Handlers with improved error management
  const handleTagChange = useCallback(
    (wordIndex, tag) => {
      const wordKey = `${id}-${wordIndex}`;
      setTags((prevTags) => ({
        ...prevTags,
        [wordKey]: tag,
      }));
      setError(null);
    },
    [id]
  );

  const validateTags = useCallback(() => {
    const untaggedWords = words.filter(
      (word, index) => !tags[`${id}-${index}`]
    );

    if (untaggedWords.length > 0) {
      setError(
        `Please tag all words. Missing tags for: ${untaggedWords.join(", ")}`
      );
      return false;
    }
    return true;
  }, [words, tags, id]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!validateTags()) return;

      try {
        setIsSubmitting(true);
        const formattedTags = words.map((word, index) => ({
          word,
          tag: tags[`${id}-${index}`],
          position: index,
        }));

        await axios.post(`http://localhost:3000/taggedsentences`, {
          sentenceId: id,
          sentence: sentence?.Content,
          taggedWords: formattedTags,
          sentenceStatus: true,
        });

        // Use React Router for navigation instead of page reload
        navigate(0);
      } catch (error) {
        setError(
          `Failed to submit tags: ${
            error.response?.data?.message || error.message
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateTags, words, tags, id, sentence, navigate]
  );

  // Utility function for tag colors
  const getTagColor = (tag) => {
    switch (tag) {
      case "subject":
        return "bg-blue-100 text-blue-800";
      case "verb":
        return "bg-green-100 text-green-800";
      case "object":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100";
    }
  };

  // Render loading and error states
  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!sentence) return <div className="p-4">Sentence not found!</div>;

  return (
    <div className="w-3/4 mx-auto p-6 bg-white rounded-lg shadow-lg overflow-scroll">
      <div className="mb-8">
        <p className="text-lg font-medium mb-2">Sentence:</p>
        <div className="flex flex-wrap gap-2">
          {words.map((word, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-md ${getTagColor(
                tags[`${id}-${idx}`]
              )} transition-colors duration-200`}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6">
          {words.map((word, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-gray-200">
              <div className="mb-2 font-medium">{word}</div>
              <div className="flex gap-4">
                {TAG_OPTIONS.map((tag) => (
                  <label key={tag} className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`tag-${idx}`}
                      value={tag}
                      checked={tags[`${id}-${idx}`] === tag}
                      onChange={() => handleTagChange(idx, tag)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm capitalize">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Analysis"}
        </button>
      </form>
    </div>
  );
};

export default SentenceTag;
