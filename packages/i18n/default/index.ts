import common from "./common";
import welcome from "./welcome";

const resources = {
  welcome,
  common,
};
export const defaultNameSpaces = Object.entries(resources).map(
  ([key]) => key as keyof typeof resources,
);

export default resources;
