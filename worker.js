/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { error, fetchPath, json, qr, query, route } from "./utils.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const q = query(url);
    if (url.pathname.startsWith("/threads/")) {
      const search = url.pathname.split("/threads/")[1];
      if (!search) {
        return error(`No thread ID provided.`);
      }
      const res = await fetchPath(env, `/threads/${search}`, {
        with_posts: q.bool("posts"),
        page: q.int("page"),
        with_first_post: q.bool("first"),
        with_last_post: q.bool("last"),
        order: url.searchParams.get("order"),
      });
      if (res.status === false) {
        return error(res.message);
      }
      if (!res.data.thread) {
        return error(`No thread data found for (${search})`);
      }
      return json({
        status: true,
        thread: res.data.thread,
        posts: {
          first: res.data.first_post || null,
          last: res.data.last_post || null,
          pinned: res.data.pinned_post || null,
          highlighted: res.data.highlighted_posts || [],
          all: res.data.posts || [],
        },
        pagination: res.data.pagination || null,
      });
    }
    if (url.pathname.startsWith("/forums/") && url.pathname.endsWith("/threads")) {
      const search = url.pathname.split("/forums/")?.[1]?.split("/")?.[0];
      if (!search) {
        return error(`No forum ID provided.`);
      }
      const res = await fetchPath(env, `/forums/${search}/threads`, {
        page: q.int("page"),
        prefix_id: q.int("prefix"),
        starter_id: q.int("starter"),
        last_days: q.int("days"),
        unread: q.bool("unread"),
        thread_type: url.searchParams.get("type"),
        order: url.searchParams.get("order"),
        direction: url.searchParams.get("sort"),
      });
      if (res.status === false) {
        return error(res.message);
      }
      if (!res.data.threads?.length) {
        return error(`No threads found for (${search}) forum`);
      }
      return json({
        status: true,
        threads: res.data.threads,
        sticky: res.data.sticky || [],
        pagination: res.data.pagination || null,
      })
    }
    return json({
      status: true,
      "powered_by": "https://github.com/GoldenAngel2/Xenforo-API",
      routes: [
        route({
          path: `/threads/:id`,
          query: [
            qr(`posts`, `If any posts in the thread should be included (def: false)`),
            qr(`page`, `What page to go to (def: 1)`, `number`),
            qr(`first`, `If the first post should be populated`),
            qr(`last`, `If the most recent/last post should be populated`),
            qr(`order`, `What order should be used`, "string"),
          ]
        }),
        route({
          path: `/forums/:id/threads`,
          query: [
            qr(`page`, `Which page to go to (def: 1)`, "number"),
            qr(`prefix`, `Filters to only threads with the specified prefix.`, `number`),
            qr(`starter`, `Filters to only threads started by the specified user ID.`, `number`),
            qr(`unread`, `Filters to unread threads only. Ignored for guests.`),
            qr(`days`, `Filters to threads that have had a reply in the last X days.`, `number`),
            qr(`type`, `Filters to threads of the specified thread type.`, `string`),
            qr(`order`, `Method of ordering: last_post_date, post_date. When in a specific forum context: title, reply_count, view_count, vote_score, first_post_reaction_score.`, `string`),
            qr(`sort`, `Either "asc" or "desc" for ascending or descending. Applies only if an order is provided.`, `string`)
          ]
        })
      ]
    })
  }
};
