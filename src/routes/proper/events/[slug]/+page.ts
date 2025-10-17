import { readEventTitle } from "$lib/supabase";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params }) => {
  const title = (await readEventTitle(params.slug)).data?.event_title;
  return {
    title: title ?? `Event ${params.slug}`,
  };
};
