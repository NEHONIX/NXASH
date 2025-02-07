/**
 * The function `extractJSON` takes a string input, extracts a JSON object from it, and returns the
 * parsed JSON object or logs an error if the JSON is invalid.
 * @param {string} text - The `extractJSON` function takes a `text` parameter, which is expected to be
 * a string containing JSON data. The function attempts to extract and parse the JSON object from the
 * input text. If successful, it returns the parsed JSON object. If the JSON parsing fails, it logs an
 * error message
 * @returns The `extractJSON` function returns the parsed JSON object extracted from the input text
 * string. If a valid JSON object is found in the text, it is parsed and returned. If the JSON is
 * invalid, an error message is logged to the console and `null` is returned.
 */
export const extractJSON = (text: string) => {
  const jsonMatch = text.match(/{[\s\S]*}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]); // On parse le JSON extrait
    } catch (error) {
      console.error("JSON invalide :", error);
    }
  }
  return null;
};

export const cleanJSON = (text: string) => {
  return text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
};
