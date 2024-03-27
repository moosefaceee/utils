/**
 * Converts a phrase to title case.
 * @param phrase - The phrase to convert.
 * @returns The converted phrase in title case.
 */
export const toTitleCase = (phrase: string) => {
  return phrase
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Converts a string in enum format to a sentence format.
 *
 * @param {string} enumString - The string in enum format to convert.
 * @returns {string} The converted string in sentence format.
 *
 * @example
 * convertEnumToString('SOME_EXAMPLE_ENUM')
 * returns 'Some Example Enum'
 */
export const convertEnumToString = (enumString?: string): string => {
  if (!enumString) return "";

  const sentence = enumString.split("_").join(" ").toLowerCase();

  const words = sentence.split(" ");

  return words
    ?.map((word) => {
      const capitalizeWord = word[0].toUpperCase();
      return capitalizeWord + word.substring(1);
    })
    .join(" ");
};

/**
 * Converts a string in sentence format to enum format.
 *
 * @param {string} sentenceString - The string in sentence format to convert.
 * @returns {string} The converted string in enum format.
 *
 * @example
 * convertStringToEnum('Some Example Enum')
 * returns 'SOME_EXAMPLE_ENUM'
 */

export const convertStringToEnum = (sentenceString?: string): string => {
  if (!sentenceString) return "";

  const words = sentenceString.split(" ");

  return words
    .map((word) => {
      const upperCaseWord = word.toUpperCase();
      return upperCaseWord;
    })
    .join("_");
};

type User = {
  firstName: string;
  lastName: string;
};

// Function that formats a user object to a string containing the users first and last name
export const formatUsername = (user: User) => {
  if (!user) {
    return "";
  }

  if (!user.firstName && !user.lastName) {
    return "";
  }

  const formattedFirstname = `${user.firstName
    .charAt(0)
    .toUpperCase()}${user.firstName.slice(1)}`;
  const formattedLastname = `${user.lastName
    .charAt(0)
    .toUpperCase()}${user.lastName.slice(1)}`;

  return `${formattedFirstname} ${formattedLastname}`;
};

/**
 * Formats the given number of bytes into a human-readable string representation.
 * @param bytes - The number of bytes to format.
 * @returns A string representing the formatted bytes.
 */
export function formatBytes(bytes: number) {
  if (bytes < 1000) {
    return bytes + " Bytes";
  } else if (bytes >= 1000 && bytes < 1000 * 1000) {
    return (bytes / 1000).toFixed(2) + " KB";
  } else {
    return (bytes / (1000 * 1000)).toFixed(2) + " MB";
  }
}

/**
 * Represents a single select option with a label and a value.
 *
 * @template T - The type of the label.
 * @template K - The type of the value.
 */
export interface SelectOption<T, K> {
  label: T;
  value: K;
}

/**
 * Converts an array of data into an array of SelectOptions.
 *
 * The input data should be an array of objects, where each object contains
 * the keys specified by labelKey and valueKey parameters.
 * The function maps these keys to the label and value properties of a
 * SelectOption object.
 *
 * @param {Array<{ [key: string]: T | K }>} data - The array of data to convert.
 * @param {string} labelKey - The key in the input data objects that maps to the label property in SelectOption.
 * @param {string} valueKey - The key in the input data objects that maps to the value property in SelectOption.
 * @returns {SelectOption<T, K>[]} - An array of SelectOption objects with label and value properties.
 *
 * @example
 * const data = [
 *   { name: 'Apple', id: 1 },
 *   { name: 'Banana', id: 2 },
 * ];
 * const labelKey = 'name';
 * const valueKey = 'id';
 * const result = convertArrayToSelectOptions<string, number>(data, labelKey, valueKey);
 * // result = [{ label: 'Apple', value: 1 }, { label: 'Banana', value: 2 }]
 */
export const convertArrayToSelectOptions = <T, K>(
  data: Array<{ [key: string]: T | K }>,
  labelKey: string,
  valueKey: string
): SelectOption<T, K>[] => {
  return data.map((item) => {
    return {
      label: item[labelKey] as T,
      value: item[valueKey] as K,
    };
  });
};
