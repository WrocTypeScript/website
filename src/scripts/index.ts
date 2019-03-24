/**
 * Utility scripts to improve the experience if JS is enabled
 */

import { MeetupApi } from "./meetupApi";

if ("Promise" in window) {
  (function main() {
    // https://github.com/meetup/api/issues/130#issuecomment-253679176
    const JSONP_ID = "js-jsonp";
    const CALLBACK_NAME = "__callback";
    const jsonpGet = (url: string) => {
      return new Promise((resolve, reject) => {
        let jsonpScriptTag = document.getElementById(
          JSONP_ID
        ) as HTMLScriptElement;

        if (!jsonpScriptTag) {
          jsonpScriptTag = document.createElement("script");
          jsonpScriptTag.id = JSONP_ID;
          jsonpScriptTag.type = "application/javascript";
          document.body.appendChild(jsonpScriptTag);
        }

        (window as /* 🦄 */ any)[CALLBACK_NAME] = resolve;

        jsonpScriptTag.src =
          url + (url.includes("?") ? "&" : "?") + `callback=${CALLBACK_NAME}`;
      });
    };

    /**
     * Replaces `Attend a meetup` link with link to latest meetup
     * and adds title attribute.
     */
    const addLinkToLatestMeetup = () => {
      const anchor = document.getElementById("js-attend-a-meetup");
      if (anchor instanceof HTMLAnchorElement) {
        jsonpGet(
          "https://api.meetup.com/WrocTypeScript/events?&sign=true&photo-host=public&page=1"
        ).then(res => {
          try {
            const {
              data: [nextEvent],
            } = res as MeetupApi.EventsResponse;

            anchor.href = nextEvent.link;
            anchor.title = nextEvent.name;
          } catch (err) {
            console.error(err);
          }
        });
      } else {
        console.error("There is no anchor with id #js-attend-a-meetup");
      }
    };

    if (document.readyState === "loading") {
      document.onreadystatechange = () => {
        if (document.readyState === "interactive") {
          addLinkToLatestMeetup();
        }
      };
    } else {
      addLinkToLatestMeetup();
    }
  })();
}
