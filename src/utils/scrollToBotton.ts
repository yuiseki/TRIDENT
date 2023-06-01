import { sleep } from "./sleep";

export const scrollToBottom = async () => {
  await sleep(100);
  window.scroll({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};
