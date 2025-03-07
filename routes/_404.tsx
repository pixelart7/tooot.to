import { HandlerContext, Handlers, ErrorHandler } from "$fresh/server.ts";

export const handler: ErrorHandler = (req, ctx) => {
  const urlInSlashes = req.url.split("/");
  const origin = urlInSlashes.slice(0, 3).join("/");
  let attemptingToGoTo = urlInSlashes.slice(3).join("/");
  console.log({ origin, attemptingToGoTo });

  // clean up
  attemptingToGoTo = attemptingToGoTo.replace(/^https?:\/\/[^\/? ]+\/web\/(@.+\/)/, '$1')

  for (const redir of REDIRECTORS) {
    const groups = redir.exec(attemptingToGoTo)?.groups;
    if (groups && groups.host && groups.user) {
      console.log("found", groups);
      let Location = `${origin}/@${groups.user}@${groups.host}`;
      if (groups.item) {
        Location += `/${groups.item}`;
      }
      return new Response(null, {
        status: 302,
        headers: {
          Location,
        },
      });
    }
  }
  return new Response(null, { status: 404 });
};

interface MatcherLike {
  exec(
    input: string
  ):
    | null
    | RegExpExecArray
    | { groups: { host: string; user: string; item?: string } };
}

const REDIRECTORS: MatcherLike[] = [
  /^https?:\/\/(?<host>[^\/? ]+)\/@(?<user>[^\/? ]+)(?:\/(?<item>[^\/?\s]+))?$/i,
  /^https?:\/\/(?<host>[^\/? ]+)\/web\/@(?<user>[^\/? ]+)(?:\/(?<item>[^\/@\s][^\/?\s]+))?$/i,
  /^@?(?<host>(?:\w+\.)+(?:\w+))@(?<user>[^\/? \.]+)(?:\/(?<item>[^\/?\s]+))?$/i,
  /^@?(?<user>[^\/? ]+)@(?<host>[^\/? ]+)(?:\/(?<item>[^\/?\s]+))?$/i,
];
