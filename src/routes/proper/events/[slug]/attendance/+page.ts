import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  return {
    title: `Attendance for ${params.slug}`,
  };
};
